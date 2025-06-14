const db = require('../config/db');

// GET /api/teachers/count
exports.getCount = async (req, res) => {
  try {
    const result = await db.query('SELECT COUNT(*) AS count FROM giaovien');
    return res.json(result.rows[0]);
  } catch (err) {
    console.error('Error getting teachers count:', err);
    return res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};

// GET /api/teachers
exports.getAllTeachers = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM giaovien ORDER BY magv ASC');
    res.json(result.rows);
  } catch (err) {
    console.error('Lỗi khi lấy giáo viên:', err);
    res.status(500).send('Lỗi truy vấn');
  }
};

// POST /api/teachers/add
exports.addTeacher = async (req, res) => {
  const { magv, hoten, sdt, email, ngaysinh, chuyennganh } = req.body;

  if (!magv || !hoten || !chuyennganh) {
    return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });
  }

  try {
    const result = await db.query(
      `INSERT INTO giaovien (magv, hoten, sdt, email, ngaysinh, chuyennganh)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [magv, hoten, sdt || null, email || null, ngaysinh || null, chuyennganh]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Lỗi khi thêm giáo viên:', err);
    if (err.code === '23505') {
      return res.status(400).json({ message: 'Mã giáo viên đã tồn tại' });
    }
    res.status(500).json({ message: 'Lỗi khi thêm giáo viên' });
  }
};

// PUT /api/teachers/:magv
exports.updateTeacher = async (req, res) => {
  const { magv } = req.params;
  const { hoten, sdt, email, ngaysinh, chuyennganh } = req.body;

  if (!hoten || !chuyennganh) {
    return res.status(400).json({ message: 'Thiếu thông tin cập nhật' });
  }

  try {
    const result = await db.query(
      `UPDATE giaovien
       SET hoten = $1, sdt = $2, email = $3, ngaysinh = $4, chuyennganh = $5
       WHERE magv = $6 RETURNING *`,
      [hoten, sdt || null, email || null, ngaysinh || null, chuyennganh, magv]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Không tìm thấy giáo viên' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Lỗi khi cập nhật giáo viên:', err);
    res.status(500).json({ message: 'Lỗi khi cập nhật giáo viên' });
  }
};

// DELETE /api/teachers/:magv
exports.deleteTeacher = async (req, res) => {
  const { magv } = req.params;

  try {
    // Kiểm tra ràng buộc khoá ngoại
    const checkFK = await db.query(
      `SELECT 1 FROM lop WHERE gvcn = $1
       UNION
       SELECT 1 FROM phanconggiangday WHERE giaovienid = $1
       UNION
       SELECT 1 FROM taikhoan WHERE giaovienid = $1`,
      [magv]
    );

    if (checkFK.rowCount > 0) {
      return res.status(400).json({
        message: 'Không thể xoá giáo viên do đang được sử dụng ở bảng khác'
      });
    }

    const result = await db.query(
      'DELETE FROM giaovien WHERE magv = $1 RETURNING *',
      [magv]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Không tìm thấy giáo viên' });
    }

    res.json({ message: 'Đã xoá giáo viên thành công' });
  } catch (err) {
    console.error('Lỗi khi xoá giáo viên:', err);
    res.status(500).json({ message: 'Lỗi khi xoá giáo viên' });
  }
};

exports.getTeacherName = async (req, res) => {
  const { magv } = req.params;
  try {
    const result = await db.query(
      "SELECT hoten FROM giaovien WHERE magv = $1",
      [magv]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Không tìm thấy giáo viên" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Lỗi khi lấy giáo viên:", err);
    res.status(500).json({ error: "Lỗi server" });
  }
};
