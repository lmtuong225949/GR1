const db = require('../config/db');

class HungarianAlgorithm {
  constructor(costMatrix) {
    this.costMatrix = costMatrix;
    this.n = costMatrix.length;
    this.m = costMatrix[0].length;
    this.u = new Array(this.n + 1).fill(0);
    this.v = new Array(this.m + 1).fill(0);
    this.p = new Array(this.m + 1).fill(0);
    this.way = new Array(this.m + 1).fill(0);
  }

  solve() {
    for (let i = 1; i <= this.n; i++) {
      this.p[0] = i;
      let j0 = 0;
      const minv = new Array(this.m + 1).fill(Infinity);
      const used = new Array(this.m + 1).fill(false);

      do {
        used[j0] = true;
        let i0 = this.p[j0];
        let delta = Infinity;
        let j1 = 0;

        // Find the minimum value in the row
        for (let j = 1; j <= this.m; j++) {
          if (!used[j]) {
            const current = this.costMatrix[i0 - 1][j - 1] - this.u[i0] - this.v[j];
            if (current < minv[j]) {
              minv[j] = current;
              this.way[j] = j0;
            }
            if (minv[j] < delta) {
              delta = minv[j];
              j1 = j;
            }
          }
        }

        // Update the dual variables
        for (let j = 0; j <= this.m; j++) {
          if (used[j]) {
            this.u[this.p[j]] += delta;
            this.v[j] -= delta;
          } else {
            minv[j] -= delta;
          }
        }

        j0 = j1;
      } while (this.p[j0] !== 0);

      // Update the matching
      do {
        const j1 = this.way[j0];
        this.p[j0] = this.p[j1];
        j0 = j1;
      } while (j0 !== 0);
    }

    // Construct the result
    const result = new Array(this.n).fill(-1);
    for (let j = 1; j <= this.m; j++) {
      if (this.p[j] !== 0) {
        result[this.p[j] - 1] = j - 1;
      }
    }

    return {
      assignments: result,
      totalCost: -this.v[0]
    };
  }
}

class HungarianScheduler {
  constructor() {
    this.days = [2, 3, 4, 5, 6]; // Monday to Friday
    this.periods = [1, 2, 3, 4, 5]; // 5 periods per day
  }

  async generateSchedule(academicYear, semester) {
    try {
      console.log('Fetching teaching assignments...');
      const teachingAssignments = await this.fetchTeachingAssignments(academicYear, semester);
      
      if (teachingAssignments.length === 0) {
        throw new Error('No teaching assignments found for the given academic year and semester');
      }

      console.log('Generating schedule...');
      const classes = await this.fetchClasses();
      const schedule = {};
      
      for (const classInfo of classes) {
        const classId = classInfo.malop;
        const classAssignments = teachingAssignments.filter(a => a.lopid === classId);
        
        if (classAssignments.length > 0) {
          schedule[classId] = await this.createClassSchedule(classAssignments);
        }
      }

      console.log('Saving schedule to database...');
      await this.saveScheduleToDatabase(schedule, academicYear, semester);
      
      console.log('Schedule generated and saved successfully!');
      return { success: true, message: 'Schedule generated successfully' };
    } catch (error) {
      console.error('Error in generateSchedule:', error);
      throw error;
    }
  }

  async fetchTeachingAssignments(academicYear, semester) {
    const query = `
      SELECT 
        pc.id, pc.giaovienid, pc.lopid, pc.monid, pc.namhoc, pc.hocky,
        gv.hoten as teacher_name, 
        m.tenmon as subject_name, 
        l.tenlop as class_name,
        l.siso as class_size
      FROM phanconggiangday pc
      JOIN giaovien gv ON pc.giaovienid = gv.magv
      JOIN monhoc m ON pc.monid = m.id
      JOIN lop l ON pc.lopid = l.malop
      WHERE pc.namhoc = $1 AND pc.hocky = $2
      ORDER BY pc.lopid, pc.monid
    `;
    
    try {
      const { rows } = await db.query(query, [academicYear, semester]);
      return rows;
    } catch (error) {
      console.error('Error fetching teaching assignments:', error);
      throw new Error('Failed to fetch teaching assignments');
    }
  }

