// ===== 3D Canvas Setup with Three.js =====
class Portfolio3D {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.particles = [];
        this.lines = [];
        this.init();
        this.animate();
        window.addEventListener('resize', () => this.onWindowResize());
        window.addEventListener('mousemove', (e) => this.onMouseMove(e));
    }

    init() {
        const canvas = document.getElementById('canvas3d');
        
        // Scene setup
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0f172a);
        
        // Camera setup
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.z = 30;
        
        // Renderer setup
        this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        
        // Create particles
        this.createParticles();
        
        // Create lines
        this.createLines();
        
        // Create floating cubes
        this.createFloatingCubes();
        
        // Lighting
        this.setupLighting();
    }

    createParticles() {
        const geometry = new THREE.BufferGeometry();
        const particleCount = 150;
        const positions = new Float32Array(particleCount * 3);
        
        for (let i = 0; i < particleCount * 3; i += 3) {
            positions[i] = (Math.random() - 0.5) * 200;
            positions[i + 1] = (Math.random() - 0.5) * 200;
            positions[i + 2] = (Math.random() - 0.5) * 200;
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        const material = new THREE.PointsMaterial({
            color: 0xa855f7,
            size: 0.5,
            sizeAttenuation: true,
            transparent: true,
            opacity: 0.6
        });
        
        this.particles = new THREE.Points(geometry, material);
        this.scene.add(this.particles);
    }

    createLines() {
        const lineMaterial = new THREE.LineBasicMaterial({
            color: 0xec4899,
            transparent: true,
            opacity: 0.3,
            linewidth: 2
        });
        
        // Create a network of lines
        for (let i = 0; i < 5; i++) {
            const geometry = new THREE.BufferGeometry();
            const positions = [];
            
            for (let j = 0; j < 10; j++) {
                positions.push(
                    (Math.random() - 0.5) * 200,
                    (Math.random() - 0.5) * 200,
                    (Math.random() - 0.5) * 200
                );
            }
            
            geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));
            const line = new THREE.Line(geometry, lineMaterial);
            this.lines.push(line);
            this.scene.add(line);
        }
    }

    createFloatingCubes() {
        const colors = [0xa855f7, 0xec4899, 0x06b6d4, 0x10b981];
        
        for (let i = 0; i < 4; i++) {
            const geometry = new THREE.BoxGeometry(3, 3, 3);
            const material = new THREE.MeshStandardMaterial({
                color: colors[i],
                metalness: 0.7,
                roughness: 0.2,
                emissive: colors[i],
                emissiveIntensity: 0.2
            });
            
            const cube = new THREE.Mesh(geometry, material);
            cube.position.set(
                (Math.random() - 0.5) * 100,
                (Math.random() - 0.5) * 100,
                (Math.random() - 0.5) * 100
            );
            
            cube.rotation.set(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
            );
            
            cube.castShadow = true;
            cube.receiveShadow = true;
            
            // Store original position for animation
            cube.userData.originalPosition = cube.position.clone();
            cube.userData.rotationSpeed = {
                x: (Math.random() - 0.5) * 0.02,
                y: (Math.random() - 0.5) * 0.02,
                z: (Math.random() - 0.5) * 0.02
            };
            
            this.scene.add(cube);
        }
    }

    setupLighting() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
        this.scene.add(ambientLight);
        
        // Point lights with different colors
        const colors = [0xa855f7, 0xec4899, 0x06b6d4];
        const positions = [
            [50, 50, 50],
            [-50, -50, 50],
            [50, -50, -50]
        ];
        
        positions.forEach((pos, idx) => {
            const light = new THREE.PointLight(colors[idx], 1.5, 200);
            light.position.set(...pos);
            light.castShadow = true;
            this.scene.add(light);
        });
        
        // Directional light
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
        directionalLight.position.set(10, 10, 10);
        directionalLight.castShadow = true;
        this.scene.add(directionalLight);
    }

    onMouseMove(event) {
        if (!this.camera) return;
        
        const x = (event.clientX / window.innerWidth) * 2 - 1;
        const y = -(event.clientY / window.innerHeight) * 2 + 1;
        
        // Subtle camera movement
        this.camera.position.x = x * 5;
        this.camera.position.y = y * 5;
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        
        // Animate particles
        if (this.particles) {
            this.particles.rotation.x += 0.0001;
            this.particles.rotation.y += 0.0001;
        }
        
        // Animate lines
        this.lines.forEach((line, idx) => {
            line.rotation.x += 0.0005 * (idx + 1);
            line.rotation.y += 0.0005 * (idx + 1);
        });
        
        // Animate cubes
        this.scene.children.forEach((child) => {
            if (child.geometry && child.geometry.type === 'BoxGeometry') {
                child.rotation.x += child.userData.rotationSpeed.x;
                child.rotation.y += child.userData.rotationSpeed.y;
                child.rotation.z += child.userData.rotationSpeed.z;
                
                // Float effect
                child.position.y = child.userData.originalPosition.y + Math.sin(Date.now() * 0.0005) * 5;
                child.position.x = child.userData.originalPosition.x + Math.cos(Date.now() * 0.0003) * 3;
            }
        });
        
        this.renderer.render(this.scene, this.camera);
    }
}

