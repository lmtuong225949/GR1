// File: src/utils/scheduleGenerator.js

const db = require('../config/db');

const DAYS = [2, 3, 4, 5, 6]; // 2=Monday, 3=Tuesday, etc.
const PERIODS = [1, 2, 3, 4, 5];
const MAX_GENERATIONS = 100;
const POPULATION_SIZE = 30;
const MUTATION_RATE = 0.05;

const MON_CHINH = ['1', '2', '3', '4', '5', '6']; // Toán, Văn, Anh, Lý, Hóa, Sinh
const MON_PHU = ['7', '8', '9', '10', '11', '12', '13'];

// Create schedule slots for each day and period
function createScheduleSlots() {
  const slots = [];
  // Days: 2 (Tuesday) to 6 (Saturday)
  // Periods: 1 to 8
  for (let day = 2; day <= 6; day++) {
    for (let period = 1; period <= 8; period++) {
      slots.push({ day, period });
    }
  }
  return slots;
}

const getClasses = async () => {
  const result = await db.query('SELECT malop, tenlop FROM lop ORDER BY tenlop');
  return result.rows;
};

const getSubjects = async () => {
  const result = await db.query('SELECT id, tenmon FROM monhoc ORDER BY tenmon');
  return result.rows;
};

const getTeachers = async () => {
  const result = await db.query('SELECT magv, hoten FROM giaovien ORDER BY hoten');
  return result.rows;
};

const clearSchedule = async () => {
  await db.query('DELETE FROM thoikhoabieu');
};

const insertSchedule = async (schedule) => {
  const insertPromises = schedule.map(item => 
    db.query(
      'INSERT INTO thoikhoabieu(lopid, thu, tiet, monid, lanthu) VALUES ($1, $2, $3, $4, $5)',
      [item.lopid, item.thu, item.tiet, item.monid, item.lanthu]
    )
  );
  await Promise.all(insertPromises);
};

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

function evaluateFitness(schedule, constraints) {
  let score = 0;
  const used = new Set();

  for (const row of schedule) {
    const key = `${row.thu}_${row.tiet}_${row.giaovienid}`;
    if (!used.has(key)) {
      score++;
      used.add(key);
    }
  }

  return score;
}

function mutate(schedule, assignments) {
  const index = getRandomInt(schedule.length);
  const newSchedule = [...schedule];
  const cls = newSchedule[index].lopid;
  const slot = {
    thu: DAYS[getRandomInt(DAYS.length)],
    tiet: PERIODS[getRandomInt(PERIODS.length)],
  };
  const pcgds = assignments[cls];
  if (!pcgds || pcgds.length === 0) return newSchedule;
  const candidate = pcgds[getRandomInt(pcgds.length)];
  newSchedule[index] = {
    lopid: cls,
    monid: candidate.monid,
    giaovienid: candidate.giaovienid,
    ...slot,
  };
  return newSchedule;
}

function crossover(parent1, parent2) {
  const crossoverPoint = Math.floor(parent1.length / 2);
  return [...parent1.slice(0, crossoverPoint), ...parent2.slice(crossoverPoint)];
}