  async fetchClasses() {
    try {
      const query = 'SELECT malop, tenlop FROM lop ORDER BY malop';
      const { rows } = await db.query(query);
      return rows;
    } catch (error) {
      console.error('Error fetching classes:', error);
      throw new Error('Failed to fetch classes');
    }
  }

  async createClassSchedule(classAssignments) {
    if (!classAssignments || classAssignments.length === 0) {
      return Array(5).fill().map(() => Array(5).fill(null));
    }
    
    const schedule = Array(5).fill().map(() => Array(5).fill(null));
    const costMatrix = this.createCostMatrix(classAssignments);
    
    try {
      const hungarian = new HungarianAlgorithm(costMatrix);
      const result = hungarian.solve();
      this.applySchedule(schedule, result.assignments, classAssignments);
    } catch (error) {
      console.error('Error in Hungarian algorithm:', error);
      throw new Error('Failed to generate optimal schedule');
    }
    
    return schedule;
  }

  createCostMatrix(assignments) {
    const numSlots = 25; // 5 days × 5 periods
    const costMatrix = Array(assignments.length).fill().map(() => Array(numSlots).fill(0));

    assignments.forEach((assignment, teacherIdx) => {
      for (let slot = 0; slot < numSlots; slot++) {
        const day = Math.floor(slot / 5);
        const period = slot % 5;
        
        // Base cost based on period (prefer earlier in the day)
        let cost = (period + 1) * 10;
        
        // Add some randomness to break ties
        cost += Math.floor(Math.random() * 5);
        
        // Store the cost (lower is better)
        costMatrix[teacherIdx][slot] = cost;
      }
    });

    return costMatrix;
  }

  applySchedule(schedule, assignments, classAssignments) {
    assignments.forEach((slot, teacherIdx) => {
      if (slot !== -1 && teacherIdx < classAssignments.length) {
        const day = Math.floor(slot / 5);
        const period = slot % 5;
        
        if (day < 5 && period < 5) {
          schedule[day][period] = {
            ...classAssignments[teacherIdx],
            day: this.days[day],
            period: this.periods[period]
          };
        }
      }
    });
  }

  async saveScheduleToDatabase(schedule, academicYear, semester) {
    const client = await db.getClient();
    try {
      await client.query('BEGIN');
      
      // Delete existing schedule for this period
      await client.query(
        'DELETE FROM thoikhoabieu WHERE namhoc = $1 AND hocky = $2',
        [academicYear, semester]
      );

      // Insert new schedule
      for (const [classId, classSchedule] of Object.entries(schedule)) {
        for (let day = 0; day < 5; day++) {
          for (let period = 0; period < 5; period++) {
            const slot = classSchedule[day][period];
            if (slot) {
              await client.query(
                `INSERT INTO thoikhoabieu 
                (lopid, monid, magv, thu, tiet, namhoc, hocky, created_at, updated_at)
                VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
                ON CONFLICT (lopid, thu, tiet, namhoc, hocky) 
                DO UPDATE SET 
                  monid = EXCLUDED.monid, 
                  magv = EXCLUDED.magv, 
                  updated_at = NOW()`,
                [
                  classId,
                  slot.monid,
                  slot.giaovienid,
                  this.days[day],
                  this.periods[period],
                  academicYear,
                  semester
                ]
              );
            }
          }
        }
      }

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error saving schedule to database:', error);
      throw new Error('Failed to save schedule to database');
    } finally {
      client.release();
    }
  }

