// ==================== AUDIO PLAYER ====================
const audio = document.getElementById('audio');
const trackTitle = document.getElementById('trackTitle');
const progress = document.getElementById('progress');
const playPauseBtn = document.getElementById('playPauseBtn');
const currentTimeSpan = document.getElementById('currentTime');
const durationSpan = document.getElementById('duration');
const surahSelector = document.getElementById('surahSelector');

let currentIndex = 0;
let repeatCount = 0; // counts how many times current track has played (max 3)
let currentPlaylist = [];

// ----- Playlists -----
// Ruqyah (local files – replace with your own or use online if needed)
const ruqyahPlaylist = [
  { title: 'Surah Al-Fatiha', file: 'audio/fatiha.mp3' },
  { title: 'Ayatul Kursi', file: 'audio/ayatul_kursi.mp3' },
  { title: 'Surah Al-Ikhlas', file: 'audio/ikhlas.mp3' },
  { title: 'Surah Al-Falaq', file: 'audio/falaq.mp3' },
  { title: 'Surah An-Naas', file: 'audio/naas.mp3' }
];

// Evil Eye (local files)
const evilPlaylist = [
  { title: 'Evil Eye Protection (Ayatul Kursi)', file: 'audio/ayatul_kursi.mp3' },
  { title: 'Nazar ki Dua (Surah Falaq)', file: 'audio/falaq.mp3' },
  { title: 'Surah Naas for Protection', file: 'audio/naas.mp3' }
];

// ----- QURAN PLAYLIST (ONLINE STREAM) - IslamHouse HTTPS (reliable) -----
// Using Alafasy recitation at 128kbps
// Base URL: https://audio.islamhouse.com/quran/ar/Alafasy/001.mp3 (for surah 1)

const surahNames = [
  "Al-Fatiha", "Al-Baqarah", "Aal-E-Imran", "An-Nisa", "Al-Ma'idah", "Al-An'am", "Al-A'raf", "Al-Anfal", "At-Tawbah", "Yunus",
  "Hud", "Yusuf", "Ar-Ra'd", "Ibrahim", "Al-Hijr", "An-Nahl", "Al-Isra", "Al-Kahf", "Maryam", "Ta-Ha",
  "Al-Anbiya", "Al-Hajj", "Al-Mu'minun", "An-Nur", "Al-Furqan", "Ash-Shu'ara", "An-Naml", "Al-Qasas", "Al-Ankabut", "Ar-Rum",
  "Luqman", "As-Sajda", "Al-Ahzab", "Saba", "Fatir", "Ya-Sin", "As-Saffat", "Sad", "Az-Zumar", "Ghafir",
  "Fussilat", "Ash-Shura", "Az-Zukhruf", "Ad-Dukhan", "Al-Jathiya", "Al-Ahqaf", "Muhammad", "Al-Fath", "Al-Hujurat", "Qaf",
  "Adh-Dhariyat", "At-Tur", "An-Najm", "Al-Qamar", "Ar-Rahman", "Al-Waqia", "Al-Hadid", "Al-Mujadila", "Al-Hashr", "Al-Mumtahina",
  "As-Saff", "Al-Jumu'a", "Al-Munafiqun", "At-Taghabun", "At-Talaq", "At-Tahrim", "Al-Mulk", "Al-Qalam", "Al-Haqqa", "Al-Ma'arij",
  "Nuh", "Al-Jinn", "Al-Muzzammil", "Al-Muddaththir", "Al-Qiyama", "Al-Insan", "Al-Mursalat", "An-Naba", "An-Nazi'at", "Abasa",
  "At-Takwir", "Al-Infitar", "Al-Mutaffifin", "Al-Inshiqaq", "Al-Buruj", "At-Tariq", "Al-A'la", "Al-Ghashiya", "Al-Fajr", "Al-Balad",
  "Ash-Shams", "Al-Layl", "Ad-Duha", "Ash-Sharh", "At-Tin", "Al-Alaq", "Al-Qadr", "Al-Bayyina", "Az-Zalzala", "Al-Adiyat",
  "Al-Qaria", "At-Takathur", "Al-Asr", "Al-Humaza", "Al-Fil", "Quraish", "Al-Ma'un", "Al-Kawthar", "Al-Kafirun", "An-Nasr",
  "Al-Masad", "Al-Ikhlas", "Al-Falaq", "An-Nas"
];

// Generate playlist with IslamHouse URLs (HTTPS)
const quranPlaylist = surahNames.map((name, index) => {
  const surahNumber = (index + 1).toString().padStart(3, '0'); // 001, 002, ... 114
  return {
    title: `${index + 1}. Surah ${name}`,
    file: `https://audio.islamhouse.com/quran/ar/Alafasy/${surahNumber}.mp3`
  };
});

// Default playlist
currentPlaylist = ruqyahPlaylist;

// Load first track
loadTrack(0);

// Populate surah selector dropdown
function populateSurahSelector() {
  surahSelector.innerHTML = '<option value="">-- Choose Surah --</option>';
  quranPlaylist.forEach((track, idx) => {
    const option = document.createElement('option');
    option.value = idx;
    option.textContent = track.title;
    surahSelector.appendChild(option);
  });
}
populateSurahSelector();

