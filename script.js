const MODES = {
  work:  { time: 25*60, label: 'Focus Time',  tab: 'work',  catState: 'working',  msg: "Stay focused! You've got this 🎯" },
  short: { time: 5*60,  label: 'Short Break', tab: 'short', catState: 'resting',  msg: "Take a little breather! ☕" },
  long:  { time: 15*60, label: 'Long Break',  tab: 'long',  catState: 'sleeping', msg: "Rest time! Your cat is napping 💤" },
};

const CIRCUMFERENCE = 2 * Math.PI * 95; // ≈ 596.9

let mode      = 'work';
let timeLeft  = MODES.work.time;
let totalTime = MODES.work.time;
let isRunning = false;
let intervalId = null;
let sessions  = 0;

// DOM refs
const timeDisplay   = document.getElementById('time-display');
const timeLabel     = document.getElementById('time-label');
const ringFill      = document.getElementById('ring-fill');
const catContainer  = document.getElementById('cat-container');
const catMessage    = document.getElementById('cat-message');
const btnText       = document.getElementById('btn-text');
const pawsRow       = document.getElementById('paws-row');
const sessionsCount = document.getElementById('sessions-count');
const eyesOpen      = document.getElementById('eyes-open');
const eyesSleeping  = document.getElementById('eyes-sleeping');
const eyesResting   = document.getElementById('eyes-resting');
const appEl         = document.getElementById('app');

// init ring
ringFill.style.strokeDasharray  = CIRCUMFERENCE;
ringFill.style.strokeDashoffset = 0;

function setMode(m) {
  clearInterval(intervalId);
  isRunning = false;
  mode      = m;
  timeLeft  = MODES[m].time;
  totalTime = MODES[m].time;

  document.querySelectorAll('.mode-tab').forEach(t => t.classList.remove('active'));
  document.getElementById(`tab-${m}`).classList.add('active');

  appEl.className = `app mode-${m}`;
  timeLabel.textContent = MODES[m].label;
  btnText.textContent   = 'Start';

  updateDisplay();
  updateRing(1);
  setCatState('idle');

  const idleMsg = { work: "Ready to focus? 🎯", short: "Relax a little! ☕", long: "Rest well! 💤" };
  catMessage.textContent = idleMsg[m];
}

function toggleTimer() {
  isRunning ? pause() : start();
}

function start() {
  isRunning = true;
  btnText.textContent = 'Pause';
  setCatState(MODES[mode].catState);
  catMessage.textContent = MODES[mode].msg;

  intervalId = setInterval(() => {
    timeLeft--;
    updateDisplay();
    updateRing(timeLeft / totalTime);
    if (timeLeft <= 0) complete();
  }, 1000);
}

function pause() {
  isRunning = false;
  clearInterval(intervalId);
  btnText.textContent = 'Resume';
  setCatState('idle');
  catMessage.textContent = "Paused. Take a breath 😌";
}

function resetTimer() {
  clearInterval(intervalId);
  isRunning = false;
  timeLeft  = MODES[mode].time;
  btnText.textContent = 'Start';
  updateDisplay();
  updateRing(1);
  setCatState('idle');
  const idleMsg = { work: "Ready to focus? 🎯", short: "Relax a little! ☕", long: "Rest well! 💤" };
  catMessage.textContent = idleMsg[mode];
}

function complete() {
  clearInterval(intervalId);
  isRunning = false;
  btnText.textContent = 'Start';
  playChime();

  if (mode === 'work') {
    sessions++;
    updateSessions();
    setCatState('celebrating');
    catMessage.textContent = "Amazing work! 🎉 Break time!";
    setTimeout(() => setMode(sessions % 4 === 0 ? 'long' : 'short'), 3500);
  } else {
    setCatState('idle');
    catMessage.textContent = "Break's over! Let's go! 😸";
    setTimeout(() => setMode('work'), 2500);
  }
}

function updateDisplay() {
  const m = String(Math.floor(timeLeft / 60)).padStart(2, '0');
  const s = String(timeLeft % 60).padStart(2, '0');
  timeDisplay.textContent = `${m}:${s}`;
  document.title = `${m}:${s} — Neko Timer 🐱`;
}

function updateRing(progress) {
  ringFill.style.strokeDashoffset = CIRCUMFERENCE * (1 - Math.max(0, progress));
}

function setCatState(state) {
  catContainer.className = `cat-container cat-${state}`;
  const isSleeping = state === 'sleeping';
  const isResting  = state === 'resting';
  eyesOpen.style.display     = (!isSleeping && !isResting) ? 'block' : 'none';
  eyesSleeping.style.display = isSleeping ? 'block' : 'none';
  eyesResting.style.display  = isResting  ? 'block' : 'none';
}

function updateSessions() {
  pawsRow.innerHTML = '';
  for (let i = 0; i < sessions; i++) {
    const paw = document.createElement('span');
    paw.className   = 'paw-icon';
    paw.textContent = '🐾';
    pawsRow.appendChild(paw);
  }
  sessionsCount.textContent = `${sessions} session${sessions !== 1 ? 's' : ''} completed`;
}

function playChime() {
  try {
    const ctx  = new (window.AudioContext || window.webkitAudioContext)();
    [523.25, 659.25, 783.99].forEach((freq, i) => {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = 'sine'; osc.frequency.value = freq;
      const t = ctx.currentTime + i * 0.22;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.3, t + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.7);
      osc.start(t); osc.stop(t + 0.7);
    });
  } catch(e) { console.log('Audio unavailable'); }
}

// Boot
updateDisplay();
updateRing(1);
setCatState('idle');
