// === DOM REFERENCES ===
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

// Goals Elements
const goalInputs = [
  { name: document.getElementById('goal1-name'), price: document.getElementById('goal1-price') },
  { name: document.getElementById('goal2-name'), price: document.getElementById('goal2-price') },
  { name: document.getElementById('goal3-name'), price: document.getElementById('goal3-price') }
];

// Onboarding Elements
const obMotivationInput = document.getElementById('ob-motivation');
const obCigsDayInput = document.getElementById('ob-cigs-day');
const obCigsPackInput = document.getElementById('ob-cigs-pack');
const obPriceInput = document.getElementById('ob-price-pack');

// === CONFIG INITIALIZATION ===
// Load Configuration safely
const savedMotivation = localStorage.getItem('novair_motivation');
const savedCigsDay = localStorage.getItem('novair_cigsDay');
const savedCigsPack = localStorage.getItem('novair_cigsPack');
const savedPrice = localStorage.getItem('novair_pricePack');

motivationInput.value = savedMotivation || '';
cigsPerDayInput.value = savedCigsDay || "20";
cigsPerPackInput.value = savedCigsPack || "20";
priceInput.value = savedPrice || "8.00";

goalInputs.forEach((g, i) => {
  const savedName = localStorage.getItem(`novair_goal${i + 1}_name`);
  const savedPrice = localStorage.getItem(`novair_goal${i + 1}_price`);
  if (savedName) g.name.value = savedName;
  if (savedPrice) g.price.value = savedPrice;
});

let updateInterval;
let fpInstance;
let celebratedMilestones = JSON.parse(localStorage.getItem('novair_celebrated') || '[]');
let currentShareData = null;

// === DATA ===
const dailyFacts = [
  "Tag 1: Dein Puls und Blutdruck beginnen sich zu normalisieren.",
  "Tag 2: Kohlenmonoxid in deinem Blut sinkt, Sauerstoff steigt auf Normalniveau.",
  "Tag 3: Nikotin ist fast vollständig abgebaut. Die physische Abhängigkeit sinkt.",
  "Tag 4: Dein Geruchs- und Geschmackssinn verfeinert sich spürbar.",
  "Tag 5: Das Atmen fällt dir leichter, deine Bronchien entspannen sich.",
  "Tag 6: Deine Lungenkapazität beginnt sich zu verbessern.",
  "Tag 7: Eine Woche rauchfrei! Die schlimmsten körperlichen Entzugserscheinungen sind oft überstanden.",
  "Tag 8: Dein Kreislauf stabilisiert sich weiter. Körperliche Aktivitäten fallen leichter.",
  "Tag 9: Das Verlangen nach Zigaretten sollte jetzt seltener und schwächer werden.",
  "Tag 10: Deine Haut wird besser durchblutet und sieht frischer aus.",
  "Tag 11: Deine Zähne und Finger werden nicht mehr durch neuen Teer verfärbt.",
  "Tag 12: Du hast bereits spürbar mehr Energie im Alltag.",
  "Tag 13: Hustenanfälle und Kurzatmigkeit gehen langsam zurück.",
  "Tag 14: Zwei Wochen! Deine Lungenfunktion hat sich signifikant verbessert."
];

const genericMotivations = [
  "Jeder rauchfreie Tag ist ein Gewinn für deine Gesundheit.",
  "Bleib stark! Du tust genau das Richtige.",
  "Dein Körper dankt dir für jede nicht gerauchte Zigarette.",
  "Die Gewohnheit verblasst mit jedem Tag, den du durchhältst.",
  "Erinnere dich daran, warum du angefangen hast aufzuhören.",
  "Du hast die Kontrolle zurückgewonnen.",
  "Ein rauchfreies Leben bedeutet mehr Freiheit und Energie."
];

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

// === MODALS ===
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

function resolveCraving() {
  if (typeof confetti !== 'undefined') {
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 }
    });
  }
  if (window.umami) {
    window.umami.track('craving_resolved');
  }
  toggleCravingModal();
}
window.resolveCraving = resolveCraving;

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

