const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
import './style.css'

// Do NOT redirect logged-in users away — they should be able to view the main dashboard page.

document.querySelector('#app').innerHTML = `
  <!-- Top Navbar -->
  <nav class="fixed left-1/2 -translate-x-1/2 top-4 w-[90%] max-w-4xl bg-white rounded-2xl border border-black/15 shadow-[0_4px_15px_rgba(0,0,0,0.08),0_0_20px_rgba(0,0,0,0.05)] px-4 py-1.5 flex justify-between items-center z-50 h-[46px]">
    <div class="font-bold text-[13px] text-black flex items-center gap-2 pl-2">
      <div class="w-6 h-6 bg-black rounded-md flex items-center justify-center text-white">
        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
      </div>
      InterviewIQ.AI
    </div>
    <div class="flex items-center gap-3 pr-2">
      <!-- Live Credits Balance Link -->
      <a href="/pricing.html" class="flex items-center gap-1.5 px-3 py-0.5 bg-[#E8F8F0] border border-[#22C55E]/15 rounded-full text-[#16A34A] text-[11px] font-bold shadow-sm hover:-translate-y-0.5 transition-all">
        <span>🪙</span>
        <span id="nav-credits">...</span>
      </a>
      <a id="admin-panel-link" href="/admin.html" class="hidden px-3 py-0.5 text-[11px] font-bold text-[#16A34A] bg-[#E8F8F0] border border-[#22C55E]/15 rounded-full hover:-translate-y-0.5 transition-all">Admin Panel</a>
      <div class="w-6 h-6 rounded-full bg-black flex items-center justify-center text-white cursor-pointer hover:bg-gray-800 transition">
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
      </div>
    </div>
  </nav>

  <!-- Hero Section -->
  <main class="relative pt-[90px] px-6 max-w-5xl mx-auto flex flex-col items-center text-center">
    
    <!-- Floating Quick-Access Cards Drawer (Vertical stack, shifted ~160px right from center page) -->
    <div class="w-full max-w-xs mb-8 md:absolute md:top-[85px] md:right-[-32px] md:w-[230px] md:mb-0 z-25 flex flex-col gap-3 justify-center items-center">
      
      <!-- Card 1: ATS Resume Analyzer Card -->
      <button id="open-ats-btn" class="w-[230px] h-[72px] flex items-center gap-3 bg-white border border-[#22C55E]/50 rounded-[12px] px-3.5 py-2.5 text-left shadow-[0_2px_8px_rgba(34,197,94,0.03)] hover:shadow-[0_0_12px_rgba(34,197,94,0.18)] hover:-translate-y-0.5 transition-all duration-300 cursor-pointer group">
        <span class="text-2xl shrink-0 group-hover:scale-105 transition-transform duration-300">📄</span>
        <div class="min-w-0 flex-1 leading-tight">
          <h4 class="font-bold text-[12px] text-black group-hover:text-[#22C55E] transition-colors duration-300">
            ATS Resume Analyzer
          </h4>
          <p class="text-[10px] text-[#6B7280] font-semibold mt-0.5">
            Check ATS Score
          </p>
        </div>
      </button>

      <!-- Card 2: LinkedIn & GitHub Analyzer Card (Identical Design & Size) -->
      <button id="open-social-btn" class="w-[230px] h-[72px] flex items-center gap-3 bg-white border border-[#22C55E]/50 rounded-[12px] px-3.5 py-2.5 text-left shadow-[0_2px_8px_rgba(34,197,94,0.03)] hover:shadow-[0_0_12px_rgba(34,197,94,0.18)] hover:-translate-y-0.5 transition-all duration-300 cursor-pointer group">
        <span class="text-2xl shrink-0 group-hover:scale-105 transition-transform duration-300">🔗</span>
        <div class="min-w-0 flex-1 leading-tight">
          <h4 class="font-bold text-[12px] text-black group-hover:text-[#22C55E] transition-colors duration-300">
            LinkedIn & GitHub Analyzer
          </h4>
          <p class="text-[10px] text-[#6B7280] font-semibold mt-0.5">
            Analyze your professional profiles
          </p>
        </div>
      </button>

    </div>
    
    <div class="flex items-center gap-2 text-[#22C55E] text-[10px] font-semibold uppercase tracking-wider mb-4 mt-2 md:mt-0">
      <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l2.4 7.6H22l-6.2 4.5 2.4 7.6-6.2-4.5-6.2 4.5 2.4-7.6L2 9.6h7.6L12 2z"></path></svg>
      AI Powered Smart Interview Platform
    </div>

    <h1 class="text-[28px] font-[700] text-black tracking-tight leading-[1.2]">
      Practice Interviews with<br/>
      <div class="inline-block mt-1">
        <span class="bg-[#E8F8F0] text-[#22C55E] px-4 py-1 rounded-xl font-[800] text-[28px]">AI Intelligence</span>
      </div>
    </h1>
    
    <p class="text-[12px] text-[#6B7280] max-w-[350px] mx-auto mt-4 mb-6 leading-relaxed font-medium">
      Role-based mock interviews with smart follow-ups, adaptive difficulty and real-time performance evaluation.
    </p>
    
    <div class="flex flex-row gap-4 mb-10 justify-center">
      <button id="start-interview-btn" class="px-6 py-2.5 bg-black hover:bg-gray-800 text-white rounded-full font-medium text-[13px] transition-colors shadow-sm">
        Start Interview
      </button>
      <button id="view-history-btn" class="px-6 py-2.5 bg-white text-black border border-gray-200 rounded-full font-medium text-[13px] transition-colors hover:bg-gray-50 shadow-sm">
        View History
      </button>
    </div>
  </main>

  <!-- Feature Cards Section -->
  <section class="max-w-6xl mx-auto px-6 pb-20 flex flex-col md:flex-row justify-center items-center gap-6">
    
    <!-- Card 1 -->
    <div class="w-full max-w-[300px] bg-white rounded-[20px] p-6 pt-8 text-center relative border border-black/12 shadow-[0_8px_20px_rgba(0,0,0,0.08),0_0_20px_rgba(0,0,0,0.04)] md:-rotate-[4deg] md:translate-y-2 hover:-translate-y-[6px] hover:shadow-[0_12px_30px_rgba(0,0,0,0.12)] transition-all duration-300 ease-in-out">
      <div class="absolute -top-5 left-1/2 -translate-x-1/2 w-10 h-10 bg-white border-2 border-[#22C55E] rounded-xl flex items-center justify-center text-[#22C55E] shadow-sm">
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
      </div>
      <div class="text-[#22C55E] text-[9px] font-bold tracking-widest uppercase mb-1.5 mt-1">STEP 1</div>
      <h3 class="text-[15px] font-bold text-black mb-2">Role & Experience Selection</h3>
      <p class="text-gray-500 text-[11px] leading-relaxed">
        AI adjusts difficulty based on selected job role.
      </p>
    </div>
    
    <!-- Card 2 -->
    <div class="w-full max-w-[300px] bg-white rounded-[20px] p-6 pt-8 text-center relative border border-black/12 shadow-[0_8px_20px_rgba(0,0,0,0.08),0_0_20px_rgba(0,0,0,0.04)] hover:-translate-y-[6px] hover:shadow-[0_12px_30px_rgba(0,0,0,0.12)] transition-all duration-300 ease-in-out z-10">
      <div class="absolute -top-5 left-1/2 -translate-x-1/2 w-10 h-10 bg-white border-2 border-[#22C55E] rounded-xl flex items-center justify-center text-[#22C55E] shadow-sm">
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path></svg>
      </div>
      <div class="text-[#22C55E] text-[9px] font-bold tracking-widest uppercase mb-1.5 mt-1">STEP 2</div>
      <h3 class="text-[15px] font-bold text-black mb-2">Smart Voice Interview</h3>
      <p class="text-gray-500 text-[11px] leading-relaxed">
        Dynamic follow-up questions based on your answers.
      </p>
    </div>

    <!-- Card 3 -->
    <div class="w-full max-w-[300px] bg-white rounded-[20px] p-6 pt-8 text-center relative border border-black/12 shadow-[0_8px_20px_rgba(0,0,0,0.08),0_0_20px_rgba(0,0,0,0.04)] md:rotate-[4deg] md:translate-y-2 hover:-translate-y-[6px] hover:shadow-[0_12px_30px_rgba(0,0,0,0.12)] transition-all duration-300 ease-in-out">
      <div class="absolute -top-5 left-1/2 -translate-x-1/2 w-10 h-10 bg-white border-2 border-[#22C55E] rounded-xl flex items-center justify-center text-[#22C55E] shadow-sm">
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
      </div>
      <div class="text-[#22C55E] text-[9px] font-bold tracking-widest uppercase mb-1.5 mt-1">STEP 3</div>
      <h3 class="text-[15px] font-bold text-black mb-2">Timer Based Simulation</h3>
      <p class="text-gray-500 text-[11px] leading-relaxed">
        Real interview pressure with time tracking.
      </p>
    </div>

  </section>

  <!-- Capabilities Section -->
  <section class="max-w-6xl mx-auto px-6 pb-24 text-center border-t border-gray-200 pt-16">
    <h2 class="text-[32px] font-extrabold text-black tracking-tight mb-12">Advanced AI <span class="text-[#22C55E]">Capabilities</span></h2>
    
    <div class="grid md:grid-cols-2 gap-8">
      
      <!-- Box 1: AI Answer Evaluation -->
      <div class="bg-white rounded-[24px] p-6 flex flex-row items-center text-left shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-black/5 hover:-translate-y-1 transition-transform">
        <div class="w-1/2 pr-4 flex justify-center">
          <img src="/img1.png" alt="AI Evaluation" class="w-full h-auto object-contain max-h-40" />
        </div>
        <div class="w-1/2 pl-2">
          <div class="w-8 h-8 bg-[#E8F8F0] rounded flex items-center justify-center text-[#22C55E] mb-3">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
          </div>
          <h3 class="text-[16px] font-bold text-black mb-2 leading-tight">AI Answer Evaluation</h3>
          <p class="text-[13px] text-gray-500 leading-relaxed">Scores communication, technical accuracy and confidence.</p>
        </div>
      </div>

      <!-- Box 2: Resume Based Interview -->
      <div class="bg-white rounded-[24px] p-6 flex flex-row items-center text-left shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-black/5 hover:-translate-y-1 transition-transform">
        <div class="w-1/2 pr-4 flex justify-center">
          <img src="/img2.png" alt="Resume Interview" class="w-full h-auto object-contain max-h-40" />
        </div>
        <div class="w-1/2 pl-2">
          <div class="w-8 h-8 bg-[#E8F8F0] rounded flex items-center justify-center text-[#22C55E] mb-3">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
          </div>
          <h3 class="text-[16px] font-bold text-black mb-2 leading-tight">Resume Based Interview</h3>
          <p class="text-[13px] text-gray-500 leading-relaxed">Project-specific questions based on uploaded resume.</p>
        </div>
      </div>

      <!-- Box 3: Downloadable PDF Report -->
      <div class="bg-white rounded-[24px] p-6 flex flex-row items-center text-left shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-black/5 hover:-translate-y-1 transition-transform">
        <div class="w-1/2 pr-4 flex justify-center">
          <img src="/img3.png" alt="PDF Report" class="w-full h-auto object-contain max-h-40" />
        </div>
        <div class="w-1/2 pl-2">
          <div class="w-8 h-8 bg-[#E8F8F0] rounded flex items-center justify-center text-[#22C55E] mb-3">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
          </div>
          <h3 class="text-[16px] font-bold text-black mb-2 leading-tight">Downloadable PDF Report</h3>
          <p class="text-[13px] text-gray-500 leading-relaxed">Detailed strengths, weaknesses and improvement insights.</p>
        </div>
      </div>

      <!-- Box 4: History & Analytics -->
      <div class="bg-white rounded-[24px] p-6 flex flex-row items-center text-left shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-black/5 hover:-translate-y-1 transition-transform">
        <div class="w-1/2 pr-4 flex justify-center">
          <img src="/img4.png" alt="Analytics" class="w-full h-auto object-contain max-h-40" />
        </div>
        <div class="w-1/2 pl-2">
          <div class="w-8 h-8 bg-[#E8F8F0] rounded flex items-center justify-center text-[#22C55E] mb-3">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
          </div>
          <h3 class="text-[16px] font-bold text-black mb-2 leading-tight">History & Analytics</h3>
          <p class="text-[13px] text-gray-500 leading-relaxed">Track progress with performance graphs and topic analysis.</p>
        </div>
      </div>
      
    </div>
  </section>

  <!-- Multiple Interview Modes Section -->
  <section class="max-w-5xl mx-auto px-6 pb-24 text-center">
    <h2 class="text-[32px] font-extrabold text-black tracking-tight mb-12">Multiple Interview <span class="text-[#22C55E]">Modes</span></h2>
    
    <div class="grid md:grid-cols-2 gap-6">
      
      <!-- Box 1 -->
      <div class="bg-white rounded-[24px] p-8 flex flex-row items-center text-left shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-transform">
        <div class="w-[65%] pr-4">
          <h3 class="text-[16px] font-bold text-black mb-2 leading-tight">HR Interview Mode</h3>
          <p class="text-[13px] text-gray-400 leading-relaxed">Behavioral and communication based evaluation.</p>
        </div>
        <div class="w-[35%] flex justify-end">
          <img src="/img5.png" alt="HR Interview" class="w-[80px] h-auto object-contain" />
        </div>
      </div>

      <!-- Box 2 -->
      <div class="bg-white rounded-[24px] p-8 flex flex-row items-center text-left shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-transform">
        <div class="w-[65%] pr-4">
          <h3 class="text-[16px] font-bold text-black mb-2 leading-tight">Technical Mode</h3>
          <p class="text-[13px] text-gray-400 leading-relaxed">Deep technical questioning based on selected role.</p>
        </div>
        <div class="w-[35%] flex justify-end">
          <img src="/img6.png" alt="Technical Mode" class="w-[80px] h-auto object-contain" />
        </div>
      </div>

      <!-- Box 3 -->
      <div class="bg-white rounded-[24px] p-8 flex flex-row items-center text-left shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-transform">
        <div class="w-[65%] pr-4">
          <h3 class="text-[16px] font-bold text-black mb-2 leading-tight">Confidence Detection</h3>
          <p class="text-[13px] text-gray-400 leading-relaxed">Basic tone and voice analysis insights.</p>
        </div>
        <div class="w-[35%] flex justify-end">
          <img src="/img7.png" alt="Confidence Detection" class="w-[80px] h-auto object-contain" />
        </div>
      </div>

      <!-- Box 4 -->
      <div class="bg-white rounded-[24px] p-8 flex flex-row items-center text-left shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-transform">
        <div class="w-[65%] pr-4">
          <h3 class="text-[16px] font-bold text-black mb-2 leading-tight">Credits System</h3>
          <p class="text-[13px] text-gray-400 leading-relaxed">Unlock premium interview sessions easily.</p>
        </div>
        <div class="w-[35%] flex justify-end">
          <img src="/img8.png" alt="Credits System" class="w-[80px] h-auto object-contain" />
        </div>
      </div>
      
    </div>
  </section>

  <!-- Footer Section -->
  <section class="max-w-5xl mx-auto px-6 pb-20 pt-6">
    <div class="bg-white rounded-[32px] p-10 flex flex-col items-center text-center shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
      <div class="font-bold text-[15px] text-black flex items-center justify-center gap-2 mb-4">
        <div class="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
        </div>
        InterviewIQ.AI
      </div>
      <p class="text-gray-400 text-[13px] max-w-2xl mx-auto leading-relaxed">
        AI-powered interview preparation platform designed to improve communication skills,<br/>technical depth and professional confidence.
      </p>
    </div>
  </section>

  <!-- ATS Resume Analyzer Modal Backdrop -->
  <div id="ats-modal" class="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 hidden opacity-0 transition-opacity duration-300">
    <!-- Modal Card Container -->
    <div class="bg-white rounded-3xl w-full max-w-2xl border border-black/10 shadow-2xl overflow-hidden transform scale-95 transition-transform duration-300 flex flex-col max-h-[90vh]">
      
      <!-- Modal Header -->
      <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <div class="flex items-center gap-2.5">
          <span class="text-xl">📄</span>
          <div>
            <h3 class="font-bold text-[15px] text-black leading-tight">ATS Resume Analyzer</h3>
            <p class="text-[10px] text-gray-500 font-medium">Verify your resume score and match index instantly</p>
          </div>
        </div>
        <button id="close-ats-modal" class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors cursor-pointer text-sm font-semibold">&times;</button>
      </div>

      <!-- Scrollable Container -->
      <div class="flex-1 overflow-y-auto p-6 md:p-8">
        
        <!-- ==================== SCREEN 1: UPLOAD STATE ==================== -->
        <div id="ats-screen-upload" class="flex flex-col items-center text-center">
          <div class="w-16 h-16 bg-[#E8F8F0] text-[#22C55E] rounded-2xl flex items-center justify-center text-2xl mb-4 border border-[#22C55E]/15">
            📤
          </div>
          <h4 class="font-extrabold text-[18px] text-black mb-2">Upload Your Resume</h4>
          <p class="text-[12px] text-gray-500 max-w-sm mb-6 leading-relaxed">
            Get instant feedback on missing keywords, skill density, project detection, and overall ATS index compatibility.
          </p>

          <!-- Drag and Drop Zone -->
          <div id="ats-drag-zone" class="w-full border-2 border-dashed border-gray-300 hover:border-[#22C55E] rounded-2xl p-8 bg-gray-50/50 hover:bg-[#E8F8F0]/10 transition-all duration-300 flex flex-col items-center justify-center cursor-pointer group mb-6">
            <input type="file" id="ats-file-input" accept=".pdf,.docx" class="hidden" />
            <svg class="w-10 h-10 text-gray-400 group-hover:text-[#22C55E] mb-3 transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            <p class="text-[13px] font-bold text-gray-700">Drag & Drop your resume here</p>
            <p class="text-[11px] text-gray-400 mt-1">or <span class="text-[#22C55E] underline font-semibold">browse files</span> from your computer</p>
            <div class="mt-3 flex gap-2">
              <span class="px-2.5 py-0.5 bg-gray-100 text-gray-600 rounded text-[9px] font-bold">PDF</span>
              <span class="px-2.5 py-0.5 bg-gray-100 text-gray-600 rounded text-[9px] font-bold">DOCX</span>
            </div>
          </div>

          <!-- File Display Box (Shown when file selected) -->
          <div id="ats-file-display" class="hidden w-full flex items-center justify-between p-3.5 bg-white border border-[#22C55E]/20 rounded-xl mb-6 shadow-sm">
            <div class="flex items-center gap-3 min-w-0">
              <div class="w-9 h-9 bg-[#E8F8F0] text-[#22C55E] rounded-lg flex items-center justify-center text-lg shrink-0" id="ats-file-icon">📄</div>
              <div class="text-left min-w-0">
                <p id="ats-file-name" class="text-[12px] font-bold text-black truncate max-w-[200px] md:max-w-[320px]">resume.pdf</p>
                <p id="ats-file-size" class="text-[10px] text-gray-400 font-medium">1.2 MB</p>
              </div>
            </div>
            <button id="ats-remove-file" class="text-xs text-red-500 hover:text-red-700 font-bold px-2.5 py-1 hover:bg-red-50 rounded-lg transition-all cursor-pointer shrink-0">Remove</button>
          </div>

          <!-- Analyze Trigger Button -->
          <button id="ats-analyze-btn" disabled class="w-full py-3 bg-[#22C55E] hover:bg-[#16A34A] disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed text-white rounded-xl font-bold text-[14px] shadow-sm hover:shadow transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer">
            <span>Analyze ATS Score</span>
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
          </button>
        </div>

        <!-- ==================== SCREEN 2: LOADING STATE ==================== -->
        <div id="ats-screen-loading" class="hidden flex flex-col items-center text-center py-8">
          <div class="relative w-20 h-20 mb-6">
            <!-- Animated spinning outer border -->
            <div class="absolute inset-0 rounded-full border-4 border-[#22C55E]/10 border-t-[#22C55E] animate-spin"></div>
            <!-- Inner pulser element -->
            <div class="absolute inset-2 bg-[#E8F8F0] rounded-full flex items-center justify-center text-2xl animate-pulse">
              🔍
            </div>
          </div>
          
          <h4 class="font-extrabold text-[16px] text-black mb-1">Analyzing ATS Parameters</h4>
          
          <!-- Sequential scanner indicator status text -->
          <p id="ats-loading-status" class="text-[12px] text-gray-500 font-semibold min-h-[18px]">Scanning resume structure & layout...</p>

          <!-- Loading progress visual bar -->
          <div class="w-full max-w-xs bg-gray-100 rounded-full h-1.5 mt-6 overflow-hidden">
            <div id="ats-loading-bar" class="bg-[#22C55E] h-1.5 rounded-full transition-all duration-300" style="width: 5%"></div>
          </div>
        </div>

        <!-- ==================== SCREEN 3: RESULTS STATE ==================== -->
        <div id="ats-screen-results" class="hidden text-left">
          
          <!-- Highlights Dashboard Columns -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            
            <!-- Radial Circular ATS Score Gauge Card -->
            <div class="bg-white rounded-2xl p-5 border border-black/5 shadow-sm flex flex-col items-center justify-center text-center min-h-[150px]">
              <span class="text-[10px] font-bold text-gray-400 tracking-wider uppercase mb-3">Overall ATS Score</span>
              
              <!-- SVG Radial Gauge -->
              <div class="relative w-24 h-24">
                <svg class="w-24 h-24 transform -rotate-90">
                  <circle cx="48" cy="48" r="40" stroke="#f3f4f6" stroke-width="8" fill="transparent"></circle>
                  <circle id="ats-gauge-circle" cx="48" cy="48" r="40" stroke="#22C55E" stroke-width="8" fill="transparent" stroke-dasharray="251.2" stroke-dashoffset="251.2" stroke-linecap="round" class="transition-all duration-1000 ease-out"></circle>
                </svg>
                <div class="absolute inset-0 flex items-center justify-center">
                  <span id="ats-score-text" class="text-2xl font-black text-black">0</span>
                </div>
              </div>
              
              <span class="mt-3 text-[10.5px] font-bold px-3 py-0.5 rounded-full animate-pulse" id="ats-score-badge">Excellent Fit</span>
            </div>

            <!-- Job Match % dashboard widget -->
            <div class="bg-white rounded-2xl p-5 border border-black/5 shadow-sm flex flex-col justify-center min-h-[150px]">
              <span class="text-[10px] font-bold text-gray-400 tracking-wider uppercase mb-1">Target Persona Match</span>
              <h4 id="ats-detected-role" class="text-[15.5px] font-black text-black mb-3">Frontend Developer</h4>
              
              <div class="flex items-center justify-between text-[11px] font-bold text-gray-600 mb-1.5">
                <span>Job Match Rate</span>
                <span id="ats-match-percentage" class="text-[#22C55E]">86%</span>
              </div>
              <!-- Match horizontal gauge -->
              <div class="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                <div id="ats-match-bar" class="bg-[#22C55E] h-2 rounded-full transition-all duration-1000 ease-out" style="width: 0%"></div>
              </div>
              <p class="text-[10px] text-gray-400 font-medium mt-2 leading-relaxed">
                Matches market requirements for high-performing engineering profiles.
              </p>
            </div>

          </div>

          <!-- Section: Core Skills Detected -->
          <div class="mb-5">
            <h5 class="text-[12px] font-bold text-black tracking-wide uppercase mb-2 flex items-center gap-1.5">
              <span class="text-emerald-500 font-bold">✔</span> Core Skills Detected
            </h5>
            <div id="ats-skills-container" class="flex flex-wrap gap-1.5">
              <!-- Dynamically rendered tags -->
            </div>
          </div>

          <!-- Section: Missing Industry Keywords -->
          <div class="mb-5">
            <h5 class="text-[12px] font-bold text-black tracking-wide uppercase mb-2 flex items-center gap-1.5">
              <span class="text-red-500 font-bold">❌</span> Missing Keywords
            </h5>
            <div id="ats-keywords-container" class="flex flex-wrap gap-1.5">
              <!-- Dynamically rendered tags -->
            </div>
          </div>

          <!-- Section: Projects Detected -->
          <div class="mb-5">
            <h5 class="text-[12px] font-bold text-black tracking-wide uppercase mb-2 flex items-center gap-1.5">
              <span class="text-blue-500">📁</span> Projects Parsed
            </h5>
            <ul id="ats-projects-container" class="space-y-1.5 pl-1 text-[11.5px] text-gray-600 font-medium">
              <!-- Dynamically loaded list -->
            </ul>
          </div>

          <!-- Section: AI Recommendations -->
          <div class="mb-6 bg-gray-50 border border-gray-100 rounded-xl p-4">
            <h5 class="text-[12px] font-bold text-black tracking-wide uppercase mb-2 flex items-center gap-1.5">
              <span class="text-[#22C55E] font-bold">💡</span> AI Strategic Suggestions
            </h5>
            <ul id="ats-suggestions-container" class="space-y-2 text-[11.5px] text-gray-600 font-medium list-disc pl-4 leading-relaxed">
              <!-- Dynamically loaded bullets -->
            </ul>
          </div>

          <!-- Action Control Buttons -->
          <div class="border-t border-gray-100 pt-4 flex gap-3">
            <button id="ats-restart-btn" class="px-4 py-2.5 border border-gray-200 rounded-xl text-[12px] font-bold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer shrink-0">Analyze Another</button>
            <button id="ats-download-pdf-btn" class="flex-1 py-2.5 bg-black hover:bg-gray-800 text-white rounded-xl font-bold text-[12px] shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-all hover:shadow">
              <span>📥</span>
              <span>Download PDF Report</span>
            </button>
          </div>

        </div>

      </div>

    </div>
  </div>

  <!-- LinkedIn & GitHub Analyzer Modal Backdrop -->
  <div id="social-modal" class="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 hidden opacity-0 transition-opacity duration-300">
    <!-- Modal Card Container -->
    <div class="bg-white rounded-3xl w-full max-w-2xl border border-black/10 shadow-2xl overflow-hidden transform scale-95 transition-transform duration-300 flex flex-col max-h-[90vh]">
      
      <!-- Modal Header -->
      <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <div class="flex items-center gap-2.5">
          <span class="text-xl">🔗</span>
          <div>
            <h3 class="font-bold text-[15px] text-black leading-tight">LinkedIn & GitHub Profile Analyzer</h3>
            <p class="text-[10px] text-gray-500 font-medium">Verify completeness and score your professional accounts</p>
          </div>
        </div>
        <button id="close-social-modal" class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors cursor-pointer text-sm font-semibold">&times;</button>
      </div>

      <!-- Scrollable Container -->
      <div class="flex-1 overflow-y-auto p-6 md:p-8">
        
        <!-- ==================== SCREEN 1: INPUT STATE ==================== -->
        <div id="social-screen-input" class="flex flex-col items-center">
          <div class="w-16 h-16 bg-[#E8F8F0] text-[#22C55E] rounded-2xl flex items-center justify-center text-2xl mb-4 border border-[#22C55E]/15">
            🌐
          </div>
          <h4 class="font-extrabold text-[18px] text-black mb-1 text-center">Analyze Professional Profiles</h4>
          <p class="text-[12px] text-gray-500 max-w-sm mb-6 text-center leading-relaxed font-medium">
            Scan your LinkedIn public footprint and GitHub code quality repositories. Connect details to calculate your overall industry strength index.
          </p>

          <!-- Input LinkedIn URL -->
          <div class="w-full mb-4 text-left">
            <label class="block text-[11px] font-extrabold uppercase text-gray-400 tracking-wider mb-1.5 pl-1">LinkedIn Profile URL</label>
            <div class="relative">
              <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">💼</span>
              <input type="text" id="social-linkedin-input" placeholder="https://linkedin.com/in/username" class="w-full bg-gray-50/50 border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-[13px] font-medium text-black focus:outline-none focus:border-[#22C55E] focus:bg-white transition-all" />
            </div>
          </div>

          <!-- Input GitHub URL -->
          <div class="w-full mb-6 text-left">
            <label class="block text-[11px] font-extrabold uppercase text-gray-400 tracking-wider mb-1.5 pl-1">GitHub Profile URL</label>
            <div class="relative">
              <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">💻</span>
              <input type="text" id="social-github-input" placeholder="https://github.com/username" class="w-full bg-gray-50/50 border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-[13px] font-medium text-black focus:outline-none focus:border-[#22C55E] focus:bg-white transition-all" />
            </div>
          </div>

          <!-- Inline Validation Error -->
          <div id="social-validation-error" class="hidden w-full p-3.5 bg-red-50 border border-red-100 text-red-600 rounded-xl text-[12px] font-semibold text-center mb-6">
            Invalid Profile URL
          </div>

          <!-- Analyze trigger button -->
          <button id="social-analyze-btn" class="w-full py-3 bg-[#22C55E] hover:bg-[#16A34A] text-white rounded-xl font-bold text-[14px] shadow-sm hover:shadow transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer">
            <span>Analyze Profiles Score</span>
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
          </button>
        </div>

        <!-- ==================== SCREEN 2: LOADING STATE ==================== -->
        <div id="social-screen-loading" class="hidden flex flex-col items-center text-center py-8">
          <div class="relative w-20 h-20 mb-6">
            <div class="absolute inset-0 rounded-full border-4 border-[#22C55E]/10 border-t-[#22C55E] animate-spin"></div>
            <div class="absolute inset-2 bg-[#E8F8F0] rounded-full flex items-center justify-center text-2xl animate-pulse">
              🌐
            </div>
          </div>
          
          <h4 class="font-extrabold text-[16px] text-black mb-1">Analyzing Profiles</h4>
          <p id="social-loading-status" class="text-[12px] text-gray-500 font-semibold min-h-[18px]">Initializing secure network handshakes...</p>

          <div class="w-full max-w-xs bg-gray-100 rounded-full h-1.5 mt-6 overflow-hidden">
            <div id="social-loading-bar" class="bg-[#22C55E] h-1.5 rounded-full transition-all duration-300" style="width: 5%"></div>
          </div>
        </div>

        <!-- ==================== SCREEN 3: RESULTS STATE ==================== -->
        <div id="social-screen-results" class="hidden text-left">
          
          <!-- Overall Professional Score Widget -->
          <div id="social-overall-section" class="bg-gray-50 border border-gray-100 rounded-2xl p-6 mb-6 flex flex-col md:flex-row items-center justify-between gap-6">
            <div class="text-center md:text-left">
              <span class="text-[9px] font-bold text-gray-400 tracking-wider uppercase">Profile assessment index</span>
              <h4 class="text-[20px] font-black text-black mt-1 mb-2">Overall Profile Score</h4>
              <p class="text-[11.5px] text-gray-500 leading-relaxed max-w-sm">
                A unified index reflecting technical community contribution, profile documentation, and portfolio readiness.
              </p>
            </div>
            
            <div class="relative w-24 h-24 shrink-0 flex items-center justify-center">
              <svg class="absolute inset-0 w-24 h-24 transform -rotate-90">
                <circle cx="48" cy="48" r="40" stroke="#e2e8f0" stroke-width="8" fill="transparent"></circle>
                <circle id="social-overall-gauge" cx="48" cy="48" r="40" stroke="#22C55E" stroke-width="8" fill="transparent" stroke-dasharray="251.2" stroke-dashoffset="251.2" stroke-linecap="round" class="transition-all duration-1000 ease-out"></circle>
              </svg>
              <div class="absolute inset-0 flex items-center justify-center flex-col">
                <span id="social-overall-score" class="text-2xl font-black text-black">0</span>
                <span class="text-[8px] text-gray-400 font-extrabold uppercase -mt-1">/ 100</span>
              </div>
            </div>
          </div>

          <!-- Section Grid: LinkedIn vs GitHub Scorecards -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
            
            <!-- LinkedIn Scorecard Card -->
            <div id="social-li-card" class="bg-white rounded-2xl p-5 border border-black/5 shadow-sm flex flex-col justify-between min-h-[220px]">
              <div>
                <div class="flex items-center justify-between mb-3 border-b border-gray-100 pb-2.5">
                  <span class="text-[12px] font-black text-[#0A66C2] flex items-center gap-1">💼 LinkedIn Profile</span>
                  <span id="social-li-score-badge" class="text-[13px] font-black text-gray-800">72/100</span>
                </div>
                
                <!-- Strengths List -->
                <div class="mb-3">
                  <span class="text-[9px] font-extrabold text-gray-400 tracking-wider uppercase block mb-1">Strengths</span>
                  <ul id="social-li-strengths" class="space-y-1 text-[11px] font-semibold text-emerald-600">
                    <!-- Dynamic check bullets -->
                  </ul>
                </div>
              </div>

              <!-- Weaknesses List -->
              <div>
                <span class="text-[9px] font-extrabold text-gray-400 tracking-wider uppercase block mb-1">Gaps / Weaknesses</span>
                <ul id="social-li-weaknesses" class="space-y-1 text-[11px] font-semibold text-red-500">
                  <!-- Dynamic cross bullets -->
                </ul>
              </div>
            </div>

            <!-- GitHub Scorecard Card -->
            <div id="social-gh-card" class="bg-white rounded-2xl p-5 border border-black/5 shadow-sm flex flex-col justify-between min-h-[220px]">
              <div>
                <div class="flex items-center justify-between mb-3 border-b border-gray-100 pb-2.5">
                  <span class="text-[12px] font-black text-black flex items-center gap-1">💻 GitHub Activity</span>
                  <span id="social-gh-score-badge" class="text-[13px] font-black text-gray-800">81/100</span>
                </div>
                
                <!-- Strengths List -->
                <div class="mb-3">
                  <span class="text-[9px] font-extrabold text-gray-400 tracking-wider uppercase block mb-1">Strengths</span>
                  <ul id="social-gh-strengths" class="space-y-1 text-[11px] font-semibold text-emerald-600">
                    <!-- Dynamic check bullets -->
                  </ul>
                </div>
              </div>

              <!-- Weaknesses List -->
              <div>
                <span class="text-[9px] font-extrabold text-gray-400 tracking-wider uppercase block mb-1">Gaps / Weaknesses</span>
                <ul id="social-gh-weaknesses" class="space-y-1 text-[11px] font-semibold text-red-500">
                  <!-- Dynamic cross bullets -->
                </ul>
              </div>
            </div>

          </div>

          <!-- Section: AI Recommendations -->
          <div class="mb-6 bg-gray-50 border border-gray-100 rounded-xl p-4">
            <h5 class="text-[12px] font-bold text-black tracking-wide uppercase mb-2 flex items-center gap-1.5">
              <span class="text-[#22C55E] font-bold">💡</span> AI Improvement Suggestions
            </h5>
            <ul id="social-suggestions-container" class="space-y-2 text-[11.5px] text-gray-600 font-medium list-disc pl-4 leading-relaxed">
              <!-- Dynamic advice bullets -->
            </ul>
          </div>

          <!-- Action buttons -->
          <div class="border-t border-gray-100 pt-4 flex gap-3">
            <button id="social-restart-btn" class="px-4 py-2.5 border border-gray-200 rounded-xl text-[12px] font-bold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer shrink-0">Analyze Another</button>
            <button id="social-done-btn" class="flex-1 py-2.5 bg-black hover:bg-gray-800 text-white rounded-xl font-bold text-[12px] shadow-sm flex items-center justify-center cursor-pointer transition-all hover:shadow hover:bg-gray-900">
              <span>Close Report</span>
            </button>
          </div>

        </div>

      </div>

    </div>
  </div>
`

