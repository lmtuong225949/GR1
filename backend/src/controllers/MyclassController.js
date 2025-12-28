const db = require("../config/db");

const getMyClass = async (req, res) => {
  const magv = req.user.magv;

  try {
    const query = `
      SELECT
        l.malop, 
        l.tenlop, 
        l.khoi, 
        gv.hoten as tengiaovien, 
        l.ghichu, 
        l.sochongoi,
        l.gvcn
      FROM lop l
      JOIN giaovien gv ON l.gvcn = gv.magv
      WHERE l.gvcn = $1
    `;

    const { rows } = await db.query(query, [magv]);

    if (rows.length === 0) {
      return res.json({ message: "Bạn không phải giáo viên chủ nhiệm lớp nào." });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error("Lỗi truy vấn PostgreSQL:", error);
    res.status(500).json({ message: "Lỗi server khi truy vấn dữ liệu." });
  }
};

const getScoresByClass = async (req, res) => {
  try {
    const { malop } = req.params;
    if (!malop) {
      return res.status(400).json({ message: "Thiếu mã lớp" });
    }

    const query = `
      SELECT 
        hs.mahs,
        hs.hoten,
        nh.kyhoc as hocky,
        nh.namhoc,
        COALESCE(ROUND(kqht.diemtrungbinh::numeric, 2), 0) as diemtrungbinh,
        COALESCE(kqht.nhanxet, 'Không có') as nhanxet
      FROM hocsinh hs
      LEFT JOIN ketquahoctap kqht ON hs.mahs = kqht.mahs
      LEFT JOIN namhoc nh ON kqht.namhoc_id = nh.id
      WHERE hs.lopid = $1 
        AND kqht.diemtrungbinh IS NOT NULL
      ORDER BY hs.hoten, nh.namhoc, nh.kyhoc;
    `;

    const { rows } = await db.query(query, [malop]);

    const result = rows.map(row => ({
      mahs: row.mahs,
      hoten: row.hoten,
      hocky: row.hocky,
      namhoc: row.namhoc,
      diemtrungbinh: row.diemtrungbinh !== null ? parseFloat(row.diemtrungbinh) : null,
      nhanxet: row.nhanxet || "Không có",
    }));

    return res.json(result);
  } catch (err) {
    console.error("Lỗi chi tiết khi lấy điểm tổng hợp theo lớp:", {
      error: err,
      message: err.message,
      stack: err.stack
    });
    return res.status(500).json({ 
      message: "Lỗi máy chủ",
      error: err.message 
    });
  }
};
const getScoreDistributionByClass = async (req, res) => {
  try {
    const { malop } = req.params;
    const { hocky, namhoc } = req.query;

    if (!malop || !hocky || !namhoc) {
      return res.status(400).json({ message: "Thiếu mã lớp, học kỳ hoặc năm học" });
    }

    // Sử dụng width_bucket để phân nhóm điểm thành 10 khoảng, mỗi khoảng 1 điểm (0-1, 1-2, ...)
    const query = `
      SELECT
        CASE 
          WHEN bucket = 0 THEN '0-1'
          WHEN bucket = 1 THEN '1-2'
          WHEN bucket = 2 THEN '2-3'
          WHEN bucket = 3 THEN '3-4'
          WHEN bucket = 4 THEN '4-5'
          WHEN bucket = 5 THEN '5-6'
          WHEN bucket = 6 THEN '6-7'
          WHEN bucket = 7 THEN '7-8'
          WHEN bucket = 8 THEN '8-9'
          WHEN bucket = 9 THEN '9-10'
          ELSE 'Khác'
        END AS range,
        COUNT(*) AS so_luong
      FROM (
        SELECT
          hs.mahs,
          width_bucket(COALESCE(kqht.diemtrungbinh, 0), 0, 10, 10) - 1 AS bucket
        FROM hocsinh hs
        LEFT JOIN ketquahoctap kqht ON hs.mahs = kqht.mahs
        LEFT JOIN namhoc nh ON kqht.namhoc_id = nh.id
        WHERE hs.lopid = $1 
          AND nh.kyhoc = $2 
          AND nh.namhoc = $3
          AND kqht.diemtrungbinh IS NOT NULL
        GROUP BY hs.mahs, kqht.diemtrungbinh
      ) sub
      GROUP BY bucket
      ORDER BY bucket;
    `;

    const { rows } = await db.query(query, [malop, hocky, namhoc]);

    return res.json(rows);
  } catch (err) {
    console.error("Lỗi khi lấy phân phối điểm theo lớp:", err);
    return res.status(500).json({ message: "Lỗi máy chủ", error: err.message });
  }
};

const updateScore = async (req, res) => {
  try {
    const mahs = req.params.mahs.trim(); 
    const hocky = req.params.hocky;
    const namhoc = req.params.namhoc;
    const { nhanxet } = req.body;

    if (!mahs || !hocky || !namhoc) {
      return res.status(400).json({ message: "Thiếu thông tin để cập nhật" });
    }

    const query = `
      UPDATE ketquahoctap
      SET nhanxet = $1
      WHERE mahs = $2 AND hocky = $3 AND namhoc = $4
    `;

    const values = [nhanxet, mahs, hocky, namhoc];

    const result = await db.query(query, values);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Không tìm thấy bản ghi cần cập nhật" });
    }

    return res.json({ message: "Cập nhật thành công" });
  } catch (error) {
    console.error("Lỗi khi cập nhật điểm:", error);
    return res.status(500).json({ message: "Lỗi máy chủ", error: error.message });
  }
};


