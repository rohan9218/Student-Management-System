# Advanced Student Management System (EduManage)

EduManage is a modern, full-stack web application designed for educational institutions to manage students, course syllabi, daily attendance sheets, subject examination scores, log auditing, and analytical reports. 

Built with a responsive dashboard, the app leverages **Spring Boot (Java)** for backend business logic, **React.js** for an interactive administrative user experience, and **MySQL** for relational persistence.

---

## 🚀 Key Features

1. **Analytical Dashboard:** Displays aggregates (Total Students, Total Courses, Attendance Rates, System-wide Avg Score), recent log feeds, quick actions, and top performer metrics.
2. **Dynamic Student Directory:** Complete CRUD operations with search, course/semester filters, details modals, and local profile photo uploads.
3. **Course Allocation Roster:** Register courses, define timelines, and assign/unassign students directly from the course roster panel.
4. **Interactive Attendance Sheet:** Roster-based daily present/absent checking. Absence logs trigger automated notifications to the student.
5. **Score Card Registry:** Track individual grades by subject, with auto-calculated percentages, grades (A+, A, B, C, Fail), pass status, and auto email releases on update.
6. **Data Export Hub:** Filter datasets and download structured reports in **PDF**, **Excel (XLSX)**, and **CSV** formats.
7. **System Maintenance & Security:** Supports JWT authentication, BCrypt encryption, role-based controls (ADMIN/STAFF), and single-click **Database Backup & Restore** (ADMIN only).
8. **Dark Mode Theme:** Smooth HSL-based light and dark theme transitions.

---

## 🛠️ Tech Stack & System Requirements

### Frontend
- **React.js (Vite)**
- **Tailwind CSS v4** (for premium glassmorphism, transitions, and layout structure)
- **Axios** (pre-configured with JWT request interceptors)
- **React Router DOM** (protected routing shells)
- **Lucide React** (icons library)

### Backend
- **Spring Boot 3.4.x** (Java 17+)
- **Spring Security** & **JSON Web Tokens (JWT)** (jjwt-api)
- **Spring Data JPA** & **Hibernate**
- **MySQL Connector**
- **Lombok**
- **OpenPDF** (for PDF export generation)
- **Apache POI** (for Excel sheet compilation)
- **Spring Mail** (for automated result/absence alerts)

### Database
- **MySQL 8.0+**

---

## 📂 Project Structure

```text
d:\Student Management System\
  ├── database\
  │   └── schema.sql                 # MySQL Schema structure & Initial Seeding
  │
  ├── backend\
  │   ├── pom.xml                    # Maven Dependency Manifest
  │   ├── src\main\
  │   │   ├── java\com\example\sms\  # Java source files
  │   │   │   ├── StudentManagementApplication.java
  │   │   │   ├── config\            # Security & Web configuration files
  │   │   │   ├── controller\        # Rest Controllers (Auth, Student, Reports, System...)
  │   │   │   ├── dto\               # Data Transfer Objects (Login, Marks, Attendance...)
  │   │   │   ├── entity\            # JPA Entities (User, Student, Course, Marks...)
  │   │   │   ├── exception\         # Global Exception Handler
  │   │   │   ├── repository\        # JPA Repository Interfaces
  │   │   │   ├── security\          # JWT Filter, Token Provider, UserDetailsService
  │   │   │   └── service\           # Business Logic Layer (Dashboard, Backups, Email...)
  │   │   └── resources\
  │   │       └── application.properties # Server ports, Datasource, JWT & Upload config
  │
  └── frontend\
      ├── package.json               # Frontend Node Manifest
      ├── tailwind.config.js         # Tailwind styling configs
      ├── postcss.config.js          # PostCSS compilation rules
      ├── index.html                 # Main entry template with SEO Meta
      └── src\
          ├── main.jsx               
          ├── App.jsx                # Router config and Shell layouts
          ├── index.css              # Custom styling directives & glassmorphic helpers
          ├── components\            # Reusable UI elements (Sidebar, Navbar, Toasts...)
          ├── context\               # React context states (AuthContext, ThemeContext)
          ├── pages\                 # View pages (Dashboard, Students, Marks, Reports...)
          └── services\
              └── api.js             # Axios client with JWT interceptor
```

---

## 🔧 Installation & Getting Started

### Step 1: Database Setup
1. Ensure your local MySQL instance is running.
2. Log into MySQL client and execute:
   ```sql
   CREATE DATABASE student_management_db;
   ```
