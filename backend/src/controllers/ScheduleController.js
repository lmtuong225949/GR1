const db = require("../config/db");
const generateSchedule = require('../utils/scheduleGenerator');

const getAllSchedules = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        tkb.id,
        tkb.thu,
        tkb.tiet,
        tkb.lopid,
        tkb.monid,
        l.tenlop,
        m.tenmon AS monhoc
      FROM thoikhoabieu tkb
      JOIN lop l ON tkb.lopid = l.malop
      JOIN monhoc m ON tkb.monid = m.id
      WHERE tkb.lanthu = (
        SELECT MAX(lanthu) FROM thoikhoabieu WHERE lopid = tkb.lopid
      )
      ORDER BY tkb.thu, tkb.tiet
    `);

    res.status(200).json({
      success: true,
      data: result.rows,
      message: "Lấy toàn bộ thời khóa biểu thành công"
    });
  } catch (err) {
    console.error("Lỗi khi truy vấn thời khóa biểu:", err);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy toàn bộ thời khóa biểu"
    });
  }
};

const getScheduleByGV = async (req, res) => {
  try {
    const magv = req.user?.magv;

    if (!magv) {
      return res.status(400).json({
        success: false,
        message: "Không tìm thấy mã giáo viên từ token.",
      });
    }

    const result = await db.query(`
      SELECT 
        tkb.id,
        tkb.thu,
        tkb.tiet,
        tkb.lopid,
        l.tenlop,
        m.tenmon AS monhoc
      FROM thoikhoabieu tkb
      JOIN lop l ON tkb.lopid = l.malop
      JOIN monhoc m ON tkb.monid = m.id
      JOIN phanconggiangday pcgd 
        ON pcgd.lopid = tkb.lopid AND pcgd.monid = tkb.monid
      WHERE pcgd.giaovienid = $1
        AND tkb.lanthu = (
          SELECT MAX(lanthu) FROM thoikhoabieu WHERE lopid = tkb.lopid
        )
      ORDER BY tkb.thu, tkb.tiet
    `, [magv]);

    res.status(200).json({
      success: true,
      data: result.rows,
      message: "Lấy thời khóa biểu theo giáo viên thành công"
    });
  } catch (err) {
    console.error("Lỗi khi truy vấn thời khóa biểu theo giáo viên:", err);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy thời khóa biểu theo giáo viên"
    });
  }
};

const getScheduleByHS = async (req, res) => {
  try {
    const { mahs } = req.query;
    
    if (!mahs) {
      return res.status(400).json({
        success: false,
        message: "Thiếu mã học sinh",
      });
    }

    // Lấy lớp học của học sinh
    const hsResult = await db.query(
      `SELECT lopid FROM hocsinh WHERE mahs = $1`,
      [mahs]
    );

    if (hsResult.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy học sinh"
      });
    }

    const lopid = hsResult.rows[0].lopid;

    // Lấy thời khóa biểu của lớp
    const tkbResult = await db.query(`
      SELECT 
        tkb.id,
        tkb.thu,
        tkb.tiet,
        tkb.lopid,
        l.tenlop,
        m.tenmon AS monhoc,
        g.hoten AS tengv
      FROM thoikhoabieu tkb
      JOIN lop l ON tkb.lopid = l.malop
      JOIN monhoc m ON tkb.monid = m.id
      LEFT JOIN phanconggiangday pcgd 
        ON pcgd.lopid = tkb.lopid AND pcgd.monid = tkb.monid
      LEFT JOIN giaovien g ON pcgd.giaovienid = g.magv
      WHERE tkb.lopid = $1
        AND tkb.lanthu = (
          SELECT MAX(lanthu) FROM thoikhoabieu WHERE lopid = tkb.lopid
        )
      ORDER BY tkb.thu, tkb.tiet
    `, [lopid]);

    res.status(200).json({
      success: true,
      data: tkbResult.rows,
      message: "Lấy thời khóa biểu học sinh thành công"
    });

  } catch (err) {
    console.error("Lỗi khi lấy thời khóa biểu học sinh:", err);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy thời khóa biểu học sinh"
    });
  }
};


const generateScheduleHandler = async (req, res) => {
  try {
    const result = await generateSchedule();
    res.status(200).json({ success: true, message: "Đã sinh thời khoá biểu!", data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getAllSchedules,
  getScheduleByGV,
  getScheduleByHS,
  generateScheduleHandler
};
