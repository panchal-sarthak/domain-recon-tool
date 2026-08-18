// Initialize Lucide icons
lucide.createIcons();

// State management
let reconResult = null;
let currentTab = 'overview';
let scanProgress = 0;
let logs = [];
let riskChart = null;

// DOM Elements
const reconForm = document.getElementById('recon-form');
const domainInput = document.getElementById('domain-input');
const submitBtn = document.getElementById('submit-btn');
const errorMessage = document.getElementById('error-message');
const errorText = document.getElementById('error-text');
const landingFeatures = document.getElementById('landing-features');
const loadingState = document.getElementById('loading-state');
const resultsSection = document.getElementById('results-section');
const terminalLogs = document.getElementById('terminal-logs');
const progressBar = document.getElementById('progress-bar');
const progressPercent = document.getElementById('progress-percent');
const mainPanel = document.getElementById('main-panel');
const sidebarPanel = document.getElementById('sidebar-panel');

// Utility Functions
const addLog = (msg) => {
    logs.push(`> ${msg}`);
    if (logs.length > 6) logs.shift();
    
    terminalLogs.innerHTML = '';
    logs.forEach(log => {
        const div = document.createElement('div');
        div.className = 'flex items-center gap-2 opacity-0';
        div.innerHTML = `<span class="text-blue-600 font-black">#</span> ${log}`;
        terminalLogs.appendChild(div);
        gsap.to(div, { opacity: 1, x: 0, duration: 0.3 });
    });
};

const getRiskColor = (level) => {
    switch (level) {
        case 'High': return 'text-red-500';
        case 'Medium': return 'text-orange-500';
        case 'Low': return 'text-green-500';
        default: return 'text-gray-500';
    }
};

const getRiskBg = (level) => {
    switch (level) {
        case 'High': return 'bg-red-500/10 border-red-500/50';
        case 'Medium': return 'bg-orange-500/10 border-orange-500/50';
        case 'Low': return 'bg-green-500/10 border-green-500/50';
        default: return 'bg-gray-500/10 border-gray-500/50';
    }
};

// Form Submission
reconForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const domain = domainInput.value.trim();
    if (!domain) return;

    // Reset UI
    reconResult = null;
    errorMessage.classList.add('hidden');
    landingFeatures.classList.add('hidden');
    resultsSection.classList.add('hidden');
    loadingState.classList.remove('hidden');
    
    // Initial logs
    logs = ['Initializing security handshake...', 'Connecting to OSINT nodes...'];
    addLog(logs[0]);
    addLog(logs[1]);

    // Simulated progress
    scanProgress = 0;
    const logMessages = [
        'Scanning DNS records...',
        'Enumerating subdomains via crt.sh...',
        'Checking Have I Been Pwned database...',
        'Monitoring public paste sites...',
        'Analyzing infrastructure posture...',
        'Calculating risk scoring vectors...',
        'Compiling final intelligence report...'
    ];

    let logIdx = 0;
    const progressInterval = setInterval(() => {
        if (scanProgress < 90) {
            scanProgress += Math.random() * 8;
            updateProgress(scanProgress);
            
            if (scanProgress > (logIdx + 1) * 12 && logIdx < logMessages.length) {
                addLog(logMessages[logIdx]);
                logIdx++;
            }
        }
    }, 400);

    try {
        const response = await axios.post('/api/recon', { domain });
        reconResult = response.data;
        
        clearInterval(progressInterval);
        updateProgress(100);
        
        setTimeout(() => {
            loadingState.classList.add('hidden');
            renderResults();
        }, 800);
    } catch (err) {
        clearInterval(progressInterval);
        loadingState.classList.add('hidden');
        landingFeatures.classList.remove('hidden');
        errorMessage.classList.remove('hidden');
        errorText.innerText = err.response?.data?.detail || 'An error occurred during reconnaissance.';
    }
});

