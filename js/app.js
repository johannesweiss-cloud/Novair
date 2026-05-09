// Elements
const welcomeView = document.getElementById('welcome-view');
const onboardingView = document.getElementById('onboarding-view');
const dashboardView = document.getElementById('dashboard-view');
const startBtn = document.getElementById('start-btn');
const finishOnboardingBtn = document.getElementById('finish-onboarding-btn');

// Settings Modal Elements
const motivationInput = document.getElementById('motivation-text');
const quitInput = document.getElementById('quit-date');
const cigsPerDayInput = document.getElementById('cigs-per-day');
const cigsPerPackInput = document.getElementById('cigs-per-pack');
const priceInput = document.getElementById('price-per-pack');

// Onboarding Elements
const obMotivationInput = document.getElementById('ob-motivation');
const obCigsDayInput = document.getElementById('ob-cigs-day');
const obCigsPackInput = document.getElementById('ob-cigs-pack');
const obPriceInput = document.getElementById('ob-price-pack');

// Load Configuration safely
const savedMotivation = localStorage.getItem('novair_motivation');
const savedCigsDay = localStorage.getItem('novair_cigsDay');
const savedCigsPack = localStorage.getItem('novair_cigsPack');
const savedPrice = localStorage.getItem('novair_pricePack');

motivationInput.value = savedMotivation || '';
cigsPerDayInput.value = savedCigsDay || "20";
cigsPerPackInput.value = savedCigsPack || "20";
priceInput.value = savedPrice || "8.00";

let updateInterval;

// Milestones definition (in minutes)
const milestones = [
  { name: "Blutdruck normalisiert sich", time: 20, desc: "Puls und Blutdruck fallen auf normale Werte." },
  { name: "Kohlenmonoxid sinkt", time: 720, desc: "Sauerstoffversorgung im Blut verbessert sich (12h)." },
  { name: "Herzinfarkt-Risiko sinkt", time: 1440, desc: "Erste messbare Verringerung des Risikos (24h)." },
  { name: "Geruch & Geschmack", time: 2880, desc: "Nervenden erholen sich spürbar (48h)." },
  { name: "Freier atmen", time: 4320, desc: "Bronchien entspannen sich, das Atmen fällt leichter (72h)." },
  { name: "Besserer Kreislauf", time: 20160, desc: "Lungenfunktion und Durchblutung nehmen zu (2 Wochen)." },
  { name: "Weniger Husten", time: 129600, desc: "Lunge reinigt sich aktiv, Flimmerhärchen wachsen nach (3 Monate)." },
  { name: "Herzinfarkt-Risiko (1 Jahr)", time: 525600, desc: "Das Risiko ist nur noch halb so hoch wie bei einem Raucher." },
  { name: "Lungenkrebs-Risiko (10 Jahre)", time: 5256000, desc: "Das Risiko ist im Vergleich zu einem Raucher um die Hälfte gesunken." }
];

// Badges definitions using Lucide icons
const badgesDef = [
  { id: 'time_24h', icon: 'sun', title: '1 Tag', condition: (diffMin) => diffMin >= 1440 },
  { id: 'time_1w', icon: 'calendar-days', title: '1 Woche', condition: (diffMin) => diffMin >= 10080 },
  { id: 'time_1m', icon: 'moon', title: '1 Monat', condition: (diffMin) => diffMin >= 43200 },
  { id: 'money_50', icon: 'banknote', title: '50€', condition: (_, money) => money >= 50 },
  { id: 'money_100', icon: 'coins', title: '100€', condition: (_, money) => money >= 100 },
  { id: 'money_500', icon: 'gem', title: '500€', condition: (_, money) => money >= 500 },
  { id: 'cig_100', icon: 'shield', title: '100 vermieden', condition: (_, __, avoided) => avoided >= 100 },
  { id: 'cig_1000', icon: 'crown', title: '1.000 vermieden', condition: (_, __, avoided) => avoided >= 1000 }
];

