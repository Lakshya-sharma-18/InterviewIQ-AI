const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
import './style.css';

// 1. Authentication Gate
if (!localStorage.getItem('jwtToken')) {
  console.warn('Unauthorized access attempt to Interview Setup. Redirecting to login...');
  window.location.href = '/login.html';
}

const token = localStorage.getItem('jwtToken');
const authHeaders = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

const navCreditsDisplay = document.getElementById('nav-credits');
const insufficientModal = document.getElementById('insufficient-credits-modal');
const insufficientCloseBtn = document.getElementById('insufficient-close-btn');

if (insufficientCloseBtn && insufficientModal) {
  insufficientCloseBtn.addEventListener('click', () => {
    insufficientModal.classList.add('hidden');
  });
}

async function refreshNavbarCredits() {
  if (!navCreditsDisplay) return;
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/credits`, { headers: authHeaders });
    if (response.ok) {
      const data = await response.json();
      navCreditsDisplay.textContent = `${data.credits} Credits`;
    }
  } catch (err) {
    console.error('Failed to load navbar credits:', err);
  }
}

refreshNavbarCredits();

// Global back-to-dashboard handler
window.backToSetup = async function() {
  window.speechSynthesis.cancel();
  if (typeof recognition !== 'undefined' && recognition) {
    try { recognition.stop(); } catch(e) {}
  }
  
  // If an interview was started but not finished/evaluated, mark it as INCOMPLETE on early exit
  if (state.historyId && state.currentQuestionIndex < 5 && state.scores.overall === 0) {
    try {
      await fetch(`${API_BASE_URL}/api/auth/history/incomplete`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          historyId: state.historyId,
          answers: state.userAnswers
        })
      });
    } catch (err) {
      console.error('Failed to mark interview as incomplete:', err);
    }
  }
  window.location.href = '/';
};

// ─── 2. Global State ───────────────────────────────────────────────────────
let state = {
  candidateName: 'Candidate',
  candidateEmail: '',
  extractedSkills: [],
  extractedProjects: [],
  selectedRole: 'Software Engineer',
  selectedInterviewType: 'resume',
  questions: [],
  currentQuestionIndex: 0,
  userAnswers: [],
  scores: { technical: 0, communication: 0, confidence: 0, problemSolving: 0, overall: 0 },
  strengths: [],
  weaknesses: [],
  improvements: [],
  questionReports: [],
  historyId: null,
  resumeName: 'No Resume'
};

// ─── 3. Resume Upload & AI Analysis ────────────────────────────────────────
const dropzone = document.getElementById('dropzone');
const resumeInput = document.getElementById('resume');
const uploadText = document.getElementById('upload-text');
const fileNameDisplay = document.getElementById('file-name');
const analyzeLoader = document.getElementById('analyze-loader');
const setupFormContainer = document.getElementById('setup-form-container');
const analysisResultContainer = document.getElementById('analysis-result-container');

dropzone.addEventListener('click', () => resumeInput.click());

resumeInput.addEventListener('change', (e) => handleFileSelection(e.target.files));

dropzone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropzone.classList.add('border-[#22C55E]', 'bg-[#E8F8F0]/30');
});
dropzone.addEventListener('dragleave', () => {
  dropzone.classList.remove('border-[#22C55E]', 'bg-[#E8F8F0]/30');
});
dropzone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropzone.classList.remove('border-[#22C55E]', 'bg-[#E8F8F0]/30');
  if (e.dataTransfer.files.length > 0) {
    resumeInput.files = e.dataTransfer.files;
    handleFileSelection(e.dataTransfer.files);
  }
});

function handleFileSelection(files) {
  if (files.length > 0) {
    const file = files[0];
    uploadText.textContent = 'Resume uploaded successfully!';
    uploadText.className = 'text-[13px] font-bold text-[#22C55E]';
    fileNameDisplay.textContent = `${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
    fileNameDisplay.className = 'text-[11px] text-gray-500 mt-1 font-semibold';
    state.resumeName = file.name;
    analyzeResumeFile(file);
  }
}