function updateProgress(val) {
    const percent = Math.min(Math.round(val), 100);
    progressPercent.innerText = `${percent}%`;
    progressBar.style.width = `${percent}%`;
    
    // Update step colors
    if (percent > 25) document.getElementById('step-dns').classList.add('text-blue-500');
    if (percent > 50) document.getElementById('step-breach').classList.add('text-blue-500');
    if (percent > 75) document.getElementById('step-ip').classList.add('text-blue-500');
    if (percent > 95) document.getElementById('step-leak').classList.add('text-blue-500');
}

function renderResults() {
    resultsSection.classList.remove('hidden');
    gsap.from('#results-section', { opacity: 0, y: 40, duration: 0.8, ease: "power2.out" });

    // Header info
    document.getElementById('result-domain').innerText = reconResult.domain;
    document.getElementById('result-ip').innerText = reconResult.ip;
    document.getElementById('org-name').innerText = reconResult.ip_info?.org || "CLOUD_INFRASTRUCTURE";
    document.getElementById('execution-time').innerText = reconResult.metadata.execution_time_sec;

    // Stats Grid
    const statsGrid = document.getElementById('stats-grid');
    statsGrid.innerHTML = `
        <div class="text-center flex flex-col items-center gap-2 md:border-r md:border-slate-800 md:pr-10">
            <div class="p-2 rounded-lg bg-blue-500/10 text-blue-400 mb-1"><i data-lucide="mail" class="w-4 h-4"></i></div>
            <div class="text-3xl font-black text-white tracking-tighter">${reconResult.emails.length}</div>
            <div class="text-[9px] text-slate-500 uppercase font-black tracking-widest">Exposed Emails</div>
        </div>
        <div class="text-center flex flex-col items-center gap-2 md:border-r md:border-slate-800 md:pr-10">
            <div class="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 mb-1"><i data-lucide="server" class="w-4 h-4"></i></div>
            <div class="text-3xl font-black text-white tracking-tighter">${reconResult.subdomains.length}</div>
            <div class="text-[9px] text-slate-500 uppercase font-black tracking-widest">Subdomains</div>
        </div>
        <div class="text-center flex flex-col items-center gap-2">
            <div class="p-2 rounded-lg bg-red-500/10 text-red-400 mb-1"><i data-lucide="history" class="w-4 h-4"></i></div>
            <div class="text-3xl font-black text-white tracking-tighter">${reconResult.all_breaches.length}</div>
            <div class="text-[9px] text-slate-500 uppercase font-black tracking-widest">Breaches</div>
        </div>
    `;
    lucide.createIcons();

    switchTab('overview');
    renderRiskPanel();
}

function switchTab(tabId) {
    currentTab = tabId;
    
    // Update UI tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('tab-active');
        btn.classList.add('text-slate-500');
    });
    document.getElementById(`tab-${tabId}`).classList.add('tab-active');
    document.getElementById(`tab-${tabId}`).classList.remove('text-slate-500');

    // Render Panel Content
    mainPanel.innerHTML = '';
    gsap.from(mainPanel, { opacity: 0, x: 20, duration: 0.5 });

    if (tabId === 'overview') renderOverview();
    else if (tabId === 'emails') renderEmails();
    else if (tabId === 'infrastructure') renderInfrastructure();
    else if (tabId === 'leaks') renderLeaks();
}

