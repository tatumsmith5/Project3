window.addEventListener('load', () => {
  const target = document.body.scrollHeight;
  const duration = 2400;
  let startTime = null;

  function ease(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  }

  function step(now) {
    if (!startTime) startTime = now;
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    window.scrollTo(0, target * ease(progress));
    if (progress < 1) requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
});

document.addEventListener('DOMContentLoaded', () => {
  const group        = document.getElementById('panic-btn-group');
  const rect         = document.getElementById('panic-btn-rect');
  const panickText   = document.getElementById('panick-text');
  const redCharacter = document.getElementById('red-character');

  group.addEventListener('mouseenter', () => { rect.style.fill = '#f1a7b3'; panickText.style.fill = '#fff'; redCharacter.style.opacity = '1'; });
  group.addEventListener('mouseleave', () => { rect.style.fill = ''; panickText.style.fill = '#231f20'; redCharacter.style.opacity = '0'; });
  group.addEventListener('mousedown',  () => { rect.style.fill = '#db5971'; panickText.style.fill = '#fff'; redCharacter.style.opacity = '1'; });
  group.addEventListener('mouseup',    () => { rect.style.fill = '#f1a7b3'; panickText.style.fill = '#fff'; redCharacter.style.opacity = '1'; });

  group.addEventListener('touchstart', (e) => {
    e.preventDefault();
    rect.style.fill = '#db5971';
    panickText.style.fill = '#fff';
  }, { passive: false });

  group.addEventListener('touchend', () => {
    rect.style.fill = '';
    panickText.style.fill = '#231f20';
    navigate();
  });

  group.addEventListener('click', navigate);

  function navigate() {
    const n = Math.floor(Math.random() * 5) + 1;
    window.location.href = `game${n}.html`;
  }
});
