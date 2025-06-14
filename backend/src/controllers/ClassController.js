const db = require("../config/db");

// Lấy thông tin lớp theo ID
exports.getClassById = async (req, res) => {
  try {
    const { malop } = req.params;

    const query = `
      SELECT 
        l.malop, 
        l.tenlop, 
        l.ghichu,
        l.khoi,
        l.toanha,
        l.sochongoi,
        gv.magv AS gvcn,
        gv.hoten AS tengiaovien
      FROM lop l
      LEFT JOIN giaovien gv ON l.gvcn = gv.magv
      WHERE TRIM(l.malop) = $1
    `;

    const result = await db.query(query, [malop]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy lớp học"
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (err) {
    console.error("Lỗi khi lấy thông tin lớp:", err);
    res.status(500).json({
      success: false,
      message: "Lỗi máy chủ"
    });
  }
};

// GET /api/classes/count
exports.getCount = async (req, res) => {
  try {
    const result = await db.query('SELECT COUNT(*) AS count FROM lop');
    return res.json(result.rows[0]);
  } catch (err) {
    console.error('Error getting classes count:', err);
    return res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};

// Lấy danh sách tất cả lớp học (có tìm kiếm)
exports.getAllClasses = async (req, res) => {
  try {
    const { search } = req.query;

    let query = `
      SELECT 
        l.malop, 
        l.tenlop, 
        l.ghichu,
        l.khoi,
        l.toanha,
        gv.hoten AS tengiaovien,
        COUNT(hs.mahs) AS sohocsinh
      FROM lop l
      LEFT JOIN giaovien gv ON l.gvcn = gv.magv
      LEFT JOIN hocsinh hs ON hs.lopid = l.malop
    `;

    const params = [];
    if (search) {
      query += ` WHERE LOWER(l.tenlop) LIKE $1 OR LOWER(gv.hoten) LIKE $1 `;
      params.push(`%${search.toLowerCase()}%`);
    }

    query += `
      GROUP BY l.malop, l.tenlop, l.ghichu, l.khoi, l.toanha, gv.hoten
      ORDER BY l.malop
    `;

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error("Lỗi khi lấy danh sách lớp:", err);
    res.status(500).send("Lỗi truy vấn");
  }
};

// Lấy danh sách học sinh theo lớp
exports.getStudentsByClass = async (req, res) => {
  const { malop } = req.params;
  const { search } = req.query;

  try {
    let query = `
      SELECT 
        mahs, hoten, gioitinh, ngaysinh, diachi, sdt, email
      FROM hocsinh
      WHERE lopid = $1
    `;

    const params = [malop];

    if (search) {
      query += ` AND LOWER(hoten) LIKE $2 `;
      params.push(`%${search.toLowerCase()}%`);
    }

    query += ` ORDER BY hoten `;

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error("Lỗi khi lấy học sinh lớp:", err);
    res.status(500).send("Lỗi truy vấn");
  }
};

// Thêm lớp học
exports.createClass = async (req, res) => {
  const { malop, tenlop, ghichu, khoi, sochongoi, gvcn, toanha } = req.body;

  try {
    const result = await db.query(
      `INSERT INTO lop (malop, tenlop, ghichu, khoi, sochongoi, gvcn, toanha) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [malop, tenlop, ghichu, khoi, sochongoi, gvcn, toanha]
    );

    res.status(201).json({
      success: true,
      message: "Thêm lớp học thành công",
      data: result.rows[0],
    });
  } catch (err) {
    console.error("Lỗi khi thêm lớp:", err);
    res.status(500).json({ success: false, message: "Lỗi máy chủ" });
  }
};

// Cập nhật lớp học
exports.updateClass = async (req, res) => {
  const { malop } = req.params;
  const { tenlop, ghichu, khoi, sochongoi, gvcn, toanha } = req.body;

  try {
    const result = await db.query(
      `UPDATE lop 
       SET tenlop = $1, ghichu = $2, khoi = $3, sochongoi = $4, gvcn = $5, toanha = $6
       WHERE malop = $7 RETURNING *`,
      [tenlop, ghichu, khoi, sochongoi, gvcn, toanha, malop]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Không tìm thấy lớp học" });
    }

    res.json({
      success: true,
      message: "Cập nhật lớp học thành công",
      data: result.rows[0],
    });
  } catch (err) {
    console.error("Lỗi khi cập nhật lớp:", err);
    res.status(500).json({ success: false, message: "Lỗi máy chủ" });
  }
};

// Xoá lớp học
exports.deleteClass = async (req, res) => {
  const { malop } = req.params;

  try {
    const check = await db.query(`SELECT COUNT(*) FROM hocsinh WHERE lopid = $1`, [malop]);
    if (parseInt(check.rows[0].count) > 0) {
      return res.status(400).json({ success: false, message: "Không thể xoá lớp có học sinh" });
    }

    const result = await db.query(`DELETE FROM lop WHERE malop = $1 RETURNING *`, [malop]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Không tìm thấy lớp học" });
    }

    res.json({
      success: true,
      message: "Xoá lớp học thành công",
    });
  } catch (err) {
    console.error("Lỗi khi xoá lớp:", err);
    res.status(500).json({ success: false, message: "Lỗi máy chủ" });
  }
};