  // Tự động phân công giảng dạy sử dụng Hungarian Algorithm
  async generateAssignments(namhoc_id = null) {
    try {
      console.log('Bắt đầu phân công giảng dạy cho toàn trường...');
      
      // Lấy dữ liệu cần thiết
      const classes = await this.fetchAllClasses();
      const subjects = await this.fetchAllSubjects();
      const teachers = await this.fetchAllTeachers();
      
      if (!classes.length || !subjects.length || !teachers.length) {
        throw new Error('Thiếu dữ liệu lớp, môn học hoặc giáo viên');
      }
      
      console.log(`Tìm thấy ${classes.length} lớp, ${subjects.length} môn học, ${teachers.length} giáo viên`);
      
      // Tính toán số phân công cần thiết
      const totalRequiredAssignments = classes.length * subjects.length;
      console.log(`Số phân công cần thiết: ${classes.length} lớp × ${subjects.length} môn = ${totalRequiredAssignments} phân công`);
      
      // Tạo phân công cân bằng giữa các giáo viên
      const assignments = await this.createBalancedAssignments(classes, subjects, teachers, namhoc_id);
      
      // Kiểm tra xem tất cả các lớp-môn đã được phân công chưa
      const assignedCount = assignments.length;
      const missingCount = totalRequiredAssignments - assignedCount;
      
      console.log(`Đã phân công: ${assignedCount}/${totalRequiredAssignments} phân công`);
      
      if (missingCount > 0) {
        console.log(`⚠️ Còn thiếu ${missingCount} phân công, đang đảm bảo hoàn tất...`);
        await this.ensureCompleteCoverage(assignments, classes, subjects, teachers, namhoc_id);
      }
      
      // Lưu phân công vào database
      await this.saveAssignmentsToDatabase(assignments, namhoc_id);
      
      console.log(`✅ Đã phân công thành công ${assignments.length} lớp môn học cho ${teachers.length} giáo viên`);
      
      return assignments;
    } catch (error) {
      console.error('❌ Lỗi khi phân công giảng dạy:', error);
      throw error;
    }
  }

  // Đảm bảo tất cả các lớp-môn học đều được phân công
  async ensureCompleteCoverage(assignments, classes, subjects, teachers, namhoc_id) {
    const assignedSet = new Set(assignments.map(a => `${a.lopid}_${a.monid}`));
    const missingAssignments = [];
    
    // Tìm tất cả các lớp-môn chưa được phân công
    for (const classInfo of classes) {
      for (const subject of subjects) {
        const key = `${classInfo.malop}_${subject.id}`;
        if (!assignedSet.has(key)) {
          missingAssignments.push({
            lopid: classInfo.malop,
            monid: subject.id,
            subject: subject
          });
        }
      }
    }
    
    console.log(`🔍 Tìm thấy ${missingAssignments.length} lớp-môn chưa phân công`);
    
    // Phân công các lớp-môn còn thiếu
    for (const missing of missingAssignments) {
      // Tìm giáo viên phù hợp nhất cho lớp-môn này
      const bestTeacher = this.findAnyAvailableTeacher(missing, teachers, assignments);
      
      if (bestTeacher) {
        assignments.push({
          lopid: missing.lopid,
          monid: missing.monid,
          giaovienid: bestTeacher.magv,
          namhoc_id: namhoc_id
        });
        
        console.log(`📝 Phân công bổ sung: ${bestTeacher.hoten} -> ${missing.subject.tenmon} - lớp ${missing.lopid}`);
      } else {
        console.log(`❌ Không thể phân công: ${missing.subject.tenmon} - lớp ${missing.lopid}`);
      }
    }
    
    console.log(`✅ Hoàn tất phân công, tổng cộng: ${assignments.length} phân công`);
  }

