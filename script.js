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

        // Collect all form data
        const contactTime = document.querySelector('input[name="contactTime"]:checked')?.value || 'Anytime';
        const newsletter  = document.getElementById('newsletterCheck')?.checked ? 'Yes' : 'No';

        const payload = {
            access_key: '6ad3f653-56dd-469d-a767-171eb66f9e69',
            subject:    'New Enquiry from SMTECHHUB Website',
            from_name:  'SMTECHHUB Website',
            name:       document.getElementById('contactName')?.value.trim(),
            email:      document.getElementById('contactEmail')?.value.trim(),
            phone:      document.getElementById('contactPhone')?.value.trim(),
            company:    document.getElementById('contactCompany')?.value.trim() || '—',
            title:      document.getElementById('contactTitle')?.value.trim()   || '—',
            company_size: document.getElementById('contactSize')?.value         || '—',
            service:    document.getElementById('contactService')?.value        || '—',
            preferred_time: contactTime,
            newsletter: newsletter,
            message:    document.getElementById('contactMessage')?.value.trim(),
        };

        try {
            const res  = await fetch('https://api.web3forms.com/submit', {
                method:  'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body:    JSON.stringify(payload)
            });
            const data = await res.json();

            if (data.success) {
                successEl?.classList.remove('d-none');
                form.reset();
                form.querySelectorAll('.is-valid').forEach(el => el.classList.remove('is-valid'));
            } else {
                errorEl?.classList.remove('d-none');
            }
        } catch {
            errorEl?.classList.remove('d-none');
        }

        if (btnText) btnText.classList.remove('d-none');
        if (btnLoading) btnLoading.classList.add('d-none');
        if (submitBtn) submitBtn.disabled = false;
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
            ctx.fillStyle = `rgba(147,197,253,${Math.max(0, alpha)})`;
            ctx.fill();
        });

        // Draw grid lines (faint)
        ctx.strokeStyle = 'rgba(147,197,253,0.06)';
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

