document.getElementById('year').textContent = new Date().getFullYear();


(function () {
  var canvas = document.getElementById('starfield');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var stars = [];
  var shooters = [];
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var vw, vh, dpr, nextShot = 0;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    vw = window.innerWidth;
    vh = window.innerHeight;
    canvas.width = vw * dpr;
    canvas.height = vh * dpr;
    canvas.style.width = vw + 'px';
    canvas.style.height = vh + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    seedStars();
  }

  function seedStars() {
    var count = Math.round((vw * vh) / 8500);
    stars = [];
    for (var i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * vw,
        y: Math.random() * vh,
        r: Math.random() * 1.2 + 0.4,
        base: Math.random() * 0.5 + 0.25,
        speed: Math.random() * 0.02 + 0.006,
        phase: Math.random() * Math.PI * 2
      });
    }
  }

  function spawnShooter() {
    var startX = Math.random() * vw * 0.6 + vw * 0.2;
    var angle = (Math.random() * 18 + 48) * Math.PI / 180;
    var speed = Math.random() * 5 + 10;
    shooters.push({
      x: startX,
      y: -10,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1
    });
  }

  function frame(t) {
    ctx.clearRect(0, 0, vw, vh);

    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];
      var a = s.base;
      if (!reduced) {
        s.phase += s.speed;
        a = s.base + Math.sin(s.phase) * 0.3;
        if (a < 0.05) a = 0.05;
        if (a > 1) a = 1;
      }
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,' + a.toFixed(3) + ')';
      ctx.fill();
    }

    if (!reduced) {
      if (t > nextShot) {
        spawnShooter();
        nextShot = t + (Math.random() * 5000 + 3500);
      }
      for (var j = shooters.length - 1; j >= 0; j--) {
        var sh = shooters[j];
        sh.x += sh.vx;
        sh.y += sh.vy;
        sh.life -= 0.014;

        var tx = sh.x - sh.vx * 9;
        var ty = sh.y - sh.vy * 9;
        var life = Math.max(sh.life, 0);
        var grad = ctx.createLinearGradient(sh.x, sh.y, tx, ty);
        grad.addColorStop(0, 'rgba(255,255,255,' + life + ')');
        grad.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.6;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(sh.x, sh.y);
        ctx.lineTo(tx, ty);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(sh.x, sh.y, 1.3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,' + life + ')';
        ctx.shadowBlur = 6;
        ctx.shadowColor = '#fff';
        ctx.fill();
        ctx.shadowBlur = 0;

        if (sh.life <= 0 || sh.x > vw + 50 || sh.y > vh + 50) {
          shooters.splice(j, 1);
        }
      }
    }

    requestAnimationFrame(frame);
  }

  window.addEventListener('resize', resize);
  resize();
  requestAnimationFrame(frame);
})();
