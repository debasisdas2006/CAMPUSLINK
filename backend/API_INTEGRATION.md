# CAMPUSLINK API Integration Guide

## Backend Information

Base URL:
http://127.0.0.1:8000

Swagger Documentation:
http://127.0.0.1:8000/docs

API Version:
v1

Authentication:
JWT Bearer Token

---

# 1. Authentication

## Register

POST /api/v1/auth/register

Used to create a new user account.

## Login

POST /api/v1/auth/login

Used to authenticate the user and obtain JWT token.

## Current User

GET /api/v1/auth/me

Authentication:
Bearer Token required.

---

# 2. Student APIs

## Get Student Profile

GET /api/v1/students/profile

Authentication:
Bearer Token required.

## Create Student Profile

POST /api/v1/students/profile

Authentication:
Bearer Token required.

---

# 3. Company APIs

## Create Company

POST /api/v1/companies/

Authentication:
Bearer Token required.

## Get My Company

GET /api/v1/companies/my-company

Authentication:
Bearer Token required.

---

# 4. Recruiter APIs

## Get Recruiter Profile

GET /api/v1/recruiters/profile

Authentication:
Bearer Token required.

## Create Recruiter Profile

POST /api/v1/recruiters/profile

Authentication:
Bearer Token required.

---

# 5. Job APIs

## Create Job

POST /api/v1/jobs/

Authentication:
Bearer Token required.

## Get My Jobs

GET /api/v1/jobs/my-jobs

Authentication:
Bearer Token required.

---

# 6. Application APIs

## Apply for Job

POST /api/v1/applications/

Authentication:
Bearer Token required.

## Student Applications

GET /api/v1/applications/my-applications

Authentication:
Bearer Token required.

## Recruiter Applications

GET /api/v1/applications/recruiter/my-applications

Authentication:
Bearer Token required.

## Update Application Status

PUT /api/v1/applications/{application_id}/status

Authentication:
Bearer Token required.

---

# 7. Interview APIs

## Create Interview

POST /api/v1/interviews/

Authentication:
Bearer Token required.

## Recruiter Interviews

GET /api/v1/interviews/recruiter/my-interviews

Authentication:
Bearer Token required.

## Student Interviews

GET /api/v1/interviews/student/my-interviews

Authentication:
Bearer Token required.

## Create Interview Question

POST /api/v1/interviews/questions

Authentication:
Bearer Token required.

## Get Interview Questions

GET /api/v1/interviews/{interview_id}/questions

Authentication:
Bearer Token required.

## Update Interview Question

PUT /api/v1/interviews/questions/{question_id}

Authentication:
Bearer Token required.

## Update Interview

PUT /api/v1/interviews/{interview_id}

Authentication:
Bearer Token required.

---

# 8. Assessment Test APIs

## Get Tests

GET /api/v1/tests/

Authentication:
Bearer Token required.

## Create Test

POST /api/v1/tests/

Authentication:
Bearer Token required.

## Create Question

POST /api/v1/tests/questions

Authentication:
Bearer Token required.

## Get Test Questions

GET /api/v1/tests/{test_id}/questions

Authentication:
Bearer Token required.

## Submit Test

POST /api/v1/tests/submit

Authentication:
Bearer Token required.

## Student Attempts

GET /api/v1/tests/student/my-attempts

Authentication:
Bearer Token required.

## Get Test

GET /api/v1/tests/{test_id}

Authentication:
Bearer Token required.

---

# 9. AI/ML Matching

## Match Student With Job

POST /api/v1/ai/match

Authentication:
Bearer Token required.

This endpoint connects the backend with the AI/ML matching functionality.

---

# 10. Admin APIs

## Admin Dashboard

GET /api/v1/admin/dashboard

Authentication:
Bearer Token required.

## Get Users

GET /api/v1/admin/users

Authentication:
Bearer Token required.

---

# 11. Analytics APIs

## Placement Analytics

GET /api/v1/analytics/placement

Authentication:
Bearer Token required.

## Company Analytics

GET /api/v1/analytics/company/{company_id}

Authentication:
Bearer Token required.

## Job Analytics

GET /api/v1/analytics/job/{job_id}

Authentication:
Bearer Token required.

---

# 12. Monitoring APIs

## System Health

GET /api/v1/monitoring/health

## System Statistics

GET /api/v1/monitoring/statistics

---

# Frontend Integration

The frontend should use:

http://127.0.0.1:8000

Example:

GET http://127.0.0.1:8000/api/v1/auth/me

For protected endpoints, send:

Authorization: Bearer <JWT_TOKEN>

---

# Important

Do not share JWT tokens publicly.

Frontend developers should use the Swagger documentation for the exact request body and response schemas:

http://127.0.0.1:8000/docs

Backend developer responsibility:

- API development
- Database integration
- Authentication
- API testing
- Swagger documentation
- API integration support
- Backend error fixing
- Final backend verification