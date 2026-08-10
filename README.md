# 🏛️ Government Enterprise Meeting Management & Compliance System

[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-green?logo=node.js)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-v19-blue?logo=react)](https://reactjs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-v6-2D3748?logo=prisma)](https://www.prisma.io/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v3-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

An enterprise-grade, secure, and production-ready **Meeting Management & Action Item Compliance Tracking System** built for government departments, state secretariats, and district collectorates.

Developed and maintained by **GUNJAN KOSTA**.

---

## 👨‍💻 Developer & Author

- **Lead Developer & Architect**: **GUNJAN KOSTA**
- **Project Repository**: [Gunjan-Kosta/meeting-management](https://github.com/Gunjan-Kosta/meeting-management)
- **Frontend**: React 19 + Vite (Deployed on Vercel)
- **Backend**: Node.js + Express + Prisma ORM (Deployed on Render)
- **Database**: MongoDB Atlas Cloud

---

## 📌 Project Overview & Purpose

Government and administrative departments conduct critical policy, review, and inter-departmental coordination meetings. This application serves as the **centralized governance portal** to:

- Formally archive and track meetings across all districts and state headquarters.
- Upload and secure Minutes of Meetings (MoM), Attendance Sheets, Agenda, and Supporting Documents.
- Break down meeting decisions into trackable **Action Items** assigned to specific departments with strict completion deadlines.
- Track compliance rates, overdue items, and departmental resolution speeds.
- Provide state administrators and district magistrates with executive dashboards and analytical reports.
- Maintain an immutable, tamper-proof **Audit Trail** for every system interaction.

---

## 🌟 Key Features

### 1. 📅 Comprehensive Meeting Lifecycle Management

- **Meeting Categorization**: Supports official government meeting types:
  - `DISTRICT_LEVEL` (District Level Review)
  - `SANSAD` (Parliamentary / Sansad Meetings)
  - `RAJYA_SADAK_SURAKSHA` (State Road Safety Committee)
  - `SAMIKSHA_BAITHAK` (Departmental Review Meetings)
  - `MANTRI_PARISHAD` (Cabinet / Council of Ministers)
- **Lifecycle States**: `DRAFT` $\rightarrow$ `SUBMITTED` $\rightarrow$ `CLOSED`.
- **Mandatory MoM Validation**: Meetings cannot be submitted without an official Minutes of Meeting (MoM) uploaded.
- **State Admin Reopen Feature**: `STATE_ADMIN` can reopen `SUBMITTED` or `CLOSED` meetings back to `DRAFT` for updates.
- **Participant Directory**: Track participants with name, designation, department, and attendance toggle.

### 2. 📁 Document Management & Strict Validation

- **Allowed Formats**: Strictly restricted to `.pdf`, `.xlsx`, `.docx`, `.jpeg`, `.jpg`, and `.png`.
- **File Validation Rules**:
  - Max 10MB per file.
  - Max 10 attachments per meeting.
  - Server-side Multer filtering & client-side extension validation.
- **Live Preview Modal**:
  - Native PDF document viewer with toolbar navigation.
  - Responsive high-resolution image rendering for photo evidence.
  - Direct download and Google Docs/Office Viewer fallback for `.docx` and `.xlsx`.
- **Automatic Storage Cleanup**: Deleting a document removes both the database record and the physical file from server storage.

### 3. 🎯 Action Item & Departmental Compliance Tracker

- **Task Assignment**: Assign tasks to designated state/district departments with target completion dates.
- **Status Lifecycle**: `PENDING` $\rightarrow$ `IN_PROGRESS` $\rightarrow$ `COMPLETED`.
- **Departmental Remarks**: Real-time progress updates and remarks logged per action item.
- **Automated Reminder Cron**: Background cron service sends reminder notifications for pending and upcoming deadlines.

### 4. 📊 Executive Dashboard & Analytics

- **Live KPIs**: Total meetings, submitted/closed counts, pending action items, and departmental compliance rate.
- **Interactive Visualizations (Recharts)**:
  - Monthly Meeting Volume & Trends.
  - Meeting Type Distribution (Pie Chart).
  - Departmental Action Item Workload (Bar Chart).
  - Status Breakdown (Pending vs. In Progress vs. Completed).
- **Executive Reports**: Filter compliance data by date range, district, department, and export to CSV / JSON.

### 5. 🛡️ Tamper-Proof Audit Logging & Activity Trail

- Records all actions: `MEETING_CREATED`, `MEETING_UPDATED`, `MEETING_SUBMITTED`, `MEETING_CLOSED`, `MEETING_REOPENED`, `MEETING_DELETED`, `DOCUMENT_UPLOADED`, `MOM_UPLOADED`, `DOCUMENT_DELETED`, `ACTION_ITEM_CREATED`, `ACTION_ITEM_UPDATED`, `ACTION_ITEM_COMPLETED`.
- Captures User ID, Timestamp, IP Address, and Event Details.
- **Dedicated Activity History Tab** on the Meeting Details page.

### 6. 🔐 Role-Based Access Control (RBAC)

| Feature / Action                      | State Administrator (`STATE_ADMIN`) | District User (`DISTRICT_USER`) | Viewer (`VIEWER`) |
| :------------------------------------ | :---------------------------------: | :-----------------------------: | :---------------: |
| View Meetings & Analytics             |                 ✅                  |               ✅                |        ✅         |
| Create Meetings                       |         ✅ (All Districts)          |     ✅ (Assigned District)      |        ❌         |
| Edit Draft Meetings                   |                 ✅                  |               ✅                |        ❌         |
| Upload / Delete Documents             |                 ✅                  |     ✅ (Draft status only)      |        ❌         |
| Submit Meeting (MoM required)         |                 ✅                  |               ✅                |        ❌         |
| Reopen Meeting (`SUBMITTED`/`CLOSED`) |                 ✅                  |               ❌                |        ❌         |
| Close Meeting                         |                 ✅                  |               ❌                |        ❌         |
| Create / Update Action Items          |                 ✅                  |               ✅                |        ❌         |
| Manage Users & Departments            |                 ✅                  |               ❌                |        ❌         |
| System Audit Logs                     |                 ✅                  |               ❌                |        ❌         |

---

## 🛠️ Technology Stack

### Backend Architecture

- **Runtime**: Node.js (v18+)
- **Framework**: Express.js (MVC Pattern with centralized error handling)
- **Database & ORM**: MongoDB Atlas via **Prisma ORM 6**
- **Authentication**: Stateless JSON Web Tokens (JWT) with salted bcrypt password hashing
- **File Ingestion**: Multer with strict MIME & extension verification
- **Security & Headers**: Helmet, CORS (Cross-Origin Resource Sharing), and rate-limiting
- **Background Tasks**: Node-Cron for scheduled deadline reminders
- **Email Service**: Nodemailer integration

### Frontend Architecture

- **Framework**: React 19 + Vite
- **Routing**: React Router DOM v7 (with protected RBAC route guards)
- **Styling**: Tailwind CSS v3 (Enterprise dark mode palette, glassmorphism, responsive grid)
- **Charts & Graphs**: Recharts
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **HTTP Client**: Axios with automatic JWT interceptors and base URL resolver

---

## 📁 Repository Structure

```
meeting-management/
├── client/                               # Frontend Application (React + Vite)
│   ├── src/
│   │   ├── components/                   # Navbar, Sidebar, Badge, LoadingSkeleton, ConfirmModal
│   │   ├── context/                      # AuthContext (Authentication, RBAC helpers, Dark Mode)
│   │   ├── layouts/                      # DashboardLayout, AuthLayout
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx             # Executive KPI Dashboard & Charts
│   │   │   ├── Meetings.jsx              # Meeting list, search, filters & create modal
│   │   │   ├── MeetingDetail.jsx         # Meeting overview, documents, actions & audit trail
│   │   │   ├── ActionTracker.jsx         # Action items compliance tracker & status updates
│   │   │   ├── Reports.jsx               # Analytical reports & data export
│   │   │   ├── AuditLogs.jsx             # System audit logs explorer
│   │   │   ├── Users.jsx                 # User management (Admin only)
│   │   │   ├── Profile.jsx               # User profile & password reset
│   │   │   └── Login.jsx                 # Secure login page
│   │   ├── services/
│   │   │   └── api.js                    # Axios instance & getFileUrl host resolver
│   │   ├── App.jsx                       # Routing tree & access control guards
│   │   └── main.jsx
│   ├── vercel.json                       # Vercel SPA routing & backend proxy rewrites
│   └── vite.config.js
│
└── server/                               # Backend Application (Node.js + Express + Prisma)
    ├── config/
    │   ├── db.js                         # Prisma client instance
    │   └── mail.js                       # Nodemailer transporter configuration
    ├── controllers/                      # Business logic controllers (Auth, Meeting, Document, Action, etc.)
    ├── middleware/                       # authMiddleware, rbacMiddleware, uploadMiddleware, rateLimiter
    ├── prisma/
    │   ├── schema.prisma                 # MongoDB schema definitions & Prisma models
    │   └── seed.js                       # Database seeder (users, departments, default data)
    ├── routes/                           # REST API routes
    ├── services/                         # auditService, cronService, reportService
    ├── utils/                            # fileValidator, meetingCodeGenerator, responseHandler
    └── app.js                            # Express server entry point & static file hosting
```

---

## 🔑 Default Credentials (Demo / Seed Data)

| Role                    | Email           | Password    | Scope                        |
| :---------------------- | :-------------- | :---------- | :--------------------------- |
| **State Administrator** | `admin@gov.in`  | `Admin@123` | Full Statewide System Access |
| **District User**       | `bhopal@gov.in` | `Admin@123` | Bhopal District Scope        |
| **Public Viewer**       | `viewer@gov.in` | `Admin@123` | Read-Only Access             |

---

## 🚀 Local Installation & Setup

### Prerequisites

- [Node.js](https://nodejs.org/) (v18.0.0 or higher)
- [MongoDB Atlas](https://www.mongodb.com/atlas) account or local MongoDB instance

### 1. Clone the Repository

```bash
git clone https://github.com/Gunjan-Kosta/meeting-management.git
cd meeting-management
```

### 2. Backend Setup

```bash
cd server
npm install

# Configure environment variables in server/.env:
# PORT=5000
# DATABASE_URL=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/meeting_management?retryWrites=true&w=majority
# JWT_SECRET=your_jwt_secret_key
# FRONTEND_URL=http://localhost:3000

# Initialize Prisma Client & Seed Database
npx prisma generate
npx prisma db push
node seed.js

# Start backend server
npm start
```

_Backend runs on: `http://localhost:5000`_

### 3. Frontend Setup

```bash
cd ../client
npm install

# Start Vite dev server
npm run dev
```

_Frontend runs on: `http://localhost:3000` (or `http://localhost:5173`)_

---

## 🌐 Production Cloud Deployment

### 1. Backend on Render

- **Environment**: Node
- **Build Command**: `npm install && npx prisma generate`
- **Start Command**: `npm start`
- **Environment Variables**:
  - `DATABASE_URL`: MongoDB Atlas URI
  - `JWT_SECRET`: Secure 64-character secret
  - `NODE_ENV`: `production`
  - `FRONTEND_URL`: `https://meeting-management-client.vercel.app`

### 2. Frontend on Vercel

- **Framework Preset**: Vite
- **Root Directory**: `client`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Environment Variables**:
  - `VITE_API_BASE_URL`: `https://meeting-management-backend-28xq.onrender.com/api`

---

## 📄 License

This project is licensed under the **MIT License** - see the LICENSE file for details.

---

### Developed by **GUNJAN KOSTA**