// Initialize 3D scene
let portfolio3D;
document.addEventListener('DOMContentLoaded', () => {
    portfolio3D = new Portfolio3D();
});

// ===== Navigation and UI Interactions =====
const menuBtn = document.getElementById('menuBtn');
const mobileMenu = document.getElementById('mobileMenu');

menuBtn?.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
});

// Close mobile menu when a link is clicked
document.querySelectorAll('.mobile-link').forEach(link => {
    link.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
    });
});

// ===== Scroll Animations =====
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('scroll-fade-in');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe all cards and sections
document.querySelectorAll('.info-card, .stat-box, .education-card, .experience-card, .skill-category, .contact-card').forEach(el => {
    observer.observe(el);
});

// ===== Form Handling =====
const contactForm = document.getElementById('contactForm');
const formMessage = document.getElementById('formMessage');

const setFormMessage = (text, status = 'success') => {
    if (!formMessage) return;
    formMessage.textContent = text;
    formMessage.classList.toggle('text-green-300', status === 'success');
    formMessage.classList.toggle('text-red-400', status !== 'success');
};

if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = 'Sending...';

        const data = {
            name: contactForm.querySelector('input[name="name"]').value.trim(),
            email: contactForm.querySelector('input[name="email"]').value.trim(),
            message: contactForm.querySelector('textarea[name="message"]').value.trim()
        };

        if (!data.name || !data.email || !data.message) {
            setFormMessage('Please complete all fields before sending.', 'error');
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            return;
        }

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();
            if (!response.ok || !result.success) {
                const apiError = result?.error || 'Unable to send message.';
                setFormMessage(apiError, 'error');
                throw new Error(apiError);
            }

            setFormMessage('Thank you! We received your message and will respond as soon as possible.', 'success');
            contactForm.reset();
            submitBtn.innerHTML = '✓ Message Sent!';
            submitBtn.classList.add('bg-green-500');
        } catch (error) {
            console.error('Contact form error:', error);
            const errorMessage = error?.message || 'There was an issue sending your message. Please try again later.';
            setFormMessage(errorMessage, 'error');
            submitBtn.innerHTML = originalText;
        } finally {
            submitBtn.disabled = false;
            setTimeout(() => {
                submitBtn.innerHTML = originalText;
                submitBtn.classList.remove('bg-green-500');
            }, 3500);
        }
    });
}

// ===== Smooth Scroll for Navigation =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href !== '#' && document.querySelector(href)) {
            e.preventDefault();
            document.querySelector(href).scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ===== Active Navigation Highlighting =====
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');

const activateNavLink = () => {
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        if (pageYOffset >= sectionTop - 60) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('text-purple-400');
        if (link.getAttribute('href').slice(1) === current) {
            link.classList.add('text-purple-400');
        }
    });
};

window.addEventListener('scroll', activateNavLink);

// ===== Parallax Effect =====
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const parallaxElements = document.querySelectorAll('[class*="animate-blob"]');
    
    parallaxElements.forEach((el, idx) => {
        el.style.transform = `translateY(${scrolled * (0.1 + idx * 0.05)}px)`;
    });
});

// ===== Counter Animation =====
const animateCounters = () => {
    const cards = document.querySelectorAll('.info-card');
    const targets = [15, 38, 76, 5];
    
    const animateValue = (element, start, end, duration) => {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            element.textContent = Math.floor(progress * (end - start) + start);
            if (progress < 1) {
                window.requestAnimationFrame(step);
            } else {
                element.textContent = end + '+';
            }
        };
        window.requestAnimationFrame(step);
    };
    
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const valueElement = entry.target.querySelector('.text-3xl');
                const idx = Array.from(cards).indexOf(entry.target);
                if (idx !== -1) {
                    animateValue(valueElement, 0, targets[idx], 2000);
                }
                counterObserver.unobserve(entry.target);
            }
        });
    });
    
    cards.forEach(card => counterObserver.observe(card));
};

window.addEventListener('load', animateCounters);

// ===== Ripple Effect on Buttons =====
const createRipple = (event) => {
    const button = event.currentTarget;
    const ripple = document.createElement('span');
    
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    
    ripple.classList.add('ripple');
    button.appendChild(ripple);
    
    setTimeout(() => ripple.remove(), 600);
};

document.querySelectorAll('.cta-button').forEach(button => {
    button.addEventListener('click', createRipple);
});

// ===== Keyboard Navigation =====
const focusableElements = document.querySelectorAll('a, button, input, textarea');
const firstElement = focusableElements[0];
const lastElement = focusableElements[focusableElements.length - 1];

document.addEventListener('keydown', (event) => {
    if (event.key === 'Tab') {
        if (event.shiftKey) {
            if (document.activeElement === firstElement) {
                lastElement.focus();
                event.preventDefault();
            }
        } else {
            if (document.activeElement === lastElement) {
                firstElement.focus();
                event.preventDefault();
            }
        }
    }
});