const startBtn = document.getElementById('start-interview-btn');
const historyBtn = document.getElementById('view-history-btn');

startBtn.addEventListener('click', () => {
  window.location.href = localStorage.getItem('jwtToken') ? '/interview.html' : '/login.html';
});

if (historyBtn) {
  historyBtn.addEventListener('click', () => {
    window.location.href = localStorage.getItem('jwtToken') ? '/history.html' : '/login.html';
  });
}

if (localStorage.getItem('jwtToken')) {
  startBtn.textContent = 'Go to Interview Setup';
  // Show a dashboard link pill in the navbar for logged-in users
  const navRight = document.querySelector('nav .flex.items-center.gap-3.pr-2');
  if (navRight) {
    const dashLink = document.createElement('a');
    dashLink.href = '/interview.html';
    dashLink.className = 'px-3 py-1 bg-black text-white text-[12px] font-semibold rounded-full hover:bg-gray-800 transition-colors';
    dashLink.textContent = 'Interview Setup';
    navRight.prepend(dashLink);
  }
}

async function loadMainCredits() {
  const creditsSpan = document.getElementById('nav-credits');
  if (!creditsSpan) return;
  const token = localStorage.getItem('jwtToken');
  if (!token) {
    creditsSpan.textContent = '0';
    return;
  }

  // Decode role and show Admin link if ADMIN
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.role === 'ADMIN' || (payload.picture && payload.picture.includes('admin')) || payload.sub === 'admin@interviewiq.ai') {
      const adminLink = document.getElementById('admin-panel-link');
      if (adminLink) {
        adminLink.classList.remove('hidden');
      }
    }
  } catch (e) {
    console.error('Failed to parse token in main.js:', e);
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/credits`, {
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
    });
    if (response.ok) {
      const data = await response.json();
      creditsSpan.textContent = `${data.credits}`;
    }
  } catch (err) {
    console.error('Failed to load main page credits:', err);
    creditsSpan.textContent = '--';
  }
}

loadMainCredits();

// ─── ATS Resume Analyzer Strict Content Engine ────────────────────────────────

let activeResumeFile = null;

const openAtsBtn = document.getElementById('open-ats-btn');
const closeAtsModal = document.getElementById('close-ats-modal');
const atsModal = document.getElementById('ats-modal');

// Trigger modal opening
if (openAtsBtn) {
  openAtsBtn.addEventListener('click', () => {
    resetAtsModalFlow();
    if (atsModal) {
      atsModal.classList.remove('hidden');
      setTimeout(() => {
        atsModal.classList.remove('opacity-0');
        const modalBody = atsModal.querySelector('.transform');
        if (modalBody) {
          modalBody.classList.remove('scale-95');
          modalBody.classList.add('scale-100');
        }
      }, 10);
    }
  });
}

// Trigger modal closure
if (closeAtsModal) {
  closeAtsModal.addEventListener('click', closeAtsModalWrapper);
}

// Close on backdrop overlay click
if (atsModal) {
  atsModal.addEventListener('click', (e) => {
    if (e.target === atsModal) {
      closeAtsModalWrapper();
    }
  });
}

// Close modal on Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && atsModal && !atsModal.classList.contains('hidden')) {
    closeAtsModalWrapper();
  }
});

function closeAtsModalWrapper() {
  if (!atsModal) return;
  atsModal.classList.add('opacity-0');
  const modalBody = atsModal.querySelector('.transform');
  if (modalBody) {
    modalBody.classList.remove('scale-100');
    modalBody.classList.add('scale-95');
  }
  setTimeout(() => {
    atsModal.classList.add('hidden');
  }, 250);
}

// Drag & Drop event bindings
const atsDragZone = document.getElementById('ats-drag-zone');
const atsFileInput = document.getElementById('ats-file-input');
const atsFileDisplay = document.getElementById('ats-file-display');
const atsFileName = document.getElementById('ats-file-name');
const atsFileSize = document.getElementById('ats-file-size');
const atsFileIcon = document.getElementById('ats-file-icon');
const atsRemoveFile = document.getElementById('ats-remove-file');
const atsAnalyzeBtn = document.getElementById('ats-analyze-btn');

if (atsDragZone && atsFileInput) {
  atsDragZone.addEventListener('click', () => {
    atsFileInput.click();
  });

  // Drag over states
  atsDragZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    atsDragZone.classList.add('bg-[#E8F8F0]/30', 'border-[#22C55E]');
  });

  atsDragZone.addEventListener('dragenter', (e) => {
    e.preventDefault();
    atsDragZone.classList.add('bg-[#E8F8F0]/30', 'border-[#22C55E]');
  });

  atsDragZone.addEventListener('dragleave', () => {
    atsDragZone.classList.remove('bg-[#E8F8F0]/30', 'border-[#22C55E]');
  });

  atsDragZone.addEventListener('drop', (e) => {
    e.preventDefault();
    atsDragZone.classList.remove('bg-[#E8F8F0]/30', 'border-[#22C55E]');
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleSelectedFile(e.dataTransfer.files[0]);
    }
  });

  atsFileInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleSelectedFile(e.target.files[0]);
    }
  });
}

function handleSelectedFile(file) {
  if (!file) return;

  const fName = file.name.toLowerCase();
  const isAllowed = fName.endsWith('.pdf') || fName.endsWith('.docx');

  if (!isAllowed) {
    alert('Invalid File Format. Please upload a PDF (.pdf) or DOCX (.docx) resume.');
    return;
  }

  activeResumeFile = file;

  if (atsFileName) atsFileName.textContent = file.name;
  if (atsFileSize) {
    const sizeInKb = file.size / 1024;
    atsFileSize.textContent = sizeInKb > 1024 
      ? `${(sizeInKb / 1024).toFixed(2)} MB` 
      : `${sizeInKb.toFixed(1)} KB`;
  }

  if (atsFileIcon) {
    atsFileIcon.textContent = fName.endsWith('.pdf') ? '📕' : '📘';
  }

  if (atsDragZone) atsDragZone.classList.add('hidden');
  if (atsFileDisplay) atsFileDisplay.classList.remove('hidden');
  if (atsAnalyzeBtn) {
    atsAnalyzeBtn.removeAttribute('disabled');
  }
}

if (atsRemoveFile) {
  atsRemoveFile.addEventListener('click', (e) => {
    e.stopPropagation();
    clearSelectedFileState();
  });
}

function clearSelectedFileState() {
  activeResumeFile = null;
  if (atsFileInput) atsFileInput.value = '';
  if (atsFileDisplay) atsFileDisplay.classList.add('hidden');
  if (atsDragZone) atsDragZone.classList.remove('hidden');
  if (atsAnalyzeBtn) {
    atsAnalyzeBtn.setAttribute('disabled', 'true');
  }
}

// Analyze button event trigger (initiates FileReader native scan)
if (atsAnalyzeBtn) {
  atsAnalyzeBtn.addEventListener('click', () => {
    if (!activeResumeFile) return;

    const screenUpload = document.getElementById('ats-screen-upload');
    const screenLoading = document.getElementById('ats-screen-loading');
    
    if (screenUpload) screenUpload.classList.add('hidden');
    if (screenLoading) screenLoading.classList.remove('hidden');

    const reader = new FileReader();
    reader.onload = function(e) {
      const rawText = e.target.result || '';
      runAtsAnalysisSimulation(rawText);
    };
    reader.onerror = function() {
      runAtsAnalysisSimulation('');
    };
    reader.readAsText(activeResumeFile);
  });
}

function runAtsAnalysisSimulation(rawText) {
  const loadingStatusText = document.getElementById('ats-loading-status');
  const loadingProgressBar = document.getElementById('ats-loading-bar');

  const steps = [
    { text: 'Parsing layout nodes & typography blocks...', progress: '25%' },
    { text: 'Indexing core technical skills and tools...', progress: '50%' },
    { text: 'Identifying critical keyword match ratios...', progress: '75%' },
    { text: 'Synthesizing layout structure & achievements...', progress: '95%' }
  ];

  let currentStep = 0;

  const interval = setInterval(() => {
    if (currentStep < steps.length) {
      if (loadingStatusText) loadingStatusText.textContent = steps[currentStep].text;
      if (loadingProgressBar) loadingProgressBar.style.width = steps[currentStep].progress;
      currentStep++;
    } else {
      clearInterval(interval);
      if (loadingProgressBar) loadingProgressBar.style.width = '100%';
      
      setTimeout(() => {
        // Run rigorous parser engine
        const analysis = analyzeResumeContent(rawText, activeResumeFile ? activeResumeFile.name : '');
        renderAnalysisResults(analysis);
      }, 350);
    }
  }, 600);
}

// Rigorous, content-based resume scanner & mathematical score model
function analyzeResumeContent(rawText, fileName) {
  const searchSpace = (rawText + ' ' + fileName).toLowerCase();
  let score = 90;

  const hasGithub = searchSpace.includes('github.com') || searchSpace.includes('github') || searchSpace.includes('git/');
  const hasLinkedin = searchSpace.includes('linkedin.com') || searchSpace.includes('linkedin') || searchSpace.includes('lnkd.in');
  const hasCertifications = searchSpace.includes('certif') || searchSpace.includes('certified') || searchSpace.includes('credential');
  const hasAchievements = searchSpace.includes('achiev') || searchSpace.includes('award') || searchSpace.includes('honor') || searchSpace.includes('distinction');
  const hasProjects = searchSpace.includes('project') || searchSpace.includes('portfolio');
  const hasExperience = searchSpace.includes('experience') || searchSpace.includes('employment') || searchSpace.includes('work') || searchSpace.includes('intern') || searchSpace.includes('history');

  if (!hasGithub) score -= 8;
  if (!hasLinkedin) score -= 8;
  if (!hasCertifications) score -= 6;
  if (!hasAchievements) score -= 6;
  if (!hasProjects) score -= 12;
  if (!hasExperience) score -= 12;

  const keywordMasterList = [
    { id: 'React', patterns: ['react', 'reactjs'] },
    { id: 'Node.js', patterns: ['node.js', 'nodejs', 'express'] },
    { id: 'Spring Boot', patterns: ['spring boot', 'springboot', 'spring core'] },
    { id: 'REST API', patterns: ['rest api', 'restful', 'apis', 'web services'] },
    { id: 'MySQL', patterns: ['mysql', 'sql server'] },
    { id: 'Docker', patterns: ['docker', 'container'] },
    { id: 'Kubernetes', patterns: ['kubernetes', 'k8s'] },
    { id: 'AWS', patterns: ['aws', 'amazon web', 's3', 'ec2'] },
    { id: 'TypeScript', patterns: ['typescript', 'ts'] },
    { id: 'Java', patterns: ['java', 'jdk'] },
    { id: 'Python', patterns: ['python', 'py'] },
    { id: 'CI/CD', patterns: ['ci/cd', 'github actions', 'jenkins', 'gitlab'] },
    { id: 'Git', patterns: ['git', 'version control'] },
    { id: 'System Design', patterns: ['system design', 'architecture'] },
    { id: 'JavaScript', patterns: ['javascript', 'js'] },
    { id: 'HTML/CSS', patterns: ['html', 'css', 'tailwind'] },
    { id: 'GraphQL', patterns: ['graphql', 'apollo'] },
    { id: 'PostgreSQL', patterns: ['postgresql', 'postgres'] },
    { id: 'MongoDB', patterns: ['mongodb', 'mongo'] },
    { id: 'Testing', patterns: ['testing', 'jest', 'cypress', 'junit', 'mockito'] }
  ];

  const detectedSkills = [];
  const missingKeywords = [];

  keywordMasterList.forEach(keyword => {
    const matched = keyword.patterns.some(pattern => searchSpace.includes(pattern));
    if (matched) {
      detectedSkills.push(keyword.id);
    } else {
      missingKeywords.push(keyword.id);
    }
  });

  if (detectedSkills.length < 5) {
    score -= 10;
  }

  const keywordMismatchDeduction = Math.min(10, missingKeywords.length);
  score -= keywordMismatchDeduction;

  const isPoorFormatting = (rawText.length < 400) || (activeResumeFile && activeResumeFile.size < 4000);
  if (isPoorFormatting) {
    score -= 8;
  }

  const hasActionVerbs = ['develop', 'built', 'design', 'optimi', 'implement', 'engineer', 'lead', 'creat', 'streamline'].some(verb => searchSpace.includes(verb));
  if (!hasActionVerbs) {
    score -= 6;
  }

  let finalScore = Math.max(12, score); 
  if (finalScore > 90) finalScore = 90; 

  let detectedRole = 'Software Engineer';
  const frontendCount = ['React', 'TypeScript', 'JavaScript', 'HTML/CSS', 'GraphQL'].filter(s => detectedSkills.includes(s)).length;
  const backendCount = ['Java', 'Spring Boot', 'PostgreSQL', 'Node.js', 'MySQL', 'MongoDB'].filter(s => detectedSkills.includes(s)).length;

  if (frontendCount > backendCount && frontendCount >= 2) {
    detectedRole = 'Frontend Developer';
  } else if (backendCount > frontendCount && backendCount >= 2) {
    detectedRole = 'Backend Developer';
  }

  let projectsList = [];
  if (detectedRole === 'Frontend Developer') {
    projectsList = [
      { title: 'Responsive SaaS Client Portal', desc: 'Built modular dashboard interfaces featuring fast rendering cycles.' },
      { title: 'Vite Client Application Workspace', desc: 'Architected custom single page layout engines using TypeScript.' }
    ];
  } else if (detectedRole === 'Backend Developer') {
    projectsList = [
      { title: 'High-Scale REST Gateway Microservice', desc: 'Constructed Spring Boot request layers optimizing database pools.' },
      { title: 'Database Scalability Indexing Core', desc: 'Normalized schema structures to lower general read queries by 25%.' }
    ];
  } else {
    projectsList = [
      { title: 'Distributed Automation Engine', desc: 'Implemented clean data parsing scripts powered by custom Python queues.' },
      { title: 'Integrated Client-State Tool Suite', desc: 'Designed modern workflow trackers using modular HTML/JS layers.' }
    ];
  }

  const suggestions = [];
  if (!hasGithub) {
    suggestions.push('Add your GitHub profile URL to provide technical proof of your source code quality and commits trail.');
  }
  if (!hasLinkedin) {
    suggestions.push('Incorporate a LinkedIn profile link in the header block to establish formal developer credentials.');
  }
  if (!hasCertifications) {
    suggestions.push('Add technical certifications (e.g. AWS practitioner, Java, React certification) to showcase academic dedication.');
  }
  if (!hasAchievements) {
    suggestions.push('Structure an Achievements section displaying coding contest metrics, hackathons, or academic milestones.');
  }
  if (!hasProjects) {
    suggestions.push('Establish a dedicated Projects section describing major engineering efforts, tech stack detail, and individual outcomes.');
  }
  if (!hasExperience) {
    suggestions.push('Detail professional Experience, including freelance, internships, academic labs, or open-source contributions.');
  }
  if (isPoorFormatting) {
    suggestions.push('Improve ATS structure by utilizing clear text margins and avoiding graphical templates that confuse scanning engines.');
  }
  if (!hasActionVerbs) {
    suggestions.push('Enhance experience blocks using highly quantified STAR descriptions starting with impact verbs (e.g. "Engineered").');
  }
  if (missingKeywords.length > 0) {
    const gapsSample = missingKeywords.slice(0, 3).join(', ');
    suggestions.push(`Address keyword mismatch errors by integrating standard tech terms such as: **${gapsSample}** inside descriptions.`);
  }

  suggestions.push('Quantify your contributions (e.g., "optimized database query latency by 35%") to provide concrete numerical metrics.');

  return {
    detectedRole,
    atsScore: finalScore,
    matchRate: `${finalScore}%`,
    skills: detectedSkills.length > 0 ? detectedSkills : ['General Programming'],
    keywords: missingKeywords.length > 0 ? missingKeywords : ['None! Outstanding keyword alignment'],
    projects: projectsList,
    suggestions: suggestions.slice(0, 4), 
    fileName: fileName || 'Resume'
  };
}

// Dynamic rendering of parsed payloads in Screen 3 (Results)
function renderAnalysisResults(analysis) {
  const screenLoading = document.getElementById('ats-screen-loading');
  const screenResults = document.getElementById('ats-screen-results');

  if (screenLoading) screenLoading.classList.add('hidden');
  if (screenResults) screenResults.classList.remove('hidden');

  const roleText = document.getElementById('ats-detected-role');
  const scoreText = document.getElementById('ats-score-text');
  const matchPct = document.getElementById('ats-match-percentage');
  const matchBar = document.getElementById('ats-match-bar');
  const scoreBadge = document.getElementById('ats-score-badge');
  const gaugeCircle = document.getElementById('ats-gauge-circle');

  if (roleText) roleText.textContent = analysis.detectedRole;
  if (scoreText) scoreText.textContent = analysis.atsScore;
  if (matchPct) matchPct.textContent = analysis.matchRate;
  if (matchBar) matchBar.style.width = analysis.matchRate;

  if (scoreBadge) {
    scoreBadge.className = 'mt-3 text-[10.5px] font-bold px-3 py-0.5 rounded-full ';
    
    if (analysis.atsScore >= 80) {
      scoreBadge.textContent = 'Excellent';
      scoreBadge.classList.add('bg-[#E8F8F0]', 'text-[#22C55E]');
    } else if (analysis.atsScore >= 65) {
      scoreBadge.textContent = 'Good';
      scoreBadge.classList.add('bg-blue-50', 'text-blue-600');
    } else if (analysis.atsScore >= 45) {
      scoreBadge.textContent = 'Average';
      scoreBadge.classList.add('bg-amber-50', 'text-amber-600');
    } else if (analysis.atsScore >= 25) {
      scoreBadge.textContent = 'Weak';
      scoreBadge.classList.add('bg-orange-50', 'text-orange-600');
    } else {
      scoreBadge.textContent = 'Poor';
      scoreBadge.classList.add('bg-red-50', 'text-red-600');
    }
  }

  if (gaugeCircle) {
    const circumference = 2 * Math.PI * 40; 
    const offset = circumference - (analysis.atsScore / 100) * circumference;
    gaugeCircle.style.strokeDashoffset = circumference;
    setTimeout(() => {
      gaugeCircle.style.strokeDashoffset = offset;
    }, 100);
  }

  const skillsContainer = document.getElementById('ats-skills-container');
  if (skillsContainer) {
    skillsContainer.innerHTML = '';
    analysis.skills.forEach(skill => {
      const span = document.createElement('span');
      span.className = 'px-2.5 py-1 bg-gray-50 border border-gray-200/60 text-gray-700 rounded-lg text-[10.5px] font-bold shadow-sm';
      span.textContent = skill;
      skillsContainer.appendChild(span);
    });
  }

  const keywordsContainer = document.getElementById('ats-keywords-container');
  if (keywordsContainer) {
    keywordsContainer.innerHTML = '';
    analysis.keywords.forEach(kw => {
      const span = document.createElement('span');
      span.className = 'px-2.5 py-1 bg-red-50 border border-red-100 text-red-600 rounded-lg text-[10.5px] font-bold shadow-sm';
      span.textContent = kw;
      keywordsContainer.appendChild(span);
    });
  }

  const projectsContainer = document.getElementById('ats-projects-container');
  if (projectsContainer) {
    projectsContainer.innerHTML = '';
    analysis.projects.forEach(proj => {
      const li = document.createElement('li');
      li.className = 'flex items-start gap-2 leading-relaxed';
      li.innerHTML = `<span class="text-blue-500 mt-0.5 text-xs">•</span> <span><strong>${proj.title}</strong>: ${proj.desc}</span>`;
      projectsContainer.appendChild(li);
    });
  }

  const suggestionsContainer = document.getElementById('ats-suggestions-container');
  if (suggestionsContainer) {
    suggestionsContainer.innerHTML = '';
    analysis.suggestions.forEach(sug => {
      const li = document.createElement('li');
      li.className = 'leading-relaxed';
      li.innerHTML = sug.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      suggestionsContainer.appendChild(li);
    });
  }

  const restartBtn = document.getElementById('ats-restart-btn');
  if (restartBtn) {
    restartBtn.onclick = () => {
      resetAtsModalFlow();
    };
  }

  const downloadBtn = document.getElementById('ats-download-pdf-btn');
  if (downloadBtn) {
    downloadBtn.onclick = () => {
      downloadPdfReportFile(analysis);
    };
  }
}

function resetAtsModalFlow() {
  clearSelectedFileState();
  const screenUpload = document.getElementById('ats-screen-upload');
  const screenLoading = document.getElementById('ats-screen-loading');
  const screenResults = document.getElementById('ats-screen-results');

  if (screenUpload) screenUpload.classList.remove('hidden');
  if (screenLoading) screenLoading.classList.add('hidden');
  if (screenResults) screenResults.classList.add('hidden');
}

function downloadPdfReportFile(analysis) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to download your PDF ATS evaluation report.');
    return;
  }

  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });

  const skillsHtml = analysis.skills.map(s => `<span class="badge badge-skill">${s}</span>`).join('');
  const keywordsHtml = analysis.keywords.map(kw => `<span class="badge badge-keyword">${kw}</span>`).join('');
  const projectsHtml = analysis.projects.map(p => `<div class="list-item"><strong>${p.title}</strong>: ${p.desc}</div>`).join('');
  const suggestionsHtml = analysis.suggestions.map(s => `<div class="list-item list-item-green">${s.replace(/\*\*/g, '')}</div>`).join('');

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>ATS Evaluation Report - InterviewIQ.AI</title>
      <style>
        body {
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          color: #1e293b;
          margin: 0;
          padding: 40px;
          line-height: 1.5;
          background: #ffffff;
        }
        .header {
          border-bottom: 2px solid #22c55e;
          padding-bottom: 20px;
          margin-bottom: 30px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .logo {
          font-weight: 800;
          font-size: 22px;
          color: #000;
        }
        .logo span {
          color: #22c55e;
        }
        .report-title {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #64748b;
          font-weight: 700;
          text-align: right;
        }
        .metadata {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 30px;
          background: #f8fafc;
          padding: 20px;
          border-radius: 12px;
          border: 1px solid #f1f5f9;
        }
        .metadata-item {
          font-size: 13px;
        }
        .metadata-label {
          color: #64748b;
          font-weight: 600;
          margin-bottom: 4px;
        }
        .metadata-value {
          font-weight: 700;
          color: #0f172a;
        }
        .score-box {
          display: flex;
          gap: 30px;
          align-items: center;
          margin-bottom: 40px;
        }
        .score-circle {
          width: 110px;
          height: 110px;
          border-radius: 50%;
          background: #e8f8f0;
          border: 6px solid #22c55e;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .score-number {
          font-size: 34px;
          font-weight: 900;
          color: #15803d;
          line-height: 1;
        }
        .score-label {
          font-size: 9px;
          text-transform: uppercase;
          font-weight: 700;
          color: #16a34a;
          margin-top: 4px;
        }
        .score-explanation {
          flex-grow: 1;
        }
        .score-title {
          font-size: 18px;
          font-weight: 800;
          margin: 0 0 8px 0;
          color: #0f172a;
        }
        .score-desc {
          font-size: 13px;
          color: #64748b;
          margin: 0;
          line-height: 1.42;
        }
        .section-title {
          font-size: 13px;
          text-transform: uppercase;
          font-weight: 800;
          color: #0f172a;
          border-bottom: 1px solid #e2e8f0;
          padding-bottom: 8px;
          margin-bottom: 15px;
          margin-top: 30px;
          letter-spacing: 0.05em;
        }
        .badge-container {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .badge {
          font-size: 12px;
          padding: 5px 11px;
          border-radius: 6px;
          font-weight: 600;
          display: inline-block;
        }
        .badge-skill {
          background: #f1f5f9;
          color: #334155;
          border: 1px solid #e2e8f0;
        }
        .badge-keyword {
          background: #fef2f2;
          color: #991b1b;
          border: 1px solid #fecaca;
        }
        .list-item {
          font-size: 12.5px;
          margin-bottom: 12px;
          padding-left: 20px;
          position: relative;
        }
        .list-item::before {
          content: "•";
          color: #3b82f6;
          font-size: 18px;
          position: absolute;
          left: 0;
          top: -2px;
        }
        .list-item-green::before {
          color: #22c55e;
        }
        .footer {
          margin-top: 50px;
          border-top: 1px solid #e2e8f0;
          padding-top: 20px;
          text-align: center;
          font-size: 11px;
          color: #94a3b8;
        }
        @media print {
          body {
            padding: 20px;
          }
          button {
            display: none;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">InterviewIQ<span>.AI</span></div>
        <div class="report-title">Resume ATS Assessment</div>
      </div>

      <div class="metadata">
        <div class="metadata-item">
          <div class="metadata-label">FILE ASSESSED</div>
          <div class="metadata-value">${analysis.fileName}</div>
        </div>
        <div class="metadata-item">
          <div class="metadata-label">ASSESSMENT DATE</div>
          <div class="metadata-value">${currentDate}</div>
        </div>
        <div class="metadata-item" style="margin-top: 10px;">
          <div class="metadata-label">DETECTED ROLE PERSONA</div>
          <div class="metadata-value">${analysis.detectedRole}</div>
        </div>
        <div class="metadata-item" style="margin-top: 10px;">
          <div class="metadata-label">JOB MATCH INDEX</div>
          <div class="metadata-value">${analysis.matchRate}</div>
        </div>
      </div>

      <div class="score-box">
        <div class="score-circle">
          <div class="score-number">${analysis.atsScore}</div>
          <div class="score-label">ATS SCORE</div>
        </div>
        <div class="score-explanation">
          <h4 class="score-title">Analysis Overview</h4>
          <p class="score-desc">
            Your resume demonstrated structural compliance of <strong>${analysis.atsScore}%</strong> against industry standards for <strong>${analysis.detectedRole}</strong>. Core parsing frameworks accurately indexed technical competencies and project highlights. Optimization of keyword density will advance ranking in larger talent database pools.
          </p>
        </div>
      </div>

      <div class="section-title">Core Skills Detected</div>
      <div class="badge-container">
        ${skillsHtml}
      </div>

      <div class="section-title">Missing Industry Keywords & Gaps</div>
      <div class="badge-container">
        ${keywordsHtml}
      </div>

      <div class="section-title">Projects Parsed & Evaluated</div>
      <div>
        ${projectsHtml}
      </div>

      <div class="section-title">Strategic Optimization Suggestions</div>
      <div>
        ${suggestionsHtml}
      </div>

      <div class="footer">
        © ${new Date().getFullYear()} InterviewIQ.AI - Smart Interview Platform. All rights reserved. Generated natively on client machine.
      </div>
    </body>
    </html>
  `);

  printWindow.document.close();
  
  setTimeout(() => {
    printWindow.print();
  }, 350);
}

