// controllers/studentsController.js
const db = require('../config/db');

// GET /api/students/count
exports.getCount = async (req, res) => {
  try {
    const result = await db.query('SELECT COUNT(*) AS count FROM hocsinh');
    return res.json(result.rows[0]);
  } catch (err) {
    console.error('Error getting students count:', err);
    return res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};

// GET /api/students?search=&page=1&limit=50
exports.getAllStudents = async (req, res) => {
  try {
    const { search = "", page, limit } = req.query;
    const searchTerm = `%${search.toLowerCase()}%`;
    const hasSearch = search.trim() !== "";

    let whereClause = "";
    const params = [];

    if (hasSearch) {
      whereClause = `WHERE LOWER(hs.hoten) LIKE $1 OR LOWER(COALESCE(l.tenlop, '')) LIKE $1 OR LOWER(hs.mahs) LIKE $1`;
      params.push(searchTerm);
    }

    // Đếm tổng số bản ghi
    const countQuery = `
      SELECT COUNT(*) AS total
      FROM hocsinh hs
      LEFT JOIN lop l ON hs.lopid = l.malop
      ${whereClause}
    `;
    const countResult = await db.query(countQuery, params);
    const total = parseInt(countResult.rows[0].total);

    // Phân trang nếu có
    let limitClause = "";
    if (page && limit) {
      const offset = (parseInt(page) - 1) * parseInt(limit);
      params.push(limit, offset);
      limitClause = `LIMIT $${params.length - 1} OFFSET $${params.length}`;
    }

    // Truy vấn dữ liệu
    const dataQuery = `
      SELECT 
        hs.mahs,
        COALESCE(hs.hoten, '') AS hoten,
        COALESCE(hs.gioitinh, '') AS gioitinh,
        COALESCE(hs.ngaysinh, NULL) AS ngaysinh,
        COALESCE(hs.diachi, '') AS diachi,
        COALESCE(hs.sdt, '') AS sdt,
        COALESCE(hs.email, '') AS email,
        COALESCE(hs.lopid, '') AS lopid,
        COALESCE(l.tenlop, '') AS tenlop
      FROM hocsinh hs
      LEFT JOIN lop l ON hs.lopid = l.malop
      ${whereClause}
      ORDER BY hs.mahs
      ${limitClause}
    `;
    const dataResult = await db.query(dataQuery, params);

    res.json({
      data: dataResult.rows,
      total,
    });
  } catch (err) {
    console.error("Lỗi khi lấy học sinh:", err);
    res.status(500).send("Lỗi truy vấn");
  }
};

// GET /api/students/gvcn/:magv
exports.getStudentsByGVCN = async (req, res) => {
  try {
    const { magv } = req.params;
    if (!magv) return res.status(400).json({ message: "Thiếu mã giáo viên" });

    const query = `
      SELECT hs.mahs, hs.hoten, hs.lopid, COALESCE(l.tenlop, '') AS tenlop
      FROM hocsinh hs
      LEFT JOIN lop l ON hs.lopid = l.malop
      WHERE l.magvcn = $1
      ORDER BY hs.hoten;
    `;

    const result = await db.query(query, [magv]);

    return res.json(result.rows);
  } catch (err) {
    console.error("Lỗi lấy học sinh theo GVCN:", err);
    return res.status(500).json({ message: "Lỗi máy chủ" });
  }
};

// POST /api/students
exports.addStudent = async (req, res) => {
  try {
    const { mahs, hoten, gioitinh, ngaysinh, diachi, sdt, email, malop } = req.body;

    if (!mahs || !hoten || !malop) {
      return res.status(400).json({ message: "Thiếu thông tin bắt buộc" });
    }

    const insertQuery = `
      INSERT INTO hocsinh (mahs, hoten, gioitinh, ngaysinh, diachi, sdt, email, lopid)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `;

    await db.query(insertQuery, [mahs, hoten, gioitinh, ngaysinh, diachi, sdt, email, malop]);

    res.status(201).json({ message: "Thêm học sinh thành công" });
  } catch (err) {
    console.error("Lỗi thêm học sinh:", err);
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
};

// PUT /api/students/update/:mahs
exports.updateStudent = async (req, res) => {
  try {
    const { mahs } = req.params;
    const { hoten, gioitinh, ngaysinh, diachi, sdt, email, lopID } = req.body;

    if (!mahs) {
      return res.status(400).json({ message: "Mã học sinh không hợp lệ" });
    }

    const updateQuery = `
      UPDATE hocsinh 
      SET hoten = $1, 
          gioitinh = $2, 
          ngaysinh = $3, 
          diachi = $4, 
          sdt = $5, 
          email = $6, 
          lopid = $7
      WHERE mahs = $8
    `;

    const result = await db.query(updateQuery, [
      hoten, gioitinh, ngaysinh, diachi, sdt, email, lopID, mahs
    ]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Không tìm thấy học sinh" });
    }

    res.status(200).json({ message: "Cập nhật học sinh thành công" });
  } catch (err) {
    console.error("Lỗi cập nhật học sinh:", err);
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
};

// DELETE /api/students/delete/:mahs
exports.deleteStudent = async (req, res) => {
  try {
    const { mahs } = req.params;

    if (!mahs) {
      return res.status(400).json({ message: "Mã học sinh không hợp lệ" });
    }

    const deleteQuery = `
      DELETE FROM hocsinh 
      WHERE mahs = $1
    `;

    const result = await db.query(deleteQuery, [mahs]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Không tìm thấy học sinh" });
    }

    res.status(200).json({ message: "Xóa học sinh thành công" });
  } catch (err) {
    console.error("Lỗi xóa học sinh:", err);
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
};
