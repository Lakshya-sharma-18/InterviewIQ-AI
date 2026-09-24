const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
import './style.css';



// ─── Auth Gate ─────────────────────────────────────────────────────────────
const token = localStorage.getItem('jwtToken');
if (!token) {
  window.location.href = '/login.html';
}
const authHeaders = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

// ─── DOM refs ──────────────────────────────────────────────────────────────
const loadingState   = document.getElementById('loading-state');
const emptyState     = document.getElementById('empty-state');
const historyList    = document.getElementById('history-list');
const statsBar       = document.getElementById('stats-bar');
const reportModal    = document.getElementById('report-modal');
const modalBody      = document.getElementById('modal-body');
const modalTitle     = document.getElementById('modal-title');
const modalMeta      = document.getElementById('modal-meta');
const modalPdfBtn    = document.getElementById('modal-pdf-btn');
const modalCloseBtn  = document.getElementById('modal-close-btn');

// Currently viewed detail (for PDF download)
let currentDetail = null;

// ─── Sign Out ──────────────────────────────────────────────────────────────
document.getElementById('signout-btn').addEventListener('click', () => {
  localStorage.removeItem('jwtToken');
  window.location.href = '/login.html';
});

// ─── Modal close ──────────────────────────────────────────────────────────
modalCloseBtn.addEventListener('click', closeModal);
reportModal.addEventListener('click', (e) => { if (e.target === reportModal) closeModal(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

function closeModal() {
  reportModal.classList.add('hidden');
  currentDetail = null;
}

// ─── Fetch & Render History ────────────────────────────────────────────────
async function loadHistory() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/history`, { headers: authHeaders });
    if (res.status === 401) { window.location.href = '/login.html'; return; }
    if (!res.ok) throw new Error('Failed to load history');

    const records = await res.json();
    loadingState.classList.add('hidden');

    if (!records || records.length === 0) {
      emptyState.classList.remove('hidden');
      emptyState.classList.add('flex');
      return;
    }

    // ── Stats ──
    const completed = records.filter(r => r.status === 'COMPLETED');
    const scores = completed.map(r => r.overallScore).filter(s => s != null);
    const avgScore = scores.length ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : '--';
    const bestScore = scores.length ? Math.max(...scores) : '--';

    document.getElementById('stat-total').textContent = records.length;
    document.getElementById('stat-completed').textContent = completed.length;
    document.getElementById('stat-avg').textContent = avgScore !== '--' ? avgScore : '--';
    document.getElementById('stat-best').textContent = bestScore !== '--' ? bestScore : '--';
    statsBar.classList.remove('hidden');
    statsBar.classList.add('grid');

    // ── Cards ──
    historyList.innerHTML = '';
    records.forEach((r, i) => {
      const card = buildCard(r, i);
      historyList.appendChild(card);
    });
    historyList.classList.remove('hidden');

  } catch (err) {
    console.error('Failed to load history:', err);
    loadingState.innerHTML = `
      <div class="flex flex-col items-center gap-3 py-16">
        <svg class="w-10 h-10 text-red-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg>
        <p class="text-[13px] font-bold text-gray-500">Could not connect to server. Is the backend running?</p>
        <button onclick="location.reload()" class="text-xs font-bold text-[#22C55E] hover:underline">Try Again</button>
      </div>`;
  }
}

// ─── Build History Card ────────────────────────────────────────────────────
function buildCard(r, index) {
  const wrapper = document.createElement('div');
  wrapper.className = 'bg-white rounded-2xl border border-black/[0.07] shadow-sm card-hover animate-in p-5';
  wrapper.style.animationDelay = `${index * 60}ms`;

  const { statusClass, statusIcon, statusLabel } = getStatusInfo(r.status);
  const scoreDisplay = r.overallScore != null ? `${r.overallScore}` : '--';
  const interviewTypeLabel = formatInterviewType(r.interviewType);
  const dateDisplay = r.createdAt || '—';
  const resumeDisplay = r.resumeName || 'No Resume';
  const scoreColor = r.overallScore != null
    ? (r.overallScore >= 75 ? 'text-[#16A34A]' : r.overallScore >= 55 ? 'text-[#D97706]' : 'text-[#DC2626]')
    : 'text-gray-400';

  wrapper.innerHTML = `
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

      <!-- Left: Role + meta -->
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2.5 flex-wrap mb-2">
          <h3 class="text-[16px] font-[800] text-black truncate">${escapeHtml(r.role || 'Interview')}</h3>
          <span class="text-[10.5px] font-bold px-2.5 py-0.5 rounded-full border ${statusClass}">${statusIcon} ${statusLabel}</span>
        </div>

        <div class="flex flex-wrap gap-x-5 gap-y-1.5">
          <div class="flex items-center gap-1.5 text-[12px] text-gray-500 font-medium">
            <svg class="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
            ${interviewTypeLabel}
          </div>
          <div class="flex items-center gap-1.5 text-[12px] text-gray-500 font-medium">
            <svg class="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
            ${escapeHtml(resumeDisplay)}
          </div>
          <div class="flex items-center gap-1.5 text-[12px] text-gray-500 font-medium">
            <svg class="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
            ${dateDisplay}
          </div>
        </div>
      </div>

      <!-- Right: Score + buttons -->
      <div class="flex items-center gap-4 shrink-0">
        ${r.overallScore != null ? `
        <div class="text-right">
          <div class="text-[28px] font-[800] leading-none ${scoreColor}">${scoreDisplay}</div>
          <div class="text-[10px] font-bold text-gray-400 uppercase tracking-wide mt-0.5">/ 100 Overall</div>
        </div>` : `
        <div class="text-right">
          <div class="text-[17px] font-bold text-gray-300">Not scored</div>
        </div>`}

        <div class="flex flex-col gap-2">
          <button
            class="view-report-btn flex items-center gap-1.5 px-3.5 py-2 bg-black hover:bg-gray-800 text-white rounded-xl text-[12px] font-bold transition-colors cursor-pointer"
            data-id="${r.id}">
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
            View Report
          </button>
          ${r.status === 'COMPLETED' ? `
          <button
            class="download-pdf-btn flex items-center gap-1.5 px-3.5 py-2 border border-[#22C55E] text-[#16A34A] hover:bg-green-50 rounded-xl text-[12px] font-bold transition-colors cursor-pointer"
            data-id="${r.id}">
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
            Download PDF
          </button>` : ''}
        </div>
      </div>
    </div>`;

  // Score sub-bars (if completed)
  if (r.status === 'COMPLETED' && r.technicalScore != null) {
    const barsHtml = `
      <div class="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 sm:grid-cols-4 gap-3">
        ${miniBar('Technical', r.technicalScore)}
        ${miniBar('Communication', r.communicationScore)}
        ${miniBar('Confidence', r.confidenceScore)}
        ${miniBar('Problem Solving', r.problemSolvingScore)}
      </div>`;
    wrapper.insertAdjacentHTML('beforeend', barsHtml);
  }

  return wrapper;
}

function miniBar(label, value) {
  const v = value ?? 0;
  const color = v >= 75 ? '#22C55E' : v >= 55 ? '#F59E0B' : '#EF4444';
  return `
    <div>
      <div class="flex justify-between text-[10.5px] font-bold text-gray-500 mb-1">
        <span>${label}</span><span style="color:${color}">${v}%</span>
      </div>
      <div class="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div class="h-full rounded-full" style="width:${v}%;background:${color}"></div>
      </div>
    </div>`;
}

// ─── Event Delegation: View Report & Download PDF ─────────────────────────
document.addEventListener('click', async (e) => {
  const viewBtn = e.target.closest('.view-report-btn');
  const pdfBtn  = e.target.closest('.download-pdf-btn');

  if (viewBtn) {
    const id = viewBtn.dataset.id;
    await openReportModal(id);
  }

  if (pdfBtn) {
    const id = pdfBtn.dataset.id;
    const detail = await fetchDetail(id);
    if (detail) generatePDF(detail);
  }
});

// ─── Fetch Detail for Modal / PDF ─────────────────────────────────────────
async function fetchDetail(id) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/history/${id}`, { headers: authHeaders });
    if (!res.ok) throw new Error('Detail not found');
    return await res.json();
  } catch (err) {
    alert('Could not load interview details. Please try again.');
    return null;
  }
}

