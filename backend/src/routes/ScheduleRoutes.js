const express = require("express");
const router = express.Router();
const {
  getAllSchedules,
  getScheduleByGV,
  getScheduleByHS,
  generateScheduleHandler,
} = require("../controllers/ScheduleController");

const verifyToken = require("../middleware/verifyToken");

// Không dùng token
router.get("/byhs", getScheduleByHS);

// Dành cho giáo viên, cần token
router.get("/bygv", verifyToken, getScheduleByGV);

// Admin lấy toàn bộ
router.get("/all", getAllSchedules);


// Admin generate schedule
router.post("/generate", verifyToken, generateScheduleHandler);

module.exports = router;
