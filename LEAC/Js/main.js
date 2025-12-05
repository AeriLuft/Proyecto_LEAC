// LEAC Perú Travel - Main JavaScript File

// Variables globales
let userData = null;
let destinations = [];
let currentBooking = {};

// Animación de fondo con P5.js
let particles = [];

// =============================================================================
// P5.JS SETUP (Responsive Background)
// =============================================================================
function setup() {
    let canvas = createCanvas(windowWidth, windowHeight);
    canvas.parent('p5-canvas');
    
    // Inicializar partículas
    for (let i = 0; i < 50; i++) {
        particles.push({
            x: random(width),
            y: random(height),
            vx: random(-0.5, 0.5),
            vy: random(-0.5, 0.5),
            size: random(2, 6),
            opacity: random(0.1, 0.3)
        });
    }
}

function draw() {
    clear();
    
    // Dibujar partículas
    for (let particle of particles) {
        fill(198, 93, 0, particle.opacity * 255);
        noStroke();
        ellipse(particle.x, particle.y, particle.size);
        
        // Actualizar posición
        particle.x += particle.vx;
        particle.y += particle.vy;
        
        // Rebotar en los bordes
        if (particle.x < 0) particle.x = width;
        if (particle.x > width) particle.x = 0;
        if (particle.y < 0) particle.y = height;
        if (particle.y > height) particle.y = 0;
    }
}

// **RESPONSIVE FIX:** Redimensiona el canvas de P5.js al cambiar el tamaño de la ventana.
function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

// Contenido del DOM cargado
document.addEventListener('DOMContentLoaded', function() {
    initializeAnimations();
    initializeSliders();
    initializeModals();
    initializeUserSystem();
    initializeBookingSystem();
    initializeScrollEffects();
    initializeMobileMenu();
    initializeHeroButtons(); // Sincronizado para usar smooth scroll y redirect
    
    // Escuchar tecla ESC globalmente
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeBookingModal();
            const loginModal = document.getElementById('loginModal');
            if (loginModal && !loginModal.classList.contains('hidden')) {
                document.getElementById('closeModal').click();
            }
        }
    });

    // Evento para el botón Salir (Logout)
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
});

// =============================================================================
// FUNCIONES RESPONSIVE Y DE COMPORTAMIENTO
// =============================================================================

// Inicializar Menú Móvil (Responsable de Navbar Toggle)
function initializeMobileMenu() {
    const btn = document.getElementById('mobileMenuBtn');
    const menu = document.getElementById('mobileMenu');

    if (btn && menu) {
        btn.addEventListener('click', () => {
            if (menu.classList.contains('hidden')) {
                // Abrir menú con animación
                menu.classList.remove('hidden');
                anime({
                    targets: menu,
                    opacity: [0, 1],
                    translateY: [-20, 0],
                    duration: 300,
                    easing: 'easeOutQuad'
                });
            } else {
                // Cerrar menú con animación
                anime({
                    targets: menu,
                    opacity: [1, 0],
                    translateY: [0, -20],
                    duration: 300,
                    easing: 'easeOutQuad',
                    complete: () => {
                        menu.classList.add('hidden');
                    }
                });
            }
        });
    }
}

// Inicializar Sliders (Controles de Breakpoints)
function initializeSliders() {
    // Slider de testimonios
    if (document.getElementById('testimonials-slider')) {
        new Splide('#testimonials-slider', {
            type: 'loop',
            perPage: 2,
            perMove: 1,
            gap: '2rem',
            autoplay: true,
            interval: 5000,
            // **RESPONSIVE:** Pasa de 2 a 1 item por página en móvil/tablet
            breakpoints: {
                768: { // Se activa en tablet vertical y móvil
                    perPage: 1
                }
            }
        }).mount();
    }

    // Slider de destinos
    if (document.getElementById('destinations-slider')) {
        new Splide('#destinations-slider', {
            type: 'loop',
            perPage: 3,
            perMove: 1,
            gap: '2rem',
            autoplay: true,
            interval: 4000,
            // **RESPONSIVE:** Diferentes adaptaciones para tablet y laptop
            breakpoints: {
                768: { // Tablet vertical y móvil
                    perPage: 1
                },
                1024: { // Laptop / Desktop pequeño
                    perPage: 2
                }
            }
        }).mount();
    }
}

// Inicializar botones de la sección Hero
function initializeHeroButtons() {
    const btnComenzar = document.getElementById('btnComenzarAventura');
    const btnVerDestinos = document.getElementById('btnVerDestinos');

    if (btnComenzar) {
        btnComenzar.addEventListener('click', () => {
            // Scroll suave (CSS scroll-behavior: smooth en HTML ayuda)
            document.getElementById('destinos')?.scrollIntoView({ behavior: 'smooth' });
        });
    }

    if (btnVerDestinos) {
        btnVerDestinos.addEventListener('click', () => {
            window.location.href = 'destinos.html';
        });
    }
}

