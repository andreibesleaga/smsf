#!/bin/bash

# Configuration
BASE_URL="http://localhost:5007/api/v1"
USERNAME="admin@school-admin.com"
PASSWORD="3OU4zn3q6Zh9"
COOKIE_FILE="cookies.txt"
TIMESTAMP=$(date +%s)
EMAIL="test.student.${TIMESTAMP}@example.com"

echo "=== 1. Logging in ==="
# Login and save cookies
curl -s -c $COOKIE_FILE -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"username\": \"$USERNAME\", \"password\": \"$PASSWORD\"}" > login_response.json

# Check login success
if grep -q "accessToken" $COOKIE_FILE; then
    echo "Login successful!"
else
    echo "Login failed!"
    cat login_response.json
    exit 1
fi

# Extract CSRF Token from cookies.txt
# Format in cookies.txt: localhost FALSE / FALSE 0 csrfToken value
CSRF_TOKEN=$(grep "csrfToken" $COOKIE_FILE | awk '{print $7}')
echo "CSRF Token extracted: $CSRF_TOKEN"

echo -e "\n=== 2. Creating Student ==="
# Payload
cat <<EOF > student_payload.json
{
    "name": "Test Student",
    "email": "$EMAIL",
    "gender": "Male",
    "dob": "2010-01-01",
    "phone": "1234567890",
    "admissionDate": "2023-01-01",
    "class": "Class 1",
    "section": "A",
    "roll": 101,
    "fatherName": "Father Test",
    "motherName": "Mother Test",
    "fatherPhone": "1111111111",
    "motherPhone": "2222222222",
    "guardianName": "Guardian Test",
    "guardianPhone": "3333333333",
    "relationOfGuardian": "Uncle",
    "currentAddress": "123 Main St",
    "permanentAddress": "123 Main St",
    "systemAccess": true
}
EOF

# Create Student
curl -s -b $COOKIE_FILE -X POST "$BASE_URL/students" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: $CSRF_TOKEN" \
  -d @student_payload.json > create_response.json

echo "Create Response:"
cat create_response.json
echo ""

echo -e "\n=== 3. Listing Students to get ID ==="
curl -s -b $COOKIE_FILE -X GET "$BASE_URL/students?name=Test%20Student&limit=100" \
  -H "x-csrf-token: $CSRF_TOKEN" > list_response.json

# Use jq to extract ID of student with our email
STUDENT_ID=$(jq -r ".data[] | select(.email == \"$EMAIL\") | .id" list_response.json)

if [ -z "$STUDENT_ID" ] || [ "$STUDENT_ID" == "null" ]; then
    echo "Failed to find created student ID."
    exit 1
fi

echo "Created Student ID: $STUDENT_ID"

echo -e "\n=== 4. Get Student Details ==="
curl -s -b $COOKIE_FILE -X GET "$BASE_URL/students/$STUDENT_ID" \
  -H "x-csrf-token: $CSRF_TOKEN" > detail_response.json

echo "Student Details:"
cat detail_response.json
echo ""

echo -e "\n=== 5. Update Student ==="
# Update Payload (adding userId as per test requirement)
cat <<EOF > update_payload.json
{
    "name": "Test Student Updated",
    "email": "updated.$EMAIL",
    "gender": "Male",
    "dob": "2010-01-01",
    "phone": "1234567890",
    "admissionDate": "2023-01-01",
    "class": "Class 1",
    "section": "A",
    "roll": 101,
    "fatherName": "Father Test",
    "motherName": "Mother Test",
    "fatherPhone": "1111111111",
    "motherPhone": "2222222222",
    "guardianName": "Guardian Test",
    "guardianPhone": "3333333333",
    "relationOfGuardian": "Uncle",
    "currentAddress": "123 Main St",
    "permanentAddress": "123 Main St",
    "systemAccess": true,
    "userId": $STUDENT_ID
}
EOF

curl -s -b $COOKIE_FILE -X PUT "$BASE_URL/students/$STUDENT_ID" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: $CSRF_TOKEN" \
  -d @update_payload.json > update_response.json

echo "Update Response:"
cat update_response.json
echo ""

echo -e "\n=== 6. Verify Update ==="
curl -s -b $COOKIE_FILE -X GET "$BASE_URL/students/$STUDENT_ID" \
  -H "x-csrf-token: $CSRF_TOKEN" > verify_update.json
NAME=$(jq -r ".name" verify_update.json)
echo "Updated Name: $NAME"

echo -e "\n=== 7. Delete Student (Soft Delete) ==="
curl -s -b $COOKIE_FILE -X DELETE "$BASE_URL/students/$STUDENT_ID" \
  -H "x-csrf-token: $CSRF_TOKEN" > delete_response.json

echo "Delete Response:"
cat delete_response.json
echo ""

echo -e "\n=== 8. Verify Soft Delete ==="
curl -s -b $COOKIE_FILE -X GET "$BASE_URL/students/$STUDENT_ID" \
  -H "x-csrf-token: $CSRF_TOKEN" > final_check.json
SYSTEM_ACCESS=$(jq -r ".systemAccess" final_check.json)
echo "System Access (should be false): $SYSTEM_ACCESS"

echo -e "\n=== Cleanup ==="
rm cookies.txt login_response.json student_payload.json create_response.json list_response.json detail_response.json update_payload.json update_response.json verify_update.json delete_response.json final_check.json
echo "Done."
