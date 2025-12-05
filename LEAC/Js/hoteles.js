// Js/hoteles.js - FINAL CORREGIDO (Manejo Coherente de Markers)

let map;
let markers = {}; // Almacena todos los marcadores por nombre
let markersLayerGroup; // Capa para sostener solo los marcadores visibles

document.addEventListener('DOMContentLoaded', function() {
    
    // 1. Inicializar Mapa (Leaflet)
    initMap();

    // 2. Lógica de Filtrado 
    const applyFiltersBtn = document.getElementById('applyFilters');
    if(applyFiltersBtn){
        // El filtro ahora se llama sin argumentos, pero pasará 'true' en la carga inicial
        applyFiltersBtn.addEventListener('click', () => filterHotels(false)); 
    }
    
    // Animación inicial de las tarjetas
    animateCards();
});

// Datos simulados (debe coincidir con data-name en HTML)
const hotelsData = [
    { name: "Hotel Machu Picchu Sanctuary", lat: -13.1631, lng: -72.5450, price: "$189" },
    { name: "Casa Andina Premium Cusco", lat: -13.5170, lng: -71.9785, price: "$179" },
    { name: "Tierra Viva Valle Sagrado", lat: -13.3250, lng: -72.1136, price: "$159" },
    { name: "Sonesta Hotel Lima", lat: -12.1264, lng: -77.0298, price: "$99" },
    { name: "Jose Antonio Cusco", lat: -13.5160, lng: -71.9783, price: "$79" },
    { name: "Amazon EcoLodge Iquitos", lat: -3.7480, lng: -73.2490, price: "$149" },
    { name: "Casa Colonial Arequipa", lat: -16.3988, lng: -71.5350, price: "$119" },
    { name: "Paracas Luxury Resort", lat: -13.8690, lng: -76.2546, price: "$219" },
    { name: "Hotel Nazca Lines", lat: -14.8315, lng: -74.9405, price: "$230" },
    { name: "Huaraz Mountain Lodge", lat: -9.5261, lng: -77.5288, price: "$99" },
    { name: "Casa Boutique Trujillo", lat: -8.1120, lng: -79.0280, price: "$139" },
    { name: "Hotel Terraces Puno", lat: -15.8402, lng: -70.0219, price: "$109" }
];


function initMap() {
    map = L.map('map').setView([-9.189967, -75.015152], 5); // Centro de Perú
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap contributors' }).addTo(map);

    markersLayerGroup = L.layerGroup().addTo(map); // Inicializamos la capa de marcadores visibles

    hotelsData.forEach(hotel => {
        const marker = L.marker([hotel.lat, hotel.lng]);
        marker.bindPopup(`
            <div class="text-center">
                <h3 class="font-bold text-primary">${hotel.name}</h3>
                <p class="text-gray-600">Precio: ${hotel.price}/noche</p>
            </div>
        `);
        // Guardamos todos los marcadores en el objeto global 'markers'
        markers[hotel.name] = marker; 
    });
    
    // EJECUTAMOS EL FILTRO EN LA CARGA INICIAL para mostrar todos los puntos y ajustar el zoom
    filterHotels(true); 
}

/**
 * @param {boolean} initialLoad - Si es true, ajusta el zoom incluso si solo hay 1 marcador.
 */
function filterHotels(initialLoad = false) {
    // Obtener valores de los filtros
    const categoryVal = document.getElementById('categoryFilter').value;
    const priceRangeVal = document.getElementById('priceFilter').value;
    const amenityVal = document.getElementById('amenitiesFilter').value; 
    const ratingVal = document.getElementById('ratingFilter').value;

    const hotelCards = document.querySelectorAll('.card-hover');
    let visibleCount = 0;
    let visibleMarkers = [];

    // Limpiar capa de marcadores antes de redibujar
    markersLayerGroup.clearLayers(); 

    hotelCards.forEach(card => {
        let show = true;
        
        // [A, B, C, D Filter Logic - Lógica de visibilidad de tarjeta (Mantenida)]
        
        // Filtro Categoría
        if (categoryVal !== 'all' && card.dataset.category !== categoryVal) show = false;
        
        // Filtro Precio
        if (priceRangeVal !== 'all' && show) {
            const cardPrice = parseInt(card.dataset.price);
            if (priceRangeVal === '0-50' && cardPrice > 50) show = false;
            else if (priceRangeVal === '50-100' && (cardPrice <= 50 || cardPrice > 100)) show = false;
            else if (priceRangeVal === '100-200' && (cardPrice <= 100 || cardPrice > 200)) show = false;
            else if (priceRangeVal === '200+' && cardPrice <= 200) show = false;
        }

        // Filtro Servicios (Amenities)
        if (amenityVal !== 'all' && show) {
            const cardAmenities = card.dataset.amenities || ""; 
            if (!cardAmenities.includes(amenityVal)) show = false;
        }

        // Filtro Valoración
        if (ratingVal !== 'all' && show) {
            const cardRating = parseFloat(card.dataset.rating);
            if (cardRating < parseFloat(ratingVal)) show = false;
        }

        // Aplicar visibilidad y gestionar marcadores
        if (show) {
            // Mostrar tarjeta
            card.style.display = 'block';
            anime({ targets: card, opacity: [0, 1], translateY: [20, 0], duration: 400, easing: 'easeOutQuad', delay: visibleCount * 50 });
            
            // Añadir marcador a la capa visible
            const hotelName = card.querySelector('h3').textContent;
            const marker = markers[hotelName];
            if (marker) {
                markersLayerGroup.addLayer(marker); 
                visibleMarkers.push(marker);
            }
            
            visibleCount++;
        } else {
            // Ocultar tarjeta
            card.style.display = 'none';
        }
    });

    // 3. Ajustar Map Bounds (Responsive Zoom)
    if (visibleMarkers.length > 0) {
        const bounds = L.featureGroup(visibleMarkers).getBounds();
        
        if (visibleMarkers.length > 1 || initialLoad) { 
             // Ajustar límites si hay más de un marcador o es la carga inicial
             map.fitBounds(bounds, { padding: [50, 50] });
        } else if (visibleMarkers.length === 1) {
             // Si solo hay uno, volar a un zoom fijo (14)
             map.flyTo(bounds.getCenter(), 14, { duration: 0.5 });
        }
    } else {
        // Si no hay hoteles, volver a centrar en Perú
        map.setView([-9.189967, -75.015152], 5);
    }

    if (visibleCount === 0) { console.log("No se encontraron hoteles con esos criterios."); }
}


// Función Zoom al hacer click en "Ver Detalles"
window.verDetallesEnMapa = function(hotelName) {
    const marker = markers[hotelName];
    
    if (marker) {
        document.getElementById('map').scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        setTimeout(() => {
            map.flyTo(marker.getLatLng(), 14, { duration: 1.5 });
            marker.openPopup();
        }, 800);
    } else {
        alert("Ubicación no disponible en el mapa.");
    }
};

// Animación inicial de tarjetas
function animateCards() {
    anime({ targets: '.card-hover', opacity: [0, 1], translateY: [20, 0], duration: 800, delay: anime.stagger(100), easing: 'easeOutQuad' });
}