// === SETTINGS & CONFIG ===
function resetTimer() {
  if (confirm('Ein Rückfall ist völlig normal. Möchtest du den Timer jetzt neu starten?')) {
    const now = new Date();
    localStorage.setItem('novair_start_time', now.getTime().toString());
    localStorage.setItem('novair_slipups', '0');
    localStorage.removeItem('novair_checkins');
    localStorage.removeItem('novair_streak');
    localStorage.removeItem('novair_last_checkin_date');

    const localNow = new Date();
    localNow.setMinutes(localNow.getMinutes() - localNow.getTimezoneOffset());
    if (fpInstance) fpInstance.setDate(localNow, false);
    else quitInput.value = localNow.toISOString().slice(0, 19);

    updateApp();
    toggleSettingsModal();
  }
}
window.resetTimer = resetTimer;

function logSlipUp(source) {
  if (confirm('Hast du eine Zigarette geraucht? Ein Ausrutscher ist menschlich. Dein Tages-Zähler läuft weiter, wir ziehen nur diese Zigarette vom Ersparten ab.')) {
    const currentSlipups = parseInt(localStorage.getItem('novair_slipups') || '0', 10);
    localStorage.setItem('novair_slipups', (currentSlipups + 1).toString());
    
    if (window.umami) {
      window.umami.track('slip_up_logged', { source: source || 'settings' });
    }
    
    updateApp();
    if (source === 'craving') {
      toggleCravingModal();
    } else {
      toggleSettingsModal();
    }
  }
}
window.logSlipUp = logSlipUp;

function swapGoal(index, dir) {
  const idx = index - 1;
  const swapIdx = idx + dir;
  if (swapIdx < 0 || swapIdx > 2) return;

  const g1 = goalInputs[idx];
  const g2 = goalInputs[swapIdx];

  const tempName = g1.name.value;
  const tempPrice = g1.price.value;

  g1.name.value = g2.name.value;
  g1.price.value = g2.price.value;

  g2.name.value = tempName;
  g2.price.value = tempPrice;

  saveConfig();
  if (localStorage.getItem('novair_start_time')) updateApp();
}
window.swapGoal = swapGoal;

function saveConfig() {
  localStorage.setItem('novair_motivation', motivationInput.value);
  localStorage.setItem('novair_cigsDay', cigsPerDayInput.value);
  localStorage.setItem('novair_cigsPack', cigsPerPackInput.value);
  localStorage.setItem('novair_pricePack', priceInput.value);

  goalInputs.forEach((g, i) => {
    localStorage.setItem(`novair_goal${i + 1}_name`, g.name.value);
    localStorage.setItem(`novair_goal${i + 1}_price`, g.price.value);
  });
}

// Input Events
const allInputs = [motivationInput, cigsPerDayInput, cigsPerPackInput, priceInput];
goalInputs.forEach(g => { allInputs.push(g.name); allInputs.push(g.price); });

allInputs.forEach(el => el.addEventListener('input', () => {
  saveConfig();
  if (localStorage.getItem('novair_start_time')) updateApp();
}));

fpInstance = flatpickr("#quit-date", {
  enableTime: true,
  enableSeconds: true,
  dateFormat: "Y-m-d\\TH:i:S",
  altInput: true,
  altFormat: "d.m.Y, H:i:S",
  time_24hr: true,
  locale: "de",
  disableMobile: true,
  onChange: function (selectedDates) {
    if (selectedDates.length > 0) {
      const newTime = selectedDates[0].getTime();
      localStorage.setItem('novair_start_time', newTime.toString());
      updateApp();
    }
  }
});