  // Tìm bất kỳ giáo viên có sẵn nào cho lớp-môn cụ thể
  findAnyAvailableTeacher(missingAssignment, teachers, existingAssignments) {
    // Tìm giáo viên có tải ít nhất
    const teacherLoad = {};
    for (const assignment of existingAssignments) {
      teacherLoad[assignment.giaovienid] = (teacherLoad[assignment.giaovienid] || 0) + 1;
    }
    
    // Khởi tạo tải cho giáo viên chưa có phân công
    for (const teacher of teachers) {
      if (!teacherLoad[teacher.magv]) {
        teacherLoad[teacher.magv] = 0;
      }
    }
    
    // Ưu tiên giáo viên có tải ít nhất và có chuyên môn phù hợp
    let bestTeacher = null;
    let lowestLoad = Infinity;
    
    for (const teacher of teachers) {
      const load = teacherLoad[teacher.magv];
      
      // Ưu tiên 1: Giáo viên có chuyên môn phù hợp và tải ít
      if (this.isTeacherQualifiedForSubject(teacher, missingAssignment.subject) && load < lowestLoad) {
        bestTeacher = teacher;
        lowestLoad = load;
      }
    }
    
    // Nếu không có giáo viên phù hợp chuyên môn, chọn giáo viên có tải ít nhất
    if (!bestTeacher) {
      for (const teacher of teachers) {
        const load = teacherLoad[teacher.magv];
        if (load < lowestLoad) {
          bestTeacher = teacher;
          lowestLoad = load;
        }
      }
    }
    
    return bestTeacher;
  }

  // Tạo phân công cân bằng giữa các giáo viên
  async createBalancedAssignments(classes, subjects, teachers, namhoc_id) {
    const assignments = [];
    const teacherLoad = {}; // Theo dõi số lớp mỗi giáo viên được phân công
    const subjectSpecialization = {}; // Theo dõi chuyên môn của giáo viên
    const classSubjectAssignments = new Set(); // Theo dõi các lớp-môn đã phân công
    
    // Khởi tạo tải cho mỗi giáo viên
    teachers.forEach(teacher => {
      teacherLoad[teacher.magv] = 0;
      subjectSpecialization[teacher.magv] = new Set();
    });
    
    // Tính toán số lớp trung bình mỗi giáo viên nên dạy
    const totalAssignments = classes.length * subjects.length;
    const avgLoadPerTeacher = Math.ceil(totalAssignments / teachers.length);
    const maxLoadPerTeacher = Math.min(avgLoadPerTeacher + 2, classes.length); // Cho phép lệch 2 lớp
    
    console.log(`Mỗi giáo viên sẽ dạy khoảng ${avgLoadPerTeacher} lớp môn học (tối đa ${maxLoadPerTeacher})`);
    
    // Sắp xếp giáo viên theo tải hiện tại (ít nhất trước)
    const sortedTeachers = [...teachers].sort((a, b) => teacherLoad[a.magv] - teacherLoad[b.magv]);
    
    // Phân công từng lớp-môn học (chỉ 1 giáo viên cho mỗi lớp-môn)
    for (const classInfo of classes) {
      for (const subject of subjects) {
        const classSubjectKey = `${classInfo.malop}_${subject.id}`;
        
        // Bỏ qua nếu lớp-môn này đã được phân công
        if (classSubjectAssignments.has(classSubjectKey)) {
          continue;
        }
        
        // Tìm giáo viên phù hợp nhất (có chuyên môn phù hợp)
        const bestTeacher = this.findBestTeacher(
          sortedTeachers,
          subject,
          teacherLoad,
          subjectSpecialization,
          maxLoadPerTeacher
        );
        
        if (bestTeacher) {
          assignments.push({
            lopid: classInfo.malop,
            monid: subject.id,
            giaovienid: bestTeacher.magv,
            namhoc_id: namhoc_id
          });
          
          // Đánh dấu lớp-môn này đã được phân công
          classSubjectAssignments.add(classSubjectKey);
          
          // Cập nhật tải
          teacherLoad[bestTeacher.magv]++;
          subjectSpecialization[bestTeacher.magv].add(subject.id);
          
          // Sắp xếp lại giáo viên theo tải
          sortedTeachers.sort((a, b) => teacherLoad[a.magv] - teacherLoad[b.magv]);
        }
      }
    }
    
    // Đảm bảo tất cả giáo viên có ít nhất 1 lớp
    await this.ensureAllTeachersHaveAssignments(assignments, classes, subjects, teachers, teacherLoad, subjectSpecialization, namhoc_id, classSubjectAssignments);
    
    // In thống kê phân công
    console.log('Thống kê phân công:');
    Object.entries(teacherLoad).forEach(([teacherId, load]) => {
      const teacher = teachers.find(t => t.magv === teacherId);
      console.log(`  ${teacher?.hoten || teacherId}: ${load} lớp môn học`);
    });
    
    return assignments;
  }