// Handle surah selection
surahSelector.addEventListener('change', (e) => {
  const idx = parseInt(e.target.value);
  if (!isNaN(idx)) {
    currentIndex = idx;
    loadTrack(currentIndex);
    playAudio();
    surahSelector.value = idx; // keep selected
  }
});

function loadTrack(index) {
  if (!currentPlaylist.length) return;
  currentIndex = index;
  const track = currentPlaylist[currentIndex];
  audio.src = track.file;
  trackTitle.textContent = track.title;
  audio.load();
  repeatCount = 0;
  updatePlayPauseIcon();

  // Update surah selector if current playlist is Quran
  if (currentPlaylist === quranPlaylist) {
    surahSelector.value = currentIndex;
  }
}

function playAudio() {
  audio.play().catch(e => {
    console.warn('Playback failed:', e);
    // Optionally show a user-friendly message
  });
}

function pauseAudio() {
  audio.pause();
}

function playPause() {
  if (audio.paused) {
    playAudio();
  } else {
    pauseAudio();
  }
}

function nextTrack() {
  if (!currentPlaylist.length) return;
  currentIndex = (currentIndex + 1) % currentPlaylist.length;
  loadTrack(currentIndex);
  playAudio();
}

function prevTrack() {
  if (!currentPlaylist.length) return;
  currentIndex = (currentIndex - 1 + currentPlaylist.length) % currentPlaylist.length;
  loadTrack(currentIndex);
  playAudio();
}

// Auto repeat 3 times then next
audio.addEventListener('ended', () => {
  repeatCount++;
  if (repeatCount < 3) {
    audio.currentTime = 0;
    playAudio();
  } else {
    nextTrack();
  }
});

// Skip to next track if audio fails to load (e.g., missing file)
audio.addEventListener('error', (e) => {
  console.warn('Audio failed to load, skipping to next track:', audio.src);
  nextTrack();
});

// Update progress bar and time
audio.addEventListener('timeupdate', updateProgress);
audio.addEventListener('loadedmetadata', () => {
  durationSpan.textContent = formatTime(audio.duration);
  progress.max = audio.duration;
});

function updateProgress() {
  if (audio.duration) {
    progress.value = audio.currentTime;
    currentTimeSpan.textContent = formatTime(audio.currentTime);
  }
}

progress.addEventListener('input', () => {
  audio.currentTime = progress.value;
});

function formatTime(seconds) {
  if (isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

function updatePlayPauseIcon() {
  const icon = playPauseBtn.querySelector('i');
  if (audio.paused) {
    icon.className = 'fas fa-play';
  } else {
    icon.className = 'fas fa-pause';
  }
}

audio.addEventListener('play', updatePlayPauseIcon);
audio.addEventListener('pause', updatePlayPauseIcon);

// ==================== TAB SWITCHING ====================
const tabButtons = document.querySelectorAll('.tab-btn');
const tasbeehSection = document.getElementById('tasbeehSection');

tabButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    tabButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const section = btn.dataset.section;

    // Show/hide Tasbeeh section
    if (section === 'tasbeeh') {
      tasbeehSection.style.display = 'block';
      surahSelector.style.display = 'none'; // hide selector
    } else {
      tasbeehSection.style.display = 'none';

      // Show surah selector only for Quran tab
      if (section === 'quran') {
        surahSelector.style.display = 'block';
        currentPlaylist = quranPlaylist;
      } else {
        surahSelector.style.display = 'none';
        // Switch to appropriate local playlist
        if (section === 'ruqyah') currentPlaylist = ruqyahPlaylist;
        if (section === 'evil') currentPlaylist = evilPlaylist;
      }

      // Reset to first track of new playlist and play
      loadTrack(0);
      playAudio();
    }
  });
});

// ==================== TASBEEH LOGIC ====================
let counts = {
  subhan: 0,
  hamd: 0,
  akbar: 0
};

function increase(dhikr) {
  counts[dhikr]++;
  updateDhikrDisplay(dhikr);
}

function reset(dhikr) {
  counts[dhikr] = 0;
  updateDhikrDisplay(dhikr);
}

function resetAll() {
  counts = { subhan: 0, hamd: 0, akbar: 0 };
  updateAllDisplays();
}

function updateDhikrDisplay(dhikr) {
  const element = document.getElementById(`count${dhikr.charAt(0).toUpperCase() + dhikr.slice(1)}`);
  if (element) element.textContent = counts[dhikr];

  const progressFill = document.getElementById(`progress${dhikr.charAt(0).toUpperCase() + dhikr.slice(1)}`);
  if (progressFill) {
    const percent = Math.min((counts[dhikr] / 33) * 100, 100);
    progressFill.style.width = percent + '%';
  }

  const total = counts.subhan + counts.hamd + counts.akbar;
  document.getElementById('totalCount').textContent = total;
}

function updateAllDisplays() {
  updateDhikrDisplay('subhan');
  updateDhikrDisplay('hamd');
  updateDhikrDisplay('akbar');
}

// ==================== DARK MODE ====================
const darkToggle = document.getElementById('darkModeToggle');
darkToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  const icon = darkToggle.querySelector('i');
  if (document.body.classList.contains('dark')) {
    icon.className = 'fas fa-sun';
  } else {
    icon.className = 'fas fa-moon';
  }
});

// ==================== INITIAL HIDE TASBEEH AND SELECTOR ====================
tasbeehSection.style.display = 'none';
surahSelector.style.display = 'none';
