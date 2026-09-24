# Render Deployment Instructions

This project is fully configured to be deployed on Render using the "Blueprint" feature (via `render.yaml`).

## Deployment Steps

1. Go to your [Render Dashboard](https://dashboard.render.com/).
2. Click on the **New +** button and select **Blueprint**.
3. Connect this GitHub repository (`https://github.com/Lakshya-sharma-18/InterviewIQ-AI.git`).
4. Render will automatically detect the `render.yaml` file and set up three services:
   - **PostgreSQL Database** (`interviewiq-db`)
   - **Backend API** (`interviewiq-api`)
   - **Frontend App** (`interviewiq-app`)
5. Click **Apply** to start the initial deployment.

## Required Environment Variables

For the backend to function correctly, you **MUST** provide the following environment variables in the Render Dashboard for the `interviewiq-api` web service. The fallbacks have been removed for security.

Navigate to **Dashboard -> interviewiq-api -> Environment**, and add the following:

| Key | Description | Example / Note |
|-----|-------------|----------------|
| `JWT_SECRET` | A secure, random string (at least 256 bits) used to sign JWT tokens. | e.g. `your_super_secret_jwt_key_that_is_long_enough` |
| `GEMINI_API_KEY` | Your Google Gemini API Key for AI interview evaluations. | e.g. `AIzaSy...` |
| `RAZORPAY_KEY_ID` | Your Razorpay Key ID (Live or Test). | e.g. `rzp_test_...` |
| `RAZORPAY_KEY_SECRET` | Your Razorpay Key Secret (Live or Test). | e.g. `secret_...` |

*(Note: Variables like `DATABASE_URL`, `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, `FRONTEND_URL`, `APP_ENV`, and `SPRING_PROFILES_ACTIVE` are automatically handled by the `render.yaml` blueprint).*

## Troubleshooting

- **Database Connection Issues**: The blueprint automatically links the created PostgreSQL instance to your Spring Boot API. If it fails, ensure `DB_URL`, `DB_USERNAME`, and `DB_PASSWORD` are populated in the Environment tab of `interviewiq-api`.
- **API URL Issues on Frontend**: The frontend is built passing the `VITE_API_URL`. Ensure `interviewiq-app` has `VITE_API_URL` matching the API's Render URL (it should be automatically injected by `render.yaml`).
