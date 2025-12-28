const db = require('../config/db');

const ScoreController = {
  // Lấy toàn bộ danh sách điểm tổng quát của học sinh từ bảng ketquahoctap
  async getAllScores(req, res) {
    try {
      const query = `
        SELECT 
          hs.mahs,
          hs.hoten AS name,
          l.tenlop AS class,
          nh.kyhoc AS hocky,
          nh.namhoc,
          kqht.diemtrungbinh,
          COALESCE(kqht.hanhkiem, 'Chưa có') AS hanhkiem,
          COALESCE(kqht.xeploaihocluc, 'Chưa xếp loại') AS xeploaihocluc,
          COALESCE(kqht.nhanxet, 'Chưa có') AS nhanxet
        FROM hocsinh hs
        LEFT JOIN lop l ON hs.lopid = l.malop
        LEFT JOIN ketquahoctap kqht ON hs.mahs = kqht.mahs
        LEFT JOIN namhoc nh ON kqht.namhoc_id = nh.id
        WHERE hs.mahs IS NOT NULL 
          AND hs.hoten IS NOT NULL
        ORDER BY hs.mahs, nh.namhoc, nh.kyhoc;
      `;

      const result = await db.query(query);

      const fixedRows = result.rows.map((row) => ({
        ...row,
        diemtrungbinh: row.diemtrungbinh !== null ? parseFloat(row.diemtrungbinh) : null,
      }));

      return res.json(fixedRows);
    } catch (err) {
      console.error("Lỗi khi lấy kết quả học tập:", err);
      return res.status(500).json({ message: "Lỗi máy chủ" });
    }
  },

  // Lấy dữ liệu từ bảng diem (cho Reports.js)
  async getDiemData(req, res) {
    try {
      const query = `
        SELECT 
          d.mahs,
          hs.hoten AS hocsinh,
          mh.tenmon AS monhoc,
          ld.tenloaidiem AS loaidiem,
          d.giatri AS diem,
          d.lanthu,
          nh.namhoc,
          nh.kyhoc AS hocky
        FROM diem d
        JOIN hocsinh hs ON d.mahs = hs.mahs
        JOIN monhoc mh ON d.monid = mh.id
        JOIN loaidiem ld ON d.loaidiemid = ld.id
        JOIN namhoc nh ON d.namhoc_id = nh.id
        ORDER BY d.mahs, nh.namhoc, nh.kyhoc, mh.tenmon, ld.heso, d.lanthu;
      `;

      const result = await db.query(query);
      return res.json(result.rows);
    } catch (err) {
      console.error("Lỗi khi lấy dữ liệu điểm:", err);
      return res.status(500).json({ message: "Lỗi máy chủ" });
    }
  },

  async getStudentSubjectAverages(req, res) {
    try {
      const { mahs } = req.params;
      
      if (!mahs) {
        return res.status(400).json({ message: "Thiếu tham số: mahs" });
      }

      const query = `
        SELECT 
          dtb.mahs,
          mh.tenmon AS monhoc,
          dtb.diemtrungbinh,
          nh.namhoc,
          nh.kyhoc AS hocky
        FROM diemtbmon dtb
        JOIN monhoc mh ON dtb.monid = mh.id
        JOIN namhoc nh ON dtb.namhoc_id = nh.id
        WHERE dtb.mahs = $1
        ORDER BY nh.namhoc DESC, nh.kyhoc, mh.tenmon;
      `;

      const result = await db.query(query, [mahs]);
      
      return res.json(result.rows);
    } catch (err) {
      console.error("Lỗi khi lấy điểm trung bình môn:", err);
      return res.status(500).json({ message: "Lỗi máy chủ", error: err.message });
    }
  },

  async getScoreDetail(req, res) {
    try {
      const { mahs } = req.params;
      const { hocky, namhoc, namhoc_id } = req.query;
  
      if (!mahs || !hocky || (!namhoc && !namhoc_id)) {
        return res.status(400).json({ message: "Thiếu tham số: mahs, hocky, hoặc namhoc" });
      }

      let finalNamhocId = namhoc_id;
      if (namhoc && !namhoc_id) {
        const namhocQuery = `SELECT id FROM namhoc WHERE namhoc = $1`;
        const namhocResult = await db.query(namhocQuery, [namhoc]);
        if (namhocResult.rows.length === 0) {
          return res.status(400).json({ message: "Không tìm thấy năm học" });
        }
        finalNamhocId = namhocResult.rows[0].id;
      }
  
      const detailQuery = `
        SELECT 
          mh.tenmon AS monhoc,
          ld.tenloaidiem AS loaidiem,
          ld.heso,
          d.giatri AS diem,
          d.lanthu
        FROM diem d
        JOIN monhoc mh ON d.monid = mh.id
        JOIN loaidiem ld ON d.loaidiemid = ld.id
        WHERE d.mahs = $1 AND d.monid = $2 AND d.namhoc_id = $3
        ORDER BY mh.tenmon, ld.heso, d.lanthu;
      `;
      
      const subjectsQuery = `
        SELECT DISTINCT d.monid, mh.tenmon
        FROM diem d
        JOIN monhoc mh ON d.monid = mh.id
        WHERE d.mahs = $1 AND d.namhoc_id = $2
      `;
      
      const subjectsResult = await db.query(subjectsQuery, [mahs, parseInt(finalNamhocId)]);
      
      const map = {};
      
      subjectsResult.rows.forEach(row => {
        const monhoc = row.tenmon;
        map[monhoc] = {
          monhoc,
          diem15phut: [],
          diem1tiet: [],
          diemcuoiky: [],
          diemgiuaky: [],
          allGrades: []
        };
      });
      
      for (const subjectRow of subjectsResult.rows) {
        const monid = subjectRow.monid;
        const detailResult = await db.query(detailQuery, [mahs, monid, parseInt(finalNamhocId)]);
        
        detailResult.rows.forEach(row => {
          const monhoc = row.monhoc;
          const loaidiem = row.loaidiem?.toLowerCase() || '';
          const gradeValue = row.diem !== null ? parseFloat(row.diem) : null;
          
          if (gradeValue !== null) {
            if (loaidiem.includes("15")) {
              map[monhoc].diem15phut.push(gradeValue);
            } else if (loaidiem.includes("1 tiết")) {
              map[monhoc].diem1tiet.push(gradeValue);
            } else if (loaidiem.includes("giữa kỳ")) {
              map[monhoc].diemgiuaky.push(gradeValue);
            } else if (loaidiem.includes("cuối kỳ")) {
              map[monhoc].diemcuoiky.push(gradeValue);
            } else {
              map[monhoc].diem1tiet.push(gradeValue);
            }
            
            map[monhoc].allGrades.push(gradeValue);
          }
        });
      }
      
      const finalData = Object.values(map).map(subject => {
        const avg15phut = subject.diem15phut.length > 0 
          ? subject.diem15phut.reduce((a, b) => a + b, 0) / subject.diem15phut.length 
          : null;
        const avg1tiet = subject.diem1tiet.length > 0 
          ? subject.diem1tiet.reduce((a, b) => a + b, 0) / subject.diem1tiet.length 
          : null;
        const avggiuaky = subject.diemgiuaky.length > 0 
          ? subject.diemgiuaky.reduce((a, b) => a + b, 0) / subject.diemgiuaky.length 
          : null;
        const avgcuoiky = subject.diemcuoiky.length > 0 
          ? subject.diemcuoiky.reduce((a, b) => a + b, 0) / subject.diemcuoiky.length 
          : null;
        
        let weightedSum = 0;
        let totalWeight = 0;
        
        if (avg15phut !== null) {
          weightedSum += avg15phut * 1;
          totalWeight += 1;
        }
        if (avg1tiet !== null) {
          weightedSum += avg1tiet * 2;
          totalWeight += 2;
        }
        if (avggiuaky !== null) {
          weightedSum += avggiuaky * 2;
          totalWeight += 2;
        }
        if (avgcuoiky !== null) {
          weightedSum += avgcuoiky * 3;
          totalWeight += 3;
        }
        
        const weightedAverage = totalWeight > 0 ? weightedSum / totalWeight : null;
          
        return {
          monhoc: subject.monhoc,
          diem15phut: avg15phut,
          diem1tiet: avg1tiet,
          diemgiuaky: avggiuaky,
          diemcuoiky: avgcuoiky,
          diemtrungbinh: weightedAverage
        };
      });
  
      return res.json(finalData);
    } catch (err) {
      console.error("Lỗi khi lấy chi tiết điểm:", err);
      return res.status(500).json({ message: "Lỗi máy chủ", error: err.message });
    }
  },

  // Get available exams for a student
  async getAvailableExams(req, res) {
    try {
      const { mahs } = req.params;
      
      if (!mahs) {
        return res.status(400).json({ message: "Thiếu tham số: mahs" });
      }

      const query = `
        SELECT DISTINCT 
          d.id as dethiid,
          d.tendethi,
          d.thoigian,
          d.socauhoi,
          d.monid,
          mh.tenmon,
          nh.id as namhoc_id,
          nh.namhoc,
          nh.kyhuc as hocky
        FROM dethi d
        JOIN monhoc mh ON d.monid = mh.id
        JOIN namhoc nh ON d.namhoc_id = nh.id
        WHERE d.trangthai = true
          AND d.id NOT IN (
            SELECT bkt.dethiid 
            FROM baikiemtra bkt 
            WHERE bkt.mahs = $1
          )
        ORDER BY nh.namhoc DESC, nh.kyhoc, mh.tenmon;
      `;

      const result = await db.query(query, [mahs]);
      
      return res.json(result.rows);
    } catch (err) {
      console.error("Lỗi khi lấy danh sách bài kiểm tra:", err);
      return res.status(500).json({ message: "Lỗi máy chủ", error: err.message });
    }
  },

  // Get exam details and questions
  async getExamDetails(req, res) {
    try {
      const { dethiid } = req.params;
      
      if (!dethiid) {
        return res.status(400).json({ message: "Thiếu tham số: dethiid" });
      }

      const examQuery = `
        SELECT 
          d.id,
          d.tendethi,
          d.thoigian,
          d.socauhoi,
          d.monid,
          mh.tenmon,
          nh.namhoc,
          nh.kyhuc as hocky
        FROM dethi d
        JOIN monhoc mh ON d.monid = mh.id
        JOIN namhoc nh ON d.namhoc_id = nh.id
        WHERE d.id = $1 AND d.trangthai = true;
      `;

      const questionsQuery = `
        SELECT 
          cq.id,
          cq.noidung,
          cq.loaicauhoi,
          cq.dapan
        FROM caucham cq
        WHERE cq.dethiid = $1
        ORDER BY cq.id;
      `;

      const [examResult, questionsResult] = await Promise.all([
        db.query(examQuery, [dethiid]),
        db.query(questionsQuery, [dethiid])
      ]);

      if (examResult.rows.length === 0) {
        return res.status(404).json({ message: "Không tìm thấy bài kiểm tra" });
      }

      const exam = examResult.rows[0];
      const questions = questionsResult.rows;

      return res.json({
        exam: exam,
        questions: questions
      });
    } catch (err) {
      console.error("Lỗi khi lấy chi tiết bài kiểm tra:", err);
      return res.status(500).json({ message: "Lỗi máy chủ", error: err.message });
    }
  },

  // Submit exam
  async submitExam(req, res) {
    try {
      const { mahs, dethiid, answers, ngaykiemtra } = req.body;
      
      if (!mahs || !dethiid || !answers) {
        return res.status(400).json({ message: "Thiếu tham số bắt buộc" });
      }

      // Get exam details
      const examQuery = `
        SELECT d.id, d.thoigian, d.socauhoi, d.monid, d.namhoc_id
        FROM dethi d
        WHERE d.id = $1 AND d.trangthai = true;
      `;

      const examResult = await db.query(examQuery, [dethiid]);
      
      if (examResult.rows.length === 0) {
        return res.status(404).json({ message: "Không tìm thấy bài kiểm tra" });
      }

      const exam = examResult.rows[0];

      // Check if student already took this exam
      const existingExamQuery = `
        SELECT id FROM baikiemtra 
        WHERE mahs = $1 AND dethiid = $2;
      `;

      const existingResult = await db.query(existingExamQuery, [mahs, dethiid]);
      
      if (existingResult.rows.length > 0) {
        return res.status(400).json({ message: "Bạn đã làm bài kiểm tra này rồi" });
      }

      // Calculate score
      const questionsQuery = `
        SELECT cq.id, cq.dapan
        FROM caucham cq
        WHERE cq.dethiid = $1;
      `;

      const questionsResult = await db.query(questionsQuery, [dethiid]);
      const correctAnswers = questionsResult.rows;

      let correctCount = 0;
      correctAnswers.forEach(question => {
        if (answers[question.id] === question.dapan) {
          correctCount++;
        }
      });

      const score = (correctCount / exam.socauhoi) * 10;

      // Insert exam result
      const insertQuery = `
        INSERT INTO baikiemtra (mahs, dethiid, diem, ngaykiemtra, namhoc_id)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id;
      `;

      const insertResult = await db.query(insertQuery, [
        mahs,
        dethiid,
        score,
        ngaykiemtra || new Date(),
        exam.namhoc_id
      ]);

      return res.json({
        success: true,
        examId: insertResult.rows[0].id,
        score: score,
        correctCount: correctCount,
        totalQuestions: exam.socauhoi
      });
    } catch (err) {
      console.error("Lỗi khi nộp bài kiểm tra:", err);
      return res.status(500).json({ message: "Lỗi máy chủ", error: err.message });
    }
  }
};

module.exports = ScoreController;