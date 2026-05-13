/* Site-wide background music persistence.
   Stores playback state + position in sessionStorage so the audio
   continues seamlessly when navigating between pages.
   Auto-plays whenever sessionStorage says music was playing.
   Only stops when the user explicitly clicks the disc to pause. */
(function () {
  var KEY_PLAYING = 'siteAudioPlaying';
  var KEY_TIME = 'siteAudioTime';

  var audio = document.getElementById('site-audio');
  var btn = document.getElementById('audio-toggle');

  // Always restore last position when audio metadata is ready.
  function restorePosition() {
    if (!audio) return;
    var t = 0;
    try { t = parseFloat(sessionStorage.getItem(KEY_TIME) || '0') || 0; } catch (e) {}
    if (t > 0 && isFinite(t)) {
      try { audio.currentTime = t; } catch (e) {}
    }
  }

  if (audio) {
    audio.volume = 0.28;
    if (audio.readyState >= 1) restorePosition();
    else audio.addEventListener('loadedmetadata', restorePosition, { once: true });

    // Persist position frequently so refresh / nav resumes accurately.
    audio.addEventListener('timeupdate', function () {
      try { sessionStorage.setItem(KEY_TIME, String(audio.currentTime)); } catch (e) {}
    });
  }

  function setPlayingUI(playing) {
    if (!btn) return;
    btn.classList.toggle('is-playing', playing);
    btn.setAttribute('aria-pressed', playing ? 'true' : 'false');
    btn.setAttribute('aria-label', playing ? 'Pause background music' : 'Play background music');
  }

  function autoplayIfWanted() {
    if (!audio) return;
    var wanted = false;
    try { wanted = sessionStorage.getItem(KEY_PLAYING) === '1'; } catch (e) {}
    if (!wanted) { setPlayingUI(false); return; }

    var attempt = function () {
      audio.play().then(function () { setPlayingUI(true); }).catch(function () {
        // Browser may block autoplay until a user gesture; retry on next interaction.
        var once = function () {
          audio.play().then(function () { setPlayingUI(true); }).catch(function () {});
          window.removeEventListener('pointerdown', once);
          window.removeEventListener('keydown', once);
          window.removeEventListener('scroll', once);
        };
        window.addEventListener('pointerdown', once, { once: true });
        window.addEventListener('keydown', once, { once: true });
        window.addEventListener('scroll', once, { once: true, passive: true });
      });
    };
    setTimeout(attempt, 80);
  }

  if (audio && btn) {
    btn.addEventListener('click', function () {
      if (audio.paused) {
        audio.play().then(function () {
          setPlayingUI(true);
          try { sessionStorage.setItem(KEY_PLAYING, '1'); } catch (e) {}
        }).catch(function () {});
      } else {
        audio.pause();
        setPlayingUI(false);
        try { sessionStorage.setItem(KEY_PLAYING, '0'); } catch (e) {}
      }
    });

    audio.addEventListener('play', function () {
      setPlayingUI(true);
      try { sessionStorage.setItem(KEY_PLAYING, '1'); } catch (e) {}
    });
    audio.addEventListener('pause', function () {
      if (!audio.seeking) setPlayingUI(false);
    });
  }

  autoplayIfWanted();
})();
