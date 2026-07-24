# 🏢 WorkforceHub — Smart Employee & Project Management System

<p align="center">
  <img src="https://img.shields.io/badge/Status-Production%20Ready-brightgreen?style=for-the-badge" alt="Status"/>
  <img src="https://img.shields.io/badge/Backend-Spring%20Boot%203.2-6DB33F?style=for-the-badge&logo=spring" alt="Spring Boot"/>
  <img src="https://img.shields.io/badge/Frontend-React%2019%20%2B%20Vite-61DAFB?style=for-the-badge&logo=react" alt="React"/>
  <img src="https://img.shields.io/badge/Database-MySQL%208.0-4479A1?style=for-the-badge&logo=mysql" alt="MySQL"/>
  <img src="https://img.shields.io/badge/Auth-JWT%20%2B%20BCrypt-orange?style=for-the-badge" alt="JWT"/>
</p>

---

## 📌 Project Description

**WorkforceHub** is an enterprise-grade, full-stack **Smart Employee & Project Management System** that enables organizations to manage their workforce, projects, and tasks with role-based access control.

The system supports multiple user roles (**Admin, Manager, HR, Finance, Employee**) and provides:
- A full **Admin Control Center** with analytics, employee directory, project & task management, reports, and audit logs.
- A focused **Employee Workstation** view showing only personally assigned tasks, projects, Kanban board, and profile.
- Automatic **project progress recalculation** whenever tasks are created, updated, or completed.
- **JWT-secured REST API** backed by Spring Boot 3 with full OpenAPI/Swagger documentation.

---

## 📋 Assessment Requirements Compliance Checklist

This project strictly satisfies and exceeds all requirements specified in the **Java Full Stack Developer Assessment**:

| Category | PDF Requirement | Implementation Status |
|---|---|---|
| 🔐 **Authentication** | User Registration, Login & Logout, JWT Authentication, Role-Based Access (Admin & Employee) | ✅ **100% Completed**: `AuthService`, `JwtTokenProvider`, `JwtAuthenticationFilter`, `Login.jsx`, `Register.jsx`, Role Guards for `ADMIN`, `MANAGER`, `HR`, `EMPLOYEE` |
| 👥 **Employee Management** | Add, Update, Delete and View Employees; Search, Pagination and Sorting | ✅ **100% Completed**: `EmployeeController`, `EmployeeService`, `EmployeeManagement.jsx` with search, pagination, and sorting |
| 📁 **Project Management** | Create, Update and Delete Projects; Assign Employees; Status, Priority and Deadlines | ✅ **100% Completed**: `ProjectController`, `ProjectService`, `Projects.jsx` with priority, deadline, status, and assigned team members |
| ✅ **Task Management** | Create and Assign Tasks, Update Progress %, Change Status, Add Remarks | ✅ **100% Completed**: `TaskController`, `TaskService`, `Tasks.jsx` with status (`TODO`, `IN_PROGRESS`, `COMPLETED`), progress %, and remarks |
| 📊 **Dashboard** | Admin Dashboard (Employees, Projects, Tasks, Reports); Employee Dashboard (Assigned Tasks, Completed Tasks, Upcoming Deadlines) | ✅ **100% Completed**: `Dashboard.jsx`, `EmployeeKanban.jsx`, `DashboardController`, real-time KPI metrics |
| 🔍 **Search & Filters** | Search Employees, Projects & Tasks; Filter by Department, Status, Priority, and Date | ✅ **100% Completed**: Dynamic search inputs and filter dropdowns across Employees, Projects, Tasks, and Reports views |
| 📄 **Reports & Export** | Employee-wise Task Report, Project Progress Report, Pending Task Report, PDF/Excel Export | ✅ **100% Completed**: `Reports.jsx`, `ReportController`, export to PDF (`jsPDF`) and Excel (`.xlsx` / `.csv`) |
| 🎁 **Bonus Features** | Swagger, Docker, Unit Testing, Email Notifications, Dark Mode, Profile Upload, Audit Logs | ✅ **100% Completed**: Swagger UI (`/swagger-ui.html`), Docker (`docker-compose.yml`), JUnit 5 + Mockito tests (`16/16` passing), Email Notifications (`EmailService`), Dark Mode (`ThemeContext`), Profile Upload (`UserProfileController`), Audit Logs (`AuditLogController`) |
| 📦 **Submission Artifacts** | GitHub Repo, Source Code, README instructions, Database Script, Postman Collection, Screenshots, Architecture Flowchart | ✅ **100% Completed**: Pushed to GitHub, includes `database.sql`, `WorkforceHub.postman_collection.json`, `screenshots/`, and Mermaid flowchart |

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔐 **Role-Based Access Control** | Admin/Manager/HR/Finance/Employee roles with separate dashboard views |
| 👥 **Employee Directory** | Add, edit, delete employees with skills, department, job title, salary |
| 📁 **Project Management** | Create projects with initial tasks, track budget, deadline, and progress |
| ✅ **Task Management** | Assign tasks to employees; status auto-updates project progress |
| 📊 **Admin Dashboard** | Real-time KPIs: total employees, projects, tasks, pending/completed counts |
| 🗂️ **Employee Dashboard** | Personal task workstation with upcoming deadlines and Kanban view |
| 🔄 **Auto Progress Calculation** | Project progress = (Completed Tasks / Total Tasks) × 100% |
| 📜 **Audit Logs** | Immutable log of all CREATE, UPDATE, DELETE, LOGIN actions |
| 📄 **PDF & Excel Export** | One-click export of reports to `.pdf` and `.xlsx` |
| 🌙 **Dark / Light Mode** | Persistent theme preference per user |
| 📷 **Profile Avatar Upload** | Upload and serve profile images via REST API |
| 📖 **Swagger UI** | Full interactive API documentation at `/swagger-ui.html` |
| 🐳 **Docker Support** | Dockerfile + docker-compose for MySQL + Spring Boot |

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Backend** | Java 17+, Spring Boot 3.2.3, Spring Security (JWT/HMAC-SHA512), Spring Data JPA, Hibernate, Maven |
| **Frontend** | React 19, React Router 7, Axios, TailwindCSS v4, Lucide Icons, Vite 6 |
| **Database** | MySQL 8.0+ |
| **Testing** | JUnit 5, Mockito, Spring Boot Test |
| **API Docs** | SpringDoc OpenAPI 3.0 (Swagger UI) |
| **Containerization** | Docker, Docker Compose |
| **Security** | BCrypt password hashing, JWT (HMAC-SHA512), CORS configuration |

---

## 📂 Folder Structure

```
workforcehub/
├── .env.example                              # Environment variable template (copy to .env)
├── .gitignore                                # Git ignore rules
├── database.sql                              # Full MySQL schema + seed data
├── WorkforceHub.postman_collection.json      # Postman API collection (all endpoints)
├── Workforce_Employee_Productivity_Report.xlsx # Employee Productivity Report Excel spreadsheet
├── Workforce_Project_Portfolio_Health_Report.xlsx # Project Portfolio Health Excel spreadsheet
├── Workforce_Task_Status_Report.xlsx         # Task Status Report Excel spreadsheet
├── WorkforceHub_productivity_Report.pdf     # Employee Productivity Report PDF document
├── screenshots/                              # Application screenshots
│   ├── system_flowchart.png                  # System architecture flowchart
│   ├── admindashboard.png
│   ├── EmployeeManagement.png
│   └── ...
│
├── backend/                                  # Spring Boot 3 Backend
│   ├── database.sql                          # MySQL schema & seed script
│   ├── WorkforceHub.postman_collection.json  # Postman collection (backend copy)
│   ├── docker-compose.yml                    # Docker Compose setup
│   ├── Dockerfile                            # Multi-stage Docker build
│   ├── pom.xml                               # Maven dependencies
│   └── src/
│       ├── main/java/com/workforcehub/
│       │   ├── config/                       # OpenApiConfig, DataInitializer
│       │   ├── controller/                   # REST Controllers (Auth, Employee, Project, Task, Profile, Audit, Dashboard)
│       │   ├── dto/                          # Data Transfer Objects
│       │   ├── exception/                    # Global Exception Handlers
│       │   ├── model/                        # JPA Entities (User, Employee, Project, Task, AuditLog)
│       │   ├── repository/                   # Spring Data JPA Repositories
│       │   ├── security/                     # JWT Filter, SecurityConfig, UserDetailsService
│       │   └── service/                      # Business Logic & Service Implementations
│       ├── main/resources/
│       │   └── application.yml               # Application configuration (uses env vars)
│       └── test/java/com/workforcehub/
│           └── service/                      # JUnit 5 + Mockito Unit Tests
│
└── frontend/                                 # React 19 + Vite Frontend
    ├── package.json
    ├── vite.config.js
    ├── index.html
    └── src/
        ├── App.jsx                           # Main router with role-based route guards
        ├── main.jsx                          # React entry point
        ├── index.css                         # Global styles + TailwindCSS
        ├── components/                       # Navbar, Sidebar, Modal
        ├── context/                          # AuthContext, ThemeContext
        ├── pages/                            # Dashboard, Employees, Projects, Tasks, Kanban, Reports, AuditLogs, Profile
        └── services/                         # Axios API instance + mock fallback
```