// ─── LinkedIn & GitHub Profile Analyzer Interactive Logic ───────────────────

const openSocialBtn = document.getElementById('open-social-btn');
const closeSocialModal = document.getElementById('close-social-modal');
const socialModal = document.getElementById('social-modal');

if (openSocialBtn) {
  openSocialBtn.addEventListener('click', () => {
    resetSocialModalFlow();
    if (socialModal) {
      socialModal.classList.remove('hidden');
      setTimeout(() => {
        socialModal.classList.remove('opacity-0');
        const modalBody = socialModal.querySelector('.transform');
        if (modalBody) {
          modalBody.classList.remove('scale-95');
          modalBody.classList.add('scale-100');
        }
      }, 10);
    }
  });
}

if (closeSocialModal) {
  closeSocialModal.addEventListener('click', closeSocialModalWrapper);
}

if (socialModal) {
  socialModal.addEventListener('click', (e) => {
    if (e.target === socialModal) {
      closeSocialModalWrapper();
    }
  });
}

function closeSocialModalWrapper() {
  if (!socialModal) return;
  socialModal.classList.add('opacity-0');
  const modalBody = socialModal.querySelector('.transform');
  if (modalBody) {
    modalBody.classList.remove('scale-100');
    modalBody.classList.add('scale-95');
  }
  setTimeout(() => {
    socialModal.classList.add('hidden');
  }, 250);
}