// ---- Job Filter (careers.html) ----
const jobFilters = document.getElementById('jobFilters');
if (jobFilters) {
    jobFilters.addEventListener('click', (e) => {
        const btn = e.target.closest('.job-filter-btn');
        if (!btn) return;
        jobFilters.querySelectorAll('.job-filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.dataset.filter;
        document.querySelectorAll('.job-item').forEach(item => {
            const match = filter === 'all' || item.dataset.category === filter;
            item.classList.toggle('hidden', !match);
        });
    });
}

// ---- Blog Filter (blog.html) ----
const blogFilters = document.getElementById('blogFilters');
if (blogFilters) {
    blogFilters.addEventListener('click', (e) => {
        const btn = e.target.closest('.blog-filter-btn');
        if (!btn) return;
        blogFilters.querySelectorAll('.blog-filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.dataset.filter;
        document.querySelectorAll('.blog-grid-item').forEach(item => {
            const match = filter === 'all' || item.dataset.category === filter;
            item.classList.toggle('hidden', !match);
        });
        const featured = document.querySelector('.blog-featured');
        if (featured) {
            const match = filter === 'all' || featured.dataset.category === filter;
            featured.closest('.col-12').classList.toggle('hidden', !match);
        }
    });
}

// ---- Apply Modal Job Title ----
const applyModal = document.getElementById('applyModal');
if (applyModal) {
    applyModal.addEventListener('show.bs.modal', (e) => {
        const trigger = e.relatedTarget;
        const jobTitle = trigger?.dataset?.job || '';
        const titleEl = document.getElementById('modalJobTitle');
        if (titleEl) titleEl.textContent = jobTitle;
    });

    const modalForm = document.getElementById('modalApplyForm');
    if (modalForm) {
        const modalSubmitBtn = document.getElementById('modalSubmitBtn');
        modalForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('mApplyName');
            const email = document.getElementById('mApplyEmail');
            const phone = document.getElementById('mApplyPhone');
            const successEl = document.getElementById('mApplySuccess');
            const errorEl = document.getElementById('mApplyError');

            let valid = true;
            [name, email, phone].forEach(el => {
                if (el && !el.value.trim()) { el.classList.add('is-invalid'); valid = false; }
                else if (el) el.classList.remove('is-invalid');
            });
            if (!valid) { errorEl?.classList.remove('d-none'); return; }

            if (modalSubmitBtn) { modalSubmitBtn.disabled = true; modalSubmitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Submitting...'; }
            await new Promise(r => setTimeout(r, 1500));
            if (modalSubmitBtn) { modalSubmitBtn.disabled = false; modalSubmitBtn.innerHTML = '<i class="bi bi-send-fill"></i> Submit Application'; }
            successEl?.classList.remove('d-none');
            errorEl?.classList.add('d-none');
            modalForm.reset();
        });
    }
}

// ---- General Apply Form (careers.html) ----
const applyForm = document.getElementById('applyForm');
if (applyForm) {
    applyForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const requiredFields = ['applyName', 'applyEmail', 'applyPhone', 'applyArea', 'applyCover'];
        let valid = true;
        requiredFields.forEach(id => {
            const el = document.getElementById(id);
            if (el && !el.value.trim()) { el.classList.add('is-invalid'); valid = false; }
            else if (el) el.classList.remove('is-invalid');
        });
        const successEl = document.getElementById('applySuccess');
        const errorEl = document.getElementById('applyError');
        const btn = document.getElementById('applySubmitBtn');
        const btnText = btn?.querySelector('.btn-text');
        const btnLoading = btn?.querySelector('.btn-loading');
        if (!valid) { errorEl?.classList.remove('d-none'); return; }

        if (btnText) btnText.classList.add('d-none');
        if (btnLoading) btnLoading.classList.remove('d-none');
        if (btn) btn.disabled = true;
        await new Promise(r => setTimeout(r, 1500));
        if (btnText) btnText.classList.remove('d-none');
        if (btnLoading) btnLoading.classList.add('d-none');
        if (btn) btn.disabled = false;
        successEl?.classList.remove('d-none');
        errorEl?.classList.add('d-none');
        applyForm.reset();
    });
}

// ---- Services sticky nav active state on scroll ----
const svcNavPills = document.querySelectorAll('.svc-nav-pill');
if (svcNavPills.length) {
    const svcSections = ['infrastructure', 'hardware', 'cybersecurity', 'managed-it', 'staffing', 'cloud']
        .map(id => document.getElementById(id))
        .filter(Boolean);
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                svcNavPills.forEach(p => {
                    p.classList.toggle('active', p.getAttribute('href') === `#${entry.target.id}`);
                });
            }
        });
    }, { rootMargin: '-20% 0px -70% 0px' });
    svcSections.forEach(s => observer.observe(s));
}

// ---- Pre-fill contact form service from URL params ----
document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const serviceParam = params.get('service');
    const planParam = params.get('plan');
    const serviceSelect = document.getElementById('contactService');

    if (serviceSelect && serviceParam) {
        const map = {
            infrastructure: 'IT Infrastructure Solutions',
            hardware: 'Hardware Supply & Procurement',
            cybersecurity: 'Cybersecurity Services',
            cloud: 'Cloud Migration',
            staffing: 'IT Staffing & HR Services',
            managed: 'Managed IT Services / AMC',
        };
        const val = map[serviceParam];
        if (val) {
            [...serviceSelect.options].forEach(opt => {
                if (opt.text.includes(val.split(' ')[0])) serviceSelect.value = opt.value;
            });
        }
    }

    if (planParam) {
        const msgEl = document.getElementById('contactMessage');
        if (msgEl) {
            const planMap = {
                essential: 'I am interested in the Essential AMC Plan (up to 25 users). Please send me details.',
                professional: 'I am interested in the Professional AMC Plan (25–100 users). Please contact me.',
                enterprise: 'I would like a custom Enterprise AMC quote for our organization.',
                trial: 'I would like to start the 30-day free trial of your Managed IT Services.',
            };
            msgEl.value = planMap[planParam] || '';
        }
    }
});
