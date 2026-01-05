const asyncHandler = require("express-async-handler");
const { getAllStudents, addNewStudent, getStudentDetail, setStudentStatus, updateStudent, deleteStudent } = require("./students-service");

const handleGetAllStudents = asyncHandler(async (req, res) => {
    const result = await getAllStudents(req.query);
    res.json(result);
});

const handleAddStudent = asyncHandler(async (req, res) => {
    const result = await addNewStudent(req.body);
    res.json(result);
});

const handleUpdateStudent = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const result = await updateStudent({ ...req.body, userId: id });
    res.json(result);
});

const handleGetStudentDetail = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const student = await getStudentDetail(id);
    res.json(student);
});

const handleStudentStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    // Assuming req.user is populated by auth middleware
    const reviewerId = req.user ? req.user.id : null;
    const result = await setStudentStatus({ userId: id, status, reviewerId });
    res.json(result);
});

const handleDeleteStudent = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const result = await deleteStudent(id);
    res.json(result);
});

module.exports = {
    handleGetAllStudents,
    handleGetStudentDetail,
    handleAddStudent,
    handleStudentStatus,
    handleUpdateStudent,
    handleDeleteStudent,
};
