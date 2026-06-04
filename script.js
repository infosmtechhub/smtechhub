/* ============================================================
   SMTECHHUB – Smart Multi-Technology Hub
   Main JavaScript – script.js
   ============================================================ */

'use strict';

// ---- Preloader ----
window.addEventListener('load', () => {
    const preloader = document.getElementById('preloader');
    if (preloader) {
        setTimeout(() => {
            preloader.classList.add('hidden');
            setTimeout(() => preloader.remove(), 600);
        }, 1800);
    }
});

// ---- AOS Init ----
document.addEventListener('DOMContentLoaded', () => {
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 700,
            easing: 'ease-out-cubic',
            once: true,
            offset: 60,
        });
    }

    initNavbar();
    initScrollTop();
    initCounters();
    initContactForm();
    initHeroCanvas();
    initSmoothScroll();
    initLiveChat();
    initNewsletterForm();
});

// ---- Navbar Scroll Behavior ----
function initNavbar() {
    const navbar = document.getElementById('mainNavbar');
    if (!navbar) return;

    const onScroll = () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // Active nav link based on scroll section
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');

    const sectionObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    navLinks.forEach(link => {
                        link.classList.remove('active');
                        if (link.getAttribute('href') === `#${entry.target.id}`) {
                            link.classList.add('active');
                        }
                    });
                }
            });
        },
        { threshold: 0.3, rootMargin: '-80px 0px -60% 0px' }
    );
    sections.forEach(s => sectionObserver.observe(s));

    // Close mobile menu on link click
    const navbarCollapse = document.getElementById('navbarNav');
    document.querySelectorAll('.navbar-nav .nav-link').forEach(link => {
        link.addEventListener('click', () => {
            if (navbarCollapse && navbarCollapse.classList.contains('show')) {
                const toggler = document.querySelector('.navbar-toggler');
                if (toggler) toggler.click();
            }
        });
    });
}

// ---- Scroll-to-Top Button ----
function initScrollTop() {
    const btn = document.getElementById('scrollTopBtn');
    if (!btn) return;

    window.addEventListener('scroll', () => {
        btn.classList.toggle('visible', window.scrollY > 400);
    }, { passive: true });

    btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// ---- Animated Counters ----
function initCounters() {
    const counters = document.querySelectorAll('[data-count], .count-num[data-count]');

    const animateCounter = (el) => {
        const target = parseInt(el.dataset.count, 10);
        const duration = 2000;
        const step = target / (duration / 16);
        let current = 0;

        const tick = () => {
            current = Math.min(current + step, target);
            el.textContent = Math.floor(current);
            if (current < target) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !entry.target.dataset.counted) {
                    entry.target.dataset.counted = 'true';
                    animateCounter(entry.target);
                }
            });
        },
        { threshold: 0.5 }
    );

    counters.forEach(c => observer.observe(c));
}

// ---- Contact Form ----
function initContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const nameEl  = document.getElementById('contactName');
        const emailEl = document.getElementById('contactEmail');
        const phoneEl = document.getElementById('contactPhone');
        const msgEl   = document.getElementById('contactMessage');
        const successEl = document.getElementById('formSuccess');
        const errorEl   = document.getElementById('formError');
        const submitBtn = document.getElementById('submitBtn');
        const btnText    = submitBtn?.querySelector('.btn-text');
        const btnLoading = submitBtn?.querySelector('.btn-loading');

        successEl?.classList.add('d-none');
        errorEl?.classList.add('d-none');

        let valid = true;
        [nameEl, emailEl, phoneEl, msgEl].forEach(el => {
            if (el && !el.value.trim()) {
                el.classList.add('is-invalid');
                valid = false;
            } else if (el) {
                el.classList.remove('is-invalid');
                el.classList.add('is-valid');
            }
        });

        if (emailEl && emailEl.value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailEl.value.trim())) {
            emailEl.classList.add('is-invalid');
            emailEl.classList.remove('is-valid');
            valid = false;
        }

        if (!valid) {
            errorEl?.classList.remove('d-none');
            return;
        }

        // Show loading state
        if (btnText) btnText.classList.add('d-none');
        if (btnLoading) btnLoading.classList.remove('d-none');
        if (submitBtn) submitBtn.disabled = true;

        // Simulate async submission
        await new Promise(resolve => setTimeout(resolve, 1500));

        if (btnText) btnText.classList.remove('d-none');
        if (btnLoading) btnLoading.classList.add('d-none');
        if (submitBtn) submitBtn.disabled = false;

        successEl?.classList.remove('d-none');
        form.reset();
        form.querySelectorAll('.is-valid').forEach(el => el.classList.remove('is-valid'));
    });

    // Real-time validation clearing
    form.querySelectorAll('input, textarea').forEach(el => {
        el.addEventListener('input', () => {
            if (el.value.trim()) el.classList.remove('is-invalid');
        });
    });
}

