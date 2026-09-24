const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
import './style.css';



// ─── Auth Gate ─────────────────────────────────────────────────────────────
const token = localStorage.getItem('jwtToken');
if (!token) {
  window.location.href = '/login.html';
}
const authHeaders = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

// Decode and verify role to show Admin Link in Navbar
let isAdmin = false;
try {
  const payload = JSON.parse(atob(token.split('.')[1]));
  if (payload.role === 'ADMIN' || (payload.picture && payload.picture.includes('admin')) || payload.sub === 'admin@interviewiq.ai') {
    isAdmin = true;
  }
} catch (e) {
  console.error('Failed to parse token payload:', e);
}

const adminPanelLink = document.getElementById('admin-panel-link');
if (adminPanelLink && isAdmin) {
  adminPanelLink.classList.remove('hidden');
}

// ─── DOM refs ──────────────────────────────────────────────────────────────
const navCredits      = document.getElementById('nav-credits');

// UPI Modal elements
const upiModal        = document.getElementById('upi-modal');
const upiModalClose   = document.getElementById('upi-modal-close');
const upiPlanName     = document.getElementById('upi-plan-name');
const upiPlanCredits  = document.getElementById('upi-plan-credits');
const upiPlanPrice    = document.getElementById('upi-plan-price');

const upiCopyBtn      = document.getElementById('upi-copy-btn');
const upiPayNowBtn    = document.getElementById('upi-pay-now-btn');
const upiVerifyBtn    = document.getElementById('upi-verify-btn');
const upiUtrInput     = document.getElementById('upi-utr-input');
const upiValError     = document.getElementById('upi-validation-error');

// State sub-panels
const upiStateInfo    = document.getElementById('upi-state-info');
const upiStateConfirm = document.getElementById('upi-state-confirm');
const upiStateSuccess = document.getElementById('upi-state-success');

// Success Details display
const upiSuccessUtr     = document.getElementById('upi-success-utr');
const upiSuccessCredits = document.getElementById('upi-success-credits');
const upiSuccessDone    = document.getElementById('upi-success-done');

// Timer display
const upiTimerText    = document.getElementById('upi-timer-text');

// Active configuration state
let selectedPlan = {
  name: '',
  credits: 0,
  price: 0,
  upiLink: ''
};

let countdownInterval = null;