async function analyzeResumeFile(file) {
  analyzeLoader.classList.remove('hidden');
  const formData = new FormData();
  formData.append('file', file);
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/parse-resume`, {
      method: 'POST', body: formData
    });
    const responseText = await response.text();
    if (!response.ok) {
      let errMsg = 'Resume parsing failed';
      try { errMsg = JSON.parse(responseText).error || errMsg; } catch(e) {}
      throw new Error(errMsg);
    }
    let parsedData;
    try { parsedData = JSON.parse(responseText); }
    catch(e) { throw new Error('Invalid server response format.'); }

    state.candidateName = parsedData.name || 'Candidate';
    state.candidateEmail = parsedData.email || '';
    state.extractedSkills = Array.isArray(parsedData.skills) ? parsedData.skills : [];
    state.extractedProjects = Array.isArray(parsedData.projects) ? parsedData.projects : [];

    if (state.extractedSkills.length === 0 && state.extractedProjects.length === 0) {
      throw new Error('Resume parsing failed: No projects or skills detected.');
    }
    analyzeLoader.classList.add('hidden');
    renderAnalysisResults();
  } catch (err) {
    analyzeLoader.classList.add('hidden');
    alert(err.message || 'Resume parsing failed');
    resetDashboard();
  }
}

function renderAnalysisResults() {
  document.getElementById('extracted-name').textContent = state.candidateName;
  document.getElementById('extracted-email').textContent = state.candidateEmail;

  const skillsContainer = document.getElementById('extracted-skills');
  skillsContainer.innerHTML = '';
  state.extractedSkills.forEach(skill => {
    const pill = document.createElement('span');
    pill.className = 'bg-[#E8F8F0] text-[#22C55E] px-2.5 py-1 rounded-lg text-[11px] font-bold border border-[#22C55E]/10';
    pill.textContent = skill;
    skillsContainer.appendChild(pill);
  });

  const projectsContainer = document.getElementById('extracted-projects');
  projectsContainer.innerHTML = '';
  state.extractedProjects.forEach(proj => {
    const bullet = document.createElement('li');
    bullet.textContent = proj;
    projectsContainer.appendChild(bullet);
  });

  const roleSelect = document.getElementById('detected-role');
  roleSelect.innerHTML = '';
  const lowercaseSkills = state.extractedSkills.map(s => s.toLowerCase());
  const hasFrontend = lowercaseSkills.some(s => ['react','vue','angular','html','css','javascript'].includes(s));
  const hasBackend = lowercaseSkills.some(s => ['node.js','express','spring boot','java','python','sql','mongodb'].includes(s));
  let suggestedRoles = hasFrontend && hasBackend
    ? ['Full Stack Developer', 'Software Engineer', 'Backend Developer', 'Frontend Developer']
    : hasFrontend
      ? ['Frontend Developer', 'Software Engineer', 'React Developer']
      : hasBackend
        ? ['Backend Developer', 'Software Engineer', 'Java Spring Developer']
        : ['Software Engineer', 'Full Stack Developer', 'AI Developer'];

  suggestedRoles.forEach(role => {
    const opt = document.createElement('option');
    opt.value = role; opt.textContent = role;
    roleSelect.appendChild(opt);
  });

  setupFormContainer.classList.add('hidden');
  analysisResultContainer.classList.remove('hidden');
}

// ─── 4. Form Submissions ────────────────────────────────────────────────────
document.getElementById('setup-form').addEventListener('submit', (e) => {
  e.preventDefault();
  state.candidateName = 'Candidate';
  state.extractedSkills = ['JavaScript', 'Node.js', 'React', 'SQL'];
  state.extractedProjects = ['Web Application', 'REST API'];
  state.selectedRole = document.getElementById('role').value.trim() || 'Software Engineer';
  state.selectedInterviewType = document.getElementById('interviewType').value;
  startInterviewProcess();
});

document.getElementById('analysis-next-form').addEventListener('submit', (e) => {
  e.preventDefault();
  state.selectedRole = document.getElementById('detected-role').value;
  state.selectedInterviewType = document.getElementById('detected-type').value;
  startInterviewProcess();
});

async function startInterviewProcess() {
  generateAIQuestions();

  // Create an INCOMPLETE history record on setup submit
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/history/start`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        candidateName: state.candidateName,
        resumeName: state.resumeName || 'No Resume',
        role: state.selectedRole,
        interviewType: state.selectedInterviewType,
        skills: state.extractedSkills,
        projects: state.extractedProjects,
        questions: state.questions
      })
    });
    if (response.status === 402 || response.status === 403) {
      insufficientModal.classList.remove('hidden');
      return;
    }
    if (response.ok) {
      const data = await response.json();
      state.historyId = data.historyId;
      console.log('Interview history record created: historyId =', state.historyId);
      refreshNavbarCredits();
    } else {
      const data = await response.json().catch(() => ({}));
      if (data.error && data.error.includes("Insufficient credits")) {
        insufficientModal.classList.remove('hidden');
        return;
      }
      console.error('Failed to create interview history record');
    }
  } catch (err) {
    console.error('Failed to create interview history record:', err);
  }

  document.getElementById('setup-card').classList.add('hidden');
  document.getElementById('interview-card').classList.remove('hidden');
  state.currentQuestionIndex = 0;
  state.userAnswers = [];
  askQuestion(0);
}