  // Đảm bảo tất cả giáo viên có ít nhất một lớp
  async ensureAllTeachersHaveAssignments(assignments, classes, subjects, teachers, teacherLoad, subjectSpecialization, namhoc_id, classSubjectAssignments) {
    const teachersWithoutAssignments = teachers.filter(teacher => teacherLoad[teacher.magv] === 0);
    
    if (teachersWithoutAssignments.length === 0) {
      return; // Tất cả giáo viên đã có phân công
    }
    
    console.log(`Đang đảm bảo ${teachersWithoutAssignments.length} giáo viên chưa có lớp được phân công...`);
    
    // Tìm các lớp-môn học có thể phân công thêm (chưa được phân công)
    const availableSlots = [];
    
    for (const classInfo of classes) {
      for (const subject of subjects) {
        const key = `${classInfo.malop}_${subject.id}`;
        if (!classSubjectAssignments.has(key)) {
          availableSlots.push({
            lopid: classInfo.malop,
            monid: subject.id,
            subject: subject
          });
        }
      }
    }
    
    // Phân công cho giáo viên chưa có lớp
    for (const teacher of teachersWithoutAssignments) {
      if (availableSlots.length === 0) {
        console.log(`Cảnh báo: Không còn slot trống cho giáo viên ${teacher.hoten}`);
        break;
      }
      
      // Tìm các slot phù hợp với chuyên môn của giáo viên
      const suitableSlots = availableSlots.filter(slot => 
        this.isTeacherQualifiedForSubject(teacher, slot.subject)
      );
      
      let slot;
      
      if (suitableSlots.length > 0) {
        // Ưu tiên 1: Chọn slot phù hợp chuyên môn
        const slotIndex = Math.floor(Math.random() * suitableSlots.length);
        slot = suitableSlots[slotIndex];
        console.log(`✅ Phân công đúng chuyên môn: ${teacher.hoten} (${teacher.chuyennganh}) -> ${slot.subject.tenmon}`);
      } else {
        // Ưu tiên 2: Nếu không có slot phù hợp, chọn slot gần nhất
        console.log(`⚠️ Không có môn phù hợp với chuyên môn '${teacher.chuyennganh}' của giáo viên ${teacher.hoten}, đang tìm môn gần nhất...`);
        
        // Tìm môn học "gần nhất" dựa trên từ khóa
        const closestSlots = this.findClosestSubjectSlots(teacher, availableSlots);
        
        if (closestSlots.length > 0) {
          const slotIndex = Math.floor(Math.random() * closestSlots.length);
          slot = closestSlots[slotIndex];
          console.log(`🔄 Phân công môn gần nhất: ${teacher.hoten} (${teacher.chuyennganh}) -> ${slot.subject.tenmon}`);
        } else {
          // Ưu tiên 3: Cuối cùng, phân công ngẫu nhiên để đảm bảo có lớp
          const slotIndex = Math.floor(Math.random() * availableSlots.length);
          slot = availableSlots[slotIndex];
          console.log(`🚨 Phân công ngẫu nhiên: ${teacher.hoten} (${teacher.chuyennganh}) -> ${slot.subject.tenmon} (không phù hợp chuyên môn)`);
        }
      }
      
      if (slot) {
        assignments.push({
          lopid: slot.lopid,
          monid: slot.monid,
          giaovienid: teacher.magv,
          namhoc_id: namhoc_id
        });
        
        // Đánh dấu lớp-môn này đã được phân công
        classSubjectAssignments.add(`${slot.lopid}_${slot.monid}`);
        
        // Cập nhật tải
        teacherLoad[teacher.magv]++;
        subjectSpecialization[teacher.magv].add(slot.monid);
        
        // Xóa slot đã dùng khỏi availableSlots
        const originalIndex = availableSlots.findIndex(s => 
          s.lopid === slot.lopid && s.monid === slot.monid
        );
        if (originalIndex !== -1) {
          availableSlots.splice(originalIndex, 1);
        }
      }
    }
  }