function renderOverview() {
    mainPanel.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div class="bg-slate-900/40 border border-slate-800 p-8 rounded-[2rem] backdrop-blur-sm relative overflow-hidden group">
                <h3 class="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
                    <i data-lucide="shield" class="w-3.5 h-3.5 text-blue-500"></i> BREACH_DISTRIBUTION
                </h3>
                <div class="h-[240px] w-full relative">
                    <canvas id="breachChart"></canvas>
                    <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div class="text-center">
                            <div class="text-2xl font-black text-white tracking-tighter">${reconResult.emails.length}</div>
                            <div class="text-[8px] text-slate-500 font-black uppercase tracking-widest">TOTAL_IDS</div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="bg-slate-900/40 border border-slate-800 p-8 rounded-[2rem] backdrop-blur-sm flex flex-col">
                <h3 class="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                    <i data-lucide="history" class="w-3.5 h-3.5 text-indigo-500"></i> THREAT_HISTORY
                </h3>
                <div class="space-y-4 flex-1" id="threat-history-list"></div>
            </div>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-6" id="quick-stats-grid"></div>
    `;

    // Render Threat History
    const threatList = document.getElementById('threat-history-list');
    if (reconResult.all_breaches.length > 0) {
        reconResult.all_breaches.slice(0, 4).forEach((breach, i) => {
            const div = document.createElement('div');
            div.className = 'flex items-center gap-4 p-4 bg-slate-950/40 rounded-2xl border border-slate-800/50 hover:border-indigo-500/30 transition-colors group/item';
            div.innerHTML = `
                <div class="p-2.5 bg-red-500/10 text-red-500 rounded-xl group-hover/item:scale-110 transition-transform">
                    <i data-lucide="alert-triangle" class="w-4 h-4"></i>
                </div>
                <div class="flex-1 min-w-0">
                    <div class="text-xs font-bold text-slate-200 truncate">${breach.title}</div>
                    <div class="text-[9px] text-slate-500 mt-1 font-black uppercase tracking-widest">${breach.breach_date}</div>
                </div>
            `;
            threatList.appendChild(div);
        });
    } else {
        threatList.innerHTML = `<div class="flex flex-col items-center justify-center flex-1 text-slate-600 space-y-3 opacity-50 py-10">
            <i data-lucide="shield-check" class="w-10 h-10"></i>
            <p class="text-[11px] font-black uppercase tracking-widest">Clean History</p>
        </div>`;
    }

    // Quick Stats
    const quickStats = document.getElementById('quick-stats-grid');
    const stats = [
        { label: 'DNS Health', val: 'SECURE', color: 'text-green-400', icon: 'shield-check', bg: 'bg-green-400/5' },
        { label: 'Subdomains', val: reconResult.subdomains.length, color: 'text-blue-400', icon: 'server', bg: 'bg-blue-400/5' },
        { label: 'Active Ports', val: reconResult.open_ports.length, color: 'text-orange-400', icon: 'lock', bg: 'bg-orange-400/5' },
        { label: 'Leak Refs', val: reconResult.public_leaks.length, color: 'text-red-400', icon: 'external-link', bg: 'bg-red-400/5' },
    ];
    stats.forEach(stat => {
        const div = document.createElement('div');
        div.className = `bg-slate-900/40 border border-slate-800/80 p-6 rounded-[1.5rem] text-center transition-all duration-300 ${stat.bg} hover:-translate-y-1`;
        div.innerHTML = `
            <div class="flex justify-center mb-3">
                <div class="p-2.5 rounded-xl ${stat.bg.replace('5', '10')} ${stat.color}"><i data-lucide="${stat.icon}" class="w-4.5 h-4.5"></i></div>
            </div>
            <div class="text-2xl font-black ${stat.color} tracking-tighter">${stat.val}</div>
            <div class="text-[9px] text-slate-500 uppercase font-black mt-2 tracking-[0.2em]">${stat.label}</div>
        `;
        quickStats.appendChild(div);
    });

    lucide.createIcons();
    initBreachChart();
}

function initBreachChart() {
    const ctx = document.getElementById('breachChart').getContext('2d');
    const high = reconResult.emails.filter(e => e.severity === 'High').length || 0.1;
    const med = reconResult.emails.filter(e => e.severity === 'Medium').length || 0.1;
    const low = reconResult.emails.filter(e => e.severity === 'Low').length || 0.1;

    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['High', 'Medium', 'Low'],
            datasets: [{
                data: [high, med, low],
                backgroundColor: ['#ef4444', '#f97316', '#22c55e'],
                borderWidth: 0,
                hoverOffset: 4
            }]
        },
        options: {
            cutout: '70%',
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: '#0f172a',
                    titleColor: '#fff',
                    bodyColor: '#cbd5e1',
                    borderColor: '#1e293b',
                    borderWidth: 1,
                    padding: 12,
                    displayColors: false
                }
            }
        }
    });
}

function renderEmails() {
    mainPanel.innerHTML = `
        <div class="bg-slate-800/50 border border-slate-700 rounded-2xl overflow-hidden">
            <div class="p-6 border-b border-slate-700 flex items-center justify-between bg-slate-800/30">
                <h3 class="font-bold flex items-center gap-2 text-slate-200"><i data-lucide="mail" class="w-4.5 h-4.5 text-blue-500"></i> Exposed Email Accounts</h3>
                <span class="text-xs font-bold px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full">${reconResult.emails.length} Found</span>
            </div>
            <div class="divide-y divide-slate-700/50" id="emails-list"></div>
        </div>
    `;

    const list = document.getElementById('emails-list');
    reconResult.emails.forEach(item => {
        const div = document.createElement('div');
        div.className = 'p-6 hover:bg-slate-700/10 transition-colors';
        div.innerHTML = `
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div class="flex items-center gap-3">
                    <div class="p-2 rounded-lg ${item.severity === 'High' ? 'bg-red-500/10 text-red-500' : item.severity === 'Medium' ? 'bg-orange-500/10 text-orange-500' : 'bg-green-500/10 text-green-500'}">
                        <i data-lucide="mail" class="w-4.5 h-4.5"></i>
                    </div>
                    <div>
                        <div class="font-mono text-white font-medium">${item.email}</div>
                        <div class="text-[10px] text-slate-500 mt-0.5 font-bold uppercase tracking-tighter">Identity Discovery</div>
                    </div>
                </div>
                <div class="flex items-center gap-4">
                    <span class="text-[10px] font-bold px-2 py-1 rounded border uppercase ${item.severity === 'High' ? 'bg-red-500/10 text-red-400 border-red-500/30' : item.severity === 'Medium' ? 'bg-orange-500/10 text-orange-400 border-orange-500/30' : 'bg-green-500/10 text-green-400 border-green-500/30'}">
                        ${item.severity} Risk
                    </span>
                </div>
            </div>
            ${item.exposed_data.length > 0 ? `
            <div class="mt-4 pt-4 border-t border-slate-800/50 flex flex-wrap gap-2">
                ${item.exposed_data.map(d => `<span class="text-[10px] bg-slate-900 text-slate-400 px-2 py-0.5 rounded border border-slate-800">${d}</span>`).join('')}
            </div>` : ''}
        `;
        list.appendChild(div);
    });
    lucide.createIcons();
}

function renderInfrastructure() {
    mainPanel.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="bg-slate-800/50 border border-slate-700 rounded-2xl overflow-hidden">
                <div class="p-6 border-b border-slate-700 bg-slate-800/30">
                    <h3 class="font-bold flex items-center gap-2 text-slate-200"><i data-lucide="server" class="w-4.5 h-4.5 text-purple-500"></i> Subdomain Discovery</h3>
                </div>
                <div class="p-6 max-h-[400px] overflow-y-auto custom-scrollbar space-y-2" id="subdomains-list"></div>
            </div>
            <div class="bg-slate-800/50 border border-slate-700 rounded-2xl overflow-hidden">
                <div class="p-6 border-b border-slate-700 bg-slate-800/30">
                    <h3 class="font-bold flex items-center gap-2 text-slate-200"><i data-lucide="lock" class="w-4.5 h-4.5 text-orange-500"></i> Port Visibility</h3>
                </div>
                <div class="p-6 space-y-4" id="ports-list"></div>
            </div>
        </div>
    `;

    const subList = document.getElementById('subdomains-list');
    if (reconResult.subdomains.length > 0) {
        reconResult.subdomains.forEach(sub => {
            const div = document.createElement('div');
            div.className = 'text-xs font-mono text-slate-400 bg-slate-900/50 border border-slate-800 p-3 rounded-lg flex items-center justify-between group hover:translate-x-1 transition-all';
            div.innerHTML = `<span class="truncate">${sub}</span> <i data-lucide="external-link" class="w-3 h-3 text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity"></i>`;
            subList.appendChild(div);
        });
    } else {
        subList.innerHTML = `<div class="text-center py-10 text-slate-500 italic text-sm">No subdomains found</div>`;
    }

    const portList = document.getElementById('ports-list');
    if (reconResult.open_ports.length > 0) {
        reconResult.open_ports.forEach(p => {
            const div = document.createElement('div');
            div.className = 'flex items-center justify-between p-4 bg-slate-900/50 rounded-xl border border-slate-800';
            div.innerHTML = `
                <div class="flex items-center gap-3">
                    <div class="p-2 bg-orange-500/10 text-orange-500 rounded-lg"><i data-lucide="server" class="w-4 h-4"></i></div>
                    <div>
                        <div class="text-sm font-bold text-white">Port ${p.port}</div>
                        <div class="text-[10px] text-slate-500 font-bold uppercase tracking-widest">${p.service}</div>
                    </div>
                </div>
                <span class="text-[10px] bg-green-500/10 text-green-500 px-2 py-0.5 rounded border border-green-500/20 font-bold">OPEN</span>
            `;
            portList.appendChild(div);
        });
    } else {
        portList.innerHTML = `<div class="flex flex-col items-center justify-center py-12 text-slate-500 space-y-2">
            <i data-lucide="shield-check" class="w-10 h-10 text-slate-700"></i>
            <p class="text-sm italic">No sensitive ports exposed</p>
        </div>`;
    }
    lucide.createIcons();
}