// ─── 5. Question Generator ──────────────────────────────────────────────────
function generateAIQuestions() {
  const p1 = state.extractedProjects[0] || 'your core project';
  const p2 = state.extractedProjects[1] || 'your portfolio project';
  const s1 = state.extractedSkills[0] || 'JavaScript';
  const s2 = state.extractedSkills[1] || 'Web API';
  const s3 = state.extractedSkills[2] || 'Databases';

  if (state.selectedInterviewType === 'technical' || state.selectedInterviewType === 'resume') {
    state.questions = [
      `Explain the technical architecture of your "${p1}" project. What were the key design decisions and challenges you faced?`,
      `You listed ${s1} in your resume. Can you walk me through how you used it in a real project and handle complex scenarios with it?`,
      `For your "${p2}" project, explain the backend technology choices. Why did you pick those over alternatives?`,
      `How do you approach database schema design and optimization? When would you pick SQL vs NoSQL for a ${state.selectedRole} project using ${s3}?`,
      `As a ${state.selectedRole}, describe how you would secure and scale an API in a system like "${p1}". What specific strategies would you apply?`
    ];
  } else if (state.selectedInterviewType === 'hr') {
    state.questions = [
      `Tell me about yourself. Walk me through your journey as a ${state.selectedRole} and your key achievements in "${p1}".`,
      `What are your top 3 professional strengths? Give specific examples from your work on "${p1}" to support your answer.`,
      `Why should we hire you for this ${state.selectedRole} position over other candidates? What unique value do you bring?`,
      `Describe a significant technical challenge you faced while building "${p2}". How did you overcome it?`,
      `Where do you see yourself in 5 years? How does this ${state.selectedRole} role align with your long-term career plan?`
    ];
  } else {
    state.questions = [
      `Tell me about a time you had to learn ${s1} quickly for a project. Walk me through exactly how you approached it.`,
      `Describe a time you disagreed with a team member about a technical decision in "${p1}". What happened and how did you resolve it?`,
      `Tell me about a time you worked under a tight deadline to deliver a major feature in "${p2}". How did you manage it?`,
      `Describe a situation where requirements changed midway through development. How did you adapt your technical approach?`,
      `Tell me about a project that failed or didn't meet expectations. What went wrong and what key lessons did you learn?`
    ];
  }
}

// ─── 6. Active Interview Screen ─────────────────────────────────────────────
const questionText = document.getElementById('question-text');
const answerInput = document.getElementById('answer-input');
const recordBtn = document.getElementById('record-btn');
const recordBtnText = document.getElementById('record-btn-text');
const recordDot = document.getElementById('record-dot');
const progressLabel = document.getElementById('question-progress-label');
const statusLabel = document.getElementById('interview-status-label');
const progressBarFill = document.getElementById('progress-bar-fill');
const waveformContainer = document.getElementById('waveform-container');
const waveformDesc = document.getElementById('waveform-description');
const processingOverlay = document.getElementById('processing-overlay');

let speechUtterance = null;
let recognition = null;
let isRecording = false;

function askQuestion(index) {
  const currentQ = state.questions[index];
  progressLabel.textContent = `QUESTION ${index + 1} OF 5`;
  progressBarFill.style.width = `${(index + 1) * 20}%`;
  questionText.textContent = currentQ;
  answerInput.value = '';
  window.speechSynthesis.cancel();
  if (recognition) try { recognition.stop(); } catch(e) {}
  setAiSpeakingState(true);
  speechUtterance = new SpeechSynthesisUtterance(currentQ);
  const voices = window.speechSynthesis.getVoices();
  const enVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural')));
  if (enVoice) speechUtterance.voice = enVoice;
  speechUtterance.onend = () => { setAiSpeakingState(false); answerInput.focus(); };
  window.speechSynthesis.speak(speechUtterance);
}

