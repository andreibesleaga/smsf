const { z } = require("zod");

const getStudentsSchema = z.object({
    query: z.object({
        page: z.coerce.number().int().positive().optional(),
        limit: z.coerce.number().int().positive().optional(),
        search: z.string().optional(),
        class: z.string().optional(),
        section: z.string().optional(),
    }),
});

const createStudentSchema = z.object({
    body: z.object({
        name: z.string().min(1, "Name is required"),
        email: z.string().email("Invalid email address"),
        gender: z.enum(["Male", "Female", "Other"]),
        dob: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date format" }),
        phone: z.string().optional(),
        admissionDate: z.string().optional(),
        class: z.string().optional(),
        section: z.string().optional(),
        roll: z.number().int().positive().optional(),
        fatherName: z.string().optional(),
        motherName: z.string().optional(),
        fatherPhone: z.string().optional(),
        motherPhone: z.string().optional(),
        guardianName: z.string().optional(),
        guardianPhone: z.string().optional(),
        relationOfGuardian: z.string().optional(),
        currentAddress: z.string().optional(),
        permanentAddress: z.string().optional(),
        systemAccess: z.boolean().optional(),
    }),
});

const updateStudentSchema = z.object({
    params: z.object({
        id: z.string().transform((val) => parseInt(val, 10)).refine((val) => !isNaN(val), { message: "Invalid ID" }),
    }),
    body: z.object({
        name: z.string().min(1, "Name is required").optional(),
        email: z.string().email("Invalid email address").optional(),
        gender: z.enum(["Male", "Female", "Other"]).optional(),
        dob: z.string().optional(),
        phone: z.string().optional(),
        admissionDate: z.string().optional(),
        class: z.string().optional(),
        section: z.string().optional(),
        roll: z.number().int().positive().optional(),
        fatherName: z.string().optional(),
        motherName: z.string().optional(),
        fatherPhone: z.string().optional(),
        motherPhone: z.string().optional(),
        guardianName: z.string().optional(),
        guardianPhone: z.string().optional(),
        relationOfGuardian: z.string().optional(),
        currentAddress: z.string().optional(),
        permanentAddress: z.string().optional(),
        systemAccess: z.boolean().optional(),
    }),
});

const studentIdSchema = z.object({
    params: z.object({
        id: z.string().transform((val) => parseInt(val, 10)).refine((val) => !isNaN(val), { message: "Invalid ID" }),
    }),
});

const setStudentStatusSchema = z.object({
    params: z.object({
        id: z.string().transform((val) => parseInt(val, 10)).refine((val) => !isNaN(val), { message: "Invalid ID" }),
    }),
    body: z.object({
        status: z.boolean(),
    }),
});

module.exports = {
    getStudentsSchema,
    createStudentSchema,
    updateStudentSchema,
    studentIdSchema,
    setStudentStatusSchema,
};
