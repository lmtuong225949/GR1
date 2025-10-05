const db = require("../config/db");

// 🟢 Lấy toàn bộ danh sách phụ huynh + học sinh
const getAllParentsWithStudent = async (req, res) => {
  try {
    const query = `
      SELECT 
        p.id,
        p.hoten AS ten_phuhuynh,
        p.sdt,
        p.email,
        p.namsinh,
        h.mahs,
        h.hoten AS ten_hocsinh,
        h.lopid AS malop,
        l.tenlop
      FROM phuhuynh p
      LEFT JOIN hocsinh h ON p.mahs = h.mahs
      LEFT JOIN lop l ON h.lopid = l.malop
      ORDER BY p.id;
    `;   
    const { rows } = await db.query(query);
    res.status(200).json(rows);
  } catch (error) {
    console.error("Lỗi khi lấy danh sách phụ huynh:", error);
    res.status(500).json({ message: "Lỗi máy chủ", error: error.message });
  }
};

// 🟢 Lấy thông tin phụ huynh theo ID tài khoản
const getParentById = async (req, res) => {
  try {
    const { id } = req.params;

    // 1️⃣ Lấy mã học sinh từ bảng tài khoản (nếu tài khoản là phụ huynh)
    const accQuery = `
      SELECT mahs
      FROM taikhoan
      WHERE id = $1 AND role = 'parent';
    `;
    const accResult = await db.query(accQuery, [id]);

    if (accResult.rows.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy tài khoản phụ huynh." });
    }

    const mahs = accResult.rows[0].mahs?.trim();

    if (!mahs) {
      return res.status(400).json({ message: "Tài khoản này chưa gắn với học sinh nào." });
    }

    // 2️⃣ Lấy thông tin chi tiết phụ huynh + học sinh + lớp
    const infoQuery = `
      SELECT 
        p.id AS id_phuhuynh,
        p.hoten AS ten_phuhuynh,
        p.sdt AS sdt_phuhuynh,
        p.email AS email_phuhuynh,
        p.namsinh AS namsinh_phuhuynh,
        h.mahs,
        h.hoten AS ten_hocsinh,
        h.gioitinh,
        h.ngaysinh,
        h.diachi,
        h.email AS email_hocsinh,
        h.sdt AS sdt_hocsinh,
        h.lopid AS malop
      FROM phuhuynh p
      JOIN hocsinh h ON p.mahs = h.mahs
      LEFT JOIN lop l ON h.lopid = l.malop
      WHERE h.mahs = $1;
    `;   
    const result = await db.query(infoQuery, [mahs]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy thông tin phụ huynh hoặc học sinh." });
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Lỗi khi lấy thông tin phụ huynh:", error);
    res.status(500).json({ message: "Lỗi máy chủ", error: error.message });
  }
};

// 🟢 Lấy thông tin học sinh kèm thông tin phụ huynh theo ID học sinh
const getStudentWithParentByStudentId = async (req, res) => {
  try {
    const { studentId } = req.params;

    if (!studentId) {
      return res.status(400).json({ message: "Thiếu mã học sinh" });
    }

    // Lấy thông tin chi tiết học sinh + phụ huynh + lớp
    const query = `
      SELECT
        h.mahs,
        h.hoten AS ho_ten,
        h.gioitinh,
        h.diachi,
        h.email,
        h.ngaysinh,
        h.sdt,
        l.tenlop,
        l.malop,
        h.lopid,
        p.id AS id_phuhuynh,
        p.hoten AS ten_phu_huynh,
        p.sdt AS sdt_phu_huynh,
        p.email AS email_phu_huynh,
        p.namsinh AS namsinh_phu_huynh
      FROM hocsinh h
      LEFT JOIN lop l ON h.lopid = l.malop
      LEFT JOIN phuhuynh p ON h.mahs = p.mahs
      WHERE h.mahs = $1;
    `;  
    const result = await db.query(query, [studentId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy thông tin học sinh" });
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Lỗi khi lấy thông tin học sinh kèm phụ huynh:", error);
    res.status(500).json({ message: "Lỗi máy chủ", error: error.message });
  }
};

// 🟢 Lấy danh sách điểm của con theo ID phụ huynh
const getScoresByParentId = async (req, res) => {
  try {
    const { parentId } = req.params;

    // 1️⃣ Lấy mã học sinh từ phụ huynh
    const parentQuery = `
      SELECT mahs
      FROM phuhuynh
      WHERE id = $1;
    `;
    const parentResult = await db.query(parentQuery, [parentId]);

    if (parentResult.rows.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy mã phụ huynh trong hệ thống." });
    }

    const mahs = parentResult.rows[0].mahs.trim();

    // 2️⃣ Lấy điểm của học sinh theo mã học sinh
    const scoreQuery = `
      SELECT
        hocky,
        namhoc,
        diemtrungbinh,
        xeploaihocluc,
        hanhkiem
      FROM diem
      WHERE mahs = $1
      ORDER BY namhoc, hocky;
    `;
    const { rows } = await db.query(scoreQuery, [mahs]);

    if (rows.length === 0) {
      return res.status(200).json([]);
    }

    res.status(200).json(rows);
  } catch (error) {
    console.error("Lỗi khi lấy điểm học sinh của phụ huynh:", error);
    res.status(500).json({ message: "Lỗi máy chủ", error: error.message });
  }
};

module.exports = {
  getAllParentsWithStudent,
  getParentById,
  getStudentWithParentByStudentId,
  getScoresByParentId,
};