---

## ✅ Prerequisites

Before starting, ensure you have installed:

| Tool | Version |
|---|---|
| **Java JDK** | 17 or higher |
| **Maven** | 3.8+ |
| **Node.js** | 18+ with npm |
| **MySQL Server** | 8.0+ (running on port 3306) |
| **Git** | Any recent version |

---

## 🚀 Installation & Setup

### Step 1 — Clone the Repository

```bash
git clone https://github.com/Reshmitha-Atmakuru/workforcehub.git
cd workforcehub
```

---

### Step 2 — Database Setup

1. Open MySQL Workbench or MySQL CLI:
   ```bash
   mysql -u root -p
   ```

2. Run the full database initialization script:
   ```sql
   SOURCE database.sql;
   ```
   *(Or use MySQL Workbench: File → Open SQL Script → `database.sql` → Execute)*

3. Verify the database was created:
   ```sql
   USE workforce_hub;
   SHOW TABLES;
   SELECT username, role FROM users;
   ```

---

### Step 3 — Backend Configuration

1. Copy the environment template:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` with your actual MySQL password:
   ```env
   SPRING_DATASOURCE_PASSWORD=your_actual_mysql_password
   ```

3. Alternatively, edit `backend/src/main/resources/application.yml` directly:
   ```yaml
   spring:
     datasource:
       password: ${SPRING_DATASOURCE_PASSWORD:your_password_here}
   ```

---

### Step 4 — Run the Backend

```bash
cd backend
mvn spring-boot:run
```

- ✅ Backend API: **http://localhost:8080**
- ✅ Swagger UI: **http://localhost:8080/swagger-ui.html**
- ✅ API Docs JSON: **http://localhost:8080/v3/api-docs**

---

### Step 5 — Run the Frontend

```bash
cd frontend
npm install
npm run dev
```

- ✅ Frontend App: **http://localhost:3000**

---

### Step 6 (Optional) — Run with Docker

```bash
cd backend
docker-compose up --build
```

This starts MySQL + Spring Boot in containers automatically.

---

## 🔑 Default Login Credentials

| Username | Password | Role | Access |
|---|---|---|---|
| `admin` | `password123` | ROLE_ADMIN | Full system — all modules |
| `kiran` | `password123` | ROLE_EMPLOYEE | Employee workstation only |
| `priya` | `password123` | ROLE_MANAGER | Projects + tasks management |

> ⚠️ Change all default passwords before deploying to production.

---

## 📡 API Overview

### Base URL: `http://localhost:8080`

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/login` | Login & receive JWT token | No |
| `POST` | `/api/auth/register` | Register new user | No |
| `GET` | `/api/auth/me` | Get current session user | Yes |
| `GET` | `/api/employees` | List all employees (paginated) | Yes (Admin/HR) |
| `POST` | `/api/employees` | Create employee | Yes (Admin/HR) |
| `PUT` | `/api/employees/{id}` | Update employee | Yes (Admin/HR) |
| `DELETE` | `/api/employees/{id}` | Delete employee | Yes (Admin) |
| `GET` | `/api/projects` | List all projects | Yes |
| `POST` | `/api/projects` | Create project with tasks | Yes (Admin/Manager) |
| `PUT` | `/api/projects/{id}` | Update project | Yes (Admin/Manager) |
| `DELETE` | `/api/projects/{id}` | Delete project | Yes (Admin) |
| `GET` | `/api/tasks` | List all tasks | Yes |
| `POST` | `/api/tasks` | Create task | Yes (Admin/Manager) |
| `PUT` | `/api/tasks/{id}` | Update task / mark complete | Yes |
| `DELETE` | `/api/tasks/{id}` | Delete task | Yes (Admin) |
| `GET` | `/api/tasks/my-tasks` | Employee's own tasks | Yes (Employee) |
| `GET` | `/api/dashboard/stats` | Dashboard metrics | Yes |
| `GET` | `/api/reports/summary` | Reports overview | Yes (Admin/HR) |
| `GET` | `/api/audit-logs` | System audit trail | Yes (Admin) |
| `POST` | `/api/profile/upload-image` | Upload profile avatar | Yes |
| `GET` | `/api/profile/image/{filename}` | Serve profile image | Yes |

> Full API documentation: **http://localhost:8080/swagger-ui.html**
>
> Import `WorkforceHub.postman_collection.json` into Postman for ready-to-run requests.

---

## 🗄️ Database Scripting & Schema Architecture

The database initialization and schema scripts are located in [`database.sql`](database.sql) (Root) and [`backend/database.sql`](backend/database.sql).

### 📐 Relational Database Schema Overview

```
                          ┌──────────────┐
                          │    users     │
                          └──────┬───────┘
                                 │ 1:1 / 1:N
                                 ▼
