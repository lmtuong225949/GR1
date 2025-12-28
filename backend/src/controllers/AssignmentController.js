const db = require("../config/db");
const hungarianScheduler = require("../utils/hungarianScheduler");

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
        COALESCE(nh.namhoc, 'Chưa phân công') AS namhoc,
        COALESCE(nh.kyhoc, 'Chưa phân công') AS hocky
      FROM phanconggiangday pcgd
      JOIN giaovien gv ON pcgd.giaovienid = gv.magv
      JOIN lop l ON pcgd.lopid = l.malop
      JOIN monhoc mh ON pcgd.monid = mh.id
      LEFT JOIN namhoc nh ON pcgd.namhoc_id = nh.id
      ${search ? `
        WHERE (
          CAST(pcgd.id AS TEXT) ILIKE $1 OR
          gv.hoten ILIKE $1 OR
          l.tenlop ILIKE $1 OR
          mh.tenmon ILIKE $1 OR
          COALESCE(nh.namhoc, 'Chưa phân công') ILIKE $1 OR
          COALESCE(nh.kyhoc, 'Chưa phân công') ILIKE $1
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
        pcgd.namhoc_id,
        gv.hoten AS tengv,
        l.tenlop,
        mh.tenmon,
        COALESCE(nh.namhoc, 'Chưa phân công') AS namhoc,
        COALESCE(nh.kyhoc, 'Chưa phân công') AS hocky
      FROM phanconggiangday pcgd
      JOIN giaovien gv ON pcgd.giaovienid = gv.magv
      JOIN lop l ON pcgd.lopid = l.malop
      JOIN monhoc mh ON pcgd.monid = mh.id
      LEFT JOIN namhoc nh ON pcgd.namhoc_id = nh.id
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
  // Kiểm tra tham số đầu vào
  const { lopid, monid, namhoc_id } = req.query;
  
  if (!lopid || !monid || !namhoc_id) {
    return res.status(400).json({
      success: false,
      message: "Thiếu tham số: lopid, monid hoặc namhoc_id",
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
        ld.heso,
        mh.tenmon
      FROM hocsinh h
      JOIN diem d ON h.mahs = d.mahs
      JOIN loaidiem ld ON d.loaidiemid = ld.id
      JOIN monhoc mh ON d.monid = mh.id
      WHERE h.lopid = $1
        AND d.monid = $2
        AND d.namhoc_id = $3
      ORDER BY h.hoten, ld.id, d.lanthu;
    `;
    
    const result = await db.query(query, [lopid, monid, namhoc_id]);

    res.status(200).json({
      success: true,
      data: result.rows,
      message: result.rows.length > 0 
        ? `Lấy danh sách điểm học sinh thành công (${result.rows.length} bản ghi)`
        : "Không có dữ liệu điểm cho lớp này trong môn học và năm học đã chọn",
    });
  } catch (error) {
    console.error("Lỗi khi lấy điểm:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy điểm",
      error: error.message,
    });
  }
};

