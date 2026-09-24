const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
import './style.css';

document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const errorDiv = document.getElementById('error-message');
  
  errorDiv.classList.add('hidden');
  errorDiv.textContent = '';
  errorDiv.className = 'hidden mb-4 p-3 bg-red-50 text-red-600 text-[13px] rounded-lg border border-red-100 text-center';

  if (!email || !password) {
    errorDiv.textContent = 'Please fill in all fields.';
    errorDiv.classList.remove('hidden');
    return;
  }
  
  try {
    console.log('Sending login request to backend for email:', email);
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });
    
    let errorMessage = 'Invalid credentials. Please try again.';
    let data = null;
    
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      try {
        data = await response.json();
        console.log('Parsed backend JSON response:', data);
        if (data && data.error) {
          errorMessage = data.error;
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
      console.log('User logged in successfully!');
      localStorage.setItem('jwtToken', data.token);
      window.location.href = '/interview.html';
    } else {
      console.error('Backend returned an error code:', response.status, errorMessage);
      errorDiv.textContent = errorMessage;
      errorDiv.classList.remove('hidden');
    }
  } catch (err) {
    console.error('Fetch operation failed with network error:', err);
    errorDiv.textContent = 'Server connection failed. Please try later.';
    errorDiv.classList.remove('hidden');
  }
});