// === DASHBOARD ===
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

  // Render Savings Goals structure once
  const goalsContainer = document.getElementById('savings-goals-container');
  if (goalsContainer) {
    goalsContainer.innerHTML = [0, 1, 2].map((i) => `
      <div id="goal-item-${i}" class="space-y-2.5 relative hidden">
        <div class="flex justify-between items-end">
          <p id="goal-text-${i}" class="font-semibold text-sm md:text-base text-gray-800 flex items-center transition-colors">
            <span id="goal-name-label-${i}"></span> <span id="goal-price-label-${i}" class="text-xs ml-2 text-gray-400"></span>
            <span id="goal-icon-${i}"></span>
          </p>
          <span id="goal-percent-${i}" class="text-xs md:text-sm font-mono font-medium text-gray-400">0.0%</span>
        </div>
        <div class="w-full bg-gray-100 h-2 rounded-full overflow-hidden border border-gray-200">
          <div id="goal-bar-${i}" class="progress-bar-inner h-full bg-gray-400 rounded-full relative" style="width: 0%"></div>
        </div>
      </div>
    `).join('');
  }

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

// === ONBOARDING FLOW ===
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

  if (window.umami) {
    window.umami.track('onboarding_complete', { 
      cigsPerDay: parseInt(cigsDay, 10),
      pricePerPack: parseFloat(price)
    });
  }

  const localNow = new Date();
  localNow.setMinutes(localNow.getMinutes() - localNow.getTimezoneOffset());
  if (fpInstance) fpInstance.setDate(localNow, false);
  else quitInput.value = localNow.toISOString().slice(0, 19);

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

  const slipups = parseInt(localStorage.getItem('novair_slipups') || '0', 10);
  const avoidedCigs = Math.max(0, (cigsPerMinute * totalMinForCalc) - slipups);
  const moneySaved = Math.max(0, (avoidedCigs / cigsPerPack) * pricePerPack);

  // Slipup UI Update
  const slipupsEl = document.getElementById('stat-slipups');
  if (slipupsEl) {
    if (slipups > 0) {
      slipupsEl.innerText = `(${slipups} Ausrutscher)`;
      slipupsEl.classList.remove('hidden');
    } else {
      slipupsEl.classList.add('hidden');
    }
  }

  // Motivation Display
  const mot = localStorage.getItem('novair_motivation');
  const motEl = document.getElementById('display-motivation');
  if (motEl && mot) {
    motEl.innerText = `Für: ${mot}`;
  } else if (motEl) {
    motEl.innerText = '';
  }

  // Stats Update
  document.getElementById('stat-days').innerText = diffDays.toString();

  const hoursText = diffHours === 1 ? '1 Stunde' : `${diffHours} Stunden`;
  const minText = diffMin === 1 ? '1 Minute' : `${diffMin} Minuten`;
  const secText = diffSecondsLeft === 1 ? '1 Sekunde' : `${diffSecondsLeft} Sekunden`;
  document.getElementById('stat-seconds-ticker').innerText = `${hoursText}, ${minText}, ${secText}`;

  document.getElementById('stat-money').innerText = `${moneySaved.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;
  document.getElementById('stat-avoided').innerText = Math.floor(avoidedCigs).toLocaleString('de-DE');

  // --- Savings Goals Logic ---
  const validGoals = [];
  goalInputs.forEach((g) => {
    const n = g.name.value.trim();
    const p = parseFloat(g.price.value);
    if (n && p > 0 && !isNaN(p)) validGoals.push({ name: n, price: p });
  });

  const goalsCard = document.getElementById('savings-goals-card');

  if (validGoals.length > 0 && goalsCard) {
    goalsCard.classList.remove('hidden');
    let remainingMoney = moneySaved;

    [0, 1, 2].forEach(i => {
      const goalEl = document.getElementById(`goal-item-${i}`);
      if (!goalEl) return;

      const textEl = document.getElementById(`goal-text-${i}`);
      const nameLabel = document.getElementById(`goal-name-label-${i}`);
      const priceLabel = document.getElementById(`goal-price-label-${i}`);
      const iconEl = document.getElementById(`goal-icon-${i}`);
      const percentEl = document.getElementById(`goal-percent-${i}`);
      const barEl = document.getElementById(`goal-bar-${i}`);

      if (i < validGoals.length) {
        goalEl.classList.remove('hidden');
        const goal = validGoals[i];

        const isFilled = remainingMoney >= goal.price;
        const progressMoney = isFilled ? goal.price : remainingMoney;
        const progressPercent = Math.min(100, (progressMoney / goal.price) * 100);

        remainingMoney = Math.max(0, remainingMoney - goal.price);

        const isDone = progressPercent === 100;

        nameLabel.innerText = goal.name;
        priceLabel.innerText = `(${goal.price.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} €)`;
        percentEl.innerText = `${progressPercent.toFixed(1)}%`;
        barEl.style.width = `${progressPercent}%`;

        if (isDone) {
          textEl.classList.remove('text-gray-800');
          textEl.classList.add('text-black');
          priceLabel.classList.remove('text-gray-400');
          priceLabel.classList.add('text-gray-500');
          percentEl.classList.remove('text-gray-400');
          percentEl.classList.add('text-black');
          barEl.classList.remove('bg-gray-400');
          barEl.classList.add('bg-black');

          if (!iconEl.hasChildNodes()) {
            iconEl.innerHTML = '<i data-lucide="check-circle-2" class="w-4 h-4 ml-1.5 text-black"></i>';
            lucide.createIcons({ root: iconEl });
          }
        } else {
          textEl.classList.add('text-gray-800');
          textEl.classList.remove('text-black');
          priceLabel.classList.add('text-gray-400');
          priceLabel.classList.remove('text-gray-500');
          percentEl.classList.add('text-gray-400');
          percentEl.classList.remove('text-black');
          barEl.classList.add('bg-gray-400');
          barEl.classList.remove('bg-black');

          if (iconEl.hasChildNodes()) {
            iconEl.innerHTML = '';
          }
        }
      } else {
        goalEl.classList.add('hidden');
      }
    });
  } else if (goalsCard) {
    goalsCard.classList.add('hidden');
  }

  // Health Milestones Targeted Update
  milestones.forEach((m, index) => {
    const progress = Math.min(100, (totalMinForCalc / m.time) * 100);
    const isDone = progress === 100;
    const mId = 'health_' + index;

    if (isDone && !celebratedMilestones.includes(mId)) {
      celebratedMilestones.push(mId);
      localStorage.setItem('novair_celebrated', JSON.stringify(celebratedMilestones));
      
      if (window.umami) {
        window.umami.track('health_milestone_reached', { milestone: m.name });
      }
      
      triggerCelebration(m.name, 'activity');
    } else if (!isDone && celebratedMilestones.includes(mId)) {
      celebratedMilestones = celebratedMilestones.filter(id => id !== mId);
      localStorage.setItem('novair_celebrated', JSON.stringify(celebratedMilestones));
    }

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

    if (unlocked && !celebratedMilestones.includes(b.id)) {
      celebratedMilestones.push(b.id);
      localStorage.setItem('novair_celebrated', JSON.stringify(celebratedMilestones));
      
      if (window.umami) {
        window.umami.track('badge_unlocked', { badge: b.title, badge_id: b.id });
      }
      
      triggerCelebration(b.title, b.icon);
    } else if (!unlocked && celebratedMilestones.includes(b.id)) {
      celebratedMilestones = celebratedMilestones.filter(id => id !== b.id);
      localStorage.setItem('novair_celebrated', JSON.stringify(celebratedMilestones));
    }

    if (badgeEl) {
      if (unlocked) {
        badgeEl.className = "flex flex-col items-center p-4 rounded-xl border bg-gray-50 border-gray-200 badge-unlocked text-black transition-all duration-300";
      } else {
        badgeEl.className = "flex flex-col items-center p-4 rounded-xl border bg-white border-gray-100 text-gray-300 transition-all duration-300";
      }
    }
  });

  // Check-In and Journey UI
  updateJourneyAndCheckin(diffDays);
}

// === CHECK-IN & RETENTION LOGIC ===
function performCheckIn(mood) {
  const today = new Date().toDateString();
  const checkins = JSON.parse(localStorage.getItem('novair_checkins') || '[]');
  
  // Update Streak
  const lastCheckin = localStorage.getItem('novair_last_checkin_date');
  let streak = parseInt(localStorage.getItem('novair_streak') || '0', 10);
  
  if (lastCheckin !== today) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (lastCheckin === yesterday.toDateString()) {
      streak += 1;
    } else {
      streak = 1; // Broken streak or first check-in
    }
    
    localStorage.setItem('novair_streak', streak.toString());
    localStorage.setItem('novair_last_checkin_date', today);
    
    checkins.push({ date: today, mood: mood });
    // Keep only the last 14 days of checkins to save space
    if (checkins.length > 14) checkins.shift();
    localStorage.setItem('novair_checkins', JSON.stringify(checkins));
    
    if (window.umami) {
      window.umami.track('daily_checkin', { mood: mood, streak: streak });
    }
  }
  
  if (mood === 'great' && typeof confetti !== 'undefined') {
    confetti({ particleCount: 50, spread: 40, origin: { y: 0.8 } });
  }
  
  updateApp();
}
window.performCheckIn = performCheckIn;

function updateJourneyAndCheckin(diffDays) {
  const today = new Date().toDateString();
  const lastCheckin = localStorage.getItem('novair_last_checkin_date');
  let streak = parseInt(localStorage.getItem('novair_streak') || '0', 10);
  const checkins = JSON.parse(localStorage.getItem('novair_checkins') || '[]');
  
  // Check if streak was broken (missed yesterday and today)
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (lastCheckin && lastCheckin !== today && lastCheckin !== yesterday.toDateString()) {
    // Streak broken!
    if (streak !== 0) {
      streak = 0;
      localStorage.setItem('novair_streak', '0');
    }
  }
  
  // Check-In Card Visibility
  const checkinCard = document.getElementById('daily-checkin-card');
  if (checkinCard) {
    if (lastCheckin === today) {
      checkinCard.classList.add('hidden');
    } else {
      checkinCard.classList.remove('hidden');
    }
  }
  
  // Journey Card Update
  const streakCounter = document.getElementById('streak-counter');
  if (streakCounter) streakCounter.innerText = `${streak} Tage`;
  
  const trendContainer = document.getElementById('mood-trend-container');
  if (trendContainer) {
    // Cache key includes today so the grid shifts correctly at midnight
    const checkinsStr = today + JSON.stringify(checkins);
    if (trendContainer.dataset.rendered !== checkinsStr) {
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return d.toDateString();
      });
      const emojis = { 'great': '🤩', 'okay': '😐', 'bad': '😩' };

      trendContainer.innerHTML = last7Days.map(dateStr => {
        const checkin = checkins.find(c => c.date === dateStr);
        if (checkin) {
          return `<div class="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-lg border border-gray-100 flex-shrink-0" title="${dateStr}">${emojis[checkin.mood] || '😐'}</div>`;
        }
        return `<div class="w-8 h-8 rounded-full border border-dashed border-gray-200 flex-shrink-0" title="${dateStr}"></div>`;
      }).join('');

      trendContainer.dataset.rendered = checkinsStr;
    }
  }
  
  // Daily Fact Update
  const factText = document.getElementById('daily-fact-text');
  if (factText) {
    if (diffDays < dailyFacts.length) {
      factText.innerText = dailyFacts[diffDays];
    } else {
      // Pick a pseudo-random generic motivation based on days
      const idx = diffDays % genericMotivations.length;
      factText.innerText = genericMotivations[idx];
    }
  }
}

// === APP BOOT ===
const existingStartTime = localStorage.getItem('novair_start_time');
if (existingStartTime) {
  welcomeView.classList.add('hidden');
  onboardingView.classList.add('hidden');
  dashboardView.classList.remove('hidden');

  const d = new Date(parseInt(existingStartTime, 10));
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  if (fpInstance) fpInstance.setDate(d, false);
  else quitInput.value = d.toISOString().slice(0, 19);

  initDashboard();
  updateApp();
  updateInterval = setInterval(updateApp, 1000);
} else {
  welcomeView.classList.remove('hidden');
  onboardingView.classList.add('hidden');
  dashboardView.classList.add('hidden');

  const isPWA = window.navigator.standalone || window.matchMedia('(display-mode: standalone)').matches;
  if (isPWA) {
    const warningEl = document.getElementById('pwa-safari-warning');
    if (warningEl) warningEl.classList.remove('hidden');
    
    const restoreContainer = document.getElementById('welcome-restore-container');
    if (restoreContainer) {
      restoreContainer.classList.remove('hidden');
      restoreContainer.classList.add('flex');
    }
  }

  setTimeout(() => lucide.createIcons(), 50);
}

// Register Service Worker for PWA Offline Support
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').then(registration => {
      console.log('SW registered: ', registration);
    }).catch(registrationError => {
      console.log('SW registration failed: ', registrationError);
    });
  });
}

// === CELEBRATION & SHARING ===
function triggerCelebration(title, iconName) {
  if (typeof confetti !== 'undefined') {
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 }
    });
  }

  document.getElementById('milestone-modal-title').innerText = title;
  const iconContainer = document.getElementById('milestone-modal-icon');
  if (iconContainer) {
    iconContainer.setAttribute('data-lucide', iconName);
    lucide.createIcons({ root: iconContainer.parentElement });
  }

  currentShareData = {
    title: 'Novair Meilenstein',
    text: `${title} 🎉\nNovair`,
    url: 'https://novair-rust.vercel.app'
  };

  const modal = document.getElementById('milestone-modal');
  modal.classList.remove('hidden');
  modal.classList.add('flex');
}
window.triggerCelebration = triggerCelebration;

function closeMilestoneModal() {
  const modal = document.getElementById('milestone-modal');
  modal.classList.add('hidden');
  modal.classList.remove('flex');
}
window.closeMilestoneModal = closeMilestoneModal;

function shareMilestone() {
  if (navigator.share && currentShareData) {
    navigator.share(currentShareData)
      .then(() => closeMilestoneModal())
      .catch(console.error);
  } else if (currentShareData) {
    const textToCopy = `${currentShareData.text}\n${currentShareData.url}`;
    navigator.clipboard.writeText(textToCopy).then(() => {
      alert("In die Zwischenablage kopiert!");
      closeMilestoneModal();
    });
  }
}
window.shareMilestone = shareMilestone;

// === BACKUP & RESTORE ===
function exportData() {
  const data = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('novair_')) {
      data[key] = localStorage.getItem(key);
    }
  }
  const jsonStr = JSON.stringify(data);
  const base64Str = btoa(unescape(encodeURIComponent(jsonStr)));
  const code = `NVR-${base64Str}`;

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(code).then(() => {
      alert('Backup-Code in die Zwischenablage kopiert! Speichere ihn an einem sicheren Ort.');
    }).catch(() => {
      prompt('Fehler beim automatischen Kopieren. Kopiere den Code hier:', code);
    });
  } else {
    prompt('Kopiere diesen Code an einen sicheren Ort:', code);
  }
}
window.exportData = exportData;

function importData(inputId = 'import-code-input') {
  const input = document.getElementById(inputId);
  let code = input.value.trim();

  if (!code) return alert('Bitte einen Code eingeben.');
  if (code.startsWith('NVR-')) code = code.substring(4);

  try {
    const jsonStr = decodeURIComponent(escape(atob(code)));
    const data = JSON.parse(jsonStr);

    if (!data || !data.novair_start_time) {
      throw new Error('Ungültiges Datenformat');
    }

    // Clear old novair data
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key && key.startsWith('novair_')) {
        localStorage.removeItem(key);
      }
    }

    // Set new data
    for (const key in data) {
      localStorage.setItem(key, data[key]);
    }

    alert('Daten erfolgreich wiederhergestellt! Die Seite wird nun neu geladen.');
    window.location.reload();
  } catch (e) {
    alert('Ungültiger Backup-Code. Bitte überprüfe deine Eingabe.');
    console.error(e);
  }
}
window.importData = importData;

function toggleWelcomeRestore() {
  const container = document.getElementById('welcome-restore-container');
  if (container.classList.contains('hidden')) {
    container.classList.remove('hidden');
    container.classList.add('flex');
  } else {
    container.classList.add('hidden');
    container.classList.remove('flex');
  }
}
window.toggleWelcomeRestore = toggleWelcomeRestore;
