# TaskFlow — Team Task Manager

TaskFlow is a production-ready, full-stack team task management application built with **Next.js 15**, **Prisma**, and **JWT Authentication**. It features role-based access control, real-time analytics, and a premium design system.

![TaskFlow Dashboard](https://images.unsplash.com/photo-1540350394557-8d14678e7f91?auto=format&fit=crop&q=80&w=1200)

## ✨ Features

- **Authentication**: Secure signup/login with JWT and HTTP-only cookies.
- **Dashboard**: High-level stats, task distribution donut chart, and project progress tracking.
- **Kanban Board**: Manage project tasks across TODO, IN_PROGRESS, and DONE columns.
- **RBAC**: Admin and Member roles with granular permissions.
- **Activity Feed**: Real-time logging of project and task updates.
- **Premium UI**: Dark mode support, smooth animations, and responsive layout using Vanilla CSS.

## 🛠️ Tech Stack

- **Frontend**: Next.js (App Router), React 19, Vanilla CSS (Modules).
- **Backend**: Next.js API Routes, JWT (`jose`), Bcrypt.
- **Database**: Prisma ORM with SQLite (Dev) and PostgreSQL (Prod).
- **Icons**: Custom SVG icons.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**:
   ```bash
   git clone <your-repo-url>
   cd team-task-manager
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment Setup**:
   Create a `.env` file in the root:
   ```env
   DATABASE_URL="file:./dev.db"
   JWT_SECRET="your_super_secret_key"
   ```

4. **Initialize Database**:
   ```bash
   npx prisma db push
   npx prisma db seed
   ```

5. **Run Locally**:
   ```bash
   npm run dev
   ```

## 🚢 Deployment

### Deploy to Railway

1. Connect your GitHub repo to Railway.
2. Add a **PostgreSQL** database plugin.
3. Set environment variables:
   - `DATABASE_URL`: (Automatically provided by Railway)
   - `JWT_SECRET`: A long random string.
4. Railway will automatically detect the `railway.json` and build the app.

## 📧 Demo Credentials

- **Admin**: `admin@test.com` / `Admin123@`
- **Member**: `member@test.com` / `Member123@`

---

Built using Antigravity by Praveen Kumar.