// ─── Fetch live credits ───────────────────────────────────────────────────
async function loadCredits() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/credits`, { headers: authHeaders });
    if (res.status === 401) { window.location.href = '/login.html'; return; }
    if (!res.ok) throw new Error('Failed to load credits');

    const data = await res.json();
    navCredits.textContent = `${data.credits} Credits`;
  } catch (err) {
    console.error('Failed to load credits:', err);
    navCredits.textContent = '-- Credits';
  }
}

// ─── Clipboard Copy Utility ────────────────────────────────────────────────
if (upiCopyBtn) {
  upiCopyBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText('9389905864@pthdfc');
      upiCopyBtn.textContent = 'Copied!';
      upiCopyBtn.classList.remove('bg-[#E8F8F0]', 'text-[#22C55E]', 'border-[#22C55E]/15');
      upiCopyBtn.classList.add('bg-black', 'text-white', 'border-black');
      
      setTimeout(() => {
        upiCopyBtn.textContent = 'Copy UPI';
        upiCopyBtn.classList.add('bg-[#E8F8F0]', 'text-[#22C55E]', 'border-[#22C55E]/15');
        upiCopyBtn.classList.remove('bg-black', 'text-white', 'border-black');
      }, 2000);
    } catch (err) {
      console.error('Failed to copy UPI ID: ', err);
      alert('Could not copy automatically. Please copy the UPI ID manually.');
    }
  });
}

// ─── Input Field Validation & Button State ────────────────────────────────
if (upiUtrInput && upiVerifyBtn) {
  upiUtrInput.addEventListener('input', () => {
    const trimmedVal = upiUtrInput.value.trim();
    if (trimmedVal.length >= 10) {
      upiVerifyBtn.removeAttribute('disabled');
      upiValError.classList.add('hidden');
    } else {
      upiVerifyBtn.setAttribute('disabled', 'true');
    }
  });
}

// ─── Select Plan Interaction ──────────────────────────────────────────────
document.querySelectorAll('.select-plan-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const name = btn.dataset.name;
    const credits = parseInt(btn.dataset.amount, 10);
    
    // Map to price and upi link
    let price = 100;
    let upiLink = 'upi://pay?pa=9389905864@pthdfc&pn=InterviewIQAI&am=100&cu=INR';
    
    if (name.toUpperCase().includes('PRO')) {
      price = 500;
      upiLink = 'upi://pay?pa=9389905864@pthdfc&pn=InterviewIQAI&am=500&cu=INR';
    }

    selectedPlan = { name, credits, price, upiLink };

    // Populate modal views
    upiPlanName.textContent = name;
    upiPlanCredits.textContent = `${credits} Credits`;
    upiPlanPrice.textContent = `₹${price}`;

    // Reset UTR fields
    upiUtrInput.value = '';
    upiVerifyBtn.setAttribute('disabled', 'true');
    upiValError.classList.add('hidden');

    // Reset modal states
    upiStateInfo.classList.remove('hidden');
    upiStateConfirm.classList.add('hidden');
    upiStateSuccess.classList.add('hidden');
    
    // Clear active timer if any
    if (countdownInterval) {
      clearInterval(countdownInterval);
      countdownInterval = null;
    }

    // Display modal container
    upiModal.classList.remove('hidden');
  });
});

// ─── Pay Now Deep Link Action ──────────────────────────────────────────────
if (upiPayNowBtn) {
  upiPayNowBtn.addEventListener('click', () => {
    // Open the generated UPI Payment Link in native application
    window.location.href = selectedPlan.upiLink;
  });
}

// ─── I Have Paid Verification Triggers ──────────────────────────────────────
if (upiVerifyBtn) {
  upiVerifyBtn.addEventListener('click', () => {
    const utrValue = upiUtrInput.value.trim();
    
    if (!utrValue) {
      upiValError.textContent = 'Please enter transaction reference number.';
      upiValError.classList.remove('hidden');
      return;
    }
    upiValError.classList.add('hidden');

    // Start 2 minute countdown IMMEDIATELY on the client side
    upiStateInfo.classList.add('hidden');
    upiStateConfirm.classList.remove('hidden');

    // Initiate the 2-minute countdown timer (120 seconds)
    startCountdownTimer(120, utrValue);
  });
}

// ─── Countdown Timer Implementation ─────────────────────────────────────────
function startCountdownTimer(secondsLeft, utrValue) {
  if (countdownInterval) {
    clearInterval(countdownInterval);
  }

  // Set initial display
  updateTimerDisplay(secondsLeft);

  countdownInterval = setInterval(async () => {
    secondsLeft--;
    updateTimerDisplay(secondsLeft);

    if (secondsLeft <= 0) {
      clearInterval(countdownInterval);
      countdownInterval = null;

      // Submit payment verification request to database in PENDING status!
      const planName = selectedPlan.name.toUpperCase().includes('PRO') ? 'PRO' : 'STARTER';

      try {
        const res = await fetch(`${API_BASE_URL}/api/payment/upi-submit`, {
          method: 'POST',
          headers: authHeaders,
          body: JSON.stringify({ planName, utr: utrValue })
        });

        if (!res.ok) {
          throw new Error('Failed to submit payment request');
        }

        const data = await res.json();
        
        // Populate Success Confirmation Card
        upiSuccessUtr.textContent = utrValue;
        upiSuccessCredits.textContent = `+${data.credits} Credits`;

        // Switch to State 3 Success view (Pending Approval)
        upiStateConfirm.classList.add('hidden');
        upiStateSuccess.classList.remove('hidden');

      } catch (err) {
        console.error('Failed to submit manual payment request:', err);
        alert('Payment request submission failed. Reference ID: ' + utrValue);
        upiModal.classList.add('hidden');
      }
    }
  }, 1000);
}

function updateTimerDisplay(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  
  const mStr = String(minutes).padStart(2, '0');
  const sStr = String(seconds).padStart(2, '0');
  
  upiTimerText.textContent = `${mStr}:${sStr}`;
}

// ─── Modal Close / Done Actions ───────────────────────────────────────────
if (upiModalClose) {
  upiModalClose.addEventListener('click', () => {
    upiModal.classList.add('hidden');
    if (countdownInterval) {
      clearInterval(countdownInterval);
      countdownInterval = null;
    }
  });
}

if (upiSuccessDone) {
  upiSuccessDone.addEventListener('click', () => {
    upiModal.classList.add('hidden');
    // Refresh page or redirect to Payment History where they can track statuses
    window.location.href = '/payment-history.html';
  });
}

// Close modals on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    upiModal.classList.add('hidden');
    if (countdownInterval) {
      clearInterval(countdownInterval);
      countdownInterval = null;
    }
  }
});

// Load balance on boot
loadCredits();