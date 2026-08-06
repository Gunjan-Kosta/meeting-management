# Government Enterprise Meeting Management System

An enterprise-grade, production-quality Meeting Management & Action Item Compliance Tracking System built with Node.js, Express, Prisma ORM, React.js, Vite, Tailwind CSS, Recharts, and JWT authentication.

> **Note**: This application is strictly designed for maintaining official meeting records, uploading Minutes of Meeting (MoM), managing supporting documents, assigning action items across departments, tracking compliance rates, generating analytical reports, and logging audit trails. Meetings are conducted externally; this portal manages governance and tracking.

---

## 🛠️ Tech Stack

### Backend
- **Node.js & Express.js** - MVC Clean Architecture
- **Prisma ORM** - Database client with migrations & SQLite/MySQL schema configurations
- **JWT & bcryptjs** - Secure token authentication and salted password hashing
- **Multer** - Document upload validation (Max 10MB each, PDF/DOCX/XLSX only)
- **Node Cron** - Automated background reminder scheduler for upcoming action item deadlines
- **Nodemailer** - Email notifications integration
- **Helmet & Rate Limiting** - HTTP header security and rate limiting against brute-force attacks

### Frontend
- **React.js 19 & Vite** - High-performance frontend engine
- **React Router DOM v7** - Client-side routing with role-based layout guards
- **Tailwind CSS v3** - Enterprise government portal design system (White, Light Gray, Blue Accent) with Dark Mode toggle
- **Recharts** - Data visualization for monthly trends, meeting type distributions, and department workloads
- **React Hook Form & React Hot Toast** - Form validation and non-blocking toast notifications
- **Lucide React** - Modern accessible icon system

---

## 👥 Role Based Access Control (RBAC)

1. **State Administrator**
   - Full system access across all districts and state level departments.
   - Create, edit, submit, close, and delete meetings.
   - Provision user accounts, assign roles, and manage departments.
   - View immutable system audit logs and executive compliance reports.

2. **District User**
   - Create meetings for their designated district.
   - Edit draft meetings, upload documents, and submit meeting records.
   - Update status and progress remarks on assigned action items.
   - Cannot edit or delete submitted/closed meetings.

3. **Viewer**
   - Read-only dashboard analytics, meeting detail inspection, and reports.

---

## 🔑 Default Seeded Demo Accounts

| Role | Email | Password | Access Scope |
| :--- | :--- | :--- | :--- |
| **State Administrator** | `admin@gov.in` | `Admin@123` | Full Access (State HQ) |
| **District User** | `district.user@gov.in` | `Admin@123` | Bhopal District |
| **Viewer** | `viewer@gov.in` | `Admin@123` | Read-Only |

---

## 📁 Project Structure

```
meeting-management/
├── client/                     # Frontend Application
│   ├── src/
│   │   ├── components/         # Sidebar, Navbar, ConfirmModal, Badge, LoadingSkeleton
│   │   ├── context/            # AuthContext (JWT state, dark mode, RBAC helpers)
│   │   ├── layouts/            # DashboardLayout, AuthLayout
│   │   ├── pages/              # Dashboard, Meetings, Action Tracker, Reports, Audit Logs, Users, Profile
│   │   ├── services/           # Axios API client with request/response interceptors
│   │   ├── App.jsx             # Route definitions & protected route guards
│   │   └── main.jsx
│   ├── index.html
│   ├── tailwind.config.js
│   └── vite.config.js
└── server/                     # Backend Application
    ├── config/                 # db.js (Prisma Client), mail.js (Nodemailer setup)
    ├── controllers/            # Auth, Meeting, Document, Action, Department, User, Dashboard, Report, AuditLog
    ├── middleware/             # authMiddleware, rbacMiddleware, uploadMiddleware, rateLimiter, errorHandler
    ├── prisma/                 # schema.prisma (SQLite/MySQL models) & seed.js
    ├── routes/                 # Express route handlers
    ├── services/               # auditService, cronService, reportService
    ├── utils/                  # meetingCodeGenerator, fileValidator, responseHandler
    └── app.js                  # Express app entry point
```

---

## 🚦 Quick Start & Local Execution

### Prerequisites
- Node.js (v18+)
- npm or yarn

### 1. Backend Setup
```bash
cd server
npm install
npx prisma db push
node seed.js
npm start
```
*Backend API server runs at `http://localhost:5000`*

### 2. Frontend Setup
```bash
cd client
npm install
npm run dev
```
*Frontend application runs at `http://localhost:3000`*

---

## 📄 License
This project is licensed under the MIT License.