3. Source the database schema and seed data:
   ```bash
   mysql -u root -p student_management_db < "d:\Student Management System\database\schema.sql"
   ```
   *Note: This creates the tables and sets up two default users:*
   - **Administrator:** Username: `admin`, Password: `admin123` (Role: `ADMIN`)
   - **Staff / Teacher:** Username: `staff`, Password: `staff123` (Role: `STAFF`)

### Step 2: Backend Configuration
1. Open [backend/src/main/resources/application.properties](file:///d:/Student%20Management%20System/backend/src/main/resources/application.properties).
2. Configure your MySQL credentials if they differ from the default:
   ```properties
   spring.datasource.username=your_mysql_user
   spring.datasource.password=your_mysql_password
   ```

### Step 3: Run the Backend
1. Navigate to the `backend/` directory in your terminal.
2. Run the Spring Boot application:
   ```bash
   mvn spring-boot:run
   ```
   *The server starts on port 8081.*

### Step 4: Run the Frontend
1. Navigate to the `frontend/` directory in your terminal.
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *Open your browser and navigate to `http://localhost:5173`.*

---

## 📖 REST API Documentation

All APIs except authentication are protected. You must attach the header `Authorization: Bearer <your_jwt_token>` to all request headers.

### Authentication Module
- **POST** `/api/auth/login`
  - *Payload:* `{"username": "admin", "password": "admin123"}`
  - *Response:* `{"token": "<JWT_STRING>", "username": "admin", "email": "admin@sms.com", "role": "ADMIN"}`
- **GET** `/api/auth/me`
  - *Response:* Returns currently logged-in user profile details.

### Student Module
- **GET** `/api/students`
  - *Params:* `search` (Optional: Search by Name, Email, ID), `courseId` (Optional), `semester` (Optional).
- **POST** `/api/students`
  - *Payload:* `{"firstName": "John", "lastName": "Doe", "email": "john@example.com", "phone": "1234567890", "gender": "Male", "dob": "2001-05-15", "courseId": 1, "semester": 2, "admissionDate": "2025-08-01", "address": "London"}`
- **PUT** `/api/students/{id}`
  - *Payload:* Updates the demographic information.
- **DELETE** `/api/students/{id}` *(ADMIN only)*
- **POST** `/api/students/upload` *(FormData)*
  - *Payload:* Form-Data attachment named `file` containing an image.
  - *Response:* `{"photoUrl": "/uploads/<unique_filename>.jpg"}`

### Course Module
- **GET** `/api/courses`
- **POST** `/api/courses`
  - *Payload:* `{"courseName": "M.Tech CSE", "courseCode": "MTech-CSE", "duration": "2 Years", "description": "Advanced systems development."}`
- **PUT** `/api/courses/{id}`
- **DELETE** `/api/courses/{id}` *(ADMIN only)*

### Attendance Module
- **POST** `/api/attendance`
  - *Payload:* `{"date": "2026-06-03", "records": [{"studentId": 1, "status": "PRESENT"}, {"studentId": 2, "status": "ABSENT"}]}`
- **GET** `/api/attendance/daily?date=2026-06-03`
- **GET** `/api/attendance/student/{studentId}/percentage`
  - *Response:* `{"percentage": 88.5}`

### Marks Module
- **POST** `/api/marks`
  - *Payload:* `{"studentId": 1, "subject": "Java Programming", "marksObtained": 85.0, "totalMarks": 100.0}`
  - *Response:* Returns marks record with auto-calculated grade metrics (`percentage: 85.0`, `grade: "A"`, `resultStatus: "Pass"`).
- **DELETE** `/api/marks/{id}`

### Dashboard Analytics
- **GET** `/api/dashboard`
  - *Response:* Returns total stats count, recent activity logs, and top 5 performers.

### Exports & Reporting
- **GET** `/api/reports/students/pdf` (or `/excel` or `/csv`)
- **GET** `/api/reports/marks/pdf` (or `/excel` or `/csv`)
- **GET** `/api/reports/attendance/pdf` (or `/excel` or `/csv`)

### System Admin Operations *(ADMIN only)*
- **GET** `/api/system/backup`
  - *Response:* Downloads an SQL database script dump.
- **POST** `/api/system/restore` *(FormData)*
  - *Payload:* Form-Data `file` containing the SQL backup script to restore.
"# Student-Management-System" 