const getDetailedScoresByClass = async (req, res) => {
  try {
    const { malop } = req.params;
    const { hocky, namhoc } = req.query;

    if (!malop || !hocky || !namhoc) {
      return res.status(400).json({ message: "Thiếu mã lớp, học kỳ hoặc năm học" });
    }

    // Lấy điểm chi tiết theo từng môn cho học sinh trong lớp
    const query = `
      SELECT 
        hs.mahs,
        hs.hoten,
        nh.kyhoc as hocky,
        nh.namhoc,
        COALESCE(kqht.diemtrungbinh, 0) as diemtrungbinh,
        COALESCE(kqht.nhanxet, 'Không có') as nhanxet,
        m.tenmon,
        d.giatri as diemgiatri,
        d.lanthu,
        ld.tenloaidiem,
        ld.heso
      FROM hocsinh hs
      LEFT JOIN ketquahoctap kqht ON hs.mahs = kqht.mahs
      LEFT JOIN namhoc nh ON kqht.namhoc_id = nh.id
      LEFT JOIN diem d ON hs.mahs = d.mahs AND d.namhoc_id = kqht.namhoc_id
      LEFT JOIN monhoc m ON d.monid = m.id
      LEFT JOIN loaidiem ld ON d.loaidiemid = ld.id
      WHERE hs.lopid = $1 
        AND nh.kyhoc = $2 
        AND nh.namhoc = $3
      ORDER BY hs.hoten, m.tenmon, ld.tenloaidiem, d.lanthu;
    `;

    const { rows } = await db.query(query, [malop, hocky, namhoc]);

    // Group data by student
    const studentData = {};
    
    rows.forEach(row => {
      if (!studentData[row.mahs]) {
        studentData[row.mahs] = {
          mahs: row.mahs,
          hoten: row.hoten,
          hocky: row.hocky,
          namhoc: row.namhoc,
          diemtrungbinh: row.diemtrungbinh,
          nhanxet: row.nhanxet,
          subjects: {}
        };
      }

      // Group subjects
      if (row.tenmon) {
        if (!studentData[row.mahs].subjects[row.tenmon]) {
          studentData[row.mahs].subjects[row.tenmon] = {
            monhoc: row.tenmon,
            diemmieng: null,
            diem15phut: null,
            diem1tiet: null,
            diemcuoaky: null,
            diemtrungbinh: null,
            allGrades: []
          };
        }

        // Add grade to subject
        const gradeType = row.tenloaidiem?.toLowerCase() || '';
        const gradeValue = parseFloat(row.diemgiatri);
        
        if (!isNaN(gradeValue) && gradeValue !== null && gradeValue !== undefined) {
          studentData[row.mahs].subjects[row.tenmon].allGrades.push({
            value: gradeValue,
            lanthu: row.lanthu,
            heso: row.heso || 1
          });

          // Categorize grades by type
          if (gradeType.includes('miệng') || gradeType.includes('mouth') || gradeType.includes('oral')) {
            if (!studentData[row.mahs].subjects[row.tenmon].diemmieng || 
                parseFloat(studentData[row.mahs].subjects[row.tenmon].diemmieng) < gradeValue) {
              studentData[row.mahs].subjects[row.tenmon].diemmieng = gradeValue;
            }
          } else if (gradeType.includes('15') || gradeType.includes('15 phút')) {
            if (!studentData[row.mahs].subjects[row.tenmon].diem15phut || 
                parseFloat(studentData[row.mahs].subjects[row.tenmon].diem15phut) < gradeValue) {
              studentData[row.mahs].subjects[row.tenmon].diem15phut = gradeValue;
            }
          } else if (gradeType.includes('1 tiết') || gradeType.includes('giữa kỳ')) {
            if (!studentData[row.mahs].subjects[row.tenmon].diem1tiet || 
                parseFloat(studentData[row.mahs].subjects[row.tenmon].diem1tiet) < gradeValue) {
              studentData[row.mahs].subjects[row.tenmon].diem1tiet = gradeValue;
            }
          } else if (gradeType.includes('cuối kỳ')) {
            if (!studentData[row.mahs].subjects[row.tenmon].diemcuoaky || 
                parseFloat(studentData[row.mahs].subjects[row.tenmon].diemcuoaky) < gradeValue) {
              studentData[row.mahs].subjects[row.tenmon].diemcuoaky = gradeValue;
            }
          }
        }
      }
    });

    // Calculate subject averages and convert to array
    const result = Object.values(studentData).map(student => {
      const subjects = Object.values(student.subjects).map(subject => {
        // Calculate weighted average for subject
        const grades = subject.allGrades;
        let avgSubject = null;
        
        if (grades.length > 0) {
          let weightedSum = 0;
          let totalWeight = 0;
          
          grades.forEach(grade => {
            weightedSum += grade.value * grade.heso;
            totalWeight += grade.heso;
          });
          
          if (totalWeight > 0) {
            avgSubject = weightedSum / totalWeight;
          }
        }

        return {
          monhoc: subject.monhoc,
          diemmieng: subject.diemmieng,
          diem15phut: subject.diem15phut,
          diem1tiet: subject.diem1tiet,
          diemcuoaky: subject.diemcuoaky,
          diemtrungbinh: avgSubject
        };
      });

      return {
        ...student,
        subjects: subjects
      };
    });

    return res.json({ success: true, data: result });
  } catch (err) {
    console.error("Lỗi khi lấy điểm chi tiết theo lớp:", err);
    return res.status(500).json({ 
      message: "Lỗi máy chủ", 
      error: err.message 
    });
  }
};

module.exports = {
  getMyClass,
  getScoresByClass,
  updateScore,
  getScoreDistributionByClass,
  getDetailedScoresByClass,
};
