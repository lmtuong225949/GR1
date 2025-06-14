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
        kq.hocky,
        kq.namhoc,
        AVG(kq.diemtrungbinh) as diemtrungbinh,
        kq.nhanxet
      FROM ketquahoctap kq
      JOIN hocsinh hs ON kq.mahs = hs.mahs
      WHERE hs.lopid = $1
      GROUP BY hs.mahs, hs.hoten, kq.hocky, kq.namhoc, kq.nhanxet
      ORDER BY hs.hoten, kq.namhoc, kq.hocky;
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
    // Nếu DB chưa hỗ trợ hoặc muốn giữ CASE thì dùng CASE như bạn làm
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
          width_bucket(AVG(kq.diemtrungbinh), 0, 10, 10) - 1 AS bucket
        FROM ketquahoctap kq
        JOIN hocsinh hs ON kq.mahs = hs.mahs
        WHERE hs.lopid = $1 AND kq.hocky = $2 AND kq.namhoc = $3
        GROUP BY hs.mahs
      ) sub
      GROUP BY bucket
      ORDER BY bucket;
    `;

    const { rows } = await db.query(query, [malop, hocky, namhoc]);

    // Nếu muốn trả luôn mảng đầy đủ khoảng (để front-end luôn có đủ label), có thể bổ sung sau

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


module.exports = {
  getMyClass,
  getScoresByClass,
  updateScore,
  getScoreDistributionByClass,
};