exports.getStudentsInClass = async (req, res) => {
  const { lopid } = req.query;
  
  if (!lopid) {
    return res.status(400).json({
      success: false,
      message: "Thiếu tham số: lopid",
    });
  }

  try {
    const query = `
      SELECT 
        h.mahs,
        h.hoten,
        l.tenlop
      FROM hocsinh h
      LEFT JOIN lop l ON h.lopid = l.malop
      WHERE h.lopid = $1
      ORDER BY h.hoten;
    `;
    
    const result = await db.query(query, [lopid]);
    
    res.status(200).json({
      success: true,
      data: result.rows,
      message: `Lấy danh sách học sinh lớp ${lopid} thành công`,
    });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách học sinh:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy danh sách học sinh",
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

// Cập nhật phân công giảng dạy
exports.updateAssignment = async (req, res) => {
  const { id, giaovienid, lopid, monid, namhoc_id } = req.body;

  if (!id || !giaovienid || !lopid || !monid) {
    return res.status(400).json({
      success: false,
      message: "Thiếu thông tin bắt buộc: id, giaovienid, lopid, monid",
    });
  }

  // Validate namhoc_id - if provided, it must be a valid integer
  let validNamhocId = null;
  if (namhoc_id !== undefined && namhoc_id !== null && namhoc_id !== '') {
    const parsedId = parseInt(namhoc_id);
    if (isNaN(parsedId) || parsedId <= 0) {
      return res.status(400).json({
        success: false,
        message: "namhoc_id phải là một số nguyên dương",
      });
    }
    
    // Check if namhoc_id exists in database
    const namhocQuery = 'SELECT id FROM namhoc WHERE id = $1';
    const namhocResult = await db.query(namhocQuery, [parsedId]);
    
    if (namhocResult.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: `namhoc_id ${parsedId} không tồn tại trong hệ thống`,
      });
    }
    
    validNamhocId = parsedId;
  }

  try {
    // Kiểm tra giáo viên có tồn tại và lấy chuyên ngành
    const teacherQuery = `
      SELECT magv, hoten, chuyennganh 
      FROM giaovien 
      WHERE magv = $1
    `;
    const teacherResult = await db.query(teacherQuery, [giaovienid]);
    
    if (teacherResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy giáo viên",
      });
    }
    
    const teacher = teacherResult.rows[0];
    
    // Kiểm tra môn học có tồn tại và lấy tên môn
    const subjectQuery = `
      SELECT id, tenmon 
      FROM monhoc 
      WHERE id = $1
    `;
    const subjectResult = await db.query(subjectQuery, [monid]);
    
    if (subjectResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy môn học",
      });
    }
    
    const subject = subjectResult.rows[0];
    
    // Kiểm tra chuyên ngành của giáo viên có khớp với môn học không
    // So sánh không phân biệt chữ hoa/thường, loại bỏ khoảng trắng và xử lý các trường hợp đặc biệt
    const teacherSpecialty = teacher.chuyennganh.toLowerCase().trim();
    const subjectName = subject.tenmon.toLowerCase().trim();
    
    // Các từ khóa tương đương
    const literatureKeywords = ['văn', 'văn học', 'ngữ văn'];
    const mathKeywords = ['toán', 'toán học'];
    const englishKeywords = ['tiếng anh', 'anh', 'anh văn'];
    const physicsKeywords = ['vật lý', 'lý'];
    const chemistryKeywords = ['hóa học', 'hóa'];
    const biologyKeywords = ['sinh học', 'sinh'];
    const historyKeywords = ['lịch sử', 'sử'];
    const geographyKeywords = ['địa lý', 'địa'];
    const civicKeywords = ['giáo dục công dân', 'công dân', 'gdcd'];
    const itKeywords = ['tin học', 'tin', 'công nghệ thông tin', 'cntt'];
    const techKeywords = ['công nghệ', 'cn'];
    const peKeywords = ['thể dục', 'td', 'giáo dục thể chất'];
    const musicKeywords = ['âm nhạc', 'nhạc'];
    
    // Hàm kiểm tra xem hai chuỗi có cùng lĩnh vực không
    const isSameSubject = (specialty, subject) => {
      if (specialty === subject) return true;
      if (specialty.includes(subject) || subject.includes(specialty)) return true;
      
      // Kiểm tra các từ khóa tương đương
      const checkKeywords = (keywords, str1, str2) => {
        return keywords.some(keyword => 
          str1.includes(keyword) && str2.includes(keyword)
        );
      };
      
      return checkKeywords(literatureKeywords, specialty, subject) ||
             checkKeywords(mathKeywords, specialty, subject) ||
             checkKeywords(englishKeywords, specialty, subject) ||
             checkKeywords(physicsKeywords, specialty, subject) ||
             checkKeywords(chemistryKeywords, specialty, subject) ||
             checkKeywords(biologyKeywords, specialty, subject) ||
             checkKeywords(historyKeywords, specialty, subject) ||
             checkKeywords(geographyKeywords, specialty, subject) ||
             checkKeywords(civicKeywords, specialty, subject) ||
             checkKeywords(itKeywords, specialty, subject) ||
             checkKeywords(techKeywords, specialty, subject) ||
             checkKeywords(peKeywords, specialty, subject) ||
             checkKeywords(musicKeywords, specialty, subject);
    };
    
    if (!isSameSubject(teacherSpecialty, subjectName)) {
      return res.status(400).json({
        success: false,
        message: `Giáo viên ${teacher.hoten} chuyên ngành '${teacher.chuyennganh}' không thể dạy môn '${subject.tenmon}'`,
      });
    }

    const query = `
      UPDATE phanconggiangday
      SET giaovienid = $1, lopid = $2, monid = $3, namhoc_id = $4, updated_at = CURRENT_TIMESTAMP
      WHERE id = $5
      RETURNING *;
    `;
    const values = [giaovienid, lopid, monid, validNamhocId, id];
    const result = await db.query(query, values);

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy phân công cần cập nhật",
      });
    }

    res.status(200).json({
      success: true,
      data: result.rows[0],
      message: "Cập nhật phân công thành công",
    });
  } catch (error) {
    console.error("Lỗi cập nhật phân công:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi cập nhật phân công",
      error: error.message,
    });
  }
};