function setAiSpeakingState(isSpeaking) {
  if (isSpeaking) {
    statusLabel.textContent = 'AI SPEAKING';
    statusLabel.className = 'text-[#22C55E] tracking-wider uppercase';
    waveformContainer.classList.remove('hidden');
    waveformDesc.textContent = 'Assistant is speaking';
    waveformDesc.className = 'text-[11.5px] font-bold text-[#22C55E] uppercase tracking-widest';
    document.getElementById('voice-avatar').classList.add('animate-pulse-glow');
    recordBtn.disabled = true;
    recordBtn.classList.add('opacity-50', 'cursor-not-allowed');
  } else {
    statusLabel.textContent = 'WAITING FOR ANSWER';
    statusLabel.className = 'text-gray-400 tracking-wider uppercase';
    waveformContainer.classList.add('hidden');
    waveformDesc.textContent = 'Ready to record voice or type';
    waveformDesc.className = 'text-[11px] font-semibold text-gray-400 uppercase tracking-wide';
    document.getElementById('voice-avatar').classList.remove('animate-pulse-glow');
    recordBtn.disabled = false;
    recordBtn.classList.remove('opacity-50', 'cursor-not-allowed');
  }
}

if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = 'en-US';
  recognition.onstart = () => {
    isRecording = true;
    recordBtnText.textContent = 'Stop Recording';
    recordDot.classList.remove('hidden');
    recordBtn.classList.add('bg-red-50', 'border-red-200');
    statusLabel.textContent = 'LISTENING';
    statusLabel.className = 'text-red-500 tracking-wider uppercase animate-pulse';
    waveformContainer.classList.remove('hidden');
    waveformDesc.textContent = 'Listening to your answer...';
    waveformDesc.className = 'text-[11.5px] font-bold text-red-500 uppercase tracking-widest';
  };
  recognition.onresult = (event) => {
    let finalTranscript = '';
    for (let i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) finalTranscript += event.results[i][0].transcript;
    }
    if (finalTranscript) answerInput.value += (answerInput.value ? ' ' : '') + finalTranscript;
  };
  recognition.onerror = () => stopRecording();
  recognition.onend = () => stopRecording();
}

function stopRecording() {
  isRecording = false;
  recordBtnText.textContent = 'Record Voice';
  recordDot.classList.add('hidden');
  recordBtn.classList.remove('bg-red-50', 'border-red-200');
  setAiSpeakingState(false);
}

recordBtn.addEventListener('click', () => {
  if (!recognition) { alert('Speech recognition not supported. Please type your answer.'); return; }
  if (isRecording) recognition.stop();
  else { answerInput.value = ''; recognition.start(); }
});

document.getElementById('answer-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const answer = answerInput.value.trim();
  if (!answer) return;
  window.speechSynthesis.cancel();
  if (recognition) try { recognition.stop(); } catch(e) {}
  processingOverlay.classList.remove('hidden');
  const overlayText = processingOverlay.querySelector('p');
  if (overlayText) overlayText.textContent = 'Saving your answer...';
  setTimeout(() => {
    processingOverlay.classList.add('hidden');
    state.userAnswers.push(answer);
    if (state.currentQuestionIndex < 4) {
      state.currentQuestionIndex++;
      askQuestion(state.currentQuestionIndex);
    } else {
      evaluateAnswersAndShowReport();
    }
  }, 800);
});