// ─── Open Report Modal ─────────────────────────────────────────────────────
async function openReportModal(id) {
  modalBody.innerHTML = `<div class="flex items-center justify-center py-20">
    <div class="w-8 h-8 border-4 border-[#22C55E] border-t-transparent rounded-full spinner"></div>
  </div>`;
  modalPdfBtn.classList.add('hidden');
  reportModal.classList.remove('hidden');

  const detail = await fetchDetail(id);
  if (!detail) { closeModal(); return; }

  currentDetail = detail;
  const { statusClass, statusIcon, statusLabel } = getStatusInfo(detail.status);
  modalTitle.textContent = `AI Evaluation Report`;
  modalMeta.textContent = `ROLE: ${(detail.role || '').toUpperCase()} | TYPE: ${(detail.interviewType || '').toUpperCase()} | ${detail.createdAt || ''}`;

  if (detail.status === 'COMPLETED') {
    modalPdfBtn.classList.remove('hidden');
    modalPdfBtn.onclick = () => generatePDF(detail);
  }

  modalBody.innerHTML = buildModalContent(detail, statusClass, statusIcon, statusLabel);
}

function buildModalContent(d, statusClass, statusIcon, statusLabel) {
  const overallColor = d.overallScore >= 75 ? '#16A34A' : d.overallScore >= 55 ? '#D97706' : '#DC2626';
  const circumference = 339.3;
  const offset = d.overallScore != null ? circumference - (d.overallScore / 100) * circumference : circumference;

  const skills = Array.isArray(d.resumeSkills) ? d.resumeSkills : [];
  const projects = Array.isArray(d.resumeProjects) ? d.resumeProjects : [];
  const strengths = Array.isArray(d.strengths) ? d.strengths : [];
  const weaknesses = Array.isArray(d.weaknesses) ? d.weaknesses : [];
  const improvements = Array.isArray(d.improvements) ? d.improvements : [];
  const qReports = Array.isArray(d.questionReports) ? d.questionReports : [];

  return `
    <!-- Candidate Info + Score Row -->
    <div class="flex flex-col sm:flex-row gap-5 mb-6">

      <!-- Candidate Info -->
      <div class="flex-1 bg-gray-50 rounded-2xl border border-black/5 p-4">
        <p class="text-[10.5px] font-bold text-gray-400 uppercase tracking-widest mb-3">Candidate Info</p>
        <div class="space-y-2 text-[12.5px] font-semibold text-gray-700">
          <div class="flex items-center gap-2"><span class="text-gray-400 w-20 shrink-0">Name</span><span class="text-black font-bold">${escapeHtml(d.candidateName || '—')}</span></div>
          <div class="flex items-center gap-2"><span class="text-gray-400 w-20 shrink-0">Resume</span><span class="text-black font-bold">${escapeHtml(d.resumeName || 'No Resume')}</span></div>
          <div class="flex items-center gap-2"><span class="text-gray-400 w-20 shrink-0">Role</span><span class="text-black font-bold">${escapeHtml(d.role || '—')}</span></div>
          <div class="flex items-center gap-2"><span class="text-gray-400 w-20 shrink-0">Status</span><span class="text-[10.5px] font-bold px-2.5 py-0.5 rounded-full border ${statusClass}">${statusIcon} ${statusLabel}</span></div>
          <div class="flex items-center gap-2"><span class="text-gray-400 w-20 shrink-0">Date</span><span>${d.createdAt || '—'}</span></div>
        </div>
      </div>

      <!-- Overall Score Gauge -->
      ${d.overallScore != null ? `
      <div class="bg-gray-50 rounded-2xl border border-black/5 p-4 flex flex-col items-center justify-center text-center min-w-[150px]">
        <span class="text-[10.5px] font-bold text-gray-400 uppercase tracking-widest mb-2">Overall Score</span>
        <div class="relative w-24 h-24 flex items-center justify-center">
          <svg class="w-full h-full transform -rotate-90">
            <circle cx="48" cy="48" r="40" stroke="rgba(0,0,0,0.05)" stroke-width="8" fill="transparent"/>
            <circle cx="48" cy="48" r="40" stroke="${overallColor}" stroke-width="8" fill="transparent"
              stroke-dasharray="${circumference * 0.74}" stroke-dashoffset="${offset * 0.74}" class="transition-all duration-1000"/>
          </svg>
          <div class="absolute flex flex-col items-center">
            <span class="text-[26px] font-[800] leading-none" style="color:${overallColor}">${d.overallScore}</span>
            <span class="text-[9px] text-gray-400 font-bold uppercase tracking-wide">/100</span>
          </div>
        </div>
      </div>` : ''}
    </div>

    <!-- Score Bars -->
    ${d.technicalScore != null ? `
    <div class="grid grid-cols-2 gap-3 mb-5">
      ${fullBar('Technical Accuracy', d.technicalScore)}
      ${fullBar('Communication & Flow', d.communicationScore)}
      ${fullBar('Professional Confidence', d.confidenceScore)}
      ${fullBar('Problem Solving', d.problemSolvingScore)}
    </div>` : ''}

    <!-- Resume Skills & Projects -->
    ${(skills.length || projects.length) ? `
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
      ${skills.length ? `
      <div class="bg-green-50/40 border border-green-100 rounded-xl p-4">
        <p class="text-[10.5px] font-bold text-green-700 uppercase tracking-wider mb-2.5">Skills Extracted</p>
        <div class="flex flex-wrap gap-1.5">
          ${skills.map(s => `<span class="bg-white border border-green-200 text-green-800 px-2.5 py-0.5 rounded-lg text-[11px] font-bold">${escapeHtml(s)}</span>`).join('')}
        </div>
      </div>` : ''}
      ${projects.length ? `
      <div class="bg-blue-50/40 border border-blue-100 rounded-xl p-4">
        <p class="text-[10.5px] font-bold text-blue-700 uppercase tracking-wider mb-2.5">Projects Found</p>
        <ul class="space-y-1">
          ${projects.map(p => `<li class="text-[12.5px] text-blue-900 font-semibold flex items-center gap-1.5"><span class="w-1.5 h-1.5 bg-blue-400 rounded-full shrink-0"></span>${escapeHtml(p)}</li>`).join('')}
        </ul>
      </div>` : ''}
    </div>` : ''}

    <!-- Strengths & Weaknesses -->
    ${(strengths.length || weaknesses.length) ? `
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
      ${strengths.length ? `
      <div class="bg-green-50/45 border border-green-100 rounded-xl p-4">
        <div class="flex items-center gap-1.5 mb-2.5 text-green-700 font-bold text-[10.5px] uppercase tracking-wider">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
          Key Strengths
        </div>
        <ul class="space-y-1.5">
          ${strengths.map(s => `<li class="flex items-start gap-1.5 text-[12px] text-gray-700 font-medium"><span class="text-green-600 font-bold shrink-0">✓</span>${escapeHtml(s)}</li>`).join('')}
        </ul>
      </div>` : ''}
      ${weaknesses.length ? `
      <div class="bg-red-50/45 border border-red-100 rounded-xl p-4">
        <div class="flex items-center gap-1.5 mb-2.5 text-red-700 font-bold text-[10.5px] uppercase tracking-wider">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
          Areas to Improve
        </div>
        <ul class="space-y-1.5">
          ${weaknesses.map(w => `<li class="flex items-start gap-1.5 text-[12px] text-gray-700 font-medium"><span class="text-red-500 font-bold shrink-0">✗</span>${escapeHtml(w)}</li>`).join('')}
        </ul>
      </div>` : ''}
    </div>` : ''}

    <!-- Improvement Roadmap -->
    ${improvements.length ? `
    <div class="bg-blue-50/40 border border-blue-100 rounded-xl p-4 mb-5">
      <div class="flex items-center gap-1.5 mb-2.5 text-blue-700 font-bold text-[10.5px] uppercase tracking-wider">
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>
        Improvement Roadmap
      </div>
      <ul class="space-y-2">
        ${improvements.map((imp, i) => `<li class="flex items-start gap-2 text-[12.5px] text-blue-900 font-medium"><span class="w-5 h-5 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">${i+1}</span>${escapeHtml(imp)}</li>`).join('')}
      </ul>
    </div>` : ''}

    <!-- Question-by-Question Analysis -->
    ${qReports.length ? `
    <div>
      <h4 class="text-[13px] font-bold text-black mb-3 flex items-center gap-2">
        <svg class="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2"/></svg>
        Question-by-Question Analysis
      </h4>
      <div class="space-y-3">
        ${qReports.map((qr, i) => buildQACard(qr, i)).join('')}
      </div>
    </div>` : `
    <div class="text-center py-8 text-gray-400 text-[13px] font-semibold">No detailed Q&A data available for this session.</div>`}
  `;
}

