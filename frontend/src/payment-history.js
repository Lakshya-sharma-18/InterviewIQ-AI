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
const navCredits     = document.getElementById('nav-credits');
const loadingState   = document.getElementById('loading-state');
const emptyState     = document.getElementById('empty-state');
const tableContainer = document.getElementById('table-container');
const paymentRows    = document.getElementById('payment-rows');
const signoutBtn     = document.getElementById('signout-btn');

// ─── Load User Balance ─────────────────────────────────────────────────────
async function loadCredits() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/credits`, { headers: authHeaders });
    if (res.status === 401) {
      localStorage.removeItem('jwtToken');
      window.location.href = '/login.html';
      return;
    }
    if (!res.ok) throw new Error('Credits fetch failed');
    const data = await res.json();
    navCredits.textContent = `${data.credits} Credits`;
  } catch (err) {
    console.error('Failed to load user credits:', err);
    navCredits.textContent = '-- Credits';
  }
}

// ─── Render Payments Table ──────────────────────────────────────────────────
async function loadPaymentHistory() {
  try {
    loadingState.classList.remove('hidden');
    emptyState.classList.add('hidden');
    tableContainer.classList.add('hidden');

    const res = await fetch(`${API_BASE_URL}/api/payment/history`, { headers: authHeaders });
    if (res.status === 401) {
      localStorage.removeItem('jwtToken');
      window.location.href = '/login.html';
      return;
    }
    if (!res.ok) throw new Error('Failed to fetch payment history');

    const records = await res.json();
    loadingState.classList.add('hidden');

    if (!records || records.length === 0) {
      emptyState.classList.remove('hidden');
      return;
    }

    // Populate rows
    paymentRows.innerHTML = '';
    records.forEach(p => {
      const row = document.createElement('tr');
      row.className = 'hover:bg-gray-50/50 transition-colors border-b border-gray-100';

      // Format Date
      const dateVal = p.createdAt || 'N/A';

      // Format Status Badge
      const statusBadge = getStatusBadge(p.status || 'PENDING');

      // Format Amount
      const formattedAmount = `₹${parseFloat(p.amount || 0).toFixed(2)}`;

      // Audit Trail Info
      const isAudited = p.status.toUpperCase() !== 'PENDING';
      const auditTrail = isAudited ? `
        <div class="text-[9.5px] text-gray-400 font-semibold mt-1">
          Audited by: <span class="text-gray-600 font-bold">${escapeHtml(p.approvedBy)}</span> on ${escapeHtml(p.approvedAt)}
        </div>
      ` : '';

      row.innerHTML = `
        <td class="px-6 py-4 whitespace-nowrap text-gray-500 font-medium">${escapeHtml(dateVal)}</td>
        <td class="px-6 py-4 whitespace-nowrap">
          <div class="font-bold text-black text-xs">${escapeHtml(p.planName || 'Credits Purchase')}</div>
          ${auditTrail}
        </td>
        <td class="px-6 py-4 whitespace-nowrap font-semibold text-[#16A34A] text-xs">${formattedAmount}</td>
        <td class="px-6 py-4 whitespace-nowrap font-bold text-gray-700 text-xs">+${p.creditsAdded || 0} Credits</td>
        <td class="px-6 py-4 whitespace-nowrap">${statusBadge}</td>
        <td class="px-6 py-4 whitespace-nowrap text-xs font-mono text-gray-400 select-all font-bold">${escapeHtml(p.transactionId || 'N/A')}</td>
      `;
      paymentRows.appendChild(row);
    });

    tableContainer.classList.remove('hidden');

  } catch (err) {
    console.error('Failed to load payments history:', err);
    loadingState.classList.add('hidden');
    emptyState.classList.remove('hidden');
    emptyState.querySelector('h3').textContent = 'Error Loading History';
    emptyState.querySelector('p').textContent = 'Something went wrong while fetching your transaction records. Please try again.';
  }
}

// ─── Status Badge Builder ──────────────────────────────────────────────────
function getStatusBadge(status) {
  let badgeClass = '';
  let label = '';
  switch(status.toUpperCase()) {
    case 'APPROVED':
    case 'SUCCESS':
      badgeClass = 'status-success';
      label = '✓ Approved';
      break;
    case 'REJECTED':
    case 'FAILED':
      badgeClass = 'status-failed';
      label = '✗ Rejected';
      break;
    default:
      badgeClass = 'status-created';
      label = 'Pending';
      break;
  }
  return `<span class="px-2.5 py-0.5 rounded-full border text-[10px] font-extrabold ${badgeClass}">${label}</span>`;
}

// ─── Utilities ─────────────────────────────────────────────────────────────
function escapeHtml(str) {
  return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// Sign out button
if (signoutBtn) {
  signoutBtn.addEventListener('click', () => {
    localStorage.removeItem('jwtToken');
    window.location.href = '/login.html';
  });
}

// ─── Boot ──────────────────────────────────────────────────────────────────
loadCredits();
loadPaymentHistory();