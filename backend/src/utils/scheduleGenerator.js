// File: src/utils/scheduleGenerator.js

const db = require('../config/db');

const DAYS = [2, 3, 4, 5, 6]; // Thứ 2 - Thứ 6
const PERIODS = [1, 2, 3, 4, 5]; // 5 tiết/ngày
const POPULATION_SIZE = 30;
const MAX_GENERATIONS = 100;
const MUTATION_RATE = 0.08;

// Môn chính / phụ (nếu cần)
const MON_CHINH = ["1", "2", "3", "4", "5", "6"];
const MON_PHU = ["7", "8", "9", "10", "11", "12", "13"];

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

function createSlots() {
  const slots = [];
  for (const d of DAYS) {
    for (const p of PERIODS) {
      slots.push({ thu: d, tiet: p });
    }
  }
  return slots;
}

// --- EVALUATE FITNESS ---
// Kiểm tra trùng giáo viên, trùng lớp, cân bằng tải, và phạt giáo viên không có tiết
function evaluateFitness(schedule, allTeacherIds) {
  let score = 0;
  const usedTeacherSlot = new Set();
  const usedClassSlot = new Set();
  const teacherLoad = {};

  for (const item of schedule) {
    const tKey = `${item.thu}_${item.tiet}_${item.giaovienid}`;
    if (!usedTeacherSlot.has(tKey)) {
      score += 1;
      usedTeacherSlot.add(tKey);
    } else {
      // trùng giáo viên: không cộng điểm (implicit penalty)
    }

    const cKey = `${item.thu}_${item.tiet}_${item.lopid}`;
    if (!usedClassSlot.has(cKey)) {
      score += 1;
      usedClassSlot.add(cKey);
    } else {
      // trùng lớp: không cộng điểm
    }

    teacherLoad[item.giaovienid] = (teacherLoad[item.giaovienid] || 0) + 1;
  }

  // Phạt giáo viên không có tiết (nặng)
  for (const giaovienid of allTeacherIds) {
    if (!teacherLoad[giaovienid]) {
      score -= 8; // penalty: điều chỉnh nếu cần
    }
  }

  // Cân bằng tải: trừ stdDev
  const loads = Object.values(teacherLoad);
  if (loads.length > 0) {
    const avg = loads.reduce((a, b) => a + b, 0) / loads.length;
    const variance = loads.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / loads.length;
    const stdDev = Math.sqrt(variance);
    score -= stdDev;
  }

  return score;
}

