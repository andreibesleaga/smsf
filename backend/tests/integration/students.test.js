const request = require('supertest');

// Mock specific middleware that causes issues in testing
jest.mock('../../src/middlewares/handle-global-error', () => {
    const original = jest.requireActual('../../src/middlewares/handle-global-error');
    return {
        ...original,
        syncConfigHandler: jest.fn(),
    };
});

const { app } = require('../../src/app');
const { db } = require('../../src/config/db');

// Mock console.log to keep output clean


describe('Student Management API', () => {
    let token;
    let createdStudentId;

    const adminCredentials = {
        username: 'admin@school-admin.com',
        password: '3OU4zn3q6Zh9'
    };

    const newStudent = {
        name: 'Test Student',
        email: `test.student.${Date.now()}@example.com`,
        gender: 'Male',
        dob: '2010-01-01',
        phone: '1234567890',
        admissionDate: '2023-01-01',
        class: 'Class 1',
        section: 'A',
        roll: 101,
        fatherName: 'Father Test',
        motherName: 'Mother Test',
        fatherPhone: '1111111111',
        motherPhone: '2222222222',
        guardianName: 'Guardian Test',
        guardianPhone: '3333333333',
        relationOfGuardian: 'Uncle',
        currentAddress: '123 Main St',
        permanentAddress: '123 Main St',
        systemAccess: true
    };

    let csrfToken;
    let server;
    let agent;

    beforeAll(async () => {
        // Start server on ephemeral port
        server = app.listen(0);
        agent = request.agent(server);

        // Seed Class and Section for FK constraints
        await db.query("INSERT INTO classes (name) VALUES ('Class 1') ON CONFLICT (name) DO NOTHING");
        await db.query("INSERT INTO sections (name) VALUES ('A') ON CONFLICT (name) DO NOTHING");

        // Login to get token
        const res = await agent
            .post('/api/v1/auth/login')
            .send(adminCredentials);

        console.log('Login Status:', res.statusCode);
        console.log('Login Body:', JSON.stringify(res.body, null, 2));

        expect(res.statusCode).toBe(200);
        if (res.header['set-cookie']) {
            const cookies = res.header['set-cookie'];
            // Find the last csrfToken cookie which should be the active one (after clearAllCookies)
            // Or filter for non-expired one.
            const csrfCookie = cookies.reverse().find(cookie => cookie.startsWith('csrfToken=') && !cookie.includes('Expires=Thu, 01 Jan 1970'));

            if (csrfCookie) {
                csrfToken = csrfCookie.split(';')[0].split('=')[1];
            }
        }
    });

    afterAll(async () => {
        await new Promise(resolve => server.close(resolve)); // Ensure server is closed
        await db.end();
    });

    test('POST /api/v1/students - Create a new student', async () => {
        const res = await agent
            .post('/api/v1/students')
            .set('x-csrf-token', csrfToken)
            .send(newStudent);

        if (res.statusCode !== 200) {
            // failure handling
        }

        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBeDefined();
        // Depending on service implementation, it might not return the ID directly in body if not modified to do so.
        // But let's check if we can fetch it. 
        // Actually the service returns `{ message: ... }`.
        // To verify creation we should query by email or list all.
    });

    test('GET /api/v1/students - List all students', async () => {
        const res = await agent
            .get('/api/v1/students')
            .set('x-csrf-token', csrfToken);

        if (res.statusCode !== 200) {
            // Keep error logging for future failures if needed, or remove. 
            // I'll keep the failure logs but remove "DEBUG" ones.
        }

        expect(res.statusCode).toBe(200);
        expect(res.body.students).toBeInstanceOf(Array);

        // Find our student
        const student = res.body.students.find(s => s.email === newStudent.email);
        if (!student) {
            console.log('Students List:', JSON.stringify(res.body.students, null, 2));
        }
        expect(student).toBeDefined();
        createdStudentId = student.id;
    });

    test('GET /api/v1/students/:id - Get student details', async () => {
        expect(createdStudentId).toBeDefined();
        const res = await agent
            .get(`/api/v1/students/${createdStudentId}`)
            .set('x-csrf-token', csrfToken);

        expect(res.statusCode).toBe(200);
        expect(res.body.email).toBe(newStudent.email);
    });

    test('PUT /api/v1/students/:id - Update student', async () => {
        expect(createdStudentId).toBeDefined();
        const updatedName = 'Test Student Updated';
        const res = await agent
            .put(`/api/v1/students/${createdStudentId}`)
            .set('x-csrf-token', csrfToken)
            .send({ ...newStudent, name: updatedName, userId: createdStudentId });

        expect(res.statusCode).toBe(200);

        // Verify update
        const checkRes = await agent
            .get(`/api/v1/students/${createdStudentId}`)
            .set('x-csrf-token', csrfToken);

        expect(checkRes.body.name).toBe(updatedName);
    });

    test('DELETE /api/v1/students/:id - Delete student', async () => {
        expect(createdStudentId).toBeDefined();
        const res = await agent
            .delete(`/api/v1/students/${createdStudentId}`)
            .set('x-csrf-token', csrfToken);

        expect(res.statusCode).toBe(200);
        expect(res.body.message).toContain('deleted');

        // Verify soft delete (is_active should be false)
        // Note: The /students list filters by is_active? 
        // Repository says "WHERE t1.role_id = 3". It doesn't seem to filter by is_active in findAllStudents.
        // But getStudentDetail returns "systemAccess" which corresponds to is_active.

        const checkRes = await agent
            .get(`/api/v1/students/${createdStudentId}`)
            .set('x-csrf-token', csrfToken);

        expect(checkRes.body.systemAccess).toBe(false);
    });
});

