# Production Environment Variables: InterviewIQ-AI

This document outlines all production environment variables required to run the backend and frontend services on Render.

---

## 🖥️ Backend API Service (`interviewiq-api`)

These variables are injected automatically via the **Render Blueprint (`render.yaml`)** or must be supplied in the Render Dashboard UI.

| Variable Name | Purpose | Required Value / Source |
| :--- | :--- | :--- |
| `DB_HOST` | Hostname of the private Render Postgres database. | **Managed by Blueprint**: Fetched via database property `host`. |
| `DB_PORT` | Port of the private Render Postgres database. | **Managed by Blueprint**: Fetched via database property `port`. |
| `DB_DATABASE` | Name of the database schema. | **Managed by Blueprint**: Fetched via database property `database`. |
| `DB_USERNAME` | Database connection username. | **Managed by Blueprint**: Fetched via database property `user`. |
| `DB_PASSWORD` | Database connection password. | **Managed by Blueprint**: Fetched via database property `password`. |
| `JWT_SECRET` | Secret key used to sign and verify JWT authentication tokens. | **Managed by Blueprint**: Securely generated automatically. |
| `FRONTEND_URL` | The public URL of the frontend deployment. Used for CORS. | **Managed by Blueprint**: `https://interviewiq-app.onrender.com`. |
| `SPRING_PROFILES_ACTIVE` | Dictates which Spring profile configuration to load. | **Managed by Blueprint**: `prod`. |
| `PORT` | The port the Spring Boot server binds to. | **Managed by Blueprint**: `8080`. |
| `GEMINI_API_KEY` | Google Gemini API key used for evaluation and question generation. | **User-Defined**: Generate your key in Google AI Studio and paste it in Render Settings. |
| `RAZORPAY_KEY_ID` | Your Razorpay API integration Key ID. | **User-Defined**: Paste your Razorpay Key ID (Test or Live) in Render Settings. |
| `RAZORPAY_KEY_SECRET` | Your Razorpay API integration Key Secret. | **User-Defined**: Paste your Razorpay Key Secret in Render Settings. |

---

## 🎨 Frontend Static Site (`interviewiq-app`)

These variables are defined during the static site build phase.

| Variable Name | Purpose | Value |
| :--- | :--- | :--- |
| `VITE_API_URL` | Root URL of the deployed Spring Boot backend. | **Managed by Blueprint**: `https://interviewiq-api.onrender.com`. |
