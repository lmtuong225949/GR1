const express = require("express");
const router = express.Router();
const parentController = require("../controllers/ParentController");

// GET /api/parents → lấy danh sách phụ huynh + học sinh
router.get("/", parentController.getAllParentsWithStudent);

// GET /api/parents/:id → lấy phụ huynh theo ID
router.get("/:id", parentController.getParentById);

// GET /api/parents/student/:studentId → lấy thông tin học sinh kèm phụ huynh theo ID học sinh
router.get("/student/:studentId", parentController.getStudentWithParentByStudentId);

// GET /api/parents/score/:id → lấy điểm của học sinh con theo ID phụ huynh
router.get("/:id/score", parentController.getScoresByParentId);

module.exports = router;
