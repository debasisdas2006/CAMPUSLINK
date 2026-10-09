# CAMPUSLINK Analytics API

## Project

CAMPUSLINK - AI Powered Campus-to-Corporate Placement Management & Analytics Platform

## Purpose

The Analytics module provides placement, company, job demand, skill demand,
and student readiness analytics for the CAMPUSLINK Admin Dashboard.

---

## Analytics Endpoints

### 1. Placement Analytics

GET `/analytics/placement`

Provides overall placement statistics.

---

### 2. Company Analytics

GET `/analytics/companies`

Provides company-related placement information.

---

### 3. Job Demand Analytics

GET `/analytics/jobs`

Provides job demand and job-related statistics.

---

### 4. Skill Analytics

GET `/analytics/skills`

Provides information about in-demand skills.

---

### 5. Student Readiness

GET `/analytics/student-readiness`

Provides student readiness information based on available student data.

---

## API Testing

The API can be tested using Swagger UI:

`/docs`

Example local URL:

`http://127.0.0.1:8000/docs`

---

## Module Structure

```text
analytics/
│
├── data/
├── notebooks/
├── src/
│   ├── data_loader.py
│   ├── placement_analysis.py
│   ├── company_analysis.py
│   ├── job_demand.py
│   ├── skill_analysis.py
│   ├── student_readiness.py
│   ├── company_requirements_analysis.py
│   └── recruiter_analysis.py
│
├── charts/
│   ├── placement_chart.py
│   ├── company_chart.py
│   ├── skill_chart.py
│   └── job_demand_chart.py
│
└── api/
    └── analytics_api.py