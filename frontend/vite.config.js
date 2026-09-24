import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        login: resolve(__dirname, 'login.html'),
        signup: resolve(__dirname, 'signup.html'),
        forgotPassword: resolve(__dirname, 'forgot-password.html'),
        resetPassword: resolve(__dirname, 'reset-password.html'),
        interview: resolve(__dirname, 'interview.html'),
        history: resolve(__dirname, 'history.html'),
        paymentHistory: resolve(__dirname, 'payment-history.html'),
        pricing: resolve(__dirname, 'pricing.html'),
        admin: resolve(__dirname, 'admin.html'),
      },
    },
  },
});