function buildQACard(qr, i) {
  const score = typeof qr.score === 'number' ? qr.score : parseFloat(qr.score) || 0;
  const scoreColor = score >= 8.5 ? '#16a34a' : score >= 7 ? '#65a30d' : score >= 5 ? '#d97706' : '#dc2626';
  const scoreBg = score >= 8.5
    ? 'bg-green-50 border-green-200 text-green-700'
    : score >= 7 ? 'bg-lime-50 border-lime-200 text-lime-700'
    : score >= 5 ? 'bg-amber-50 border-amber-200 text-amber-700'
    : 'bg-red-50 border-red-200 text-red-700';
  const scoreLabel = score >= 8.5 ? 'Excellent' : score >= 7 ? 'Good' : score >= 5 ? 'Average' : score >= 3 ? 'Poor' : 'Very Poor';

  return `
    <div class="border border-gray-100 rounded-xl p-4 bg-white">
      <div class="flex justify-between items-start gap-3 mb-3">
        <div class="flex items-start gap-2 flex-1 min-w-0">
          <span class="w-6 h-6 bg-gray-100 text-gray-600 rounded-lg flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5">Q${i+1}</span>
          <p class="text-[13px] font-bold text-black leading-snug">${escapeHtml(qr.question || '')}</p>
        </div>
        <div class="flex flex-col items-end shrink-0 ml-2">
          <span class="text-[20px] font-[800] leading-none" style="color:${scoreColor}">${score.toFixed(1)}</span>
          <span class="text-[9px] font-bold text-gray-400 uppercase tracking-wide">/10</span>
          <span class="text-[10px] font-bold mt-1 px-2 py-0.5 rounded-full border ${scoreBg}">${scoreLabel}</span>
        </div>
      </div>
      <div class="w-full h-1.5 bg-gray-100 rounded-full mb-3 overflow-hidden">
        <div class="h-full rounded-full" style="width:${score*10}%;background:${scoreColor}"></div>
      </div>
      <div class="bg-gray-50/80 rounded-xl p-3 mb-2.5 border border-gray-100">
        <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Your Answer</p>
        <p class="text-[12.5px] text-gray-700 leading-relaxed">${escapeHtml(qr.answer || '(No answer provided)')}</p>
      </div>
      <div class="flex items-start gap-2 bg-blue-50/60 rounded-xl p-3 border border-blue-100">
        <svg class="w-4 h-4 text-blue-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        <p class="text-[12px] text-blue-800 font-medium leading-relaxed">${escapeHtml(qr.feedback || '—')}</p>
      </div>
    </div>`;
}