  // Tìm môn học gần nhất với chuyên môn của giáo viên
  findClosestSubjectSlots(teacher, availableSlots) {
    if (!teacher.chuyennganh) {
      return availableSlots; // Nếu không có chuyên môn, trả về tất cả
    }
    
    const teacherSpecialty = teacher.chuyennganh.toLowerCase().trim();
    const scoredSlots = availableSlots.map(slot => {
      const subjectName = slot.subject.tenmon.toLowerCase().trim();
      let score = 0;
      
      // Kiểm tra các từ khóa chung
      const commonKeywords = ['giáo dục', 'học', 'văn', 'toán', 'lý', 'hóa', 'sinh', 'sử', 'địa', 'tin', 'công nghệ'];
      
      for (const keyword of commonKeywords) {
        if (teacherSpecialty.includes(keyword) && subjectName.includes(keyword)) {
          score += 1;
        }
      }
      
      // Kiểm tra độ tương đồng về độ dài
      const lengthDiff = Math.abs(teacherSpecialty.length - subjectName.length);
      score += Math.max(0, 10 - lengthDiff); // Càng giống độ dài càng điểm cao
      
      return { ...slot, score };
    });
    
    // Sắp xếp theo điểm và lấy các slot có điểm cao nhất
    scoredSlots.sort((a, b) => b.score - a.score);
    const maxScore = scoredSlots[0]?.score || 0;
    
    if (maxScore === 0) {
      return availableSlots; // Nếu không có gì tương đồng, trả về tất cả
    }
    
    return scoredSlots.filter(slot => slot.score >= maxScore * 0.5); // Lấy các slot có điểm >= 50% của max
  }

  // Tìm giáo viên phù hợp nhất cho một môn học cụ thể
  findBestTeacher(teachers, subject, teacherLoad, subjectSpecialization, maxLoad) {
    let bestTeacher = null;
    let bestScore = -Infinity;
    
    for (const teacher of teachers) {
      // Bỏ qua nếu giáo viên đã đạt tải tối đa
      if (teacherLoad[teacher.magv] >= maxLoad) {
        continue;
      }
      
      // Kiểm tra chuyên môn của giáo viên
      if (!this.isTeacherQualifiedForSubject(teacher, subject)) {
        continue; // Bỏ qua nếu giáo viên không đủ chuyên môn
      }
      
      let score = 0;
      
      // Ưu tiên 1: Giáo viên chưa có lớp nào (ưu tiên cao nhất)
      if (teacherLoad[teacher.magv] === 0) {
        score += 200;
      }
      
      // Ưu tiên 2: Giáo viên đã dạy môn này trước
      if (subjectSpecialization[teacher.magv].has(subject.id)) {
        score += 50;
      }
      
      // Ưu tiên 3: Giáo viên có tải ít hơn
      const loadFactor = (maxLoad - teacherLoad[teacher.magv]) / maxLoad;
      score += loadFactor * 30;
      
      // Ưu tiên 4: Thêm yếu tố ngẫu nhiên để phân công đều
      score += Math.random() * 10;
      
      if (score > bestScore) {
        bestScore = score;
        bestTeacher = teacher;
      }
    }
    
    return bestTeacher;
  }

