/* SentryC2 — theme toggle + hero mesh */
(function () {
    'use strict';

    /* ---------- Theme ---------- */
    var root = document.documentElement;
    var stored = null;
    try { stored = localStorage.getItem('theme'); } catch (e) { /* private mode */ }
    if (stored === 'light' || stored === 'dark') root.setAttribute('data-theme', stored);

    function currentTheme() {
        var t = root.getAttribute('data-theme');
        if (t) return t;
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    function initToggle() {
        var btn = document.querySelector('.theme-toggle');
        if (!btn) return;
        btn.addEventListener('click', function () {
            var next = currentTheme() === 'dark' ? 'light' : 'dark';
            root.setAttribute('data-theme', next);
            try { localStorage.setItem('theme', next); } catch (e) { /* ignore */ }
            restyleMesh();
        });
    }

    /* ---------- Hero mesh ---------- */
    var canvas, ctx, nodes = [], rafId = null, W = 0, H = 0, dpr = 1;
    var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var LINK_DIST = 140;

    function meshColors() {
        var cs = getComputedStyle(root);
        return {
            node: cs.getPropertyValue('--mesh-node').trim() || 'rgba(58,75,85,0.45)',
            line: cs.getPropertyValue('--mesh-line').trim() || 'rgba(58,75,85,0.16)'
        };
    }
    var colors = null;

    function restyleMesh() {
        colors = meshColors();
        if (canvas && reducedMotion) drawFrame();
    }

    function sizeMesh() {
        var rect = canvas.parentElement.getBoundingClientRect();
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        W = rect.width; H = rect.height;
        canvas.width = Math.round(W * dpr);
        canvas.height = Math.round(H * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        var target = Math.max(16, Math.min(36, Math.round(W / 42)));
        nodes = [];
        for (var i = 0; i < target; i++) {
            nodes.push({
                x: Math.random() * W,
                y: Math.random() * H,
                vx: (Math.random() - 0.5) * 0.3,
                vy: (Math.random() - 0.5) * 0.3
            });
        }
    }

    function drawFrame() {
        ctx.clearRect(0, 0, W, H);
        var i, j, a, b, dx, dy, dist;
        ctx.lineWidth = 1;
        for (i = 0; i < nodes.length; i++) {
            for (j = i + 1; j < nodes.length; j++) {
                a = nodes[i]; b = nodes[j];
                dx = a.x - b.x; dy = a.y - b.y;
                dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < LINK_DIST) {
                    ctx.globalAlpha = 1 - dist / LINK_DIST;
                    ctx.strokeStyle = colors.line;
                    ctx.beginPath();
                    ctx.moveTo(a.x, a.y);
                    ctx.lineTo(b.x, b.y);
                    ctx.stroke();
                }
            }
        }
        ctx.globalAlpha = 1;
        ctx.fillStyle = colors.node;
        for (i = 0; i < nodes.length; i++) {
            a = nodes[i];
            ctx.beginPath();
            ctx.arc(a.x, a.y, 1.8, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function step() {
        for (var i = 0; i < nodes.length; i++) {
            var n = nodes[i];
            n.x += n.vx; n.y += n.vy;
            if (n.x < -8) n.x = W + 8; else if (n.x > W + 8) n.x = -8;
            if (n.y < -8) n.y = H + 8; else if (n.y > H + 8) n.y = -8;
        }
        drawFrame();
        rafId = requestAnimationFrame(step);
    }

    function startMesh() {
        if (rafId === null && !reducedMotion) rafId = requestAnimationFrame(step);
    }
    function stopMesh() {
        if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null; }
    }

    function initMesh() {
        canvas = document.querySelector('.hero-mesh');
        if (!canvas || !canvas.getContext) return;
        ctx = canvas.getContext('2d');
        colors = meshColors();
        sizeMesh();
        drawFrame();
        if (!reducedMotion) startMesh();

        var resizeTimer = null;
        window.addEventListener('resize', function () {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(function () { sizeMesh(); drawFrame(); }, 150);
        });
        document.addEventListener('visibilitychange', function () {
            if (document.hidden) stopMesh(); else startMesh();
        });
    }

    /* ---------- Reduced-motion video ---------- */
    function initVideo() {
        if (!reducedMotion) return;
        var vids = document.querySelectorAll('video[autoplay]');
        for (var i = 0; i < vids.length; i++) {
            vids[i].removeAttribute('autoplay');
            vids[i].pause();
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () { initToggle(); initMesh(); initVideo(); });
    } else {
        initToggle(); initMesh(); initVideo();
    }
})();
