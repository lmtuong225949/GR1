const db = require('../config/db');

const ScoreController = {
  // Lấy toàn bộ danh sách điểm tổng quát của học sinh
  async getAllScores(req, res) {
    try {
      const query = `
        SELECT 
          kqht.id,
          hs.mahs,
          hs.hoten AS name,
          l.tenlop AS class,
          kqht.hocky,
          kqht.namhoc,
          ROUND(kqht.diemtrungbinh::numeric, 2) AS diemtrungbinh,
          kqht.hanhkiem,
          kqht.xeploaihocluc,
          kqht.nhanxet
        FROM ketquahoctap kqht
        JOIN hocsinh hs ON kqht.mahs = hs.mahs
        JOIN lop l ON hs.lopid = l.malop
        ORDER BY hs.mahs, kqht.namhoc, kqht.hocky;
      `;

      const result = await db.query(query);

      const fixedRows = result.rows.map((row) => ({
        ...row,
        diemtrungbinh: row.diemtrungbinh !== null ? parseFloat(row.diemtrungbinh) : null,
      }));

      return res.json(fixedRows);
    } catch (err) {
      console.error("Lỗi khi lấy kết quả học tập:", err);
      return res.status(500).json({ message: "Lỗi máy chủ" });
    }
  },

  // Lấy chi tiết điểm theo mã học sinh, học kỳ và năm học
  async getScoreDetail(req, res) {
    try {
      const { mahs } = req.params;
      const { hocky, namhoc } = req.query;
  
      if (!mahs || !hocky || !namhoc) {
        return res.status(400).json({ message: "Thiếu tham số" });
      }
  
      // Truy vấn điểm theo môn, phân loại theo loại điểm
      const detailQuery = `
        SELECT 
          mh.tenmon AS monhoc,
          ld.tenloaidiem AS loaidiem,
          ld.heso,
          d.giatri AS diem
        FROM diem d
        JOIN monhoc mh ON d.monid = mh.id
        JOIN loaidiem ld ON d.loaidiemid = ld.id
        WHERE d.mahs = $1 AND d.hocky = $2 AND d.namhoc = $3
        ORDER BY mh.tenmon, ld.heso;
      `;
      const detailResult = await db.query(detailQuery, [mahs, hocky, namhoc]);
  
      // Truy vấn điểm trung bình từ bảng diemtbmon
      const avgQuery = `
        SELECT 
          dtb.monid,
          mh.tenmon,
          dtb.diemtrungbinh
        FROM diemtbmon dtb
        JOIN monhoc mh ON dtb.monid = mh.id
        WHERE dtb.mahs = $1 AND dtb.hocky = $2 AND dtb.namhoc = $3;
      `;
      const avgResult = await db.query(avgQuery, [mahs, hocky, namhoc]);
  
      // Gộp kết quả
      const map = {};
  
      detailResult.rows.forEach(row => {
        const monhoc = row.monhoc || row.tenmon;
        if (!map[monhoc]) {
          map[monhoc] = {
            monhoc,
            diem15phut: null,
            diem1tiet: null,
            diemcuoiky: null,
            diemtrungbinh: null,
          };
        }

        const loaidiem = row.loaidiem?.toLowerCase() || '';
        if (loaidiem.includes("15")) {
          map[monhoc].diem15phut = row.diem !== null ? parseFloat(row.diem) : null;
        } else if (loaidiem.includes("1 tiết")) {
          map[monhoc].diem1tiet = row.diem !== null ? parseFloat(row.diem) : null;
        } else if (loaidiem.includes("cuối kỳ")) {
          map[monhoc].diemcuoiky = row.diem !== null ? parseFloat(row.diem) : null;
        }
      });

      avgResult.rows.forEach(row => {
        const monhoc = row.tenmon;
        if (!map[monhoc]) {
          map[monhoc] = {
            monhoc,
            diem15phut: null,
            diem1tiet: null,
            diemcuoiky: null,
            diemtrungbinh: null,
          };
        }
        map[monhoc].diemtrungbinh = row.diemtrungbinh !== null ? parseFloat(row.diemtrungbinh) : null;
      });
  
      return res.json(Object.values(map));
    } catch (err) {
      console.error("Lỗi khi lấy chi tiết điểm:", err);
      return res.status(500).json({ message: "Lỗi máy chủ" });
    }
  }  
};

module.exports = ScoreController;