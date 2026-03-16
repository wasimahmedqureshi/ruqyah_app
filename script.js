// ==================== AUDIO PLAYER ====================
const audio = document.getElementById('audio');
const trackTitle = document.getElementById('trackTitle');
const progress = document.getElementById('progress');
const playPauseBtn = document.getElementById('playPauseBtn');
const currentTimeSpan = document.getElementById('currentTime');
const durationSpan = document.getElementById('duration');

let currentIndex = 0;
let repeatCount = 0; // counts how many times current track has played (max 3)
let currentPlaylist = [];

// ----- Playlists (using existing audio files) -----
const ruqyahPlaylist = [
  { title: 'Surah Al-Fatiha', file: 'audio/fatiha.mp3' },
  { title: 'Ayatul Kursi', file: 'audio/ayatul_kursi.mp3' },
  { title: 'Surah Al-Ikhlas', file: 'audio/ikhlas.mp3' },
  { title: 'Surah Al-Falaq', file: 'audio/falaq.mp3' },
  { title: 'Surah An-Naas', file: 'audio/naas.mp3' }
];

const evilPlaylist = [
  { title: 'Evil Eye Protection (Ayatul Kursi)', file: 'audio/ayatul_kursi.mp3' },
  { title: 'Nazar ki Dua (Surah Falaq)', file: 'audio/falaq.mp3' },
  { title: 'Surah Naas for Protection', file: 'audio/naas.mp3' }
];

const quranPlaylist = [
  { title: 'Surah Baqarah (Last Ayat)', file: 'audio/baqarah_last_ayat.mp3' },
  { title: 'Surah Fatiha', file: 'audio/fatiha.mp3' },
  { title: 'Ayatul Kursi', file: 'audio/ayatul_kursi.mp3' }
];

// Default playlist
currentPlaylist = ruqyahPlaylist;

// Load first track
loadTrack(0);

function loadTrack(index) {
  if (!currentPlaylist.length) return;
  currentIndex = index;
  const track = currentPlaylist[currentIndex];
  audio.src = track.file;
  trackTitle.textContent = track.title;
  audio.load(); // reset audio element
  // Reset repeat counter for new track
  repeatCount = 0;
  // Update play/pause icon
  updatePlayPauseIcon();
}

function playAudio() {
  audio.play().catch(e => {
    alert('Could not play audio. File may be missing: ' + audio.src);
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
    // Remove active class from all tabs
    tabButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const section = btn.dataset.section;

    // Show/hide Tasbeeh section
    if (section === 'tasbeeh') {
      tasbeehSection.style.display = 'block';
    } else {
      tasbeehSection.style.display = 'none';
      // Switch playlist based on section
      switch (section) {
        case 'ruqyah':
          currentPlaylist = ruqyahPlaylist;
          break;
        case 'evil':
          currentPlaylist = evilPlaylist;
          break;
        case 'quran':
          currentPlaylist = quranPlaylist;
          break;
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

  // Update progress bar (goal 33)
  const progressFill = document.getElementById(`progress${dhikr.charAt(0).toUpperCase() + dhikr.slice(1)}`);
  if (progressFill) {
    const percent = Math.min((counts[dhikr] / 33) * 100, 100);
    progressFill.style.width = percent + '%';
  }

  // Update total
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

// ==================== INITIAL HIDE TASBEEH ====================
tasbeehSection.style.display = 'none';
