const express = require("express");
const router = express.Router();
const studentController = require("./students-controller");


const { validateRequest } = require("../../middlewares/validation");
const {
    getStudentsSchema,
    createStudentSchema,
    updateStudentSchema,
    studentIdSchema,
    setStudentStatusSchema
} = require("./student-schemas");

router.get("", validateRequest(getStudentsSchema), studentController.handleGetAllStudents);
router.post("", validateRequest(createStudentSchema), studentController.handleAddStudent);
router.get("/:id", validateRequest(studentIdSchema), studentController.handleGetStudentDetail);
router.post("/:id/status", validateRequest(setStudentStatusSchema), studentController.handleStudentStatus);
router.put("/:id", validateRequest(updateStudentSchema), studentController.handleUpdateStudent);
router.delete("/:id", validateRequest(studentIdSchema), studentController.handleDeleteStudent);

module.exports = { studentsRoutes: router };
