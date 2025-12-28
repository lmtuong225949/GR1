const db = require('../config/db');

const ExamController = {

 
  async getAvailableExams(req, res) {
  try {
    const { mahs } = req.params;
    if (!mahs) {
      return res.status(400).json({ message: "Thiếu tham số: mahs" });
    }

    // Get student's class first
    const classQuery = `
      SELECT lopid 
      FROM hocsinh 
      WHERE mahs = $1
    `;
    
    const classResult = await db.query(classQuery, [mahs.trim()]);
    if (classResult.rows.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy học sinh" });
    }
    
    const studentClass = classResult.rows[0].lopid;

    const query = `
      SELECT 
        d.id AS dethiid,
        d.thoigian,
        d.tongdiem,
        d.socau,
        mh.tenmon
      FROM dethi d
      JOIN monhoc mh ON d.monid = mh.id
      WHERE d.id NOT IN (
        SELECT dethiid FROM baikiemtra WHERE mahs = $1
      )
      AND (d.lop IS NULL OR d.lop = $2)
      ORDER BY mh.tenmon;
    `;

    const result = await db.query(query, [mahs.trim(), studentClass]);
    res.json(result.rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
},

  
  async getExamDetails(req, res) {
    try {
      const { dethiid } = req.params;
      if (!dethiid) {
        return res.status(400).json({ message: "Thiếu dethiid" });
      }

      // Get student's class from session or token (assuming it's passed in headers or params)
      // For now, we'll check if the exam exists and is accessible
      const examQuery = `
        SELECT d.id, d.thoigian, d.tongdiem, mh.tenmon, d.lop
        FROM dethi d
        JOIN monhoc mh ON d.monid = mh.id
        WHERE d.id = $1;
      `;

      const examRes = await db.query(examQuery, [dethiid]);
      if (examRes.rows.length === 0) {
        return res.status(404).json({ message: "Không tìm thấy đề thi" });
      }

      const exam = examRes.rows[0];
      
      // Check if exam is class-specific and validate access
      if (exam.lop) {
        // This is a class-specific exam, you would need to validate student's class here
        // For now, we'll allow access but you should add proper validation
        console.log(`Class-specific exam for class: ${exam.lop}`);
      }

      const questionQuery = `
        SELECT 
          ch.id AS cauhoiid,
          ch.noidung,
          ch.diem,
          json_agg(
            json_build_object(
              'id', pa.id,
              'noidung', pa.noidung
            )
          ) AS phuongan
        FROM cauhoi ch
        JOIN phuongan pa ON pa.cauhoiid = ch.id
        WHERE ch.dethiid = $1
        GROUP BY ch.id
        ORDER BY ch.thutu;
      `;

      const questionRes = await db.query(questionQuery, [dethiid]);

      res.json({
        exam: exam,
        questions: questionRes.rows
      });

    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Lỗi máy chủ" });
    }
  },

  
  async submitExam(req, res) {
    const client = await db.pool.connect();
    try {
      const { mahs, dethiid, answers } = req.body;
      
      console.log('Received submission data:', { mahs, dethiid, answers });

      if (!mahs || !dethiid || !answers) {
        return res.status(400).json({ message: "Thiếu dữ liệu" });
      }

      await client.query('BEGIN');

      // tạo bài kiểm tra
      const insertBKT = `
        INSERT INTO baikiemtra (mahs, dethiid, trangthai, thoigianbatdau, thoigianketthuc)
        VALUES ($1, $2, 'danop', now(), now())
        RETURNING id;
      `;

      const bktRes = await client.query(insertBKT, [mahs, dethiid]);
      const baikiemtraid = bktRes.rows[0].id;

      // lưu bài làm chi tiết
      for (const [cauhoiid, phuonganid] of Object.entries(answers)) {
        console.log('Processing answer:', { cauhoiid, phuonganid, baikiemtraid });
        
        if (!cauhoiid || !phuonganid) {
          console.error('Invalid answer data:', { cauhoiid, phuonganid });
          continue;
        }
        
        await client.query(
          `
          INSERT INTO bailam_chitiet (baikiemtraid, cauhoiid, phuonganid)
          VALUES ($1, $2, $3);
          `,
          [baikiemtraid, cauhoiid, phuonganid]
        );
      }

      // chấm điểm tự động
      for (const [cauhoiid, phuonganid] of Object.entries(answers)) {
        // Get question and option details
        const result = await client.query(`
          SELECT ch.diem, pa.is_dung
          FROM cauhoi ch
          JOIN phuongan pa ON pa.cauhoiid = ch.id
          WHERE ch.id = $1 AND pa.id = $2
        `, [cauhoiid, phuonganid]);
        
        if (result.rows.length > 0) {
          const { diem, is_dung } = result.rows[0];
          const score = is_dung ? diem : 0;
          
          await client.query(`
            UPDATE bailam_chitiet
            SET dung = $1, diem = $2
            WHERE baikiemtraid = $3 AND cauhoiid = $4 AND phuonganid = $5
          `, [is_dung, score, baikiemtraid, cauhoiid, phuonganid]);
        }
      }

      // cập nhật điểm tổng
      await client.query(`
        UPDATE baikiemtra
        SET diem = (
          SELECT COALESCE(SUM(diem), 0)
          FROM bailam_chitiet
          WHERE baikiemtraid = $1
        )
        WHERE id = $1;
      `, [baikiemtraid]);

      await client.query('COMMIT');

      // Get exam results
      const resultQuery = `
        SELECT 
          bk.diem,
          COUNT(bl.id) as tongcau,
          COUNT(CASE WHEN bl.dung = true THEN 1 END) as dung
        FROM baikiemtra bk
        LEFT JOIN bailam_chitiet bl ON bl.baikiemtraid = bk.id
        WHERE bk.id = $1
        GROUP BY bk.diem
      `;
      
      const resultRes = await client.query(resultQuery, [baikiemtraid]);
      const result = resultRes.rows[0];

      res.json({
        diem: result.diem || 0,
        dung: result.dung || 0,
        tongcau: result.tongcau || 0
      });

    } catch (err) {
      await client.query('ROLLBACK');
      console.error(err);
      res.status(500).json({ message: "Lỗi khi nộp bài" });
    } finally {
      client.release();
    }
  },


  async getExamHistory(req, res) {
    try {
      const { mahs } = req.params;

      const query = `
        SELECT 
          bkt.id,
          bkt.diem,
          bkt.thoigianketthuc,
          mh.tenmon,
          d.tongdiem,
          d.id as dethiid
        FROM baikiemtra bkt
        JOIN dethi d ON bkt.dethiid = d.id
        JOIN monhoc mh ON d.monid = mh.id
        WHERE bkt.mahs = $1
        ORDER BY bkt.thoigianketthuc DESC;
      `;

      const result = await db.query(query, [mahs]);
      res.json(result.rows);

    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Lỗi máy chủ" });
    }
  }
};

module.exports = ExamController;
