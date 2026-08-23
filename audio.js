// Background audio: persists play state + position across page loads via localStorage
(function () {
  const soundBtn = document.getElementById('sound-toggle');
  const bgAudio = document.getElementById('bg-audio');
  if (!soundBtn || !bgAudio) return;

  const iconMuted = soundBtn.querySelector('.icon-muted');
  const iconPlaying = soundBtn.querySelector('.icon-playing');
  bgAudio.volume = 0.18;

  const KEY_PLAYING = 'bgAudioPlaying';
  const KEY_TIME = 'bgAudioTime';

  function setIcons(playing) {
    iconMuted.style.display = playing ? 'none' : 'block';
    iconPlaying.style.display = playing ? 'block' : 'none';
    soundBtn.setAttribute('aria-pressed', playing ? 'true' : 'false');
  }

  // Restore saved position
  const savedTime = parseFloat(localStorage.getItem(KEY_TIME) || '0');
  if (savedTime > 0) {
    bgAudio.addEventListener('loadedmetadata', () => {
      if (!isNaN(savedTime) && savedTime < bgAudio.duration) {
        bgAudio.currentTime = savedTime;
      }
    }, { once: true });
  }

  // Attempt to resume playback if it was playing on the previous page
  if (localStorage.getItem(KEY_PLAYING) === 'true') {
    bgAudio.play().then(() => {
      setIcons(true);
    }).catch(() => {
      // Autoplay blocked — leave paused, user can click to resume
      setIcons(false);
    });
  }

  soundBtn.addEventListener('click', () => {
    if (bgAudio.paused) {
      bgAudio.play().catch(() => {});
      localStorage.setItem(KEY_PLAYING, 'true');
      setIcons(true);
    } else {
      bgAudio.pause();
      localStorage.setItem(KEY_PLAYING, 'false');
      setIcons(false);
    }
  });

  // Periodically save current position so the next page can resume near this spot
  bgAudio.addEventListener('timeupdate', () => {
    localStorage.setItem(KEY_TIME, bgAudio.currentTime.toString());
  });

  // Save state before navigating away
  window.addEventListener('pagehide', () => {
    localStorage.setItem(KEY_TIME, bgAudio.currentTime.toString());
    localStorage.setItem(KEY_PLAYING, (!bgAudio.paused).toString());
  });
})();
