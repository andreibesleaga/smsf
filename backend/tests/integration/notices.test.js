const request = require('supertest');
const { app } = require('../../src/app');
const { db } = require('../../src/config/db');

// Mock specific middleware
jest.mock('../../src/middlewares/handle-global-error', () => {
    const original = jest.requireActual('../../src/middlewares/handle-global-error');
    return {
        ...original,
        syncConfigHandler: jest.fn(),
    };
});

describe('Notice Management API', () => {
    let token;
    let csrfToken;
    let server;
    let agent;
    let adminUserId;

    const adminCredentials = {
        username: 'admin@school-admin.com',
        password: '3OU4zn3q6Zh9'
    };

    const newNotice = {
        title: 'Test Notice',
        description: 'This is a test notice description.',
        status: 1, // Draft probably, based on code might need checking enums but 1/2/3 were in switch
        recipientType: 'all',
        recipientRole: null,
        firstField: null
    };

    beforeAll(async () => {
        // Start server on ephemeral port
        server = app.listen(0);
        agent = request.agent(server);

        // Mock console.error to suppress expected API errors
        jest.spyOn(console, 'error').mockImplementation(() => { });

        // Login to get token
        const res = await agent
            .post('/api/v1/auth/login')
            .send(adminCredentials);

        expect(res.statusCode).toBe(200);
        adminUserId = res.body.id; // accountBasic serves as the user object directly

        if (res.header['set-cookie']) {
            const cookies = res.header['set-cookie'];
            const csrfCookie = cookies.reverse().find(cookie => cookie.startsWith('csrfToken=') && !cookie.includes('Expires=Thu, 01 Jan 1970'));
            if (csrfCookie) {
                csrfToken = csrfCookie.split(';')[0].split('=')[1];
            }
        }
    });

    afterAll(async () => {
        await new Promise(resolve => server.close(resolve));
        await db.end();
        jest.restoreAllMocks();
    });

    test('POST /api/v1/notices - Create a notice with description', async () => {
        const res = await agent
            .post('/api/v1/notices')
            .set('x-csrf-token', csrfToken)
            .send(newNotice);

        expect(res.statusCode).toBe(200);
        expect(res.body.message).toContain('successfully');
    });

    test('GET /api/v1/notices - Verify description saved', async () => {
        const res = await agent
            .get('/api/v1/notices')
            .set('x-csrf-token', csrfToken);

        expect(res.statusCode).toBe(200);

        // Find the notice we just created
        const notice = res.body.notices.find(n => n.title === newNotice.title);
        expect(notice).toBeDefined();
        // This is the core issue check:
        // README says "Notice Description Not Saving". 
        // If the issue exists, this might be null/empty or fail.
        expect(notice.description).toBe(newNotice.description);
    });

    test('POST /api/v1/notices - Create check without description (Should fail after fix)', async () => {
        // Currently might succeed if no validation. 
        // Goal is to ensure it fails with validation.
        const invalidNotice = { ...newNotice, title: 'No Desc Notice' };
        delete invalidNotice.description;

        const res = await agent
            .post('/api/v1/notices')
            .set('x-csrf-token', csrfToken)
            .send(invalidNotice);

        // We want it to be 400 after fix.
        expect(res.statusCode).toBe(400);
        expect(res.body.error).toBeDefined();
    });
});