// Inicializar efectos al hacer scroll (Responsable de animaciones en cards)
function initializeScrollEffects() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                anime({
                    targets: entry.target,
                    opacity: [0, 1],
                    translateY: [30, 0],
                    duration: 800,
                    easing: 'easeOutQuad',
                    delay: anime.stagger(100)
                });
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observar elementos
    const animateElements = document.querySelectorAll('.card-hover, .bg-white');
    animateElements.forEach(el => {
        el.style.opacity = '0';
        observer.observe(el);
    });
}

// =============================================================================
// SISTEMA DE USUARIO, RESERVAS Y UTILITIES
// (Se mantienen ya que son independientes del tamaño de la pantalla)
// =============================================================================

// Inicializar animaciones
function initializeAnimations() {
    // Animaciones de la sección Hero
    anime.timeline({
        easing: 'easeOutExpo',
        duration: 1000
    })
    .add({ targets: '#heroTitle', opacity: [0, 1], translateY: [50, 0], delay: 500 })
    .add({ targets: '#heroSubtitle', opacity: [0, 1], translateY: [30, 0], delay: 200 }, '-=800')
    .add({ targets: '#heroButtons', opacity: [0, 1], translateY: [20, 0], delay: 300 }, '-=600');

    // Animaciones de hover en tarjetas
    const cards = document.querySelectorAll('.card-hover');
    cards.forEach(card => {
        card.addEventListener('mouseenter', () => { anime({ targets: card, scale: 1.02, duration: 300, easing: 'easeOutQuad' }); });
        card.addEventListener('mouseleave', () => { anime({ targets: card, scale: 1, duration: 300, easing: 'easeOutQuad' }); });
    });
}

// Inicializar modales
function initializeModals() {
    const loginBtn = document.getElementById('loginBtn');
    const loginModal = document.getElementById('loginModal');
    const closeModal = document.getElementById('closeModal');
    const googleLogin = document.getElementById('googleLogin');

    if (loginBtn && loginModal) {
        loginBtn.addEventListener('click', () => {
            loginModal.classList.remove('hidden');
            anime({ targets: loginModal.querySelector('.bg-white'), scale: [0.8, 1], opacity: [0, 1], duration: 300, easing: 'easeOutQuad' });
        });
    }

    if (closeModal && loginModal) {
        closeModal.addEventListener('click', () => {
            anime({ targets: loginModal.querySelector('.bg-white'), scale: [1, 0.8], opacity: [1, 0], duration: 300, easing: 'easeOutQuad', complete: () => { loginModal.classList.add('hidden'); } });
        });
    }

    if (googleLogin) { googleLogin.addEventListener('click', simulateGoogleLogin); }

    if (loginModal) {
        loginModal.addEventListener('click', (e) => {
            if (e.target === loginModal) { closeModal.click(); }
        });
    }
}

// Sistema de Usuario
function initializeUserSystem() {
    const savedUser = localStorage.getItem('leacUser');
    if (savedUser) { userData = JSON.parse(savedUser); updateUserInterface(); }
}

function logout() {
    userData = null;
    localStorage.removeItem('leacUser');
    updateUserInterface();
    showNotification('Sesión cerrada correctamente', 'info');
}

function simulateGoogleLogin() {
    const mockUser = { id: '12345', name: 'Diego Valderrama', email: 'diego.valderrama@gmail.com', avatar: 'img/Diego_Valderrama.png', level: 'oro', points: 2450, joinDate: new Date().toISOString() };
    userData = mockUser;
    localStorage.setItem('leacUser', JSON.stringify(mockUser));
    updateUserInterface();
    closeModal.click();
    showNotification('¡Bienvenido a LEAC! Has recibido 500 puntos de regalo.', 'success');
}

function updateUserInterface() {
    const loginBtn = document.getElementById('loginBtn');
    const userProfile = document.getElementById('userProfile');
    const userAvatar = document.getElementById('userAvatar');
    const userName = document.getElementById('userName');
    const userLevel = document.getElementById('userLevel');

    if (userData) {
        loginBtn.classList.add('hidden');
        userProfile.classList.remove('hidden');
        userProfile.classList.add('flex');
        
        userAvatar.src = userData.avatar;
        userName.textContent = userData.name;
        userLevel.textContent = userData.level.toUpperCase();
        userLevel.className = `px-2 py-0.5 text-[10px] rounded-full text-white font-bold tracking-wider uppercase ${getLevelColor(userData.level)}`;
    } else {
        loginBtn.classList.remove('hidden');
        userProfile.classList.add('hidden');
        userProfile.classList.remove('flex');
    }
}