// Xóa phân công giảng dạy
exports.deleteAssignment = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({
      success: false,
      message: "Thiếu ID phân công",
    });
  }

  try {
    const query = `DELETE FROM phanconggiangday WHERE id = $1 RETURNING *;`;
    const result = await db.query(query, [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy phân công cần xóa",
      });
    }

    res.status(200).json({
      success: true,
      data: result.rows[0],
      message: "Xóa phân công thành công",
    });
  } catch (error) {
    console.error("Lỗi xóa phân công:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi xóa phân công",
      error: error.message,
    });
  }
};

// Thêm phân công giảng dạy
exports.createAssignment = async (req, res) => {
  const { giaovienid, lopid, monid, namhoc_id } = req.body;

  if (!giaovienid || !lopid || !monid) {
    return res.status(400).json({
      success: false,
      message: "Thiếu thông tin bắt buộc: giaovienid, lopid, monid",
    });
  }

  // Validate namhoc_id - if provided, it must be a valid integer
  let validNamhocId = null;
  if (namhoc_id !== undefined && namhoc_id !== null && namhoc_id !== '') {
    const parsedId = parseInt(namhoc_id);
    if (isNaN(parsedId) || parsedId <= 0) {
      return res.status(400).json({
        success: false,
        message: "namhoc_id phải là một số nguyên dương",
      });
    }
    
    // Check if namhoc_id exists in database
    const namhocQuery = 'SELECT id FROM namhoc WHERE id = $1';
    const namhocResult = await db.query(namhocQuery, [parsedId]);
    
    if (namhocResult.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: `namhoc_id ${parsedId} không tồn tại trong hệ thống`,
      });
    }
    
    validNamhocId = parsedId;
  }

  try {
    // Kiểm tra giáo viên có tồn tại và lấy chuyên ngành
    const teacherQuery = `
      SELECT magv, hoten, chuyennganh 
      FROM giaovien 
      WHERE magv = $1
    `;
    const teacherResult = await db.query(teacherQuery, [giaovienid]);
    
    if (teacherResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy giáo viên",
      });
    }
    
    const teacher = teacherResult.rows[0];
    
    // Kiểm tra môn học có tồn tại và lấy tên môn
    const subjectQuery = `
      SELECT id, tenmon 
      FROM monhoc 
      WHERE id = $1
    `;
    const subjectResult = await db.query(subjectQuery, [monid]);
    
    if (subjectResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy môn học",
      });
    }
    
    const subject = subjectResult.rows[0];
    
    // Kiểm tra chuyên ngành của giáo viên có khớp với môn học không
    // So sánh không phân biệt chữ hoa/thường, loại bỏ khoảng trắng và xử lý các trường hợp đặc biệt
    const teacherSpecialty = teacher.chuyennganh.toLowerCase().trim();
    const subjectName = subject.tenmon.toLowerCase().trim();
    
    // Các từ khóa tương đương
    const literatureKeywords = ['văn', 'văn học', 'ngữ văn'];
    const mathKeywords = ['toán', 'toán học'];
    const englishKeywords = ['tiếng anh', 'anh', 'anh văn'];
    const physicsKeywords = ['vật lý', 'lý'];
    const chemistryKeywords = ['hóa học', 'hóa'];
    const biologyKeywords = ['sinh học', 'sinh'];
    const historyKeywords = ['lịch sử', 'sử'];
    const geographyKeywords = ['địa lý', 'địa'];
    const civicKeywords = ['giáo dục công dân', 'công dân', 'gdcd'];
    const itKeywords = ['tin học', 'tin', 'công nghệ thông tin', 'cntt'];
    const techKeywords = ['công nghệ', 'cn'];
    const peKeywords = ['thể dục', 'td', 'giáo dục thể chất'];
    const musicKeywords = ['âm nhạc', 'nhạc'];
    
    // Hàm kiểm tra xem hai chuỗi có cùng lĩnh vực không
    const isSameSubject = (specialty, subject) => {
      if (specialty === subject) return true;
      if (specialty.includes(subject) || subject.includes(specialty)) return true;
      
      // Kiểm tra các từ khóa tương đương
      const checkKeywords = (keywords, str1, str2) => {
        return keywords.some(keyword => 
          str1.includes(keyword) && str2.includes(keyword)
        );
      };
      
      return checkKeywords(literatureKeywords, specialty, subject) ||
             checkKeywords(mathKeywords, specialty, subject) ||
             checkKeywords(englishKeywords, specialty, subject) ||
             checkKeywords(physicsKeywords, specialty, subject) ||
             checkKeywords(chemistryKeywords, specialty, subject) ||
             checkKeywords(biologyKeywords, specialty, subject) ||
             checkKeywords(historyKeywords, specialty, subject) ||
             checkKeywords(geographyKeywords, specialty, subject) ||
             checkKeywords(civicKeywords, specialty, subject) ||
             checkKeywords(itKeywords, specialty, subject) ||
             checkKeywords(techKeywords, specialty, subject) ||
             checkKeywords(peKeywords, specialty, subject) ||
             checkKeywords(musicKeywords, specialty, subject);
    };
    
    if (!isSameSubject(teacherSpecialty, subjectName)) {
      return res.status(400).json({
        success: false,
        message: `Giáo viên ${teacher.hoten} chuyên ngành '${teacher.chuyennganh}' không thể dạy môn '${subject.tenmon}'`,
      });
    }

    // Kiểm tra trùng lặp
    const checkQuery = `
      SELECT id FROM phanconggiangday 
      WHERE giaovienid = $1 AND lopid = $2 AND monid = $3 AND (namhoc_id = $4 OR (namhoc_id IS NULL AND $4 IS NULL))
    `;
    const checkResult = await db.query(checkQuery, [giaovienid, lopid, monid, validNamhocId]);
    
    if (checkResult.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Đã tồn tại phân công này",
      });
    }

    const query = `
      INSERT INTO phanconggiangday (giaovienid, lopid, monid, namhoc_id)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const values = [giaovienid, lopid, monid, validNamhocId];
    const result = await db.query(query, values);

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: "Thêm phân công thành công",
    });
  } catch (error) {
    console.error("Lỗi thêm phân công:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi thêm phân công",
      error: error.message,
    });
  }
};

// Tự động phân công giảng dạy sử dụng Hungarian Algorithm
exports.autoAssignTeachers = async (req, res) => {
  const { namhoc_id } = req.body;

  try {
    console.log('🔄 Bắt đầu tự động phân công giảng dạy với Hungarian Algorithm...');
    
    // Sử dụng Hungarian Scheduler để phân công
    const result = await hungarianScheduler.generateAssignments(namhoc_id);
    
    res.status(200).json({
      success: true,
      message: `Tự động phân công thành công ${result.totalAssignments} phân công`,
      data: result,
    });

  } catch (error) {
    console.error("❌ Lỗi tự động phân công:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi tự động phân công",
      error: error.message,
    });
  }
};

// Lấy danh sách môn học
exports.getSubjects = async (req, res) => {
  try {
    const query = `
      SELECT id, tenmon 
      FROM monhoc 
      ORDER BY id
    `;
    const result = await db.query(query);

    res.status(200).json({
      success: true,
      data: result.rows,
      message: "Lấy danh sách môn học thành công",
    });

  } catch (error) {
    console.error("Error fetching subjects:", error);
    res.status(500).json({
      success: false,
      error: "Lỗi khi lấy danh sách môn học",
      message: error.message,
    });
  }
};

// Lấy danh sách năm học
exports.getAcademicYears = async (req, res) => {
  try {
    const query = `
      SELECT id, namhoc, kyhoc, trangthai 
      FROM namhoc 
      ORDER BY batdau DESC
    `;
    const result = await db.query(query);

    res.status(200).json({
      success: true,
      data: result.rows,
      message: "Lấy danh sách năm học thành công",
    });

  } catch (error) {
    console.error("Error fetching academic years:", error);
    res.status(500).json({
      success: false,
      error: "Lỗi khi lấy danh sách năm học",
      message: error.message,
    });
  }
};