function renderLeaks() {
    mainPanel.innerHTML = `
        <div class="bg-slate-800/50 border border-slate-700 rounded-2xl overflow-hidden shadow-xl">
            <div class="p-6 border-b border-slate-700 bg-slate-800/30 flex items-center justify-between">
                <h3 class="font-bold flex items-center gap-2 text-slate-200"><i data-lucide="external-link" class="w-4.5 h-4.5 text-orange-500"></i> Leak & Paste References</h3>
                <span class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">OSINT Monitoring</span>
            </div>
            <div class="p-6 space-y-4" id="leaks-list"></div>
        </div>
    `;

    const list = document.getElementById('leaks-list');
    if (reconResult.public_leaks.length > 0) {
        reconResult.public_leaks.forEach(leak => {
            const div = document.createElement('div');
            div.className = 'border border-slate-700 rounded-2xl p-6 bg-slate-900/50 hover:bg-slate-900 transition-all group';
            div.innerHTML = `
                <div class="flex justify-between items-start mb-4">
                    <div class="flex items-start gap-4">
                        <div class="p-3 rounded-xl ${leak.severity === 'High' ? 'bg-red-500/10 text-red-500' : leak.severity === 'Medium' ? 'bg-orange-500/10 text-orange-500' : 'bg-green-500/10 text-green-500'}">
                            <i data-lucide="external-link" class="w-5 h-5"></i>
                        </div>
                        <div>
                            <h4 class="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">${leak.title}</h4>
                            <div class="flex items-center gap-3 mt-1">
                                <span class="text-xs font-bold text-blue-500">${leak.source}</span>
                                <span class="text-slate-700">•</span>
                                <span class="text-[10px] text-slate-500 font-bold uppercase">${leak.date}</span>
                            </div>
                        </div>
                    </div>
                    <span class="text-[10px] font-black px-2 py-1 rounded-lg border uppercase tracking-widest ${leak.severity === 'High' ? 'bg-red-500/10 text-red-400 border-red-500/30' : leak.severity === 'Medium' ? 'bg-orange-500/10 text-orange-400 border-orange-500/30' : 'bg-green-500/10 text-green-400 border-green-500/30'}">
                        ${leak.severity}
                    </span>
                </div>
                <div class="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-400 leading-relaxed">${leak.snippet}</div>
                <div class="mt-4 flex justify-end">
                    <a href="${leak.url}" target="_blank" class="text-xs font-bold text-slate-500 hover:text-white flex items-center gap-1.5 transition-colors">
                        View Reference <i data-lucide="external-link" class="w-3 h-3"></i>
                    </a>
                </div>
            `;
            list.appendChild(div);
        });
    } else {
        list.innerHTML = `<div class="text-center py-20 text-slate-600">
            <i data-lucide="history" class="w-12 h-12 mx-auto mb-4 opacity-20"></i>
            <p class="text-sm italic">No data leaks discovered in public pastes</p>
        </div>`;
    }
    lucide.createIcons();
}