async function generateSchedule() {
  try {
    console.log('Starting schedule generation...');

    const classesResult = await db.query('SELECT malop FROM lop');
    const subjectsResult = await db.query('SELECT id FROM monhoc');

    if (!classesResult.rows.length || !subjectsResult.rows.length) {
      throw new Error('Không tìm thấy lớp học hoặc môn học');
    }

    const classes = classesResult.rows;
    const subjects = subjectsResult.rows;

    // Create schedule for each class
    const schedule = classes.flatMap(classRow => {
      const classId = classRow.malop;
      const scheduleSlots = createScheduleSlots();
      shuffle(scheduleSlots);

      const mainSubjects = subjects.filter(s => MON_CHINH.includes(s.id.toString()));
      const extraSubjects = subjects.filter(s => MON_PHU.includes(s.id.toString()));

      let scheduleItems = [];
      let slotIndex = 0;

      // Add main subjects (3 periods each)
      for (const subject of mainSubjects) {
        for (let i = 0; i < 3; i++) {
          if (slotIndex >= scheduleSlots.length) break;
          const slot = scheduleSlots[slotIndex++];
          scheduleItems.push({
            lopid: classId,
            monid: subject.id,
            thu: slot.day,
            tiet: slot.period,
            lanthu: 1
          });
        }
      }

      // Add extra subjects (1 period each)
      for (const subject of extraSubjects) {
        if (slotIndex >= scheduleSlots.length) break;
        const slot = scheduleSlots[slotIndex++];
        scheduleItems.push({
          lopid: classId,
          monid: subject.id,
          thu: slot.day,
          tiet: slot.period,
          lanthu: 1
        });
      }

      // Fill remaining slots with random subjects
      while (slotIndex < scheduleSlots.length) {
        const allSubjects = [...mainSubjects, ...extraSubjects];
        const subject = allSubjects[getRandomInt(allSubjects.length)];
        const slot = scheduleSlots[slotIndex++];
        scheduleItems.push({
          lopid: classId,
          monid: subject.id,
          thu: slot.day,
          tiet: slot.period,
          lanthu: 1
        });
      }

      return scheduleItems;
    });

    // Insert schedule into database
    await clearSchedule();
    await insertSchedule(schedule);

    return {
      success: true,
      message: "Đã sinh thời khoá biểu!",
      data: schedule
    };

    function createIndividual() {
      const individual = [];
      for (const cls of classes) {
        const classId = cls.malop.trim();
        const scheduleSlots = [];
        DAYS.forEach((day) => 
          PERIODS.forEach((period) => 
            scheduleSlots.push({ day, period })
          )
        );
        shuffle(scheduleSlots);

        const pcgds = pcgdByClass[classId] || [];
        const mainSubjects = pcgds.filter(p => MON_CHINH.includes(p.monid.toString()));
        const extraSubjects = pcgds.filter(p => MON_PHU.includes(p.monid.toString()));

        let slotIndex = 0;

        for (const subject of mainSubjects) {
          for (let i = 0; i < 3; i++) {
            if (slotIndex >= scheduleSlots.length) break;
            const slot = scheduleSlots[slotIndex++];
            individual.push({
              lopid: classId,
              monid: subject.monid,
              giaovienid: subject.giaovienid,
              thu: slot.day,
              tiet: slot.period,
            });
          }
        }

        for (const subject of extraSubjects) {
          for (let i = 0; i < 1; i++) {
            if (slotIndex >= scheduleSlots.length) break;
            const slot = scheduleSlots[slotIndex++];
            individual.push({
              lopid: classId,
              monid: subject.monid,
              giaovienid: subject.giaovienid,
              thu: slot.day,
              tiet: slot.period,
            });
          }
        }

        while (slotIndex < scheduleSlots.length) {
          const all = [...mainSubjects, ...extraSubjects];
          const subject = all[getRandomInt(all.length)];
          const slot = scheduleSlots[slotIndex++];
          individual.push({
            lopid: classId,
            monid: subject.monid,
            giaovienid: subject.giaovienid,
            thu: slot.day,
            tiet: slot.period,
          });
        }
      }
      return individual;
    }

    let population = Array.from({ length: POPULATION_SIZE }, createIndividual);

    for (let generation = 0; generation < MAX_GENERATIONS; generation++) {
      population = population.sort((a, b) => evaluateFitness(b, pcgdByClass) - evaluateFitness(a, pcgdByClass));
      const newPopulation = [population[0]];

      while (newPopulation.length < POPULATION_SIZE) {
        const parent1 = population[getRandomInt(POPULATION_SIZE / 2)];
        const parent2 = population[getRandomInt(POPULATION_SIZE / 2)];
        let child = crossover(parent1, parent2);
        if (Math.random() < MUTATION_RATE) {
          child = mutate(child, pcgdByClass);
        }
        newPopulation.push(child);
      }
      population = newPopulation;
    }

    const best = population[0];
    const lanthuResult = await db.query('SELECT COALESCE(MAX(lanthu), 1) as max_lanthu FROM thoikhoabieu');
    const currentLanthu = lanthuResult.rows[0].max_lanthu;
    const newLanthu = currentLanthu + 1;

    const insertPromises = best.map((item, index) => 
      db.query(
        'INSERT INTO thoikhoabieu(lopid, monid, thu, tiet, magv, lanthu) VALUES ($1, $2, $3, $4, $5, $6)',
        [item.lopid, item.monid, item.thu, item.tiet, item.magv, newLanthu]
      ).catch(err => {
        console.error(`Error inserting schedule item ${index + 1}:`, err);
        throw err;
      })
    );

    await Promise.all(insertPromises);

    return {
      success: true,
      message: "Đã sinh thời khoá biểu!",
      data: best
    };
  } catch (err) {
    console.error("Detailed error:", err);
    console.error("Error stack:", err.stack);
    throw new Error(`Lỗi khi tạo thời khóa biểu: ${err.message}`);
  }
}

module.exports = generateSchedule;