// ==================== AUDIO PLAYER WITH RETRY LOGIC ====================
const audio = document.getElementById('audio');
const trackTitle = document.getElementById('trackTitle');
const progress = document.getElementById('progress');
const playPauseBtn = document.getElementById('playPauseBtn');
const currentTimeSpan = document.getElementById('currentTime');
const durationSpan = document.getElementById('duration');
const surahSelector = document.getElementById('surahSelector');

let currentIndex = 0;
let repeatCount = 0;
let currentPlaylist = [];
let retryCount = 0;
let retryTimeout = null;
const MAX_RETRIES = 3; // number of sources to try per surah
const RETRY_DELAY = 2000; // 2 seconds per source

// ----- Playlists (local) -----
const ruqyahPlaylist = [
  { title: 'Surah Al-Fatiha', file: 'audio/fatiha.mp3' },
  { title: 'Ayatul Kursi', file: 'audio/ayatul_kursi.mp3' },
  { title: 'Surah Al-Ikhlas', file: 'audio/ikhlas.mp3' },
  { title: 'Surah Al-Falaq', file: 'audio/falaq.mp3' },
  { title: 'Surah An-Naas', file: 'audio/naas.mp3' },
  { title: 'Surah baqarah_last_ayat', file: 'audio/baqarah_last_ayat.mp3' }
];

const evilPlaylist = [
  { title: 'Evil Eye Protection (Ayatul Kursi)', file: 'audio/ayatul_kursi.mp3' },
  { title: 'Nazar ki Dua (Surah Falaq)', file: 'audio/falaq.mp3' },
  { title: 'Surah Naas for Protection', file: 'audio/naas.mp3' }
];

// ----- QURAN PLAYLIST with multiple sources -----
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

// List of sources in order of reliability (HTTPS)
const SOURCES = [
  'https://server8.mp3quran.net/afs/{num}.mp3',        // fastest & reliable
  'https://download.quranicaudio.com/quran/alafasy/{num}.mp3',
  'https://audio.islamhouse.com/quran/ar/Alafasy/{num}.mp3'
];

const quranPlaylist = surahNames.map((name, index) => {
  const num = (index + 1).toString().padStart(3, '0');
  return {
    title: `${index + 1}. Surah ${name}`,
    sources: SOURCES.map(s => s.replace('{num}', num))
  };
});

// Default playlist
currentPlaylist = ruqyahPlaylist;

// Populate surah selector
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

surahSelector.addEventListener('change', (e) => {
  const idx = parseInt(e.target.value);
  if (!isNaN(idx)) {
    currentIndex = idx;
    loadTrackWithRetry(currentIndex);
  }
});

function loadTrackWithRetry(index, retryAttempt = 0) {
  if (!currentPlaylist.length) return;
  
  // Clear any pending retry timeout
  if (retryTimeout) clearTimeout(retryTimeout);
  
  currentIndex = index;
  const track = currentPlaylist[currentIndex];
  
  // If track has multiple sources (Quran), try the appropriate attempt
  if (track.sources) {
    if (retryAttempt >= track.sources.length) {
      // All sources failed – mark as unavailable
      trackTitle.textContent = `❌ ${track.title} (all sources failed)`;
      audio.removeAttribute('src');
      audio.load();
      surahSelector.value = currentIndex; // keep selected
      return;
    }
    audio.src = track.sources[retryAttempt];
  } else {
    // Local playlist
    audio.src = track.file;
  }
  
  trackTitle.textContent = track.title;
  audio.load();
  repeatCount = 0;
  retryCount = retryAttempt;
  updatePlayPauseIcon();

  if (currentPlaylist === quranPlaylist) {
    surahSelector.value = currentIndex;
  }
  
  // Set a timeout to detect if loading takes too long (e.g., server hangs)
  retryTimeout = setTimeout(() => {
    console.warn(`Source ${retryAttempt+1} timed out, trying next...`);
    // If we haven't reached max retries, try next source
    if (track.sources && retryAttempt + 1 < track.sources.length) {
      loadTrackWithRetry(currentIndex, retryAttempt + 1);
    } else {
      // No more sources
      trackTitle.textContent = `❌ ${track.title} (timeout)`;
    }
  }, 8000); // 8 second timeout
}

function playAudio() {
  audio.play().catch(e => {
    console.log('Playback error, will retry source if needed');
  });
}

function pauseAudio() {
  audio.pause();
}

function playPause() {
  if (audio.paused) playAudio();
  else pauseAudio();
}

function nextTrack() {
  if (!currentPlaylist.length) return;
  let nextIndex = (currentIndex + 1) % currentPlaylist.length;
  loadTrackWithRetry(nextIndex);
  // Play will be attempted after load
}

function prevTrack() {
  if (!currentPlaylist.length) return;
  let prevIndex = (currentIndex - 1 + currentPlaylist.length) % currentPlaylist.length;
  loadTrackWithRetry(prevIndex);
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

// Handle successful load
audio.addEventListener('canplay', () => {
  // Clear the retry timeout
  if (retryTimeout) clearTimeout(retryTimeout);
  // Ensure title is correct
  const track = currentPlaylist[currentIndex];
  if (track) trackTitle.textContent = track.title;
  // Attempt to play automatically (if user expects it)
  playAudio();
});

// Handle errors during loading
audio.addEventListener('error', (e) => {
  console.error('Error loading source:', audio.src);
  // Clear timeout
  if (retryTimeout) clearTimeout(retryTimeout);
  
  const track = currentPlaylist[currentIndex];
  if (!track) return;
  
  // If there are more sources, try the next one
  if (track.sources && retryCount + 1 < track.sources.length) {
    loadTrackWithRetry(currentIndex, retryCount + 1);
  } else {
    // No more sources
    trackTitle.textContent = `❌ ${track.title} (failed)`;
  }
});

// Progress and time
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
  icon.className = audio.paused ? 'fas fa-play' : 'fas fa-pause';
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

    if (section === 'tasbeeh') {
      tasbeehSection.style.display = 'block';
      surahSelector.style.display = 'none';
    } else {
      tasbeehSection.style.display = 'none';

      if (section === 'quran') {
        surahSelector.style.display = 'block';
        currentPlaylist = quranPlaylist;
      } else {
        surahSelector.style.display = 'none';
        if (section === 'ruqyah') currentPlaylist = ruqyahPlaylist;
        if (section === 'evil') currentPlaylist = evilPlaylist;
      }

      // Load first track of new playlist
      loadTrackWithRetry(0);
    }
  });
});

// ==================== TASBEEH LOGIC ====================
let counts = { subhan: 0, hamd: 0, akbar: 0 };

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
  icon.className = document.body.classList.contains('dark') ? 'fas fa-sun' : 'fas fa-moon';
});

// ==================== INITIAL HIDE ====================
tasbeehSection.style.display = 'none';
surahSelector.style.display = 'none';