function renderRiskPanel() {
    const report = reconResult.risk_report;
    sidebarPanel.innerHTML = `
        <div class="p-8 rounded-3xl border-2 ${getRiskBg(report.level)} flex flex-col items-center text-center space-y-6 shadow-2xl relative overflow-hidden">
            <div class="absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 rounded-full blur-3xl opacity-10 ${getRiskColor(report.level).replace('text-', 'bg-')}"></div>
            
            <h2 class="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Security Risk Profile</h2>
            
            <div class="relative flex items-center justify-center">
                <canvas id="riskGauge" width="160" height="160"></canvas>
                <div class="absolute flex flex-col items-center">
                    <span class="text-4xl font-black text-white">${report.score}<span class="text-xl text-slate-500">%</span></span>
                    <span class="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-1">Vulnerability Index</span>
                </div>
            </div>
            
            <div>
                <div class="text-2xl font-black uppercase tracking-tight ${getRiskColor(report.level)}">${report.level} Risk</div>
                <p class="text-[10px] text-slate-500 mt-2 font-bold uppercase tracking-widest px-4 py-1 bg-slate-900/50 rounded-full border border-slate-800 inline-block">Security Posture</p>
            </div>

            <div class="w-full pt-8 border-t border-slate-700/50 space-y-4 text-left">
                <h4 class="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-2">
                    <i data-lucide="info" class="w-3 h-3"></i> Critical Exposure Factors
                </h4>
                <div id="risk-reasons" class="space-y-3"></div>
            </div>
        </div>

        <div class="bg-slate-800/30 border border-slate-700/50 p-6 rounded-2xl">
            <h4 class="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <i data-lucide="shield" class="w-3 h-3"></i> OSINT Assessment
            </h4>
            <p class="text-[11px] text-slate-400 leading-relaxed">
                This score is calculated based on publicly accessible data points including data breaches, infrastructure exposure, and subdomain visibility.
            </p>
        </div>
    `;

    const reasons = document.getElementById('risk-reasons');
    report.reasons.forEach(reason => {
        const div = document.createElement('div');
        div.className = 'flex gap-3 text-xs text-slate-300 leading-snug p-3 bg-slate-900/30 rounded-xl border border-slate-800/50 group hover:border-blue-500/30 transition-colors';
        div.innerHTML = `<div class="mt-0.5"><i data-lucide="check-circle" class="w-3 h-3 text-blue-500"></i></div> <span class="group-hover:text-slate-100 transition-colors">${reason}</span>`;
        reasons.appendChild(div);
    });

    lucide.createIcons();
    initRiskGauge(report.score, report.level);
}

function initRiskGauge(score, level) {
    const canvas = document.getElementById('riskGauge');
    const ctx = canvas.getContext('2d');
    const color = level === 'High' ? '#ef4444' : level === 'Medium' ? '#f97316' : '#22c55e';
    
    // Simple gauge animation using GSAP
    const gaugeObj = { val: 0 };
    gsap.to(gaugeObj, {
        val: score,
        duration: 2,
        ease: "power2.out",
        onUpdate: () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Background track
            ctx.beginPath();
            ctx.arc(80, 80, 74, 0, 2 * Math.PI);
            ctx.strokeStyle = 'rgba(30, 41, 59, 0.5)';
            ctx.lineWidth = 10;
            ctx.stroke();

            // Progress arc
            ctx.beginPath();
            ctx.arc(80, 80, 74, -Math.PI / 2, (-Math.PI / 2) + (2 * Math.PI * gaugeObj.val / 100));
            ctx.strokeStyle = color;
            ctx.lineWidth = 10;
            ctx.lineCap = 'round';
            ctx.stroke();
        }
    });
}