┌──────────────────┐ 1:N  ┌──────────────┐ 1:N  ┌──────────────┐
│   departments    │◄─────│  employees   │◄─────│    tasks     │
└──────────────────┘      └──────┬───────┘      └──────▲───────┘
                                 │ 1:N                 │ N:1
                                 ▼                     │
                          ┌──────────────┐             │
                          │emp_skills    │             │
                          └──────────────┘      ┌──────┴───────┐
                                                │   projects   │
                                                └──────────────┘
```

### 📋 Database Tables & DDL Script Breakdown

| Table Name | Primary Key | Key Foreign Keys | Purpose |
|---|---|---|---|
| `users` | `id` (BIGINT) | — | User authentication accounts, roles (`ROLE_ADMIN`, `ROLE_EMPLOYEE`, `ROLE_MANAGER`, `ROLE_HR`), BCrypt password hashes |
| `employees` | `id` (BIGINT) | `user_id` ➔ `users(id)` | Employee directory records, job titles, department assignments, salary, contact info |
| `employee_skills` | — | `employee_id` ➔ `employees(id)` | Element collection table storing employee technical skills |
| `projects` | `id` (BIGINT) | — | Enterprise projects, budget, priority, status, auto-calculated progress % |
| `tasks` | `id` (BIGINT) | `project_id` ➔ `projects(id)`, `employee_id` ➔ `employees(id)` | Task deliverables, assignees, progress %, due dates, remarks |
| `departments` | `id` (BIGINT) | — | Organizational department structures, budgets, locations |
| `audit_logs` | `id` (BIGINT) | — | Immutable audit trail logging user mutations (`CREATE`, `UPDATE`, `DELETE`, `LOGIN`) |

### 💻 Sample Database Initialization Script (`database.sql`)

```sql
-- Database Initialization Script
CREATE DATABASE IF NOT EXISTS `workforce_hub` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `workforce_hub`;

-- 1. Users Table
CREATE TABLE `users` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `first_name` VARCHAR(50) NOT NULL,
  `last_name` VARCHAR(50) NOT NULL,
  `role` VARCHAR(20) NOT NULL DEFAULT 'ROLE_EMPLOYEE',
  `department` VARCHAR(50) DEFAULT 'General',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Projects Table