// ─── 7. Real AI Evaluation via Backend ────────────────────────────────────
async function evaluateAnswersAndShowReport() {
  processingOverlay.classList.remove('hidden');
  const overlayText = processingOverlay.querySelector('p');
  if (overlayText) overlayText.textContent = 'AI is evaluating your interview performance...';

  try {
    console.log('Sending interview to AI for evaluation...');
    const response = await fetch(`${API_BASE_URL}/api/auth/evaluate-interview`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        role: state.selectedRole,
        interviewType: state.selectedInterviewType,
        questions: state.questions,
        answers: state.userAnswers
      })
    });

    const responseText = await response.text();
    console.log('AI Evaluation raw response:', responseText);

    if (!response.ok) {
      throw new Error('Evaluation API error: ' + response.status);
    }

    const evalData = JSON.parse(responseText);

    state.scores = {
      overall: Math.round(evalData.overallScore || 0),
      technical: Math.round(evalData.technicalScore || 0),
      communication: Math.round(evalData.communicationScore || 0),
      confidence: Math.round(evalData.confidenceScore || 0),
      problemSolving: Math.round(evalData.problemSolvingScore || 0)
    };
    state.strengths = Array.isArray(evalData.strengths) ? evalData.strengths : [];
    state.weaknesses = Array.isArray(evalData.weaknesses) ? evalData.weaknesses : [];
    state.improvements = Array.isArray(evalData.improvements) ? evalData.improvements : [];
    state.questionReports = Array.isArray(evalData.questionReports) ? evalData.questionReports : [];

    console.log('AI Evaluation complete:', state.scores);

    // Call complete endpoint to save scores and change status to COMPLETED
    if (state.historyId) {
      try {
        await fetch(`${API_BASE_URL}/api/auth/history/complete`, {
          method: 'POST',
          headers: authHeaders,
          body: JSON.stringify({
            historyId: state.historyId,
            overallScore: state.scores.overall,
            technicalScore: state.scores.technical,
            communicationScore: state.scores.communication,
            confidenceScore: state.scores.confidence,
            problemSolvingScore: state.scores.problemSolving,
            answers: state.userAnswers,
            questionReports: state.questionReports,
            strengths: state.strengths,
            weaknesses: state.weaknesses,
            improvements: state.improvements,
            pdfPath: `InterviewIQ_Report_${state.candidateName.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`
          })
        });
        console.log('Interview history updated successfully to COMPLETED');
        refreshNavbarCredits();
      } catch (historyErr) {
        console.error('Failed to complete interview history:', historyErr);
      }
    }

  } catch (err) {
    console.error('AI evaluation failed, using fallback:', err);

    // Report failed status to backend
    if (state.historyId) {
      try {
        await fetch(`${API_BASE_URL}/api/auth/history/failed`, {
          method: 'POST',
          headers: authHeaders,
          body: JSON.stringify({ historyId: state.historyId })
        });
        console.log('Interview history marked as FAILED');
      } catch (failedErr) {
        console.error('Failed to mark interview history as FAILED:', failedErr);
      }
    }

    // Fallback basic scoring when backend is unreachable
    const avgWords = state.userAnswers.reduce((sum, a) => sum + a.split(/\s+/).length, 0) / 5;
    const baseScore = avgWords > 50 ? 72 : avgWords > 25 ? 60 : avgWords > 10 ? 45 : 30;
    state.scores = {
      overall: baseScore,
      technical: baseScore + 3,
      communication: baseScore - 2,
      confidence: baseScore - 5,
      problemSolving: baseScore + 1
    };
    state.strengths = ['Attempted all interview questions', 'Engaged with the interview process'];
    state.weaknesses = ['Could not reach AI evaluation server', 'Scores are estimates only'];
    state.improvements = [
      'Ensure the backend server is running on port 8080',
      'Check your Gemini API key in application.properties',
      'Restart the backend with: .\\gradlew bootRun'
    ];
    state.questionReports = state.questions.map((q, i) => ({
      question: q,
      answer: state.userAnswers[i] || '(no answer)',
      score: 5.0,
      feedback: 'AI evaluation unavailable. Connect to backend server for real scoring.'
    }));
  }

  processingOverlay.classList.add('hidden');
  renderEvaluationReport();
  document.getElementById('interview-card').classList.add('hidden');
  document.getElementById('report-card').classList.remove('hidden');
}

