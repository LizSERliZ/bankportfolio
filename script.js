// ---------- Footer year ----------
document.getElementById('year').textContent = new Date().getFullYear();

// ---------- Mobile nav toggle ----------
const navToggle = document.getElementById('nav-toggle');
const navLinks = document.getElementById('nav-links');

navToggle.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', isOpen);
});

navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

// ---------- Active nav link on scroll ----------
const sections = document.querySelectorAll('section[id]');
const navAnchors = document.querySelectorAll('.nav-links a');

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navAnchors.forEach(a => a.classList.remove('active'));
      const activeLink = document.querySelector(`.nav-links a[href="#${entry.target.id}"]`);
      if (activeLink) activeLink.classList.add('active');
    }
  });
}, { rootMargin: '-50% 0px -50% 0px' });

sections.forEach(section => sectionObserver.observe(section));

// ---------- Scroll reveal ----------
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ---------- Decorative waveform in hero ----------
function drawWaveform() {
  const group = document.getElementById('wave-bars');
  if (!group) return;
  const barCount = 80;
  const width = 1200;
  const barWidth = width / barCount * 0.55;
  const gap = width / barCount;

  let bars = '';
  for (let i = 0; i < barCount; i++) {
    const height = 6 + Math.random() * 34;
    const x = i * gap;
    const y = (60 - height) / 2;
    bars += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${barWidth.toFixed(1)}" height="${height.toFixed(1)}" rx="1"></rect>`;
  }
  group.innerHTML = bars;
}
drawWaveform();

// ---------- Standard track players: only one plays at a time ----------
const allAudio = Array.from(document.querySelectorAll('audio'));
allAudio.forEach(audio => {
  audio.addEventListener('play', () => {
    allAudio.forEach(other => {
      if (other !== audio && !other.paused) other.pause();
    });
  });
});

// ---------- Before/After mixing comparison players ----------
function formatTime(sec) {
  if (!isFinite(sec)) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

document.querySelectorAll('.mix-card').forEach(card => {
  const audio = card.querySelector('.mix-audio');
  const beforeBtn = card.querySelector('.mix-btn[data-state="before"]');
  const afterBtn = card.querySelector('.mix-btn[data-state="after"]');
  const playBtn = card.querySelector('.mix-play');
  const iconPlay = card.querySelector('.icon-play');
  const iconPause = card.querySelector('.icon-pause');
  const progress = card.querySelector('.mix-progress');
  const progressFill = card.querySelector('.mix-progress-fill');
  const timeLabel = card.querySelector('.mix-time');

  const beforeSrc = card.dataset.before;
  const afterSrc = card.dataset.after;

  audio.src = beforeSrc;

  function setState(state) {
    const wasPlaying = !audio.paused;
    const t = audio.currentTime;
    audio.src = state === 'before' ? beforeSrc : afterSrc;
    audio.currentTime = t || 0;
    beforeBtn.classList.toggle('active', state === 'before');
    afterBtn.classList.toggle('active', state === 'after');
    if (wasPlaying) audio.play();
  }

  beforeBtn.addEventListener('click', () => setState('before'));
  afterBtn.addEventListener('click', () => setState('after'));

  playBtn.addEventListener('click', () => {
    if (audio.paused) {
      // pause every other audio element on the page (both mix and track players)
      allAudio.forEach(other => { if (!other.paused) other.pause(); });
      document.querySelectorAll('.mix-audio').forEach(other => {
        if (other !== audio && !other.paused) other.pause();
      });
      audio.play();
    } else {
      audio.pause();
    }
  });

  audio.addEventListener('play', () => {
    iconPlay.hidden = true;
    iconPause.hidden = false;
    card.classList.add('is-playing');
    document.querySelectorAll('.mix-audio').forEach(other => {
      if (other !== audio && !other.paused) other.pause();
    });
  });

  audio.addEventListener('pause', () => {
    iconPlay.hidden = false;
    iconPause.hidden = true;
    card.classList.remove('is-playing');
  });

  audio.addEventListener('timeupdate', () => {
    const pct = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
    progressFill.style.width = pct + '%';
    timeLabel.textContent = formatTime(audio.currentTime);
  });

  audio.addEventListener('ended', () => {
    progressFill.style.width = '0%';
    timeLabel.textContent = '0:00';
  });

  progress.addEventListener('click', (e) => {
    const rect = progress.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    if (audio.duration) audio.currentTime = pct * audio.duration;
  });
});

// ---------- Gallery + Lightbox ----------
const galleryGrid = document.getElementById('gallery-grid');
const galleryCount = 27;
const galleryFiles = Array.from({ length: galleryCount }, (_, i) =>
  `assets/gallery/bts-${String(i + 1).padStart(2, '0')}.jpg`
);

galleryFiles.forEach((src, i) => {
  const img = document.createElement('img');
  img.src = src;
  img.loading = 'lazy';
  img.alt = `Behind the scenes photo ${i + 1}`;
  img.dataset.index = i;
  galleryGrid.appendChild(img);
});

const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const lightboxClose = document.getElementById('lightbox-close');
const lightboxPrev = document.getElementById('lightbox-prev');
const lightboxNext = document.getElementById('lightbox-next');
let currentIndex = 0;

function openLightbox(index) {
  currentIndex = index;
  lightboxImg.src = galleryFiles[currentIndex];
  lightbox.classList.add('open');
  lightbox.setAttribute('aria-hidden', 'false');
}

function closeLightbox() {
  lightbox.classList.remove('open');
  lightbox.setAttribute('aria-hidden', 'true');
}

function showDelta(delta) {
  currentIndex = (currentIndex + delta + galleryFiles.length) % galleryFiles.length;
  lightboxImg.src = galleryFiles[currentIndex];
}

galleryGrid.addEventListener('click', (e) => {
  if (e.target.tagName === 'IMG') {
    openLightbox(Number(e.target.dataset.index));
  }
});

lightboxClose.addEventListener('click', closeLightbox);
lightboxPrev.addEventListener('click', () => showDelta(-1));
lightboxNext.addEventListener('click', () => showDelta(1));
lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });

document.addEventListener('keydown', (e) => {
  if (!lightbox.classList.contains('open')) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft') showDelta(-1);
  if (e.key === 'ArrowRight') showDelta(1);
});
// 1. ป้องกันการคลิกขวา (Disable Right-Click) ทั่วทั้งเว็บไซต์
document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
});

// 2. ป้องกันการใช้ปุ่มลัด Save (Ctrl+S / Cmd+S) และปุ่มดู Inspect Element (F12)
document.addEventListener('keydown', function(e) {
    // ป้องกัน Ctrl+S หรือ Cmd+S
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
    }
    // ป้องกัน Ctrl+U (ดู Source Code)
    if ((e.ctrlKey || e.metaKey) && e.key === 'u') {
        e.preventDefault();
    }
    // ป้องกัน F12 (Developer Tools)
    if (e.key === 'F12') {
        e.preventDefault();
    }
});