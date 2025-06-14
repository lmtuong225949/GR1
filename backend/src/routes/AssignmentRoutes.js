const express = require("express");
const router = express.Router();
const assignmentController = require("../controllers/AssignmentController");
const authenticateToken = require("../middleware/auth");

// Các endpoint cho phân công
router.get("/", assignmentController.getAssignments);
router.get("/bygv", authenticateToken, assignmentController.getAssignmentsByGV);
router.get("/getStudentGrades", assignmentController.getStudentGrades);
router.put("/update", assignmentController.updateStudentGrade);

module.exports = router;