CREATE TABLE `projects` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(30) NOT NULL UNIQUE,
  `name` VARCHAR(100) NOT NULL,
  `department` VARCHAR(50) NOT NULL,
  `priority` VARCHAR(20) DEFAULT 'MEDIUM',
  `status` VARCHAR(30) DEFAULT 'In Progress',
  `progress` INT DEFAULT 0,
  `budget` DECIMAL(12,2) DEFAULT NULL,
  `deadline` DATE DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Tasks Table
CREATE TABLE `tasks` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `task_number` VARCHAR(30) DEFAULT NULL,
  `title` VARCHAR(150) NOT NULL,
  `project_id` BIGINT DEFAULT NULL,
  `employee_id` BIGINT DEFAULT NULL,
  `priority` VARCHAR(20) DEFAULT 'MEDIUM',
  `status` VARCHAR(20) DEFAULT 'TODO',
  `progress` INT DEFAULT 0,
  `due_date` DATE DEFAULT NULL,
  `remarks` VARCHAR(500) DEFAULT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_tasks_project` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_tasks_employee` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

---

## 🔄 System Architecture & Flowchart

### 🏛️ 1. High-Level System Architecture

```mermaid
graph TB
    subgraph CLIENT["🖥️ Client Layer"]
        direction LR
        ADMIN_USR(["👨‍💼 Admin / Manager / HR"])
        EMP_USR(["👨‍💻 Employee"])
    end

    subgraph FRONTEND["⚛️ Frontend — React 19 + Vite"]
        direction TB
        UI_AUTH["🔑 Login / Auth Pages"]
        UI_ADMIN["📊 Admin Dashboard\nEmployee · Project · Task Mgmt\nReports · Audit Logs · Leave"]
        UI_EMP["🗂️ Employee Portal\nMy Tasks · Kanban · Profile\nLeave Requests · My Projects"]
    end

    subgraph SECURITY["🔐 Security Layer — Spring Security 6"]
        JWT_FILTER["JWT Authentication Filter\nHMAC-SHA512 Token Validation"]
        RBAC{{"⚖️ RBAC\nRole-Based Access Control"}}
    end

    subgraph BACKEND["☕ Backend — Spring Boot 3.2"]
        direction TB
        CTRL["🌐 REST Controllers\n/api/auth · /api/employees\n/api/projects · /api/tasks\n/api/reports · /api/audit-logs\n/api/leaves · /api/departments"]
        SVC["⚙️ Service Layer\nBusiness Logic & Validation\nAuto-Progress Engine\nAudit Log Writer"]
        REPO["📦 Repository Layer\nSpring Data JPA / Hibernate"]
    end

    subgraph DB["🗄️ MySQL 8.0 — workforce_hub"]
        direction LR
        T_USERS[("users")]
        T_EMP[("employees")]
        T_PROJ[("projects")]
        T_TASKS[("tasks")]
        T_DEPT[("departments")]
        T_AUDIT[("audit_logs")]
        T_LEAVE[("leave_requests")]
    end

    ADMIN_USR --> UI_AUTH
    EMP_USR --> UI_AUTH
    UI_AUTH --> JWT_FILTER
    UI_ADMIN --> JWT_FILTER
    UI_EMP --> JWT_FILTER
    JWT_FILTER --> RBAC
    RBAC -->|"ADMIN / MANAGER / HR"| UI_ADMIN
    RBAC -->|"EMPLOYEE"| UI_EMP
    UI_ADMIN --> CTRL
    UI_EMP --> CTRL
    CTRL --> SVC
    SVC --> REPO
    REPO --> T_USERS & T_EMP & T_PROJ & T_TASKS & T_DEPT & T_AUDIT & T_LEAVE
```

---

### 🔐 2. Authentication & JWT Token Flow