// ─── 8. Render Enhanced Report ─────────────────────────────────────────────
function renderEvaluationReport() {
  // Header metadata
  document.getElementById('report-meta').textContent =
    `ROLE: ${state.selectedRole.toUpperCase()} | TYPE: ${state.selectedInterviewType.toUpperCase()}`;
  document.getElementById('report-candidate-name').textContent = state.candidateName;
  document.getElementById('report-date').textContent =
    new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  // Overall circular gauge
  document.getElementById('report-overall-score').textContent = state.scores.overall;
  const circumference = 339.3;
  const offset = circumference - (state.scores.overall / 100) * circumference;
  setTimeout(() => {
    document.getElementById('report-overall-circle').style.strokeDashoffset = offset;
  }, 100);

  // Sub-score bars
  setScoreBar('report-tech-score', 'report-tech-fill', state.scores.technical);
  setScoreBar('report-comm-score', 'report-comm-fill', state.scores.communication);
  setScoreBar('report-conf-score', 'report-conf-fill', state.scores.confidence);
  setScoreBar('report-ps-score', 'report-ps-fill', state.scores.problemSolving);

  // Strengths
  const strengthsEl = document.getElementById('report-strengths');
  strengthsEl.innerHTML = '';
  state.strengths.forEach(s => {
    const li = document.createElement('li');
    li.className = 'flex items-start gap-1.5';
    li.innerHTML = `<span class="text-green-600 font-bold shrink-0 mt-0.5">✓</span><span>${s}</span>`;
    strengthsEl.appendChild(li);
  });

  // Weaknesses
  const weaknessesEl = document.getElementById('report-weaknesses');
  weaknessesEl.innerHTML = '';
  state.weaknesses.forEach(w => {
    const li = document.createElement('li');
    li.className = 'flex items-start gap-1.5';
    li.innerHTML = `<span class="text-red-500 font-bold shrink-0 mt-0.5">✗</span><span>${w}</span>`;
    weaknessesEl.appendChild(li);
  });

  // Improvement roadmap
  const impEl = document.getElementById('report-improvements');
  impEl.innerHTML = '';
  state.improvements.forEach((imp, i) => {
    const li = document.createElement('li');
    li.className = 'flex items-start gap-2';
    li.innerHTML = `<span class="w-5 h-5 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">${i + 1}</span><span>${imp}</span>`;
    impEl.appendChild(li);
  });

  // Question-by-question analysis cards
  const qrContainer = document.getElementById('question-reports-container');
  qrContainer.innerHTML = '';
  state.questionReports.forEach((qr, i) => {
    const score = typeof qr.score === 'number' ? qr.score : parseFloat(qr.score) || 0;
    const scoreColor = score >= 8.5 ? '#16a34a' : score >= 7 ? '#65a30d' : score >= 5 ? '#d97706' : '#dc2626';
    const scoreBg = score >= 8.5
      ? 'bg-green-50 border-green-200 text-green-700'
      : score >= 7
        ? 'bg-lime-50 border-lime-200 text-lime-700'
        : score >= 5
          ? 'bg-amber-50 border-amber-200 text-amber-700'
          : 'bg-red-50 border-red-200 text-red-700';
    const scoreLabel = score >= 8.5 ? 'Excellent' : score >= 7 ? 'Good' : score >= 5 ? 'Average' : score >= 3 ? 'Poor' : 'Very Poor';

    const card = document.createElement('div');
    card.className = 'border border-gray-100 rounded-xl p-4 bg-white shadow-sm';
    card.innerHTML = `
      <div class="flex justify-between items-start gap-3 mb-3">
        <div class="flex items-start gap-2.5 flex-1 min-w-0">
          <span class="w-6 h-6 bg-gray-100 text-gray-600 rounded-lg flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5">Q${i + 1}</span>
          <p class="text-[13px] font-bold text-black leading-snug">${qr.question}</p>
        </div>
        <div class="flex flex-col items-end shrink-0 ml-2">
          <span class="text-[22px] font-[800] leading-none" style="color:${scoreColor}">${score.toFixed(1)}</span>
          <span class="text-[9px] font-bold text-gray-400 uppercase tracking-wide">/10</span>
          <span class="text-[10px] font-bold mt-1 px-2 py-0.5 rounded-full border ${scoreBg}">${scoreLabel}</span>
        </div>
      </div>
      <div class="w-full h-1.5 bg-gray-100 rounded-full mb-3 overflow-hidden">
        <div class="h-full rounded-full transition-all duration-700" style="width:${score * 10}%;background-color:${scoreColor}"></div>
      </div>
      <div class="bg-gray-50/80 rounded-xl p-3 mb-2.5 border border-gray-100">
        <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Your Answer</p>
        <p class="text-[12.5px] text-gray-700 leading-relaxed">${qr.answer || '(No answer provided)'}</p>
      </div>
      <div class="flex items-start gap-2 bg-blue-50/60 rounded-xl p-3 border border-blue-100">
        <svg class="w-4 h-4 text-blue-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        <p class="text-[12px] text-blue-800 font-medium leading-relaxed">${qr.feedback}</p>
      </div>
    `;
    qrContainer.appendChild(card);
  });
}

function setScoreBar(textId, fillId, value) {
  document.getElementById(textId).textContent = `${value}%`;
  setTimeout(() => {
    document.getElementById(fillId).style.width = `${value}%`;
  }, 200);
}

