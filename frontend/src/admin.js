const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
import './style.css';



// ─── Auth Guard & Admin Check ────────────────────────────────────────────────
const token = localStorage.getItem('jwtToken');
if (!token) {
  window.location.href = '/login.html';
}

const authHeaders = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

// Decode and verify role
let isAdmin = false;
try {
  const payload = JSON.parse(atob(token.split('.')[1]));
  if (payload.role === 'ADMIN' || (payload.picture && payload.picture.includes('admin')) || payload.sub === 'admin@interviewiq.ai') {
    isAdmin = true;
  }
} catch (e) {
  console.error('Failed to parse token payload:', e);
}

if (!isAdmin) {
  // If not admin, redirect away immediately
  alert('Unauthorized Access: Admins only.');
  window.location.href = '/login.html';
}

// ─── DOM refs ──────────────────────────────────────────────────────────────
const statPending   = document.getElementById('stat-pending');
const statApproved  = document.getElementById('stat-approved');
const statRejected  = document.getElementById('stat-rejected');
const statRevenue   = document.getElementById('stat-revenue');
const statCredits   = document.getElementById('stat-credits');

const loadingState   = document.getElementById('loading-state');
const emptyState     = document.getElementById('empty-state');
const tableContainer = document.getElementById('table-container');
const requestRows    = document.getElementById('request-rows');
const signoutBtn     = document.getElementById('signout-btn');

// Notification Elements
const newRequestAlert = document.getElementById('new-request-alert');
const alertDetails    = document.getElementById('alert-details');
const alertDismissBtn = document.getElementById('alert-dismiss-btn');

// ─── Fetch Stats & Analytics ────────────────────────────────────────────────
async function loadAnalytics() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/payment/admin/stats`, { headers: authHeaders });
    if (!res.ok) throw new Error('Stats load failed');

    const data = await res.json();
    statPending.textContent  = data.pendingRequests || 0;
    statApproved.textContent = data.approvedRequests || 0;
    statRejected.textContent = data.rejectedRequests || 0;
    statRevenue.textContent  = `₹${parseFloat(data.totalRevenue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
    statCredits.textContent  = data.totalCreditsSold || 0;
  } catch (err) {
    console.error('Failed to load admin stats:', err);
  }
}

// ─── Fetch & Render Table Requests ──────────────────────────────────────────
async function loadRequests() {
  try {
    loadingState.classList.remove('hidden');
    emptyState.classList.add('hidden');
    tableContainer.classList.add('hidden');

    const res = await fetch(`${API_BASE_URL}/api/payment/admin/requests`, { headers: authHeaders });
    if (!res.ok) throw new Error('Requests fetch failed');

    const records = await res.json();
    loadingState.classList.add('hidden');

    if (!records || records.length === 0) {
      emptyState.classList.remove('hidden');
      newRequestAlert.classList.add('hidden');
      return;
    }

    // Trigger Notification Alert for the most recent PENDING request
    const pendingReq = records.find(r => r.status.toUpperCase() === 'PENDING');
    if (pendingReq) {
      alertDetails.innerHTML = `<span class="font-extrabold text-white">${escapeHtml(pendingReq.userName)}</span> requested <span class="font-bold text-[#22C55E]">${escapeHtml(pendingReq.planName)}</span> (₹${pendingReq.amount}) — UTR: <span class="font-mono font-bold select-all">${escapeHtml(pendingReq.utrNumber)}</span> — <span class="text-yellow-400 font-extrabold uppercase text-[9.5px]">Pending Approval</span>`;
      newRequestAlert.classList.remove('hidden');
    } else {
      newRequestAlert.classList.add('hidden');
    }

    // Populate rows
    requestRows.innerHTML = '';
    records.forEach(r => {
      const row = document.createElement('tr');
      row.className = 'hover:bg-gray-50/50 transition-colors border-b border-gray-100';

      const statusBadge = getStatusBadge(r.status);
      const isPending = r.status.toUpperCase() === 'PENDING';

      row.innerHTML = `
        <td class="px-6 py-4 whitespace-nowrap">
          <div class="font-extrabold text-black text-xs">${escapeHtml(r.userName)}</div>
          <div class="text-[10px] text-gray-400 font-semibold">${escapeHtml(r.email)}</div>
        </td>
        <td class="px-6 py-4 whitespace-nowrap font-bold text-black text-xs">${escapeHtml(r.planName)}</td>
        <td class="px-6 py-4 whitespace-nowrap font-bold text-[#16A34A] text-xs">₹${parseFloat(r.amount || 0).toFixed(2)}</td>
        <td class="px-6 py-4 whitespace-nowrap font-extrabold text-gray-700 text-xs">+${r.credits} Credits</td>
        <td class="px-6 py-4 whitespace-nowrap text-xs font-mono text-gray-500 select-all font-bold">${escapeHtml(r.utrNumber)}</td>
        <td class="px-6 py-4 whitespace-nowrap text-gray-400 text-[11px] font-semibold">${escapeHtml(r.submittedAt || 'N/A')}</td>
        <td class="px-6 py-4 whitespace-nowrap">${statusBadge}</td>
        <td class="px-6 py-4 whitespace-nowrap text-center">
          ${isPending ? `
            <div class="flex items-center justify-center gap-1.5">
              <button class="approve-btn px-2.5 py-1 bg-[#22C55E] hover:bg-[#1ea951] text-white text-[10px] font-extrabold rounded-lg shadow-sm cursor-pointer transition-colors" data-id="${r.id}">
                Approve
              </button>
              <button class="reject-btn px-2.5 py-1 bg-[#EF4444] hover:bg-[#dc2626] text-white text-[10px] font-extrabold rounded-lg shadow-sm cursor-pointer transition-colors" data-id="${r.id}">
                Reject
              </button>
            </div>
          ` : `
            <div class="text-[10px] text-gray-400 font-semibold italic">
              Audited by: ${escapeHtml(r.approvedBy || 'Admin')}
            </div>
          `}
        </td>
      `;
      requestRows.appendChild(row);
    });

    tableContainer.classList.remove('hidden');
    bindActionButtons();

  } catch (err) {
    console.error('Failed to load requests ledger:', err);
    loadingState.classList.add('hidden');
    emptyState.classList.remove('hidden');
  }
}

