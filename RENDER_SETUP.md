# Render Production Setup: InterviewIQ-AI

Follow these simple, step-by-step instructions to deploy your fixed, production-ready full-stack application on Render.

---

## 🛠️ Step 1: Push the Fixed Code to GitHub

First, commit the changes we made to your repository and push them to your `main` branch. This triggers Render to use the fixed `render.yaml` configuration.

Run these commands in your project root folder:
```bash
git add .
git commit -m "chore: fix database configuration, add health check, and setup fallbacks for render production"
git push origin main
```

---

## 🚀 Step 2: Deploy the Blueprint on Render

1. Open your [Render Dashboard](https://dashboard.render.com/).
2. In the top-right corner, click **New +** and select **Blueprint**.
3. Choose the repository `vipulsharma1772-eng/InterviewIQ-AI` (or your cloned repository).
4. Render will scan the repository and detect the updated `render.yaml` file automatically.
5. In the blueprint initialization form, you will see a list of three services:
   - `interviewiq-db` (PostgreSQL Database)
   - `interviewiq-api` (Docker Web Service)
   - `interviewiq-app` (Static Frontend Web Service)
6. Scroll down to the **Environment Variables** section. You will see fields where you can fill in your keys:
   - **`GEMINI_API_KEY`**: Paste your Google Gemini API Key from Google AI Studio.
   - **`RAZORPAY_KEY_ID`**: Paste your Razorpay Key ID.
   - **`RAZORPAY_KEY_SECRET`**: Paste your Razorpay Key Secret.
7. Click **Apply** to trigger the deployment.

---

## ✅ Step 3: Verification & Live Check

Render will build and run all services in parallel. The database will spin up first, then the Spring Boot API, and finally the static site frontend.

- **Backend Health Check**: Verify by opening `https://interviewiq-api.onrender.com/` in your browser. It will respond immediately with:
  ```json
  {
    "status": "UP",
    "message": "InterviewIQ API is running successfully"
  }
  ```
- **Frontend App**: Open `https://interviewiq-app.onrender.com/` to check the beautiful UI, register/login, and start your smart voice interviews!