// --- REPAIR INDIVIDUAL ---
// 1) đảm bảo trong cùng 1 lớp không có 2 mục cùng slot
// 2) đảm bảo mỗi giáo viên có ít nhất 1 tiết (nếu giáo viên xuất hiện trong pcgd)
function repairIndividual(individual, pcgdByClass, pcgdByTeacher, allTeacherIds) {
  // 1) fix duplicates per class
  const fixed = [...individual];
  const idxByClassSlot = {}; // key lopid + slot => index of first occurance

  for (let i = 0; i < fixed.length; i++) {
    const it = fixed[i];
    const slotKey = `${it.lopid}_${it.thu}_${it.tiet}`;
    if (!idxByClassSlot[slotKey]) {
      idxByClassSlot[slotKey] = i;
    } else {
      // conflict: need to find an unused slot for this class
      const usedSlots = new Set(
        fixed
          .filter(x => x.lopid === it.lopid)
          .map(x => `${x.thu}_${x.tiet}`)
      );
      const slots = shuffle(createSlots());
      let newSlot = null;
      for (const s of slots) {
        const k = `${s.thu}_${s.tiet}`;
        if (!usedSlots.has(k)) {
          newSlot = s;
          break;
        }
      }
      if (newSlot) {
        fixed[i].thu = newSlot.thu;
        fixed[i].tiet = newSlot.tiet;
      } else {
        // nếu không còn slot nào (ít khả năng), ta swap với một item khác lớp
        const swapIdx = (i + 1) % fixed.length;
        const tmp = fixed[i];
        fixed[i] = fixed[swapIdx];
        fixed[swapIdx] = tmp;
      }
    }
  }

  // 2) ensure each teacher assigned at least once (for teachers who appear in pcgd)
  const teacherLoad = {};
  for (const it of fixed) teacherLoad[it.giaovienid] = (teacherLoad[it.giaovienid] || 0) + 1;

  const unassigned = allTeacherIds.filter(gv => !teacherLoad[gv]);

  for (const gv of unassigned) {
    const candidates = pcgdByTeacher[gv] || []; // danh sách {lopid, monid, magv}
    if (candidates.length === 0) continue;

    // pick one candidate class where this gv can teach
    const pick = candidates[getRandomInt(candidates.length)];
    // find an item in that class with teacher having load > 1 (so we can replace)
    let replaceIdx = -1;
    let maxLoad = -1;
    for (let i = 0; i < fixed.length; i++) {
      const it = fixed[i];
      if (it.lopid === pick.lopid) {
        const load = teacherLoad[it.magv] || 0;
        if (load > maxLoad) {
          maxLoad = load;
          replaceIdx = i;
        }
      }
    }

    if (replaceIdx === -1) {
      // fallback: find any item whose teacher load > 1
      for (let i = 0; i < fixed.length; i++) {
        const load = teacherLoad[fixed[i].magv] || 0;
        if (load > 1) {
          replaceIdx = i;
          break;
        }
      }
    }

    if (replaceIdx !== -1) {
      // replace that slot with this teacher's subject
      const old = fixed[replaceIdx];
      teacherLoad[old.magv] = (teacherLoad[old.magv] || 1) - 1;
      fixed[replaceIdx] = {
        lopid: pick.lopid,
        monid: pick.monid,
        giaovienid: gv,
        thu: old.thu,
        tiet: old.tiet,
      };
      teacherLoad[gv] = (teacherLoad[gv] || 0) + 1;
    }
  }

  // cuối cùng, đảm bảo không có 2 item trùng lớp+slot (bất kỳ)
  const seen = new Set();
  for (let i = 0; i < fixed.length; i++) {
    const it = fixed[i];
    const key = `${it.lopid}_${it.thu}_${it.tiet}`;
    if (seen.has(key)) {
      // tìm slot trống trong class
      const usedSlots = new Set(
        fixed
          .filter(x => x.lopid === it.lopid)
          .map(x => `${x.thu}_${x.tiet}`)
      );
      const slots = shuffle(createSlots());
      let newSlot = null;
      for (const s of slots) {
        const k = `${s.thu}_${s.tiet}`;
        if (!usedSlots.has(k)) {
          newSlot = s;
          break;
        }
      }
      if (newSlot) {
        fixed[i].thu = newSlot.thu;
        fixed[i].tiet = newSlot.tiet;
      } else {
        // swap with random index
        const j = getRandomInt(fixed.length);
        const tmp = fixed[i];
        fixed[i] = fixed[j];
        fixed[j] = tmp;
      }
    } else {
      seen.add(key);
    }
  }

  return fixed;
}