function fullBar(label, value) {
  const v = value ?? 0;
  const color = v >= 75 ? '#22C55E' : v >= 55 ? '#F59E0B' : '#EF4444';
  return `
    <div class="bg-gray-50 border border-black/5 rounded-xl p-3.5">
      <div class="flex justify-between text-[11.5px] font-bold text-black mb-2">
        <span>${label}</span><span style="color:${color}">${v}%</span>
      </div>
      <div class="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div class="h-full rounded-full" style="width:${v}%;background:${color}"></div>
      </div>
    </div>`;
}

// ─── PDF Generation ────────────────────────────────────────────────────────
function generatePDF(d) {
  if (!window.jspdf) { alert('PDF library is loading. Please wait a moment.'); return; }
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 18;
  const cw = pageW - margin * 2;
  let y = 0;

  function checkPage(need = 15) { if (y + need > pageH - 18) { doc.addPage(); y = 18; } }

  function sectionHeader(title, r, g, b) {
    checkPage(18);
    doc.setFillColor(r, g, b);
    doc.roundedRect(margin, y, cw, 7.5, 1.5, 1.5, 'F');
    doc.setFontSize(8.5); doc.setFont('helvetica', 'bold'); doc.setTextColor(255, 255, 255);
    doc.text(title.toUpperCase(), margin + 4, y + 5);
    doc.setTextColor(0, 0, 0); y += 12;
  }

  // Header
  doc.setFillColor(22, 163, 74);
  doc.rect(0, 0, pageW, 26, 'F');
  doc.setFontSize(17); doc.setFont('helvetica', 'bold'); doc.setTextColor(255, 255, 255);
  doc.text('InterviewIQ.AI — Evaluation Report', pageW / 2, 11, { align: 'center' });
  doc.setFontSize(8.5); doc.setFont('helvetica', 'normal');
  doc.text(`Generated: ${new Date().toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' })}`, pageW / 2, 20, { align: 'center' });
  doc.setTextColor(0, 0, 0); y = 34;

  // Candidate info
  doc.setFontSize(9.5); doc.setFont('helvetica', 'bold');
  doc.text('Candidate:', margin, y); doc.setFont('helvetica', 'normal'); doc.text(d.candidateName || '—', margin + 25, y);
  doc.setFont('helvetica', 'bold'); doc.text('Role:', margin + 95, y); doc.setFont('helvetica', 'normal'); doc.text(d.role || '—', margin + 108, y);
  y += 7;
  doc.setFont('helvetica', 'bold'); doc.text('Resume:', margin, y); doc.setFont('helvetica', 'normal'); doc.text(d.resumeName || 'No Resume', margin + 25, y);
  doc.setFont('helvetica', 'bold'); doc.text('Type:', margin + 95, y); doc.setFont('helvetica', 'normal'); doc.text(d.interviewType || '—', margin + 108, y);
  y += 7;
  doc.setFont('helvetica', 'bold'); doc.text('Date:', margin, y); doc.setFont('helvetica', 'normal'); doc.text(d.createdAt || '—', margin + 25, y);
  doc.setFont('helvetica', 'bold'); doc.text('Overall:', margin + 95, y);
  doc.setFont('helvetica', 'bold'); doc.setTextColor(22, 163, 74); doc.text(`${d.overallScore ?? '--'}/100`, margin + 111, y); doc.setTextColor(0, 0, 0);
  y += 12;

  // Scores
  sectionHeader('Performance Scores', 30, 41, 59);
  [['Technical Accuracy', d.technicalScore], ['Communication & Flow', d.communicationScore],
   ['Professional Confidence', d.confidenceScore], ['Problem Solving', d.problemSolvingScore],
   ['Overall Score', d.overallScore]].forEach(([lbl, sc]) => {
    checkPage(10);
    doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.text(`${lbl}:`, margin, y);
    doc.setFont('helvetica', 'normal'); doc.text(`${sc ?? '--'}%`, margin + 52, y);
    doc.setFillColor(235, 235, 235); doc.roundedRect(margin + 64, y - 3.5, 83, 4, 1, 1, 'F');
    if (sc != null) {
      const bc = sc >= 75 ? [22,163,74] : sc >= 55 ? [217,119,6] : [220,38,38];
      doc.setFillColor(...bc); doc.roundedRect(margin + 64, y - 3.5, (sc / 100) * 83, 4, 1, 1, 'F');
    }
    y += 8;
  }); y += 4;

  // Skills
  const skills = d.resumeSkills || [];
  if (skills.length) {
    sectionHeader('Skills Extracted', 21, 128, 61);
    doc.setFontSize(9); doc.setFont('helvetica', 'normal');
    const skillLines = doc.splitTextToSize(skills.join(' · '), cw);
    doc.text(skillLines, margin, y); y += skillLines.length * 5 + 6;
  }

  // Projects
  const projects = d.resumeProjects || [];
  if (projects.length) {
    sectionHeader('Projects Found', 37, 99, 235);
    projects.forEach(p => { checkPage(8); doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.text(`• ${p}`, margin, y); y += 6; }); y += 3;
  }

  // Strengths
  const strengths = d.strengths || [];
  if (strengths.length) {
    sectionHeader('Key Strengths', 21, 128, 61);
    strengths.forEach(s => { checkPage(8); const ln = doc.splitTextToSize(`✓  ${s}`, cw); doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.text(ln, margin, y); y += ln.length * 5 + 2; }); y += 3;
  }

  // Weaknesses
  const weaknesses = d.weaknesses || [];
  if (weaknesses.length) {
    sectionHeader('Areas to Improve', 185, 28, 28);
    weaknesses.forEach(w => { checkPage(8); const ln = doc.splitTextToSize(`✗  ${w}`, cw); doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.text(ln, margin, y); y += ln.length * 5 + 2; }); y += 3;
  }

  // Roadmap
  const imps = d.improvements || [];
  if (imps.length) {
    sectionHeader('Improvement Roadmap', 37, 99, 235);
    imps.forEach((imp, i) => { checkPage(8); const ln = doc.splitTextToSize(`${i+1}.  ${imp}`, cw); doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.text(ln, margin, y); y += ln.length * 5 + 2; }); y += 5;
  }

  // Q&A
  const qr = d.questionReports || [];
  if (qr.length) {
    sectionHeader('Question-by-Question Analysis', 30, 41, 59);
    qr.forEach((q, i) => {
      const sc = typeof q.score === 'number' ? q.score : parseFloat(q.score) || 0;
      checkPage(45);
      doc.setFontSize(10); doc.setFont('helvetica', 'bold'); doc.text(`Question ${i + 1}`, margin, y);
      const bc = sc >= 8.5 ? [22,163,74] : sc >= 7 ? [101,163,13] : sc >= 5 ? [217,119,6] : [220,38,38];
      doc.setFillColor(...bc); doc.roundedRect(pageW - margin - 18, y - 5, 18, 6.5, 1.5, 1.5, 'F');
      doc.setFontSize(8); doc.setFont('helvetica', 'bold'); doc.setTextColor(255,255,255);
      doc.text(`${sc.toFixed(1)}/10`, pageW - margin - 9, y - 0.5, { align: 'center' }); doc.setTextColor(0,0,0); y += 5;
      const qLines = doc.splitTextToSize(q.question || '', cw); doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.text(qLines, margin, y); y += qLines.length * 5 + 4;
      checkPage(15);
      doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.setTextColor(100,100,100); doc.text('YOUR ANSWER:', margin, y); y += 5;
      doc.setFont('helvetica', 'normal'); doc.setTextColor(0,0,0);
      const aLines = doc.splitTextToSize(q.answer || '(No answer)', cw).slice(0, 6); doc.text(aLines, margin, y); y += aLines.length * 5 + 4;
      checkPage(10);
      doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.setTextColor(37,99,235); doc.text('AI FEEDBACK:', margin, y); y += 5;
      doc.setFont('helvetica', 'normal'); doc.setTextColor(30,64,175);
      const fLines = doc.splitTextToSize(q.feedback || '', cw); doc.text(fLines, margin, y); doc.setTextColor(0,0,0); y += fLines.length * 5 + 8;
      if (i < qr.length - 1) { doc.setDrawColor(220,220,220); doc.line(margin, y - 3, pageW - margin, y - 3); }
    });
  }

  // Footers
  const total = doc.getNumberOfPages();
  for (let p = 1; p <= total; p++) {
    doc.setPage(p);
    doc.setFontSize(7.5); doc.setFont('helvetica', 'normal'); doc.setTextColor(160,160,160);
    doc.text('InterviewIQ.AI — AI-Powered Interview Preparation', pageW / 2, pageH - 7, { align: 'center' });
    doc.text(`Page ${p} / ${total}`, pageW - margin, pageH - 7, { align: 'right' });
  }

  const safe = (d.candidateName || 'Report').replace(/[^a-zA-Z0-9]/g, '_');
  doc.save(`InterviewIQ_${safe}_${new Date().toISOString().split('T')[0]}.pdf`);
}