// ===== Print Optimization =====
window.addEventListener('beforeprint', () => {
    document.getElementById('canvas3d').style.display = 'none';
});

window.addEventListener('afterprint', () => {
    document.getElementById('canvas3d').style.display = 'block';
});

// ===== Performance Optimization - Lazy Loading =====
if ('IntersectionObserver' in window) {
    const images = document.querySelectorAll('[data-src]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                observer.unobserve(img);
            }
        });
    });
    images.forEach(img => imageObserver.observe(img));
}

// ===== Accessibility - Skip Links =====
const skipLink = document.createElement('a');
skipLink.href = '#main-content';
skipLink.className = 'fixed -top-10 left-0 bg-purple-600 text-white px-4 py-2 focus:top-0 transition-all z-50';
skipLink.textContent = 'Skip to main content';
document.body.insertBefore(skipLink, document.body.firstChild);

// ===== Dark Mode Toggle =====
const themeToggleBtn = document.getElementById('themeToggleBtn');
const themeToggleBtnMobile = document.getElementById('themeToggleBtnMobile');
const themeKey = 'portfolio-theme';

const updateThemeIcon = () => {
    const isLight = document.documentElement.classList.contains('light-mode');
    const icon = isLight ? 'fas fa-sun' : 'fas fa-moon';
    if (themeToggleBtn) themeToggleBtn.innerHTML = `<i class="${icon}"></i>`;
    if (themeToggleBtnMobile) themeToggleBtnMobile.innerHTML = `<i class="${icon}"></i>`;
};

const setTheme = (theme) => {
    if (theme === 'light') {
        document.documentElement.classList.add('light-mode');
    } else {
        document.documentElement.classList.remove('light-mode');
    }
    localStorage.setItem(themeKey, theme);
    updateThemeIcon();
};

const toggleTheme = () => {
    const currentTheme = localStorage.getItem(themeKey) || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    setTheme(currentTheme === 'dark' ? 'light' : 'dark');
};

const storedTheme = localStorage.getItem(themeKey);
if (storedTheme) {
    setTheme(storedTheme);
} else {
    setTheme(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
}

themeToggleBtn?.addEventListener('click', toggleTheme);
themeToggleBtnMobile?.addEventListener('click', toggleTheme);

// ===== Error Handling =====
window.addEventListener('error', (event) => {
    console.error('Error:', event.error);
});

// ===== Console Greeting =====
console.log('%c🎨 Welcome to Sanjay Reddy\'s Portfolio', 'color: #a855f7; font-size: 20px; font-weight: bold;');
console.log('%cBuilt with Three.js, Tailwind CSS, and cutting-edge web technologies', 'color: #ec4899; font-size: 14px;');

// ===== Projects: fetch, render, realtime (SSE) =====
const projectsGrid = document.getElementById('projectsGrid');

// Render projects into grid
function renderProjects(list = []) {
    if (!projectsGrid) return;
    projectsGrid.innerHTML = '';
    list.forEach(p => {
        const card = document.createElement('div');
        card.className = 'bg-slate-800 rounded-xl p-4 border border-purple-500/10 hover:scale-105 transition transform';
        card.innerHTML = `
            <div class="flex items-start justify-between gap-2">
                <div>
                    <h4 class="text-lg font-bold mb-1">${escapeHtml(p.title)}</h4>
                    <p class="text-sm text-gray-300 mb-3">${escapeHtml(p.description || '')}</p>
                    <div class="text-xs text-gray-400">${new Date(p.date).toLocaleDateString()}</div>
                </div>
                <div class="flex-shrink-0">
                    <a href="${encodeURI(p.url)}" target="_blank" rel="noopener noreferrer" class="inline-block px-3 py-2 bg-purple-600 rounded text-sm font-semibold">Open</a>
                </div>
            </div>
        `;
        projectsGrid.appendChild(card);
    });
}

function escapeHtml(text) {
    return String(text || '').replace(/[&"'<>]/g, function (s) {
        return ({'&':'&amp;','"':'&quot;','\'':'&#39;','<':'&lt;','>':'&gt;'})[s];
    });
}

// Fetch initial projects
async function fetchProjects() {
    try {
        const res = await fetch('/api/projects');
        const data = await res.json();
        if (data && data.success) renderProjects(data.projects || []);
    } catch (e) {
        console.warn('Could not load projects:', e.message);
    }
}

// SSE subscription for realtime updates
function subscribeProjectsSSE() {
    if (!window.EventSource) return;
    try {
        const es = new EventSource('/api/projects/stream');
        es.onmessage = (e) => {
            try {
                const payload = JSON.parse(e.data);
                if (payload.projects) renderProjects(payload.projects);
            } catch (err) {
                console.debug('SSE parse error', err.message);
            }
        };
        es.onerror = (err) => {
            console.warn('Projects SSE error', err);
            // leave it — browser will try to reconnect
        };
    } catch (err) {
        console.warn('SSE not available:', err.message);
    }
}

// Initialize projects UI and SSE
document.addEventListener('DOMContentLoaded', () => {
    fetchProjects();
    subscribeProjectsSSE();
});