// --- CREATE INDIVIDUAL ---
// build schedule per class while preventing duplicate slots inside a class
function createIndividual(classes, pcgdByClass, pcgdByTeacher, allTeacherIds) {
  const individual = [];

  for (const cls of classes) {
    const classId = cls.malop;
    const slots = shuffle(createSlots());
    const usedSlots = new Set();
    const pcgds = pcgdByClass[classId] || [];

    let slotIdx = 0;

    function pickSlot() {
      while (slotIdx < slots.length) {
        const s = slots[slotIdx++];
        const key = `${s.thu}_${s.tiet}`;
        if (!usedSlots.has(key)) {
          usedSlots.add(key);
          return s;
        }
      }
      return null;
    }

    // ensure every teacher assigned to this class gets at least one period in this class (but we will also repair global later)
    const teachersInClass = [...new Set(pcgds.map(p => p.magv))];
    for (const gv of teachersInClass) {
      const subj = pcgds.find(p => p.magv === gv);
      const s = pickSlot();
      if (!s) break;
      individual.push({
        lopid: classId,
        monid: subj.monid,
        giaovienid: gv,
        thu: s.thu,
        tiet: s.tiet,
      });
    }

    // assign main subjects (3 periods each if available in pcgd)
    const main = pcgds.filter(p => MON_CHINH.includes(p.monid.toString()));
    for (const subj of main) {
      for (let i = 0; i < 3; i++) {
        const s = pickSlot();
        if (!s) break;
        individual.push({
          lopid: classId,
          monid: subj.monid,
          giaovienid: subj.magv,
          thu: s.thu,
          tiet: s.tiet,
        });
      }
    }

    // extra subjects (1 period)
    const extra = pcgds.filter(p => MON_PHU.includes(p.monid.toString()));
    for (const subj of extra) {
      const s = pickSlot();
      if (!s) break;
      individual.push({
        lopid: classId,
        monid: subj.monid,
        giaovienid: subj.magv,
        thu: s.thu,
        tiet: s.tiet,
      });
    }

    // fill remaining slots randomly from available pcgds
    const all = [...main, ...extra, ...pcgds];
    while (true) {
      const s = pickSlot();
      if (!s) break;
      if (all.length === 0) break;
      const subj = all[getRandomInt(all.length)];
      individual.push({
        lopid: classId,
        monid: subj.monid,
        giaovienid: subj.magv,
        thu: s.thu,
        tiet: s.tiet,
      });
    }
  }

  // repair to ensure global constraints (no class duplicate slots, every teacher appears at least once)
  return repairIndividual(individual, pcgdByClass, pcgdByTeacher, allTeacherIds);
}

// --- MUTATION ---
// mutate: đổi một slot hoặc đổi giáo viên trong một lớp, giữ invariant không duplicate slot trong lớp
function mutate(individual, pcgdByClass, pcgdByTeacher, allTeacherIds) {
  // clone
  let newInd = JSON.parse(JSON.stringify(individual));
  const idx = getRandomInt(newInd.length);
  const item = newInd[idx];
  const classId = item.lopid;
  const pcgds = pcgdByClass[classId] || [];

  // try change to a different valid (monid, magv) for that class and choose a free slot inside class
  if (pcgds.length > 0) {
    // pick candidate teacher-subject
    const cand = pcgds[getRandomInt(pcgds.length)];
    // find unused slot for the class
    const used = new Set(newInd.filter(x => x.lopid === classId).map(x => `${x.thu}_${x.tiet}`));
    const slots = shuffle(createSlots());
    let newSlot = null;
    for (const s of slots) {
      const k = `${s.thu}_${s.tiet}`;
      if (!used.has(k)) {
        newSlot = s;
        break;
      }
    }
    if (newSlot) {
      newInd[idx] = {
        lopid: classId,
        monid: cand.monid,
        giaovienid: cand.magv,
        thu: newSlot.thu,
        tiet: newSlot.tiet,
      };
    } else {
      // fallback: just change teacher/subject keeping the same slot
      newInd[idx].monid = cand.monid;
      newInd[idx].magv = cand.magv;
    }
  }

  // repair again
  newInd = repairIndividual(newInd, pcgdByClass, pcgdByTeacher, allTeacherIds);
  return newInd;
}

// --- CROSSOVER ---
// simple one-point crossover then repair offspring
function crossover(parent1, parent2, pcgdByClass, pcgdByTeacher, allTeacherIds) {
  const p = Math.floor(parent1.length / 2);
  const child = [...parent1.slice(0, p), ...parent2.slice(p)];
  return repairIndividual(child, pcgdByClass, pcgdByTeacher, allTeacherIds);
}

