// Js/destinos.js - Versión Final con Efecto Hover y Animación

document.addEventListener('DOMContentLoaded', function() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const destinationCards = document.querySelectorAll('[data-category]');
    
    let currentFilter = 'all';

    // 1. Funciones de Estilo (Para manejar el estado Activo/Inactivo sin depender solo de CSS hover)
    
    function setOrangeStyle(btn) {
        btn.style.backgroundColor = '#C65D00'; // Primary Color
        btn.style.color = '#FFFFFF';
        btn.style.borderColor = '#C65D00';
        btn.style.cursor = 'pointer';
        // Añadir una clase de utilidad de animación (opcional si Tailwind ya lo hace)
        // btn.classList.add('shadow-md'); 
    }

    function setWhiteStyle(btn) {
        btn.style.backgroundColor = '#FFFFFF';
        btn.style.color = '#374151'; // Gris oscuro
        btn.style.borderColor = '#E5E7EB'; // Gris claro
    }

    // 2. Inicialización y Event Listeners
    filterButtons.forEach(btn => {
        // Inicialización
        if (btn.dataset.filter === 'all') {
            setOrangeStyle(btn);
        } else {
            setWhiteStyle(btn);
        }

        // --- EVENTO HOVER (Desktop/Tablet) ---
        btn.addEventListener('mouseenter', () => {
            if (btn.dataset.filter !== currentFilter) {
                setOrangeStyle(btn);
            }
        });

        btn.addEventListener('mouseleave', () => {
            if (btn.dataset.filter !== currentFilter) {
                setWhiteStyle(btn);
            }
        });

        // --- EVENTO CLICK (Lógica de Filtrado) ---
        btn.addEventListener('click', () => {
            currentFilter = btn.dataset.filter;

            // 1. Reseteamos visualmente TODOS los botones (para quitar el color activo)
            filterButtons.forEach(b => setWhiteStyle(b));
            
            // 2. Pintamos el clickeado de naranja
            setOrangeStyle(btn);
            
            // 3. Lógica de Filtrado y Animación
            let delay = 0;
            destinationCards.forEach(card => {
                const categories = card.dataset.category;
                
                if (currentFilter === 'all' || categories.includes(currentFilter)) {
                    card.style.display = 'block';
                    // **RESPONSIVE ANIMATION:** Transición suave para las tarjetas que aparecen
                    anime({
                        targets: card,
                        opacity: [0, 1],
                        scale: [0.95, 1],
                        duration: 300,
                        easing: 'easeOutQuad',
                        delay: delay * 50 // Efecto cascada ligero
                    });
                    delay++;
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
});