function toggleCravingModal() {
  const modal = document.getElementById('craving-modal');
  if (modal.classList.contains('hidden')) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  } else {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

// Make toggleCravingModal available globally since it's called from HTML inline onclick
window.toggleCravingModal = toggleCravingModal;

function toggleSettingsModal() {
  const modal = document.getElementById('settings-modal');
  if (modal.classList.contains('hidden')) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  } else {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

window.toggleSettingsModal = toggleSettingsModal;

function saveConfig() {
  localStorage.setItem('novair_motivation', motivationInput.value);
  localStorage.setItem('novair_cigsDay', cigsPerDayInput.value);
  localStorage.setItem('novair_cigsPack', cigsPerPackInput.value);
  localStorage.setItem('novair_pricePack', priceInput.value);
}

// Input Events
[motivationInput, cigsPerDayInput, cigsPerPackInput, priceInput].forEach(el => el.addEventListener('input', () => {
  saveConfig();
  if(localStorage.getItem('novair_start_time')) updateApp();
}));

quitInput.addEventListener('change', () => {
  const newTime = new Date(quitInput.value).getTime();
  if (!isNaN(newTime)) {
    localStorage.setItem('novair_start_time', newTime.toString());
    updateApp();
  }
});

function initDashboard() {
  // Render Milestones structure once
  const healthContainer = document.getElementById('health-milestones');
  healthContainer.innerHTML = milestones.map((m, index) => `
    <div class="space-y-2.5 relative">
      <div class="flex justify-between items-end">
        <div>
          <p id="milestone-text-${index}" class="font-semibold text-sm md:text-base text-gray-800 flex items-center transition-colors">
            ${m.name} <span id="milestone-icon-${index}"></span>
          </p>
          <p class="text-xs md:text-sm text-gray-500 mt-0.5">${m.desc}</p>
        </div>
        <span id="milestone-percent-${index}" class="text-xs md:text-sm font-mono font-medium text-gray-400">0.0%</span>
      </div>
      <div class="w-full bg-gray-100 h-2 rounded-full overflow-hidden border border-gray-200">
        <div id="milestone-bar-${index}" class="progress-bar-inner h-full bg-gray-400 rounded-full relative" style="width: 0%">
        </div>
      </div>
    </div>
  `).join('');

  // Render Badges structure once
  const badgesContainer = document.getElementById('badges-container');
  badgesContainer.innerHTML = badgesDef.map((b, index) => `
    <div id="badge-${index}" class="flex flex-col items-center p-4 rounded-xl border bg-white border-gray-100 text-gray-300 transition-all duration-300">
      <i data-lucide="${b.icon}" class="w-8 h-8 md:w-10 md:h-10 mb-3 stroke-[1.5]"></i>
      <span class="text-xs font-semibold">${b.title}</span>
    </div>
  `).join('');

  // Generate all icons in the DOM
  setTimeout(() => lucide.createIcons(), 50);
}

startBtn.addEventListener('click', () => {
  welcomeView.classList.add('hidden');
  onboardingView.classList.remove('hidden');
  setTimeout(() => lucide.createIcons(), 50);
});

finishOnboardingBtn.addEventListener('click', () => {
  const mot = obMotivationInput.value || '';
  const cigsDay = obCigsDayInput.value || '20';
  const cigsPack = obCigsPackInput.value || '20';
  const price = obPriceInput.value || '8.00';
  
  localStorage.setItem('novair_motivation', mot);
  localStorage.setItem('novair_cigsDay', cigsDay);
  localStorage.setItem('novair_cigsPack', cigsPack);
  localStorage.setItem('novair_pricePack', price);
  
  // Set values in Settings Modal
  motivationInput.value = mot;
  cigsPerDayInput.value = cigsDay;
  cigsPerPackInput.value = cigsPack;
  priceInput.value = price;

  const now = new Date();
  localStorage.setItem('novair_start_time', now.getTime().toString());
  
  const localNow = new Date();
  localNow.setMinutes(localNow.getMinutes() - localNow.getTimezoneOffset());
  quitInput.value = localNow.toISOString().slice(0,19);

  onboardingView.classList.add('hidden');
  dashboardView.classList.remove('hidden');
  
  initDashboard();
  updateApp();
  updateInterval = setInterval(updateApp, 1000);
});

function updateApp() {
  const startTimeStr = localStorage.getItem('novair_start_time');
  if (!startTimeStr) return;

  const startTime = parseInt(startTimeStr, 10);
  const now = new Date().getTime();
  const diffMs = now - startTime;
  
  const diffSec = Math.max(0, Math.floor(diffMs / 1000));
  const diffDays = Math.floor(diffSec / 86400);
  const diffHours = Math.floor((diffSec % 86400) / 3600);
  const diffMin = Math.floor((diffSec % 3600) / 60);
  const diffSecondsLeft = diffSec % 60;
  
  const totalMinForCalc = diffSec / 60;

  // Berechnungen
  const cigsPerDay = parseFloat(cigsPerDayInput.value || 0);
  const cigsPerPack = parseFloat(cigsPerPackInput.value || 1);
  const pricePerPack = parseFloat(priceInput.value || 0);
  
  const cigsPerMinute = cigsPerDay / 1440;
  const avoidedCigs = cigsPerMinute * totalMinForCalc;
  const moneySaved = (avoidedCigs / cigsPerPack) * pricePerPack;

  // Stats Update
  document.getElementById('stat-days').innerText = diffDays.toString();
  
  const hoursText = diffHours === 1 ? '1 Stunde' : `${diffHours} Stunden`;
  const minText = diffMin === 1 ? '1 Minute' : `${diffMin} Minuten`;
  const secText = diffSecondsLeft === 1 ? '1 Sekunde' : `${diffSecondsLeft} Sekunden`;
  document.getElementById('stat-seconds-ticker').innerText = `${hoursText}, ${minText}, ${secText}`;
  
  document.getElementById('stat-money').innerText = `${moneySaved.toLocaleString('de-DE', {minimumFractionDigits: 2, maximumFractionDigits: 2})} €`;
  document.getElementById('stat-avoided').innerText = Math.floor(avoidedCigs).toLocaleString('de-DE');

  // Health Milestones Targeted Update
  milestones.forEach((m, index) => {
    const progress = Math.min(100, (totalMinForCalc / m.time) * 100);
    const isDone = progress === 100;
    
    const textEl = document.getElementById(`milestone-text-${index}`);
    const iconEl = document.getElementById(`milestone-icon-${index}`);
    const percentEl = document.getElementById(`milestone-percent-${index}`);
    const barEl = document.getElementById(`milestone-bar-${index}`);

    if (percentEl) percentEl.innerText = `${progress.toFixed(1)}%`;
    if (barEl) barEl.style.width = `${progress}%`;

    if (isDone) {
      if (textEl) {
        textEl.classList.remove('text-gray-800');
        textEl.classList.add('text-black');
      }
      if (percentEl) {
        percentEl.classList.remove('text-gray-400');
        percentEl.classList.add('text-black');
      }
      if (barEl) {
        barEl.classList.remove('bg-gray-400');
        barEl.classList.add('bg-black');
      }
      if (iconEl && !iconEl.hasChildNodes()) {
        iconEl.innerHTML = '<i data-lucide="check-circle-2" class="w-4 h-4 ml-1.5 text-black"></i>';
        lucide.createIcons({ root: iconEl });
      }
    } else {
      if (textEl) {
        textEl.classList.add('text-gray-800');
        textEl.classList.remove('text-black');
      }
      if (percentEl) {
        percentEl.classList.add('text-gray-400');
        percentEl.classList.remove('text-black');
      }
      if (barEl) {
        barEl.classList.add('bg-gray-400');
        barEl.classList.remove('bg-black');
      }
      if (iconEl && iconEl.hasChildNodes()) {
        iconEl.innerHTML = '';
      }
    }
  });

  // Badges Targeted Update
  badgesDef.forEach((b, index) => {
    const unlocked = b.condition(totalMinForCalc, moneySaved, avoidedCigs);
    const badgeEl = document.getElementById(`badge-${index}`);
    
    if (badgeEl) {
      if (unlocked) {
        badgeEl.className = "flex flex-col items-center p-4 rounded-xl border bg-gray-50 border-gray-200 badge-unlocked text-black transition-all duration-300";
      } else {
        badgeEl.className = "flex flex-col items-center p-4 rounded-xl border bg-white border-gray-100 text-gray-300 transition-all duration-300";
      }
    }
  });
}

// Init
const existingStartTime = localStorage.getItem('novair_start_time');
if (existingStartTime) {
  welcomeView.classList.add('hidden');
  onboardingView.classList.add('hidden');
  dashboardView.classList.remove('hidden');
  
  const d = new Date(parseInt(existingStartTime, 10));
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  quitInput.value = d.toISOString().slice(0, 19);
  
  initDashboard();
  updateApp();
  updateInterval = setInterval(updateApp, 1000);
} else {
  welcomeView.classList.remove('hidden');
  onboardingView.classList.add('hidden');
  dashboardView.classList.add('hidden');
  setTimeout(() => lucide.createIcons(), 50);
}
