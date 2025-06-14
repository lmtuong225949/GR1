const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const pool = require("../config/db");

// Cấu hình multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: function (req, file, cb) {
    const allowed = /pdf|docx?|pptx?|xlsx?|txt|zip|rar/;
    const ext = path.extname(file.originalname).toLowerCase();
    const mime = file.mimetype;
    if (allowed.test(ext) && allowed.test(mime)) {
      cb(null, true);
    } else {
      cb(new Error("File không hợp lệ"));
    }
  },
});

// 👉 Upload file mới
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const { filename, type } = req.body;
    const filePath = req.file.path;

    const result = await pool.query(
      `INSERT INTO uploads (title, filename, filepath, type)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [filename, req.file.originalname, filePath, type]
    );

    res.status(201).json({ message: "Tải lên thành công", file: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lỗi khi tải lên" });
  }
});

// 👉 Lấy danh sách theo loại
router.get("/list/:type", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM uploads WHERE type = $1 ORDER BY uploaded_at DESC",
      [req.params.type]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Lỗi truy vấn" });
  }
});

// 👉 Cập nhật tiêu đề
router.put("/rename/:id", async (req, res) => {
  try {
    const { title } = req.body;
    const result = await pool.query(
      "UPDATE uploads SET title = $1 WHERE id = $2 RETURNING *",
      [title, req.params.id]
    );
    res.json({ message: "Đã cập nhật tiêu đề", file: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: "Không thể cập nhật" });
  }
});

// 👉 Thay thế file
router.put("/replace/:id", upload.single("file"), async (req, res) => {
  try {
    const id = req.params.id;
    const newFile = req.file;

    // Lấy file cũ
    const old = await pool.query("SELECT * FROM uploads WHERE id = $1", [id]);
    if (!old.rows.length) return res.status(404).json({ error: "Không tìm thấy file" });

    // Xoá file cũ
    fs.unlinkSync(old.rows[0].filepath);

    // Cập nhật DB
    const result = await pool.query(
      `UPDATE uploads SET filename = $1, filepath = $2, uploaded_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *`,
      [newFile.originalname, newFile.path, id]
    );

    res.json({ message: "Đã thay thế file", file: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Không thể thay thế" });
  }
});

// 👉 Xoá file
router.delete("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const result = await pool.query("SELECT * FROM uploads WHERE id = $1", [id]);
    if (!result.rows.length) return res.status(404).json({ error: "Không tìm thấy file" });

    // Xoá file vật lý
    fs.unlinkSync(result.rows[0].filepath);

    // Xoá DB
    await pool.query("DELETE FROM uploads WHERE id = $1", [id]);

    res.json({ message: "Đã xoá thành công" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lỗi khi xoá" });
  }
});

module.exports = router;
router.get("/download/:id", async (req, res) => {
  const { id } = req.params;
  const result = await pool.query("SELECT filename, filepath FROM uploads WHERE id = $1", [id]);

  if (result.rows.length === 0) {
    return res.status(404).json({ error: "Không tìm thấy tài liệu" });
  }

  const { filename, filepath } = result.rows[0];
  const fullPath = path.resolve(filepath); // tuyệt đối luôn đúng
  if (!fs.existsSync(fullPath)) {
    return res.status(404).json({ error: "File không tồn tại" });
  }

  res.download(fullPath, filename);
});
