const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
import './style.css';

document.getElementById('reset-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const token = document.getElementById('token').value.trim();
  const newPassword = document.getElementById('newPassword').value;
  const msgDiv = document.getElementById('message-container');
  
  msgDiv.classList.add('hidden');
  msgDiv.textContent = '';
  
  if (!token || !newPassword) {
    msgDiv.textContent = 'Please fill in all fields.';
    msgDiv.className = 'mb-3 p-3 bg-red-50 text-red-600 text-[13px] rounded-lg border border-red-100 text-center block';
    msgDiv.classList.remove('hidden');
    return;
  }
  
  if (newPassword.length < 8) {
    msgDiv.textContent = 'Password must be at least 8 characters.';
    msgDiv.className = 'mb-3 p-3 bg-red-50 text-red-600 text-[13px] rounded-lg border border-red-100 text-center block';
    msgDiv.classList.remove('hidden');
    return;
  }
  
  try {
    console.log('Sending reset-password request to backend with token:', token);
    const response = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ token, newPassword })
    });
    
    let errorMessage = 'Failed to reset password.';
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
      console.log('Password reset successfully!');
      msgDiv.textContent = 'Password reset successfully! Redirecting to login...';
      msgDiv.className = 'mb-3 p-3 bg-green-50 text-green-700 text-[13px] rounded-lg border border-green-200 text-center block';
      msgDiv.classList.remove('hidden');
      setTimeout(() => {
        window.location.href = '/login.html';
      }, 2000);
    } else {
      console.error('Backend returned an error code:', response.status, errorMessage);
      msgDiv.textContent = errorMessage;
      msgDiv.className = 'mb-3 p-3 bg-red-50 text-red-600 text-[13px] rounded-lg border border-red-100 text-center block';
      msgDiv.classList.remove('hidden');
    }
  } catch (err) {
    console.error('Fetch operation failed with network error:', err);
    msgDiv.textContent = 'Server connection failed. Please try later.';
    msgDiv.className = 'mb-3 p-3 bg-red-50 text-red-600 text-[13px] rounded-lg border border-red-100 text-center block';
    msgDiv.classList.remove('hidden');
  }
});