// ---- Hero Canvas Background (Particle Grid) ----
function initHeroCanvas() {
    const container = document.getElementById('heroCanvas');
    if (!container) return;

    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;opacity:0.4;';
    container.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    let W, H, particles = [], animId;

    const resize = () => {
        W = canvas.width = container.offsetWidth;
        H = canvas.height = container.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize, { passive: true });

    // Create grid dots
    const COLS = Math.ceil(W / 60);
    const ROWS = Math.ceil(H / 60);

    for (let i = 0; i < COLS; i++) {
        for (let j = 0; j < ROWS; j++) {
            particles.push({
                x: i * 60 + 30,
                y: j * 60 + 30,
                r: Math.random() * 1.2 + 0.3,
                alpha: Math.random() * 0.5 + 0.1,
                speed: Math.random() * 0.004 + 0.002,
                phase: Math.random() * Math.PI * 2,
            });
        }
    }

    const draw = (t) => {
        ctx.clearRect(0, 0, W, H);
        particles.forEach(p => {
            const alpha = p.alpha + Math.sin(t * p.speed + p.phase) * 0.3;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(13,110,253,${Math.max(0, alpha)})`;
            ctx.fill();
        });

        // Draw grid lines (faint)
        ctx.strokeStyle = 'rgba(13,110,253,0.04)';
        ctx.lineWidth = 1;
        for (let i = 0; i < COLS + 1; i++) {
            ctx.beginPath();
            ctx.moveTo(i * 60, 0);
            ctx.lineTo(i * 60, H);
            ctx.stroke();
        }
        for (let j = 0; j < ROWS + 1; j++) {
            ctx.beginPath();
            ctx.moveTo(0, j * 60);
            ctx.lineTo(W, j * 60);
            ctx.stroke();
        }

        animId = requestAnimationFrame(draw);
    };
    animId = requestAnimationFrame(draw);

    // Cleanup on page unload
    window.addEventListener('pagehide', () => cancelAnimationFrame(animId));
}

// ---- Smooth Scroll for anchor links ----
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            const targetId = anchor.getAttribute('href');
            if (!targetId || targetId === '#') return;

            const target = document.querySelector(targetId);
            if (!target) return;

            e.preventDefault();
            const navHeight = document.getElementById('mainNavbar')?.offsetHeight || 80;
            const top = target.getBoundingClientRect().top + window.scrollY - navHeight - 10;
            window.scrollTo({ top, behavior: 'smooth' });
        });
    });
}

// ---- Live Chat Placeholder ----
function initLiveChat() {
    const btn = document.getElementById('liveChatBtn');
    if (!btn) return;

    btn.addEventListener('click', () => {
        // Placeholder — integrate Tawk.to, Intercom, Crisp, etc.
        const modal = createChatModal();
        document.body.appendChild(modal);
        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();
        modal.addEventListener('hidden.bs.modal', () => modal.remove());
    });
}

function createChatModal() {
    const div = document.createElement('div');
    div.className = 'modal fade';
    div.setAttribute('tabindex', '-1');
    div.innerHTML = `
        <div class="modal-dialog modal-dialog-centered modal-sm">
            <div class="modal-content" style="background:#131929;border:1px solid rgba(255,255,255,0.07);border-radius:16px;">
                <div class="modal-header" style="border-bottom:1px solid rgba(255,255,255,0.07);">
                    <div class="d-flex align-items-center gap-2">
                        <div style="width:36px;height:36px;background:linear-gradient(135deg,#0d6efd,#00d4ff);border-radius:8px;display:flex;align-items:center;justify-content:center;">
                            <i class="bi bi-chat-dots-fill text-white"></i>
                        </div>
                        <div>
                            <h6 class="mb-0 text-white" style="font-size:0.9rem;">SMTECHHUB Live Support</h6>
                            <small style="color:#4ade80;font-size:0.72rem;">● Online – Typically replies in minutes</small>
                        </div>
                    </div>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body text-center py-4" style="color:#8896b3;">
                    <i class="bi bi-headset" style="font-size:3rem;color:#0d6efd;display:block;margin-bottom:14px;"></i>
                    <p style="font-size:0.88rem;margin-bottom:16px;">Our support team is ready to assist you. Choose how you'd like to connect:</p>
                    <a href="tel:+91XXXXXXXXXX" class="btn btn-primary w-100 mb-2" style="font-size:0.85rem;">
                        <i class="bi bi-telephone-fill"></i> Call Now
                    </a>
                    <a href="https://wa.me/91XXXXXXXXXX" target="_blank" class="btn w-100 mb-2" style="background:#25D366;border:none;color:#fff;font-size:0.85rem;border-radius:8px;padding:10px;display:inline-flex;align-items:center;justify-content:center;gap:7px;">
                        <i class="bi bi-whatsapp"></i> WhatsApp
                    </a>
                    <a href="mailto:support@smtechhub.com" class="btn btn-outline-secondary w-100" style="font-size:0.85rem;">
                        <i class="bi bi-envelope-fill"></i> Email Support
                    </a>
                </div>
            </div>
        </div>`;
    return div;
}

// ---- Newsletter Form ----
function initNewsletterForm() {
    const section = document.querySelector('.newsletter-section');
    if (!section) return;

    const btn = section.querySelector('button');
    const input = section.querySelector('input[type="email"]');
    if (!btn || !input) return;

    btn.addEventListener('click', (e) => {
        e.preventDefault();
        const email = input.value.trim();
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            input.style.borderColor = 'rgba(220,53,69,0.5)';
            input.focus();
            return;
        }
        input.style.borderColor = '';
        btn.innerHTML = '<i class="bi bi-check-circle-fill"></i> Subscribed!';
        btn.disabled = true;
        input.value = '';

        setTimeout(() => {
            btn.innerHTML = 'Subscribe <i class="bi bi-arrow-right"></i>';
            btn.disabled = false;
        }, 4000);
    });
}

// ---- Utility: Throttle ----
function throttle(fn, wait) {
    let last = 0;
    return (...args) => {
        const now = Date.now();
        if (now - last >= wait) { last = now; fn(...args); }
    };
}

// ---- Service Tab URL hash sync ----
document.addEventListener('DOMContentLoaded', () => {
    // If URL contains #svc-*, activate that tab
    const hash = window.location.hash;
    if (hash && document.querySelector(hash)) {
        const tab = document.querySelector(`[data-bs-target="${hash}"]`);
        if (tab) {
            new bootstrap.Tab(tab).show();
        }
    }

    // Update hash on tab change
    document.querySelectorAll('[data-bs-toggle="pill"]').forEach(tab => {
        tab.addEventListener('shown.bs.tab', (e) => {
            const target = e.target.dataset.bsTarget;
            if (target) history.replaceState(null, '', target);
        });
    });
});

// ---- Parallax for hero section (subtle) ----
window.addEventListener('scroll', throttle(() => {
    const hero = document.querySelector('.hero-section');
    if (!hero) return;
    const offset = window.scrollY;
    if (offset < window.innerHeight) {
        hero.style.backgroundPositionY = `${offset * 0.3}px`;
    }
}, 16), { passive: true });

// ---- Card hover tilt (optional micro-interaction) ----
document.querySelectorAll('.why-card, .testi-card, .industry-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width - 0.5) * 6;
        const y = ((e.clientY - rect.top) / rect.height - 0.5) * 6;
        card.style.transform = `perspective(600px) rotateX(${-y}deg) rotateY(${x}deg) translateY(-4px)`;
    });
    card.addEventListener('mouseleave', () => {
        card.style.transform = '';
    });
});
