const express = require("express");
const router = express.Router();
const assignmentController = require("../controllers/AssignmentController");
const authenticateToken = require("../middleware/auth");

// Các endpoint cho phân công
router.get("/", authenticateToken, assignmentController.getAssignments);
router.get("/bygv", authenticateToken, assignmentController.getAssignmentsByGV);
router.get("/getStudentGrades", authenticateToken, assignmentController.getStudentGrades);
router.get("/getStudentsInClass", authenticateToken, assignmentController.getStudentsInClass);
router.put("/update", authenticateToken, assignmentController.updateStudentGrade);

// Endpoint cho môn học và năm học
router.get("/subjects", authenticateToken, assignmentController.getSubjects);
router.get("/academic-years", authenticateToken, assignmentController.getAcademicYears);

// CRUD operations cho phân công
router.post("/", authenticateToken, assignmentController.createAssignment);
router.put("/:id", authenticateToken, assignmentController.updateAssignment);
router.delete("/:id", authenticateToken, assignmentController.deleteAssignment);

// Tự động phân công
router.post("/auto-assign", authenticateToken, assignmentController.autoAssignTeachers);

module.exports = router;