// ─── Utilities ─────────────────────────────────────────────────────────────
function getStatusInfo(status) {
  if (status === 'COMPLETED')  return { statusClass: 'status-completed',  statusIcon: '✅', statusLabel: 'Completed' };
  if (status === 'FAILED')     return { statusClass: 'status-failed',     statusIcon: '❌', statusLabel: 'Failed' };
  return                              { statusClass: 'status-incomplete', statusIcon: '⚠', statusLabel: 'Incomplete' };
}

function formatInterviewType(t) {
  const map = { technical: 'Technical Interview', hr: 'HR Interview', behavioral: 'Behavioral Interview', resume: 'Resume-Based Interview' };
  return map[t] || t || 'Interview';
}

function escapeHtml(str) {
  return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

async function loadHistoryCredits() {
  // Decode role and show Admin Panel link in Navbar if ADMIN
  try {
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.role === 'ADMIN' || (payload.picture && payload.picture.includes('admin')) || payload.sub === 'admin@interviewiq.ai') {
        const adminPanelLink = document.getElementById('admin-panel-link');
        if (adminPanelLink) {
          adminPanelLink.classList.remove('hidden');
        }
      }
    }
  } catch (e) {
    console.error('Failed to parse token payload in history page:', e);
  }

  const creditsSpan = document.getElementById('nav-credits');
  if (!creditsSpan) return;
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/credits`, { headers: authHeaders });
    if (response.ok) {
      const data = await response.json();
      creditsSpan.textContent = `${data.credits}`;
    }
  } catch (err) {
    console.error('Failed to load history page credits:', err);
    creditsSpan.textContent = '--';
  }
}

// ─── Boot ──────────────────────────────────────────────────────────────────
loadHistoryCredits();
loadHistory();