// ─── Button Click Event Handlers ──────────────────────────────────────────
function bindActionButtons() {
  document.querySelectorAll('.approve-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const requestId = btn.dataset.id;
      if (!confirm('Are you sure you want to APPROVE this payment reference? Credits will be added immediately.')) return;

      try {
        const res = await fetch(`${API_BASE_URL}/api/payment/admin/approve`, {
          method: 'POST',
          headers: authHeaders,
          body: JSON.stringify({ requestId })
        });
        if (!res.ok) throw new Error('Approval request failed');

        alert('Payment Request APPROVED Successfully!');
        // Refresh dashboard
        loadAnalytics();
        loadRequests();
      } catch (err) {
        console.error(err);
        alert('Server encountered error while processing payment request.');
      }
    });
  });

  document.querySelectorAll('.reject-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const requestId = btn.dataset.id;
      if (!confirm('Are you sure you want to REJECT this payment request? No credits will be loaded.')) return;

      try {
        const res = await fetch(`${API_BASE_URL}/api/payment/admin/reject`, {
          method: 'POST',
          headers: authHeaders,
          body: JSON.stringify({ requestId })
        });
        if (!res.ok) throw new Error('Rejection request failed');

        alert('Payment Request REJECTED.');
        // Refresh dashboard
        loadAnalytics();
        loadRequests();
      } catch (err) {
        console.error(err);
        alert('Server encountered error while processing payment request.');
      }
    });
  });
}

// ─── Status Badge Builders ────────────────────────────────────────────────
function getStatusBadge(status) {
  let badgeClass = '';
  let label = '';
  switch(status.toUpperCase()) {
    case 'APPROVED':
      badgeClass = 'status-approved';
      label = '✓ Approved';
      break;
    case 'REJECTED':
      badgeClass = 'status-rejected';
      label = '✗ Rejected';
      break;
    default:
      badgeClass = 'status-pending';
      label = 'Pending';
      break;
  }
  return `<span class="px-2.5 py-0.5 rounded-full border text-[10px] font-extrabold ${badgeClass}">${label}</span>`;
}

// ─── Utilities ─────────────────────────────────────────────────────────────
function escapeHtml(str) {
  return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// Dismiss Notification alert
if (alertDismissBtn) {
  alertDismissBtn.addEventListener('click', () => {
    newRequestAlert.classList.add('hidden');
  });
}

// Sign out button
if (signoutBtn) {
  signoutBtn.addEventListener('click', () => {
    localStorage.removeItem('jwtToken');
    window.location.href = '/login.html';
  });
}

// ─── Boot ──────────────────────────────────────────────────────────────────
loadAnalytics();
loadRequests();