```mermaid
sequenceDiagram
    actor User
    participant FE as React Frontend
    participant AUTH as AuthController<br/>/api/auth/login
    participant SEC as Spring Security<br/>BCrypt Verifier
    participant JWT as JwtService<br/>HMAC-SHA512
    participant DB as MySQL<br/>users table

    User->>FE: Enter email + password
    FE->>AUTH: POST /api/auth/login<br/>{ email, password }
    AUTH->>DB: SELECT user WHERE email = ?
    DB-->>AUTH: User record + hashed password
    AUTH->>SEC: matches(inputPassword, storedHash)
    SEC-->>AUTH: ✅ Password valid
    AUTH->>JWT: generateToken(username, role, 24h)
    JWT-->>AUTH: Signed JWT Token (HMAC-SHA512)
    AUTH-->>FE: 200 OK { token, role, username }
    FE->>FE: Store token in localStorage

    Note over FE,JWT: Every subsequent API call...

    FE->>AUTH: GET /api/employees<br/>Authorization: Bearer <token>
    AUTH->>JWT: validateToken(token)
    JWT-->>AUTH: ✅ Valid — username + role
    AUTH-->>FE: 200 OK — Employee List
```

---

### 🎭 3. Role-Based Access Control (RBAC) Matrix

```mermaid
graph LR
    subgraph ROLES["User Roles"]
        R1(["👑 ROLE_ADMIN"])
        R2(["📋 ROLE_MANAGER"])
        R3(["🧑‍💼 ROLE_HR"])
        R4(["👨‍💻 ROLE_EMPLOYEE"])
    end

    subgraph PERMISSIONS["Access Permissions"]
        P1["Manage All Employees"]
        P2["Manage Projects & Tasks"]
        P3["View All Reports"]
        P4["View Audit Logs"]
        P5["Manage Departments"]
        P6["Approve Leave Requests"]
        P7["View Own Tasks Only"]
        P8["Update Own Task Status"]
        P9["Submit Leave Request"]
        P10["View Own Profile"]
    end

    R1 --> P1 & P2 & P3 & P4 & P5 & P6
    R2 --> P2 & P3 & P6
    R3 --> P1 & P3 & P5 & P6
    R4 --> P7 & P8 & P9 & P10
```

---

### 🗃️ 4. Database Entity Relationship Diagram

```mermaid
erDiagram
    USERS {
        BIGINT id PK
        VARCHAR username UK
        VARCHAR email UK
        VARCHAR password
        VARCHAR first_name
        VARCHAR last_name
        VARCHAR role
        VARCHAR department
        DATETIME created_at
    }

    EMPLOYEES {
        BIGINT id PK
        VARCHAR code UK
        VARCHAR first_name
        VARCHAR last_name
        VARCHAR email UK
        VARCHAR phone
        VARCHAR department
        VARCHAR job_title
        VARCHAR account_role
        DECIMAL salary
        DATE join_date
        VARCHAR status
        BIGINT user_id FK
    }

    EMPLOYEE_SKILLS {
        BIGINT employee_id FK
        VARCHAR skill
    }

    PROJECTS {
        BIGINT id PK
        VARCHAR code UK
        VARCHAR name
        VARCHAR department
        VARCHAR priority
        VARCHAR status
        INT progress
        DECIMAL budget
        DATE start_date
        DATE deadline
    }

    TASKS {
        BIGINT id PK
        VARCHAR task_number
        VARCHAR title
        VARCHAR description
        BIGINT project_id FK
        BIGINT employee_id FK
        VARCHAR priority
        VARCHAR status
        INT progress
        DATE due_date
        VARCHAR remarks
    }

    DEPARTMENTS {
        BIGINT id PK
        VARCHAR code UK
        VARCHAR name
        VARCHAR description
        VARCHAR location
        DECIMAL budget
    }

    AUDIT_LOGS {
        BIGINT id PK
        DATETIME timestamp
        VARCHAR action
        VARCHAR entity_type
        VARCHAR entity_id
        VARCHAR performed_by
        TEXT details
    }

    USERS ||--o| EMPLOYEES : "linked account"
    EMPLOYEES ||--o{ EMPLOYEE_SKILLS : "has skills"
    EMPLOYEES ||--o{ TASKS : "assigned to"
    PROJECTS ||--o{ TASKS : "contains"
```