// ─── 9. PDF Report Generation ──────────────────────────────────────────────
window.downloadPDF = function() {
  if (!window.jspdf) {
    alert('PDF library is still loading. Please wait a moment and try again.');
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 18;
  const contentW = pageW - margin * 2;
  let y = 0;

  function checkPage(needed = 15) {
    if (y + needed > pageH - 18) { doc.addPage(); y = 18; }
  }

  function sectionHeader(title, r, g, b) {
    checkPage(18);
    doc.setFillColor(r, g, b);
    doc.roundedRect(margin, y, contentW, 7.5, 1.5, 1.5, 'F');
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text(title.toUpperCase(), margin + 4, y + 5);
    doc.setTextColor(0, 0, 0);
    y += 12;
  }

  // ── GREEN HEADER BAR ──
  doc.setFillColor(22, 163, 74);
  doc.rect(0, 0, pageW, 26, 'F');
  doc.setFontSize(17);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('InterviewIQ.AI — Evaluation Report', pageW / 2, 11, { align: 'center' });
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated: ${new Date().toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' })}`, pageW / 2, 19, { align: 'center' });
  doc.setTextColor(0, 0, 0);
  y = 34;

  // ── CANDIDATE INFO ──
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.text('Candidate:', margin, y); doc.setFont('helvetica', 'normal'); doc.text(state.candidateName, margin + 24, y);
  doc.setFont('helvetica', 'bold');
  doc.text('Role:', margin + 95, y); doc.setFont('helvetica', 'normal'); doc.text(state.selectedRole, margin + 107, y);
  y += 7;
  doc.setFont('helvetica', 'bold');
  doc.text('Type:', margin, y); doc.setFont('helvetica', 'normal'); doc.text(state.selectedInterviewType, margin + 15, y);
  doc.setFont('helvetica', 'bold');
  doc.text('Overall Score:', margin + 95, y); doc.setFont('helvetica', 'bold');
  doc.setTextColor(22, 163, 74); doc.text(`${state.scores.overall}/100`, margin + 126, y); doc.setTextColor(0, 0, 0);
  y += 12;

  // ── SCORES ──
  sectionHeader('Performance Scores', 30, 41, 59);
  [
    ['Technical Accuracy', state.scores.technical],
    ['Communication & Flow', state.scores.communication],
    ['Professional Confidence', state.scores.confidence],
    ['Problem Solving', state.scores.problemSolving],
    ['Overall Score', state.scores.overall]
  ].forEach(([label, score]) => {
    checkPage(10);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold'); doc.text(`${label}:`, margin, y);
    doc.setFont('helvetica', 'normal'); doc.text(`${score}%`, margin + 50, y);
    doc.setFillColor(235, 235, 235);
    doc.roundedRect(margin + 62, y - 3.5, 85, 4, 1, 1, 'F');
    const sc = score >= 75 ? [22,163,74] : score >= 55 ? [217,119,6] : [220,38,38];
    doc.setFillColor(...sc);
    doc.roundedRect(margin + 62, y - 3.5, (score / 100) * 85, 4, 1, 1, 'F');
    y += 8;
  });
  y += 4;

  // ── STRENGTHS ──
  sectionHeader('Key Strengths', 21, 128, 61);
  state.strengths.forEach(s => {
    checkPage(8);
    doc.setFontSize(9); doc.setFont('helvetica', 'normal');
    const lines = doc.splitTextToSize(`✓  ${s}`, contentW);
    doc.text(lines, margin, y); y += lines.length * 5 + 2;
  });
  y += 3;

  // ── WEAKNESSES ──
  sectionHeader('Areas to Improve', 185, 28, 28);
  state.weaknesses.forEach(w => {
    checkPage(8);
    doc.setFontSize(9); doc.setFont('helvetica', 'normal');
    const lines = doc.splitTextToSize(`✗  ${w}`, contentW);
    doc.text(lines, margin, y); y += lines.length * 5 + 2;
  });
  y += 3;

  // ── ROADMAP ──
  sectionHeader('Improvement Roadmap', 37, 99, 235);
  state.improvements.forEach((imp, i) => {
    checkPage(8);
    doc.setFontSize(9); doc.setFont('helvetica', 'normal');
    const lines = doc.splitTextToSize(`${i + 1}.  ${imp}`, contentW);
    doc.text(lines, margin, y); y += lines.length * 5 + 2;
  });
  y += 5;

  // ── Q&A BREAKDOWN ──
  sectionHeader('Question-by-Question Analysis', 30, 41, 59);
  state.questionReports.forEach((qr, i) => {
    const score = typeof qr.score === 'number' ? qr.score : parseFloat(qr.score) || 0;
    checkPage(45);

    doc.setFontSize(10); doc.setFont('helvetica', 'bold');
    doc.text(`Question ${i + 1}`, margin, y);

    // Score badge
    const sc = score >= 8.5 ? [22,163,74] : score >= 7 ? [101,163,13] : score >= 5 ? [217,119,6] : [220,38,38];
    doc.setFillColor(...sc);
    doc.roundedRect(pageW - margin - 18, y - 5, 18, 6.5, 1.5, 1.5, 'F');
    doc.setFontSize(8); doc.setFont('helvetica', 'bold'); doc.setTextColor(255,255,255);
    doc.text(`${score.toFixed(1)}/10`, pageW - margin - 9, y - 0.5, { align: 'center' });
    doc.setTextColor(0,0,0);
    y += 5;

    doc.setFontSize(9); doc.setFont('helvetica', 'normal');
    const qLines = doc.splitTextToSize(qr.question, contentW);
    doc.text(qLines, margin, y); y += qLines.length * 5 + 4;

    checkPage(20);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.setTextColor(100,100,100);
    doc.text('YOUR ANSWER:', margin, y); y += 5;
    doc.setFont('helvetica', 'normal'); doc.setTextColor(0,0,0);
    const aText = qr.answer || '(No answer provided)';
    const aLines = doc.splitTextToSize(aText, contentW).slice(0, 6);
    doc.text(aLines, margin, y); y += aLines.length * 5 + 4;

    checkPage(15);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.setTextColor(37,99,235);
    doc.text('AI FEEDBACK:', margin, y); y += 5;
    doc.setFont('helvetica', 'normal'); doc.setTextColor(30,64,175);
    const fLines = doc.splitTextToSize(qr.feedback, contentW);
    doc.text(fLines, margin, y); doc.setTextColor(0,0,0);
    y += fLines.length * 5 + 8;

    if (i < state.questionReports.length - 1) {
      checkPage(5);
      doc.setDrawColor(220,220,220);
      doc.line(margin, y - 3, pageW - margin, y - 3);
    }
  });

  // ── FOOTER on every page ──
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFontSize(7.5); doc.setFont('helvetica', 'normal'); doc.setTextColor(160,160,160);
    doc.text('InterviewIQ.AI — AI-Powered Interview Preparation Platform', pageW / 2, pageH - 7, { align: 'center' });
    doc.text(`Page ${p} / ${totalPages}`, pageW - margin, pageH - 7, { align: 'right' });
  }

  const safeName = state.candidateName.replace(/[^a-zA-Z0-9]/g, '_');
  const dateStr = new Date().toISOString().split('T')[0];
  doc.save(`InterviewIQ_Report_${safeName}_${dateStr}.pdf`);
};

// ─── 10. Restart & Navigation ──────────────────────────────────────────────
document.getElementById('restart-btn').addEventListener('click', () => resetDashboard());
document.getElementById('exit-btn').addEventListener('click', () => resetDashboard());

function resetDashboard() {
  window.speechSynthesis.cancel();
  if (recognition) try { recognition.stop(); } catch(e) {}
  resumeInput.value = '';
  fileNameDisplay.textContent = '';
  uploadText.textContent = 'Click to upload resume (Optional)';
  uploadText.className = 'text-[12.5px] font-bold text-black';
  processingOverlay.classList.add('hidden');
  analysisResultContainer.classList.add('hidden');
  document.getElementById('interview-card').classList.add('hidden');
  document.getElementById('report-card').classList.add('hidden');
  setupFormContainer.classList.remove('hidden');
  document.getElementById('setup-card').classList.remove('hidden');
  document.getElementById('role').value = '';
  document.getElementById('experience').value = '';
  state.questionReports = [];
  state.strengths = [];
  state.weaknesses = [];
  state.improvements = [];
  state.userAnswers = [];
  state.questions = [];
}

// ─── 11. Sign Out ──────────────────────────────────────────────────────────
document.getElementById('signout-btn').addEventListener('click', () => {
  window.speechSynthesis.cancel();
  localStorage.removeItem('jwtToken');
  window.location.href = '/login.html';
});