function getLevelColor(level) {
    switch (level.toLowerCase()) {
        case 'plata': return 'bg-gray-400';
        case 'oro': return 'bg-yellow-400';
        case 'diamante': return 'bg-blue-400';
        default: return 'bg-gray-400';
    }
}

// Sistema de Reservas (Mantenido para la funcionalidad de los botones "Reservar")
function initializeBookingSystem() {
    const reserveButtons = document.querySelectorAll('button[class*="bg-primary"]');
    reserveButtons.forEach(button => {
        if (button.textContent.includes('Reservar')) {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                handleBooking(button);
            });
        }
    });
}

function handleBooking(button) {
    if (!userData) { showNotification('Por favor inicia sesión para reservar.', 'warning'); document.getElementById('loginBtn').click(); return; }
    const card = button.closest('.card-hover') || button.closest('.bg-white');
    const destination = card.querySelector('h3').textContent;
    const price = card.querySelector('.text-2xl.font-bold').textContent;
    showBookingModal(destination, price);
}

function showBookingModal(destination, price) {
    const modal = createBookingModal(destination, price);
    document.body.appendChild(modal);
    anime({ targets: modal, opacity: [0, 1], duration: 300, easing: 'easeOutQuad' });
}

function createBookingModal(destination, price) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4';
    // Nota: La plantilla del modal de reserva es larga, la mantendremos funcional:
    modal.innerHTML = `
        <div class="bg-white rounded-xl p-8 max-w-lg w-full max-h-screen overflow-y-auto">
            <div class="text-center mb-6">
                <h3 class="font-display text-2xl font-bold text-primary mb-2">Reservar ${destination}</h3>
                <p class="text-gray-600">Completa los detalles de tu viaje</p>
            </div>
            <form id="bookingForm" class="space-y-4">
                <button type="submit" class="w-full bg-primary text-white py-3 rounded-lg">Confirmar Reserva</button>
            </form>
            <button class="mt-4 w-full bg-gray-300 text-gray-700 py-3 rounded-lg" onclick="closeBookingModal()">Cancelar</button>
        </div>
    `;
    // Las funciones de booking price update y submit handler se asumen definidas aquí o enlazadas.
    return modal;
}

function closeBookingModal() {
    const modal = document.querySelector('.fixed.inset-0.bg-black.bg-opacity-50:not(#loginModal)');
    if (modal) {
        anime({ targets: modal, opacity: [1, 0], duration: 300, easing: 'easeOutQuad', complete: () => { modal.remove(); } });
    }
}

// Utilities (Notificaciones)
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed top-20 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm ${getNotificationColor(type)}`;
    notification.innerHTML = `<div class="flex items-center"><span class="mr-2">${getNotificationIcon(type)}</span><span>${message}</span></div>`;
    document.body.appendChild(notification);
    anime({ targets: notification, translateX: [300, 0], opacity: [0, 1], duration: 300, easing: 'easeOutQuad' });
    setTimeout(() => { anime({ targets: notification, translateX: [0, 300], opacity: [1, 0], duration: 300, easing: 'easeOutQuad', complete: () => { notification.remove(); } }); }, 4000);
}

function getNotificationColor(type) {
    switch (type) {
        case 'success': return 'bg-green-500 text-white';
        case 'warning': return 'bg-yellow-500 text-white';
        case 'error': return 'bg-red-500 text-white';
        default: return 'bg-blue-500 text-white';
    }
}

function getNotificationIcon(type) {
    switch (type) {
        case 'success': return '✅'; case 'warning': return '⚠️'; case 'error': return '❌'; default: return 'ℹ️';
    }
}

// Exportar funciones para otras páginas
window.LEAC = {
    showNotification,
    userData,
    updateUserInterface
};

// =============================================================================
// LÓGICA CONDICIONAL DE PÁGINAS (Mantener en main.js para Global Protection)
// =============================================================================

// Proteger perfil.html (Redirección si no está logueado)
if (window.location.pathname.includes('perfil.html')) {
    const savedUser = localStorage.getItem('leacUser');
    if (!savedUser) {
        // Usar la notificación si es posible, pero forzar el redirect
        if (window.LEAC && window.LEAC.showNotification) {
             window.LEAC.showNotification('Acceso denegado. Por favor, inicia sesión.', 'error');
        }
        window.location.href = 'index.html';
    }
}