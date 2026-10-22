(function () {
    if (new URLSearchParams(window.location.search).get('debug') !== '1') return;
    var script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/eruda';
    script.onload = function () {
        if (window.eruda) window.eruda.init();
    };
    document.head.appendChild(script);
})();

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

        function toggleMobileMenu() {
            const sidebar = document.getElementById('mobile-sidebar');
            const overlay = document.getElementById('menu-overlay-bg');
            const btn = document.getElementById('hamburger-btn');
            if (!sidebar) return;
            sidebar.classList.toggle('open');
            if (overlay) overlay.classList.toggle('open');
            if (btn) btn.classList.toggle('active');
        }
        function closeMobileMenu() {
            const sidebar = document.getElementById('mobile-sidebar');
            const overlay = document.getElementById('menu-overlay-bg');
            const btn = document.getElementById('hamburger-btn');
            if (sidebar) sidebar.classList.remove('open');
            if (overlay) overlay.classList.remove('open');
            if (btn) btn.classList.remove('active');
        }
        function toggleOverlayMenu() {
            const sidebar = document.getElementById('mobile-sidebar');
            const btn = document.getElementById('hamburger-overlay-btn');
            if (!sidebar) return;
            sidebar.classList.toggle('open');
            if (btn) btn.classList.toggle('active');
        }
        function closeOverlayMenu() {
            const sidebar = document.getElementById('mobile-sidebar');
            const btn = document.getElementById('hamburger-overlay-btn');
            if (sidebar) sidebar.classList.remove('open');
            if (btn) btn.classList.remove('active');
        }
        document.addEventListener('click', function (e) {
            const sidebar = document.getElementById('mobile-sidebar');
            const btnMain = document.getElementById('hamburger-btn');
            const btnOverlay = document.getElementById('hamburger-overlay-btn');
            const overlayContainer = document.getElementById('manage-overlay');
            if (!sidebar) return;
            if (sidebar.classList.contains('open') && !overlayContainer.classList.contains('hidden') === false) {
                if (!sidebar.contains(e.target) && !btnMain?.contains(e.target)) closeMobileMenu();
            }
            if (overlayContainer.classList.contains('hidden') === false) {
                if (sidebar.classList.contains('open')) {
                    if (!sidebar.contains(e.target) && !btnOverlay?.contains(e.target)) closeOverlayMenu();
                }
            }
        });
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') { closeOverlayMenu(); closeMobileMenu(); }
        });

        function switchTab(tabName) {
            document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.module-page').forEach(page => page.classList.add('hidden'));
            const activeBtn = document.querySelector(`.tab-btn[data-tab="${tabName}"]`);
            const activePage = document.getElementById(`mod-${tabName}`);
            if (activeBtn) activeBtn.classList.add('active');
            if (activePage) activePage.classList.remove('hidden');
            if (tabName === 'tickets' && typeof renderTicketOverview === 'function') {
                setTimeout(renderTicketOverview, 50);
            }
            if (tabName === 'bot' && typeof renderBotChannelSelect === 'function') {
                setTimeout(renderBotChannelSelect, 50);
            }
            if (tabName === 'voice_support' && typeof renderVoiceSupportSelects === 'function') {
                setTimeout(renderVoiceSupportSelects, 50);
            }
        }
        function switchSubtab(module, sub) {
            const container = document.getElementById(`mod-${module}`);
            container.querySelectorAll('.subtab-btn').forEach(b => b.classList.remove('active'));
            container.querySelectorAll('.subpage').forEach(p => p.classList.add('hidden'));
            const activeBtn = container.querySelector(`[data-sub="${sub}"]`);
            const activePage = document.getElementById(`${module}-${sub}-page`);
            if (activeBtn) activeBtn.classList.add('active');
            if (activePage) activePage.classList.remove('hidden');
        }

        function showToast(message, type) {
            const container = document.getElementById('toast-container');
            if (!container) return;
            const toast = document.createElement('div');
            toast.className = `toast ${type || 'success'}`;
            toast.textContent = message;
            container.appendChild(toast);
            setTimeout(() => toast.remove(), 3000);
        }

        async function handleSaveClick(module) {
            if (typeof saveModuleSettings === 'function') {
                await saveModuleSettings(module);
            } else {
                showToast('Fehler: dashboard.js wurde nicht geladen', 'error');
            }
        }

        
        function syncColor(prefix) { }
        function syncColorHex(prefix) { }
        function handleImageUpload(input, prefix) { }
        function clearImage(prefix) { }
        async function saveModuleSettings(module) {
            showToast('Fehler: dashboard.js wurde nicht geladen - nichts gespeichert!', 'error');
        }
