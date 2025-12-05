// Js/contacto.js - Final Sincronizado

document.addEventListener('DOMContentLoaded', function() {
    
    // 1. Inicializar Mapa de Oficina (Trujillo)
    initContactMap();
    
    // 2. Animación de entrada para Tarjetas de Creadores
    animateCreators();
    
    // 3. Lógica de Acordeón (FAQ)
    // Se mantiene como una función global debido al onclick en el HTML.
    window.toggleAccordion = function(header) {
        const content = header.nextElementSibling;
        const icon = header.querySelector('.accordion-icon');
        
        // Cerrar otros acordeones abiertos usando la propiedad maxHeight
        document.querySelectorAll('.accordion-content').forEach(c => {
            if (c !== content && c.style.maxHeight) {
                c.style.maxHeight = null;
                c.previousElementSibling.querySelector('.accordion-icon').textContent = '+';
            }
        });

        // Toggle actual
        if (content.style.maxHeight) {
            content.style.maxHeight = null; // Cerrar
            icon.textContent = '+';
        } else {
            // Abrir, ajustando la altura del contenido
            content.style.maxHeight = content.scrollHeight + "px";
            icon.textContent = '−';
        }
    };
    
    // 4. Envío del Formulario (Simulado con Notificaciones)
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const btn = contactForm.querySelector('button[type="submit"]');
            const originalText = btn.innerText;
            
            // Estado de carga visual
            btn.innerText = 'Enviando...';
            btn.disabled = true;
            btn.classList.add('opacity-75', 'cursor-not-allowed');

            setTimeout(() => {
                // Usar sistema de notificaciones global (de main.js)
                if (window.LEAC && window.LEAC.showNotification) {
                    window.LEAC.showNotification('¡Mensaje enviado con éxito! Te contactaremos pronto.', 'success');
                } else {
                    alert('¡Mensaje enviado con éxito!'); // Fallback simple
                }

                // Restablecer formulario
                contactForm.reset();
                btn.innerText = originalText;
                btn.disabled = false;
                btn.classList.remove('opacity-75', 'cursor-not-allowed');
            }, 1500);
        });
    }
    
    // ------------------------------------------------------------------
    // Funciones Adicionales (Sincronización de Contenido)
    // ------------------------------------------------------------------

    function initContactMap() {
        const mapContainer = document.getElementById('contactMap');
        if (!mapContainer) return;

        // Coordenadas Trujillo, Perú (Referencia Av Larco)
        const lat = -8.11599; 
        const lng = -79.02998;

        // Inicializar mapa y centrar en las coordenadas
        const map = L.map('contactMap').setView([lat, lng], 15);

        // Capa de tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);

        // Marcador de la oficina
        L.marker([lat, lng]).addTo(map)
            .bindPopup('<div style="text-align:center;"><b style="color:#C65D00">Oficina Principal LEAC</b><br>Av. Larco 1234, Trujillo</div>')
            .openPopup();
    }

    function animateCreators() {
        // Animación de entrada para las tarjetas de los fundadores
        anime({
            targets: '.creador-card',
            translateY: [50, 0],
            opacity: [0, 1],
            delay: anime.stagger(150),
            duration: 800,
            easing: 'easeOutQuad'
        });
    }
});