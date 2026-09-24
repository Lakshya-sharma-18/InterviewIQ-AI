# InterviewIQ AI — Smart Mock Interview & ATS Analysis Platform

InterviewIQ AI is an AI-powered mock interview and ATS resume evaluation platform built with **Spring Boot 3 (Java 17/22)** backend and **Vite + TailwindCSS** frontend.

---

## 🚀 Live Local Endpoints

- **Frontend Application**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:8080](http://localhost:8080)
- **Health Check**: [http://localhost:8080/api/health](http://localhost:8080/api/health)
- **H2 Database Console**: [http://localhost:8080/h2-console](http://localhost:8080/h2-console) (JDBC URL: `jdbc:h2:mem:interviewiq`, User: `root`, Pass: `root`)

---

## 🔐 Default Admin Credentials

- **Email**: `admin@interviewiq.ai`
- **Password**: `admin123`
- **Role**: `ADMIN`
- **Admin Panel**: [http://localhost:5173/admin.html](http://localhost:5173/admin.html)

---

## 🛠️ How to Run Locally

### 1. Run Backend (Spring Boot)
```bash
cd backend
./gradlew bootRun     # On Linux/macOS
.\gradlew.bat bootRun # On Windows
```

### 2. Run Frontend (Vite)
```bash
cd frontend
npm install
npm run dev
```

---

## 🌐 How to Deploy to Production (Render)

This repository includes a turnkey **Render Blueprint** (`render.yaml`).

### Quick Deploy via Render Blueprint:
1. Push your repository to GitHub.
2. Open your [Render Dashboard](https://dashboard.render.com/).
3. Click **New +** -> **Blueprint**.
4. Select your GitHub repository.
5. Render will automatically provision:
   - **PostgreSQL Database** (`interviewiq-db`)
   - **Backend API Docker Container** (`interviewiq-api`)
   - **Frontend Static Site** (`interviewiq-app`)
6. In `interviewiq-api` environment variables on Render, set:
   - `GEMINI_API_KEY`: *(Your Google Gemini API Key from Google AI Studio)*
   - `JWT_SECRET`: *(A random 256-bit string)*
   - `RAZORPAY_KEY_ID` & `RAZORPAY_KEY_SECRET`: *(Optional for UPI payments)*
7. Click **Apply** to deploy!