Student Management System Fixes


Overview
Implemented the missing features for the Backend Developer Challenge and fixed the bug for the Frontend Developer Challenge.
This project is licensed under the MIT License.

Changes
1. Frontend: Fix "Add Notice" Page
Issue: The "Add Notice" page was failing to save the description because it was registered as "content", while the schema and backend expected "description". Fix:
- Updated initialState in add-notice-page.tsx to use "description".
- Updated form registration in notice-form.tsx to use "description".


2. Backend: Student Management CRUD
Issue: Missing CRUD operations for students. 
Implementation (adding services to controller routes):

Create (POST /students): Wired up handleAddStudent to addNewStudent service.
Read (GET /students, GET /students/:id): Wired up handleGetAllStudents and handleGetStudentDetail.
Update (PUT /students/:id): Wired up handleUpdateStudent.
Delete (DELETE /students/:id): Added  deleteStudent  to  students-service.js  which performs a Soft Delete (setting is_active to false).
Added handleDeleteStudent to students-controller.js 
Added DELETE /:id route in  sudents-router.js

Verification Results:
Automated Tests Integration test suite at backend/tests/integration/students.test.js for:
Creating a student
Listing students
Getting student details
Updating a student
Deleting a student

Files Created/Modified:
(add-notice-page.tsx, notice-form.tsx - frontend fix)
students-service.js
students-controller.js
sudents-router.js
students.test.js
package.json (added test command)
(backend/src/cookie.js - env secure cookies)
(backend/curl_test_students.sh - all CRUD operations defined in students.test.js using curl)
