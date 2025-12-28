const db = require('../config/db');

const PromotionController = {
  // Lấy danh sách học sinh theo lớp và năm học
  getStudentsByClass: async (req, res) => {
    try {
      const { currentClass, currentYear } = req.query;

      if (!currentClass || !currentYear) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng cung cấp đầy đủ thông tin lớp và năm học'
        });
      }

      // Debug: Test basic query first
      console.log('Debug: Checking class existence...');
      const classCheck = await db.query(
        'SELECT malop, tenlop FROM lop WHERE tenlop = $1',
        [currentClass]
      );
      console.log('Class found:', classCheck.rows);

      console.log('Debug: Checking students in class...');
      const studentCheck = await db.query(
        'SELECT hs.mahs, hs.hoten, hs.lopid FROM hocsinh hs WHERE hs.lopid IN (SELECT malop FROM lop WHERE tenlop = $1)',
        [currentClass]
      );
      console.log('Students in class:', studentCheck.rows);

      const query = `
        SELECT 
          hs.mahs AS id,
          hs.mahs AS "studentCode",
          hs.hoten AS name,
          hs.gioitinh AS gender,
          COALESCE(TO_CHAR(hs.ngaysinh, 'DD/MM/YYYY'), '') AS "birthDate",
          l.tenlop AS "className",
          COALESCE(nh.namhoc, $2) AS "academicYear",
          CASE 
            WHEN hs.manamhoc IS NULL THEN 'Đã tốt nghiệp'
            ELSE 'Đang học'
          END AS status
        FROM hocsinh hs
        JOIN lop l ON hs.lopid = l.malop
        LEFT JOIN namhoc nh ON l.namhoc_id = nh.id
        WHERE l.tenlop = $1
        ORDER BY hs.hoten;
      `;

      const { rows } = await db.query(query, [currentClass, currentYear]);

      return res.status(200).json({
        success: true,
        data: rows,
        message: rows.length
          ? 'Lấy danh sách học sinh thành công'
          : 'Không có học sinh trong lớp này của năm học đã chọn'
      });
    } catch (error) {
      console.error('Error fetching students:', error);
      res.status(500).json({
        success: false,
        message: 'Đã xảy ra lỗi khi lấy danh sách học sinh',
        error: error.message
      });
    }
  },

  // Lấy danh sách lớp học
  getClasses: async (req, res) => {
    try {
      const { rows: classes } = await db.query(`
        SELECT 
          malop AS id,
          tenlop AS "className",
          khoi AS "grade"
        FROM lop
        ORDER BY khoi, tenlop ASC
      `);
      res.status(200).json({ success: true, data: classes });
    } catch (error) {
      console.error('Error fetching classes:', error);
      res.status(500).json({
        success: false,
        message: 'Đã xảy ra lỗi khi lấy danh sách lớp',
        error: error.message
      });
    }
  },

  // Lấy danh sách năm học
  getAcademicYears: async (req, res) => {
    try {
      const { rows: years } = await db.query(`
        SELECT id, namhoc as year
        FROM namhoc
        WHERE namhoc IS NOT NULL
        ORDER BY namhoc DESC
      `);
      res.status(200).json({ success: true, data: years });
    } catch (error) {
      console.error('Error fetching academic years:', error);
      res.status(500).json({
        success: false,
        message: 'Đã xảy ra lỗi khi lấy danh sách năm học',
        error: error.message
      });
    }
  },

  // Xử lý lên lớp
  promoteStudents: async (req, res) => {
    const client = await db.connect();
    try {
      const { studentIds, currentYear, nextYear, currentClass, nextClass } = req.body;

      if (!studentIds?.length || !currentYear || !nextYear) {
        return res.status(400).json({
          success: false,
          message: 'Thiếu thông tin bắt buộc'
        });
      }

      await client.query('BEGIN');

      if (nextClass) {
        // Chuyển lớp - tìm lớp mới
        const classQuery = await client.query(
          'SELECT malop FROM lop WHERE tenlop = $1',
          [nextClass]
        );

        if (classQuery.rows.length === 0) {
          await client.query('ROLLBACK');
          return res.status(404).json({
            success: false,
            message: 'Không tìm thấy lớp mới'
          });
        }

        const newClassId = classQuery.rows[0].malop;

        // Cập nhật lớp của học sinh
        const { rowCount } = await client.query(
          `UPDATE hocsinh 
           SET lopid = $1
           WHERE mahs = ANY($2::varchar[]) 
           RETURNING mahs`,
          [newClassId, studentIds]
        );

        await client.query('COMMIT');

        res.status(200).json({
          success: true,
          message: `Đã chuyển ${rowCount} học sinh lên lớp ${nextClass} thành công`,
          data: { promotedCount: rowCount }
        });
      } else {
        // Xét tốt nghiệp - cập nhật năm học kết thúc
        const { rowCount } = await client.query(
          `UPDATE hocsinh 
           SET manamhoc = NULL
           WHERE mahs = ANY($1::varchar[]) 
           RETURNING mahs`,
          [studentIds]
        );

        await client.query('COMMIT');

        res.status(200).json({
          success: true,
          message: `Đã xét tốt nghiệp cho ${rowCount} học sinh thành công`,
          data: { graduatedCount: rowCount }
        });
      }
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error promoting students:', error);
      res.status(500).json({
        success: false,
        message: 'Đã xảy ra lỗi khi xử lý lên lớp',
        error: error.message
      });
    } finally {
      client.release();
    }
  }
};

module.exports = PromotionController;