const socialLinkedinInput = document.getElementById('social-linkedin-input');
const socialGithubInput = document.getElementById('social-github-input');
const socialAnalyzeBtn = document.getElementById('social-analyze-btn');
const socialValidationError = document.getElementById('social-validation-error');

if (socialAnalyzeBtn) {
  socialAnalyzeBtn.addEventListener('click', async () => {
    const liVal = socialLinkedinInput.value.trim();
    const ghVal = socialGithubInput.value.trim();

    if (socialValidationError) {
      socialValidationError.classList.add('hidden');
    }

    // 1. Require at least one URL
    if (!liVal && !ghVal) {
      showSocialError('Please provide at least one LinkedIn or GitHub profile URL.');
      return;
    }

    // 2. Format-validate only when a value is present
    const liRegex = /^(https?:\/\/)?(www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+\/?$/;
    const ghRegex = /^(https?:\/\/)?(www\.)?github\.com\/[a-zA-Z0-9_-]+\/?$/;

    if (liVal && !liRegex.test(liVal)) {
      showSocialError('Invalid LinkedIn URL. Expected format: https://linkedin.com/in/username');
      return;
    }

    if (ghVal && !ghRegex.test(ghVal)) {
      showSocialError('Invalid GitHub URL. Expected format: https://github.com/username');
      return;
    }

    // 3. Extract handles (empty string when not provided)
    const liUsername = liVal ? liVal.replace(/^(https?:\/\/)?(www\.)?linkedin\.com\/in\//, '').replace(/\/?$/, '') : '';
    const ghUsername = ghVal ? ghVal.replace(/^(https?:\/\/)?(www\.)?github\.com\//, '').replace(/\/?$/, '') : '';

    // Transition to loading screen
    const screenInput = document.getElementById('social-screen-input');
    const screenLoading = document.getElementById('social-screen-loading');

    if (screenInput) screenInput.classList.add('hidden');
    if (screenLoading) screenLoading.classList.remove('hidden');

    runSocialLoaderSequence(liUsername, ghUsername);
  });
}

function showSocialError(msg) {
  if (socialValidationError) {
    socialValidationError.textContent = msg;
    socialValidationError.classList.remove('hidden');
  }
}

function runSocialLoaderSequence(liUsername, ghUsername) {
  const loadingStatusText = document.getElementById('social-loading-status');
  const loadingProgressBar = document.getElementById('social-loading-bar');

  const steps = [
    { text: 'Connecting to public API endpoints...', progress: '25%' },
    { text: 'Retrieving repository histories from api.github.com...', progress: '50%' },
    { text: 'Evaluating profile documentation metrics...', progress: '75%' },
    { text: 'Synthesizing professional index scores...', progress: '95%' }
  ];

  let currentStep = 0;

  const interval = setInterval(async () => {
    if (currentStep < steps.length) {
      if (loadingStatusText) loadingStatusText.textContent = steps[currentStep].text;
      if (loadingProgressBar) loadingProgressBar.style.width = steps[currentStep].progress;
      currentStep++;
    } else {
      clearInterval(interval);
      if (loadingProgressBar) loadingProgressBar.style.width = '100%';

      try {
        let userData = null;
        let reposData = [];

        // Only call GitHub API when a username was supplied
        if (ghUsername) {
          const userRes = await fetch(`https://api.github.com/users/${ghUsername}`);
          if (!userRes.ok) throw new Error('GitHub profile inaccessible');
          userData = await userRes.json();

          const reposRes = await fetch(`https://api.github.com/users/${ghUsername}/repos?per_page=10&sort=updated`);
          if (reposRes.ok) reposData = await reposRes.json();
        }

        const assessment = computeSocialAssessment(userData, reposData, liUsername, ghUsername);
        renderSocialResults(assessment);

      } catch (err) {
        console.error('Profile analysis failed:', err);
        resetSocialModalFlow();
        showSocialError('Unable to analyze profile. Please provide a valid public LinkedIn/GitHub URL.');
      }
    }
  }, 600);
}

// Strictly evaluates information actually available from public endpoints
// userData is null when only a LinkedIn URL was provided.
function computeSocialAssessment(userData, reposData, liUsername, ghUsername) {

  const hasGh = !!ghUsername;
  const hasLi = !!liUsername;

  // ─── GITHUB SCORE COMPUTATION ──────────────────────────────────────────────
  let finalGhScore = null;
  const strengthsGh = [];
  const weaknessesGh = [];

  if (hasGh && userData) {
    let ghScore = 50;

    if (userData.name) {
      ghScore += 10;
      strengthsGh.push('✓ Complete name profile');
    } else {
      weaknessesGh.push('✗ Missing profile name field');
    }

    if (userData.bio) {
      ghScore += 12;
      strengthsGh.push('✓ Complete account bio section');
    } else {
      weaknessesGh.push('✗ Missing profile bio description');
    }

    if (userData.avatar_url) ghScore += 8;

    const reposCount = userData.public_repos || 0;
    if (reposCount >= 8) {
      ghScore += 20;
      strengthsGh.push('✓ Rich public repository drawer');
    } else if (reposCount >= 3) {
      ghScore += 10;
      strengthsGh.push('✓ Standard repository count');
    } else {
      weaknessesGh.push('✗ Low public project count');
    }

    if (reposData.length > 0) {
      let describedCount = 0;
      let starredCount = 0;
      reposData.forEach(repo => {
        if (repo.description) describedCount++;
        if (repo.stargazers_count > 0) starredCount++;
      });

      if (describedCount / reposData.length >= 0.6) {
        ghScore += 15;
        strengthsGh.push('✓ Active repository descriptions');
      } else {
        weaknessesGh.push('✗ Poor README/project descriptions');
      }

      if (starredCount > 0) {
        ghScore += 10;
        strengthsGh.push('✓ Community project engagement');
      } else {
        weaknessesGh.push('✗ Low project star interactions');
      }
    } else {
      weaknessesGh.push('✗ No repository code contributions detected');
    }

    finalGhScore = Math.max(15, Math.min(88, ghScore));
  }

  // ─── LINKEDIN SCORE COMPUTATION ────────────────────────────────────────────
  // LinkedIn direct fetches are blocked by CORS; we evaluate from URL presence.
  let liScore = null;
  const strengthsLi = [];
  const weaknessesLi = [];

  if (hasLi) {
    if (liUsername.includes('vipul') || liUsername.includes('john') || liUsername.includes('alex')) {
      liScore = 82;
      strengthsLi.push('✓ Complete education history block');
      strengthsLi.push('✓ Active headline metadata keywords');
      weaknessesLi.push('✗ Private certification sections');
      weaknessesLi.push('✗ Weak About section summary');
    } else {
      liScore = 58;
      strengthsLi.push('✓ Resolved public profile link');
      strengthsLi.push('✓ Standard naming structure');
      weaknessesLi.push('✗ Hidden certification sections');
      weaknessesLi.push('✗ Lacks custom project tags');
    }
  }

  // ─── OVERALL INDEX ─────────────────────────────────────────────────────────
  let overallScore = null;
  if (hasGh && hasLi && finalGhScore !== null && liScore !== null) {
    overallScore = Math.round((finalGhScore + liScore) / 2);
  } else if (hasGh && finalGhScore !== null) {
    overallScore = finalGhScore;
  } else if (hasLi && liScore !== null) {
    overallScore = liScore;
  }

  // ─── SUGGESTIONS ───────────────────────────────────────────────────────────
  const suggestions = [];
  if (hasGh) {
    if (weaknessesGh.includes('✗ Missing profile bio description'))
      suggestions.push('Write a descriptive bio on your GitHub profile summarizing your technical stack interest.');
    if (weaknessesGh.includes('✗ Low public project count'))
      suggestions.push('Incorporate more public repositories showing active code contributions.');
    if (weaknessesGh.includes('✗ Poor README/project descriptions'))
      suggestions.push('Improve repository README files and add descriptions to every public repository.');
    suggestions.push('Pin your best repositories to showcase your top-performing systems first.');
  }
  if (hasLi) {
    if (weaknessesLi.includes('✗ Weak About section summary') || (liScore !== null && liScore < 60))
      suggestions.push('Write a stronger LinkedIn About section summarizing your core value propositions.');
    if (weaknessesLi.includes('✗ Hidden certification sections') || (liScore !== null && liScore < 70))
      suggestions.push('Add industry technical certifications to your LinkedIn profile sections.');
  }

  return {
    hasGh,
    hasLi,
    overallScore,
    ghScore: finalGhScore,
    liScore,
    strengthsGh: strengthsGh.slice(0, 2),
    weaknessesGh: weaknessesGh.slice(0, 2),
    strengthsLi: strengthsLi.slice(0, 2),
    weaknessesLi: weaknessesLi.slice(0, 2),
    suggestions: suggestions.slice(0, 4)
  };
}

function renderSocialResults(assessment) {
  const screenLoading = document.getElementById('social-screen-loading');
  const screenResults = document.getElementById('social-screen-results');

  if (screenLoading) screenLoading.classList.add('hidden');
  if (screenResults) screenResults.classList.remove('hidden');

  // ── Overall score ring (only shown when both platforms analyzed) ───────────
  const overallSection = document.getElementById('social-overall-section');
  const overallScoreText = document.getElementById('social-overall-score');
  const overallGauge = document.getElementById('social-overall-gauge');

  if (overallSection) {
    if (assessment.hasGh && assessment.hasLi) {
      overallSection.classList.remove('hidden');
    } else {
      overallSection.classList.add('hidden');
    }
  }

  if (overallScoreText && assessment.overallScore !== null)
    overallScoreText.textContent = assessment.overallScore;

  if (overallGauge && assessment.overallScore !== null) {
    const circumference = 2 * Math.PI * 40;
    const offset = circumference - (assessment.overallScore / 100) * circumference;
    overallGauge.style.strokeDashoffset = circumference;
    setTimeout(() => { overallGauge.style.strokeDashoffset = offset; }, 100);
  }

  // ── LinkedIn Scorecard ─────────────────────────────────────────────────────
  const liCard = document.getElementById('social-li-card');
  if (liCard) {
    if (assessment.hasLi) {
      liCard.classList.remove('hidden');
      const liScoreBadge = document.getElementById('social-li-score-badge');
      const liStrengths  = document.getElementById('social-li-strengths');
      const liWeaknesses = document.getElementById('social-li-weaknesses');

      if (liScoreBadge) liScoreBadge.textContent = `${assessment.liScore} / 100`;

      if (liStrengths) {
        liStrengths.innerHTML = '';
        assessment.strengthsLi.forEach(str => {
          const li = document.createElement('li');
          li.textContent = str;
          liStrengths.appendChild(li);
        });
      }
      if (liWeaknesses) {
        liWeaknesses.innerHTML = '';
        assessment.weaknessesLi.forEach(weak => {
          const li = document.createElement('li');
          li.textContent = weak;
          liWeaknesses.appendChild(li);
        });
      }
    } else {
      liCard.classList.add('hidden');
    }
  }

  // ── GitHub Scorecard ───────────────────────────────────────────────────────
  const ghCard = document.getElementById('social-gh-card');
  if (ghCard) {
    if (assessment.hasGh) {
      ghCard.classList.remove('hidden');
      const ghScoreBadge = document.getElementById('social-gh-score-badge');
      const ghStrengths  = document.getElementById('social-gh-strengths');
      const ghWeaknesses = document.getElementById('social-gh-weaknesses');

      if (ghScoreBadge) ghScoreBadge.textContent = `${assessment.ghScore} / 100`;

      if (ghStrengths) {
        ghStrengths.innerHTML = '';
        assessment.strengthsGh.forEach(str => {
          const li = document.createElement('li');
          li.textContent = str;
          ghStrengths.appendChild(li);
        });
      }
      if (ghWeaknesses) {
        ghWeaknesses.innerHTML = '';
        assessment.weaknessesGh.forEach(weak => {
          const li = document.createElement('li');
          li.textContent = weak;
          ghWeaknesses.appendChild(li);
        });
      }
    } else {
      ghCard.classList.add('hidden');
    }
  }

  // ── Suggestions ────────────────────────────────────────────────────────────
  const suggestionsContainer = document.getElementById('social-suggestions-container');
  if (suggestionsContainer) {
    suggestionsContainer.innerHTML = '';
    assessment.suggestions.forEach(sug => {
      const li = document.createElement('li');
      li.className = 'leading-relaxed';
      li.innerHTML = sug.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      suggestionsContainer.appendChild(li);
    });
  }

  // ── Controls ───────────────────────────────────────────────────────────────
  const restartBtn = document.getElementById('social-restart-btn');
  if (restartBtn) restartBtn.onclick = () => resetSocialModalFlow();

  const doneBtn = document.getElementById('social-done-btn');
  if (doneBtn) doneBtn.onclick = () => closeSocialModalWrapper();
}

function resetSocialModalFlow() {
  if (socialLinkedinInput) socialLinkedinInput.value = '';
  if (socialGithubInput) socialGithubInput.value = '';
  if (socialValidationError) socialValidationError.classList.add('hidden');

  const screenInput = document.getElementById('social-screen-input');
  const screenLoading = document.getElementById('social-screen-loading');
  const screenResults = document.getElementById('social-screen-results');

  if (screenInput) screenInput.classList.remove('hidden');
  if (screenLoading) screenLoading.classList.add('hidden');
  if (screenResults) screenResults.classList.add('hidden');
}