// --- MAIN ---
async function generateSchedule() {
  try {
    console.log('Start generateSchedule (CSP + GA)');

    // load classes, pcgd (phanconggiangday), teachers (magv)
    const classesRes = await db.query('SELECT malop FROM lop ORDER BY malop');
    const pcgdRes = await db.query('SELECT lopid, monid, giaovienid as magv FROM phanconggiangday ORDER BY lopid');
    const teachersRes = await db.query('SELECT magv FROM giaovien ORDER BY magv');

    const classes = classesRes.rows;
    const pcgd = pcgdRes.rows;
    const teachers = teachersRes.rows.map(r => r.magv);

    if (!classes.length) throw new Error('Không tìm thấy lớp');
    if (!pcgd.length) throw new Error('Không tìm thấy phân công giảng dạy (phanconggiangday)');
    if (!teachers.length) throw new Error('Không tìm thấy giáo viên');

    // pcgdByClass, pcgdByTeacher
    const pcgdByClass = {};
    const pcgdByTeacher = {};
    const allTeacherIdsSet = new Set();

    for (const p of pcgd) {
      if (!pcgdByClass[p.lopid]) pcgdByClass[p.lopid] = [];
      pcgdByClass[p.lopid].push({ lopid: p.lopid, monid: p.monid, magv: p.magv });

      if (!pcgdByTeacher[p.magv]) pcgdByTeacher[p.magv] = [];
      pcgdByTeacher[p.magv].push({ lopid: p.lopid, monid: p.monid, magv: p.magv });

      allTeacherIdsSet.add(p.magv);
    }

    const allTeacherIds = Array.from(allTeacherIdsSet);
    if (allTeacherIds.length === 0) throw new Error('Không có giáo viên trong pcgd (phanconggiangday)');

    // --- Create initial population ---
    let population = [];
    for (let i = 0; i < POPULATION_SIZE; i++) {
      const indiv = createIndividual(classes, pcgdByClass, pcgdByTeacher, allTeacherIds);
      population.push(indiv);
    }

    // --- GA loop ---
    for (let gen = 0; gen < MAX_GENERATIONS; gen++) {
      // sort by fitness descending
      population.sort((a, b) => evaluateFitness(b, allTeacherIds) - evaluateFitness(a, allTeacherIds));
      const newPop = [];
      // elitism: keep top 1
      newPop.push(population[0]);

      while (newPop.length < POPULATION_SIZE) {
        // selection: top-half tournament style
        const parent1 = population[getRandomInt(Math.floor(POPULATION_SIZE / 2))];
        const parent2 = population[getRandomInt(Math.floor(POPULATION_SIZE / 2))];

        let child = crossover(parent1, parent2, pcgdByClass, pcgdByTeacher, allTeacherIds);

        if (Math.random() < MUTATION_RATE) {
          child = mutate(child, pcgdByClass, pcgdByTeacher, allTeacherIds);
        }

        newPop.push(child);
      }

      population = newPop;

      // optional: early stop if best is sufficiently good
      // if (evaluateFitness(population[0], allTeacherIds) > SOME_THRESHOLD) break;
    }

    // final best
    population.sort((a, b) => evaluateFitness(b, allTeacherIds) - evaluateFitness(a, allTeacherIds));
    const best = population[0];

    // persist: increase lanthu and save
    const lanThuRes = await db.query('SELECT COALESCE(MAX(lanthu), 0) as max FROM thoikhoabieu');
    const newLanThu = (lanThuRes.rows[0] && lanThuRes.rows[0].max ? lanThuRes.rows[0].max : 0) + 1;

    // Optionally clear previous lanthu entries or just insert new lanthu
    // await db.query('DELETE FROM thoikhoabieu WHERE lanthu=$1', [newLanThu]);

    // Insert into DB (thực tế column tên: lopid, monid, thu, tiet, magv, lanthu)
    const insertPromises = best.map(item => {
      return db.query(
        'INSERT INTO thoikhoabieu(lopid, monid, thu, tiet, magv, lanthu) VALUES($1,$2,$3,$4,$5,$6)',
        [item.lopid, item.monid, item.thu, item.tiet, item.giaovienid, newLanThu]
      ).catch(err => {
        console.error('Error inserting item', item, err);
        throw err;
      });
    });

    await Promise.all(insertPromises);

    return { success: true, message: 'Đã sinh thời khoá biểu (đã đảm bảo mỗi giáo viên có ít nhất 1 tiết nếu có trong pcgd)', data: best, lanthu: newLanThu };
  } catch (err) {
    console.error('generateSchedule error:', err);
    throw err;
  }
}

module.exports = generateSchedule;