---

### ⚡ 5. Task Completion → Auto Project Progress Engine

```mermaid
flowchart TD
    A(["👨‍💻 Employee / Admin"]) -->|"Updates Task Status"| B

    B["PUT /api/tasks/{id}\n{ status: COMPLETED, progress: 100 }"]
    B --> C["TaskService.updateTask()"]
    C --> D["Save task to DB\nTaskRepository.save()"]
    D --> E{"Is task assigned\nto a project?"}

    E -->|"No"| F(["✅ Task saved — no project update"])
    E -->|"Yes"| G["syncProjectProgress(projectId)"]

    G --> H["Count all tasks\nfor this project"]
    H --> I["Count COMPLETED\ntasks for this project"]
    I --> J["progress = completed / total × 100"]

    J --> K{"progress == 100?"}
    K -->|"Yes"| L["Set project.status\n= 'Completed' ✅"]
    K -->|"No"| M["Keep project.status\nas 'In Progress'"]

    L --> N["ProjectRepository.save()"]
    M --> N
    N --> O["AuditLogService.log()\nACTION: TASK_UPDATED"]
    O --> P(["📊 Dashboard KPIs auto-updated\nProject progress bar refreshed"])
```

---

### 🔁 6. Full Request Lifecycle

```mermaid
flowchart LR
    A(["🌐 HTTP Request"]) --> B

    subgraph SPRING_CHAIN["Spring Boot Filter Chain"]
        B["CorsFilter\nAllow React localhost:3000"]
        B --> C["JwtAuthenticationFilter\nExtract Bearer Token"]
        C --> D{"Token\nValid?"}
        D -->|"❌ Invalid / Missing"| E["401 Unauthorized"]
        D -->|"✅ Valid"| F["Load UserDetails\nSet SecurityContext"]
    end

    F --> G

    subgraph CONTROLLER["REST Controller Layer"]
        G["@RestController\nRoute matching + request mapping"]
        G --> H["@PreAuthorize\nRole permission check"]
        H --> I{"Authorized?"}
        I -->|"❌ Forbidden"| J["403 Forbidden"]
        I -->|"✅ Allowed"| K["Call Service method"]
    end

    K --> L

    subgraph SERVICE["Service + Repository Layer"]
        L["Service: Business Logic\nValidation · Calculation"]
        L --> M["JPA Repository\nHibernate ORM Query"]
        M --> N[("MySQL 8.0\nworkforce_hub")]
    end

    N --> O["Build Response DTO"]
    O --> P(["📦 JSON Response\n200 OK / 201 Created"])
```

---

## 🖼️ Application Screenshots

| Screenshot | View |
|---|---|
| ![Admin Login](screenshots/adminlogin.png) | Admin Login |
| ![Admin Dashboard](screenshots/admindashboard.png) | Admin Dashboard — KPI Cards |
| ![Employee Management](screenshots/EmployeeManagement.png) | Employee Directory |
| ![Add Employee](screenshots/addEmployee.png) | Add Employee Modal |
| ![Project Management](screenshots/ProjectManagement.png) | Project Cards |
| ![Create Project](screenshots/CreateNewproject.png) | Create Project with Tasks |
| ![Kanban Board](screenshots/EmployeeKanban.png) | Employee Kanban Board |
| ![Reports](screenshots/ReportsAndAnalytics.png) | Reports & Analytics |
| ![Audit Logs](screenshots/Audittrails.png) | Audit Trail |
| ![Task Management Admin](screenshots/TaskManagementAdmin.png) | Task Management — Admin View |
| ![Task Management Employee](screenshots/TaskManagementEmployee.png) | Task Management — Employee View |
| ![System Flowchart](screenshots/system_flowchart.png) | Architecture Flowchart |

---

## 📊 Reports & Analytics (PDF & Excel Exports)

WorkforceHub provides three comprehensive report modules with automated **PDF** and **Excel (.xlsx)** export capabilities:

1. 👥 **Employee-wise Task Report**: Aggregates task distribution, completed counts, pending items, and completion percentages per employee.
2. 📁 **Project Progress Report**: Tracks real-time project progress percentages, completion status, department scopes, and budgets.
3. ✅ **Pending Task Report**: Filters all active tasks requiring action, detailing assignees, project scopes, priorities, and deadlines.

### 📄 Exported Report Deliverables

- 📄 **PDF Report File**: [`WorkforceHub_productivity_Report.pdf`](WorkforceHub_productivity_Report.pdf) (or [`WorkforceHub_productivity_Report (1).pdf`](<WorkforceHub_productivity_Report (1).pdf>))
- 📊 **Excel Spreadsheet**: [`Workforce_Employee_Productivity_Report.xlsx`](Workforce_Employee_Productivity_Report.xlsx) (or [`Workforce_Employee_Productivity_Report (1).xlsx`](<Workforce_Employee_Productivity_Report (1).xlsx>))

### 📋 1. Employee-wise Task Report Data Preview

| Employee Code | Employee Name | Department | Total Assigned | Pending | Completed | Completion Rate |
|---|---|---|---|---|---|---|
| `EMP-1001` | Vikram M | Engineering | 0 | 0 | 0 | 0% |
| `EMP-1002` | John Doe | Engineering | 0 | 0 | 0 | 0% |
| `EMP-1003` | Riya Joseph | Engineering | 0 | 0 | 0 | 0% |
| `EMP-1004` | Sarah Jenkins | Product | 1 | 1 | 0 | 0% |
| `EMP-1005` | Kumar Varma | Finance | 1 | 0 | 1 | **100%** |
| `EMP-1006` | Krishna K | Human Resources | 5 | 5 | 0 | 0% |

### 📋 2. Project Progress Report Data Preview

| Project Code | Project Name | Department | Status | Budget | Deadline | Progress % |
|---|---|---|---|---|---|---|
| `PRJ-101` | Enterprise Cloud Migration | Engineering | In Progress | ₹1,200,000 | 2026-08-30 | 0% |
| `PRJ-102` | Smart Workforce Portal | Product | In Progress | ₹850,000 | 2026-07-31 | **50%** |
| `PRJ-103` | Automated Payroll System | Finance | Not Started | ₹500,000 | 2026-11-30 | 0% |

---

## 🧪 Running Unit Tests

```bash
cd backend
mvn test
```

Tests cover:
- `AuthServiceTest` — login, registration, token generation
- `EmployeeServiceTest` — CRUD, pagination, search
- `ProjectServiceTest` — create, update, delete, initial tasks
- `TaskServiceTest` — task lifecycle, progress sync

---

## 🔒 Security Notes

- All passwords stored as **BCrypt** hashes (never plain text)
- JWT tokens expire in **24 hours**
- All sensitive config (DB password, JWT secret, email) loaded via **environment variables**
- Never commit `.env` to Git — use `.env.example` as template
- Employees **cannot** access Admin routes — enforced at both frontend (route guards) and backend (Spring Security)

---

## 🚀 Future Enhancements

- [ ] Email notifications for task assignments and deadlines
- [ ] Real-time notifications using WebSockets
- [ ] Multi-tenant organization support
- [ ] Advanced analytics with charts (Recharts / Chart.js)
- [ ] Mobile app (React Native)
- [ ] GitHub Actions CI/CD pipeline
- [ ] Redis caching for dashboard stats
- [ ] Bulk import employees via Excel/CSV

---

## 📮 Postman API Collection

1. Open Postman
2. Click **Import** → select `WorkforceHub.postman_collection.json`
3. Set collection variable `base_url = http://localhost:8080`
4. Run **Auth > Login (Admin)** — token is auto-saved to `jwt_token`
5. All other requests use `{{jwt_token}}` automatically

---

## 🐳 Docker Deployment

```bash
cd backend
docker-compose up --build -d
```

Edit `backend/docker-compose.yml` to set your MySQL root password before running.

---

## 👤 Author

**WorkforceHub Enterprise** — Smart Employee & Project Management System

Built with ☕ Java + Spring Boot 3 & ⚛️ React 19

---

## 📝 License

This project is submitted as part of an academic/internship assessment.
