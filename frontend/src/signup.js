const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
import './style.css';

document.getElementById('signup-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const fullName = document.getElementById('fullName').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  const errorDiv = document.getElementById('error-message');
  
  // Reset error message state
  errorDiv.classList.add('hidden');
  errorDiv.textContent = '';
  errorDiv.className = 'hidden mb-3 p-3 bg-red-50 text-red-600 text-[13px] rounded-lg border border-red-100 text-center';

  // Client-side validations
  if (!fullName) {
    errorDiv.textContent = 'Full Name is required.';
    errorDiv.className = 'mb-3 p-3 bg-red-50 text-red-600 text-[13px] rounded-lg border border-red-100 text-center';
    errorDiv.classList.remove('hidden');
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    errorDiv.textContent = 'Please enter a valid email address.';
    errorDiv.className = 'mb-3 p-3 bg-red-50 text-red-600 text-[13px] rounded-lg border border-red-100 text-center';
    errorDiv.classList.remove('hidden');
    return;
  }

  if (password.length < 8) {
    errorDiv.textContent = 'Password must be at least 8 characters.';
    errorDiv.className = 'mb-3 p-3 bg-red-50 text-red-600 text-[13px] rounded-lg border border-red-100 text-center';
    errorDiv.classList.remove('hidden');
    return;
  }
  
  if (password !== confirmPassword) {
    errorDiv.textContent = 'Passwords do not match.';
    errorDiv.className = 'mb-3 p-3 bg-red-50 text-red-600 text-[13px] rounded-lg border border-red-100 text-center';
    errorDiv.classList.remove('hidden');
    return;
  }
  
  try {
    console.log('Sending signup request to backend for email:', email);
    const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ fullName, email, password })
    });
    
    let errorMessage = 'Signup failed. Please try again.';
    let data = null;
    
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      try {
        data = await response.json();
        console.log('Parsed backend JSON response:', data);
        if (data && data.error) {
          errorMessage = data.error;
        } else if (data && data.message) {
          errorMessage = data.message;
        }
      } catch (jsonErr) {
        console.error('Error parsing JSON response from server:', jsonErr);
      }
    } else {
      try {
        const text = await response.text();
        console.warn('Received non-JSON response from server:', text);
        errorMessage = text || errorMessage;
      } catch (textErr) {
        console.error('Error parsing response text from server:', textErr);
      }
    }
    
    if (response.ok) {
      console.log('User signed up successfully!');
      errorDiv.textContent = 'Account created successfully! Redirecting...';
      errorDiv.className = 'mb-3 p-3 bg-green-50 text-green-600 text-[13px] rounded-lg border border-green-100 text-center';
      errorDiv.classList.remove('hidden');
      
      setTimeout(() => {
        window.location.href = '/login.html';
      }, 1500);
    } else {
      console.error('Backend returned an error code:', response.status, errorMessage);
      errorDiv.textContent = errorMessage;
      errorDiv.className = 'mb-3 p-3 bg-red-50 text-red-600 text-[13px] rounded-lg border border-red-100 text-center';
      errorDiv.classList.remove('hidden');
    }
  } catch (err) {
    console.error('Fetch operation failed with network error:', err);
    errorDiv.textContent = 'Server connection failed. Please try later.';
    errorDiv.className = 'mb-3 p-3 bg-red-50 text-red-600 text-[13px] rounded-lg border border-red-100 text-center';
    errorDiv.classList.remove('hidden');
  }
});