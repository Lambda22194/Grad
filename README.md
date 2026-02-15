# Recruitment & Internship Platform (Students & Fresh Graduates) — No Job-Fit Score

Roles:
- **Student**: register/login, manage profile, upload CV, browse/apply, track status, view recommendations
- **Employer**: register/login, admin verification required, post jobs/internships, view + manage applications
- **Admin**: login only (created in DB), verify employers, basic monitoring

Recommendations:
- Simple overlap between **student skills/interests** and **job tags** (transparent, no job-fit score).

## Setup
1) Database: run `database/schema_and_seed.sql` in MySQL.
2) App:
- copy `.env.example` to `.env` and fill DB credentials
- `npm install`
- `npm run dev`
- open http://localhost:3000

## Seeded logins (Password123!)
- Admin: admin@platform.local
- Student: student1@platform.local / student2@platform.local
- Employer (verified): hr@techwave.local
- Employer (pending): jobs@brightlabs.local
