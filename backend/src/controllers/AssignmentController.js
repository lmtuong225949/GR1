const db = require("../config/db");

// Lấy danh sách phân công giảng dạy (có tìm kiếm)
exports.getAssignments = async (req, res) => {
  try {
    const { search = "" } = req.query;

    const query = `
      SELECT 
        pcgd.id,
        pcgd.lopid,
        pcgd.monid,
        gv.hoten AS tengv,
        l.tenlop,
        mh.tenmon,
        pcgd.namhoc,
        pcgd.hocky
      FROM phanconggiangday pcgd
      JOIN giaovien gv ON pcgd.giaovienid = gv.magv
      JOIN lop l ON pcgd.lopid = l.malop
      JOIN monhoc mh ON pcgd.monid = mh.id
      ${search ? `
        WHERE (
          CAST(pcgd.id AS TEXT) ILIKE $1 OR
          gv.hoten ILIKE $1 OR
          l.tenlop ILIKE $1 OR
          mh.tenmon ILIKE $1 OR
          pcgd.namhoc ILIKE $1 OR
          pcgd.hocky ILIKE $1
        )
      ` : ""}
      ORDER BY pcgd.id DESC
    `;

    const values = search ? [`%${search}%`] : [];
    const result = await db.query(query, values);

    res.status(200).json({
      success: true,
      data: result.rows,
      message: "Lấy danh sách phân công thành công",
    });

  } catch (error) {
    console.error("Error fetching assignments:", error);
    res.status(500).json({
      success: false,
      error: "Lỗi khi lấy danh sách phân công",
      message: error.message,
    });
  }
};

// Lấy danh sách phân công theo giáo viên từ token
exports.getAssignmentsByGV = async (req, res) => {
  try {
    const magv = req.user?.magv;

    if (!magv) {
      return res.status(401).json({
        success: false,
        message: "Không tìm thấy mã giáo viên trong token",
      });
    }

    const query = `
      SELECT 
        pcgd.id,
        pcgd.lopid,
        pcgd.monid,
        gv.hoten AS tengv,
        l.tenlop,
        mh.tenmon,
        pcgd.namhoc,
        pcgd.hocky
      FROM phanconggiangday pcgd
      JOIN giaovien gv ON pcgd.giaovienid = gv.magv
      JOIN lop l ON pcgd.lopid = l.malop
      JOIN monhoc mh ON pcgd.monid = mh.id
      WHERE gv.magv = $1
      ORDER BY pcgd.id DESC
    `;

    const result = await db.query(query, [magv]);

    res.status(200).json({
      success: true,
      data: result.rows,
      message: "Lấy phân công giảng dạy theo giáo viên thành công",
    });

  } catch (error) {
    console.error("Error fetching assignments by magv:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách phân công theo giáo viên",
      error: error.message,
    });
  }
};

exports.getStudentGrades = async (req, res) => {
  const { lopid, monid, hocky, namhoc } = req.query;

  if (!lopid || !monid || !hocky || !namhoc) {
    return res.status(400).json({
      success: false,
      message: "Thiếu tham số: lopid, monid, hocky hoặc namhoc",
    });
  }

  try {
    const query = `
      SELECT 
        h.mahs,
        h.hoten,
        d.id,
        d.giatri,
        d.lanthu,
        ld.tenloaidiem,
        ld.heso
      FROM hocsinh h
      JOIN diem d ON h.mahs = d.mahs
      JOIN loaidiem ld ON d.loaidiemid = ld.id
      WHERE h.lopid = $1
        AND d.monid = $2
        AND d.hocky = $3
        AND d.namhoc = $4
      ORDER BY h.hoten, ld.id, d.lanthu;
    `;
    const values = [lopid, monid, hocky, namhoc];
    const result = await db.query(query, values);

    res.status(200).json({
      success: true,
      data: result.rows,
      message: "Lấy danh sách điểm học sinh thành công",
    });
  } catch (error) {
    console.error("Lỗi khi lấy điểm:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy điểm",
    });
  }
};

exports.updateStudentGrade = async (req, res) => {
  const { diemid, giatri } = req.body;

  if (!diemid || giatri === undefined) {
    return res.status(400).json({
      success: false,
      message: "Thiếu thông tin điểm cần cập nhật",
    });
  }

  try {
    const query = `
      UPDATE diem
      SET giatri = $1
      WHERE id = $2
      RETURNING *;
    `;
    const result = await db.query(query, [giatri, diemid]);

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy điểm cần cập nhật",
      });
    }

    res.status(200).json({
      success: true,
      data: result.rows[0],
      message: "Cập nhật điểm thành công",
    });
  } catch (error) {
    console.error("Lỗi cập nhật điểm:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi cập nhật điểm",
      error: error.message,
    });
  }
};