const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
import './style.css';

document.getElementById('forgot-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const email = document.getElementById('email').value.trim();
  const msgDiv = document.getElementById('message-container');
  
  msgDiv.classList.add('hidden');
  msgDiv.textContent = '';
  
  if (!email) {
    msgDiv.textContent = 'Please enter your email.';
    msgDiv.className = 'mb-3 p-3 bg-red-50 text-red-600 text-[13px] rounded-lg border border-red-100 text-center block';
    return;
  }
  
  try {
    console.log('Sending forgot-password request to backend for email:', email);
    const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email })
    });
    
    let errorMessage = 'Failed to request reset.';
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
      console.log('Reset token generated successfully!');
      msgDiv.textContent = 'Reset token generated! Check the backend console log for the token.';
      msgDiv.className = 'mb-3 p-3 bg-green-50 text-green-700 text-[13px] rounded-lg border border-green-200 text-center block';
    } else {
      console.error('Backend returned an error code:', response.status, errorMessage);
      msgDiv.textContent = errorMessage;
      msgDiv.className = 'mb-3 p-3 bg-red-50 text-red-600 text-[13px] rounded-lg border border-red-100 text-center block';
    }
  } catch (err) {
    console.error('Fetch operation failed with network error:', err);
    msgDiv.textContent = 'Server connection failed. Please try later.';
    msgDiv.className = 'mb-3 p-3 bg-red-50 text-red-600 text-[13px] rounded-lg border border-red-100 text-center block';
  }
});