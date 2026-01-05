const { ApiError, sendAccountVerificationEmail } = require("../../utils");
const { findAllStudents, findStudentDetail, findStudentToSetStatus, addOrUpdateStudent } = require("./students-repository");
const { findUserById } = require("../../shared/repository");

const checkStudentId = async (id) => {
    const isStudentFound = await findUserById(id);
    if (!isStudentFound) {
        throw new ApiError(404, "Student not found");
    }
}

const getAllStudents = async (payload) => {
    const { page = 1, limit = 10, ...filters } = payload;
    const offset = (page - 1) * limit;

    const students = await findAllStudents({ ...filters, limit, offset });

    let total = 0;
    if (students.length > 0) {
        total = parseInt(students[0].totalCount, 10);
        students.forEach(s => delete s.totalCount);
    }

    const totalPages = Math.ceil(total / limit);

    return {
        data: students,
        meta: {
            total,
            page,
            limit,
            totalPages
        }
    };
}

const getStudentDetail = async (id) => {
    await checkStudentId(id);

    const student = await findStudentDetail(id);
    if (!student) {
        throw new ApiError(404, "Student not found");
    }

    return student;
}

const addNewStudent = async (payload) => {
    const ADD_STUDENT_AND_EMAIL_SEND_SUCCESS = "Student added and verification email sent successfully.";
    const ADD_STUDENT_AND_BUT_EMAIL_SEND_FAIL = "Student added, but failed to send verification email.";
    try {
        const result = await addOrUpdateStudent(payload);
        if (!result.status) {
            throw new ApiError(500, result.message);
        }

        try {
            await sendAccountVerificationEmail({ userId: result.userId, userEmail: payload.email });
            return { message: ADD_STUDENT_AND_EMAIL_SEND_SUCCESS };
        } catch (error) {
            return { message: ADD_STUDENT_AND_BUT_EMAIL_SEND_FAIL }
        }
    } catch (error) {
        throw new ApiError(500, "Unable to add student");
    }
}

const updateStudent = async (payload) => {
    const result = await addOrUpdateStudent(payload);
    if (!result.status) {
        throw new ApiError(500, result.message);
    }

    return { message: result.message };
}

const setStudentStatus = async ({ userId, reviewerId, status }) => {
    await checkStudentId(userId);

    const affectedRow = await findStudentToSetStatus({ userId, reviewerId, status });
    if (affectedRow <= 0) {
        throw new ApiError(500, "Unable to disable student");
    }

    return { message: "Student status changed successfully" };
}


const deleteStudent = async (id) => {
    await checkStudentId(id);

    // Soft delete: set is_active to false
    // We might not have a reviewerId in a simple delete call, so passing NULL or a system ID if required.
    // However, repository expects reviewerId. 
    // If usage context implies an admin action, we might ideally want the admin's ID.
    // For now, passing null for reviewerId if not strictly required by DB constraint (it is nullable in schema? Yes, DEFAULT NULL).

    const affectedRow = await findStudentToSetStatus({ userId: id, reviewerId: null, status: false });
    if (affectedRow <= 0) {
        throw new ApiError(500, "Unable to delete student");
    }

    return { message: "Student deleted successfully" };
}

module.exports = {
    getAllStudents,
    getStudentDetail,
    addNewStudent,
    setStudentStatus,
    updateStudent,
    deleteStudent,
};