  // Kiểm tra xem giáo viên có đủ chuyên môn để dạy môn học này không
  isTeacherQualifiedForSubject(teacher, subject) {
    if (!teacher.chuyennganh || !subject.tenmon) {
      return false; // Cần có thông tin chuyên môn và tên môn
    }
    
    const teacherSpecialty = teacher.chuyennganh.toLowerCase().trim();
    const subjectName = subject.tenmon.toLowerCase().trim();
    
    // Các từ khóa tương đương cho từng môn học
    const literatureKeywords = ['văn', 'văn học', 'ngữ văn'];
    const mathKeywords = ['toán', 'toán học'];
    const englishKeywords = ['tiếng anh', 'anh', 'anh văn'];
    const physicsKeywords = ['vật lý', 'lý'];
    const chemistryKeywords = ['hóa học', 'hóa'];
    const biologyKeywords = ['sinh học', 'sinh'];
    const historyKeywords = ['lịch sử', 'sử'];
    const geographyKeywords = ['địa lý', 'địa'];
    const civicKeywords = ['giáo dục công dân', 'công dân', 'gdcd'];
    const itKeywords = ['tin học', 'tin', 'công nghệ thông tin', 'cntt'];
    const techKeywords = ['công nghệ', 'cn'];
    const peKeywords = ['thể dục', 'td', 'giáo dục thể chất'];
    const musicKeywords = ['âm nhạc', 'nhạc'];
    
    // Hàm kiểm tra xem hai chuỗi có cùng lĩnh vực không
    const isSameSubject = (specialty, subject) => {
      if (specialty === subject) return true;
      if (specialty.includes(subject) || subject.includes(specialty)) return true;
      
      // Kiểm tra các từ khóa tương đương
      const checkKeywords = (keywords, str1, str2) => {
        return keywords.some(keyword => 
          str1.includes(keyword) && str2.includes(keyword)
        );
      };
      
      return checkKeywords(literatureKeywords, specialty, subject) ||
             checkKeywords(mathKeywords, specialty, subject) ||
             checkKeywords(englishKeywords, specialty, subject) ||
             checkKeywords(physicsKeywords, specialty, subject) ||
             checkKeywords(chemistryKeywords, specialty, subject) ||
             checkKeywords(biologyKeywords, specialty, subject) ||
             checkKeywords(historyKeywords, specialty, subject) ||
             checkKeywords(geographyKeywords, specialty, subject) ||
             checkKeywords(civicKeywords, specialty, subject) ||
             checkKeywords(itKeywords, specialty, subject) ||
             checkKeywords(techKeywords, specialty, subject) ||
             checkKeywords(peKeywords, specialty, subject) ||
             checkKeywords(musicKeywords, specialty, subject);
    };
    
    return isSameSubject(teacherSpecialty, subjectName);
  }

  // Lấy tất cả giáo viên
  async fetchAllTeachers() {
    try {
      const query = 'SELECT magv, hoten, chuyennganh FROM giaovien ORDER BY hoten';
      const { rows } = await db.query(query);
      return rows;
    } catch (error) {
      console.error('Error fetching teachers:', error);
      throw new Error('Failed to fetch teachers');
    }
  }

  // Lấy tất cả lớp
  async fetchAllClasses() {
    try {
      const query = 'SELECT malop, tenlop FROM lop ORDER BY malop';
      const { rows } = await db.query(query);
      return rows;
    } catch (error) {
      console.error('Error fetching classes:', error);
      throw new Error('Failed to fetch classes');
    }
  }

  // Lấy tất cả môn học
  async fetchAllSubjects() {
    try {
      const query = 'SELECT id, tenmon FROM monhoc ORDER BY tenmon';
      const { rows } = await db.query(query);
      return rows;
    } catch (error) {
      console.error('Error fetching subjects:', error);
      throw new Error('Failed to fetch subjects');
    }
  }

  // Lưu phân công vào database
  async saveAssignmentsToDatabase(assignments, namhoc_id) {
    try {
      // Xóa phân công cũ cho năm học này
      await db.query('DELETE FROM phanconggiangday WHERE namhoc_id = $1', [namhoc_id]);
      
      // Chèn phân công mới
      for (const assignment of assignments) {
        await db.query(
          'INSERT INTO phanconggiangday (giaovienid, lopid, monid, namhoc_id) VALUES ($1, $2, $3, $4)',
          [assignment.giaovienid, assignment.lopid, assignment.monid, assignment.namhoc_id]
        );
      }
      
      console.log(`Đã lưu ${assignments.length} phân công vào database`);
    } catch (error) {
      console.error('Error saving assignments:', error);
      throw error;
    }
  }
}

module.exports = new HungarianScheduler();