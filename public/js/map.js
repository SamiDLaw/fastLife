let map;
let sidebar;
let currentMarkers = [];
let markersVisible = true;

async function initMap() {
    // Initialiser la carte en mode sombre
    map = L.map('map', {
        center: [43.2965, 5.3698],
        zoom: 13,
        zoomControl: true,
        zoomAnimation: true,
        markerZoomAnimation: true
    });

    // Ajouter le fond de carte sombre
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: 'OpenStreetMap'
    }).addTo(map);

    // Activer la recherche avec la touche Entrée
    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });

    // Ajouter les écouteurs d'événements
    document.getElementById('search-button').addEventListener('click', performSearch);
    map.on('moveend', debounce(onMapMoveEnd, 500));

    // Charger les données initiales
    await loadData(43.2965, 5.3698);

    sidebar = document.getElementById('sidebar');

    const toggleButton = document.createElement('button');
    toggleButton.innerHTML = 'Afficher/Masquer les points';
    toggleButton.className = 'toggle-markers-btn';
    toggleButton.onclick = toggleMarkers;
    document.querySelector('.map-container').appendChild(toggleButton);

    map.on('zoomend', updateMarkersSize);
}

function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

function toggleMarkers() {
    markersVisible = !markersVisible;
    currentMarkers.forEach(marker => {
        if (markersVisible) {
            marker.addTo(map);
        } else {
            map.removeLayer(marker);
        }
    });
    
    const button = document.querySelector('.toggle-markers-btn');
    button.innerHTML = markersVisible ? 
        'Afficher/Masquer les points' : 
        'Afficher les points';
}

function updateMarkersSize() {
    const zoom = map.getZoom();
    const size = Math.max(20, Math.min(40, zoom * 2));
    
    currentMarkers.forEach(marker => {
        const icon = marker.getIcon();
        icon.options.iconSize = [size, size];
        marker.setIcon(icon);
    });
}

async function loadData(lat, lon) {
    try {
        const response = await fetch(`/api/aggregated-data?lat=${lat}&lon=${lon}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();

        // Nettoyer les marqueurs existants
        clearMarkers();

        // Ajouter les nouveaux marqueurs
        if (data.places && data.places.length > 0) {
            data.places.forEach(place => {
                const marker = addMarker(place);
                if (marker) currentMarkers.push(marker);
            });
        }

        // Ajuster la vue si nécessaire
        if (currentMarkers.length > 0) {
            const group = new L.featureGroup(currentMarkers);
            map.fitBounds(group.getBounds(), { padding: [50, 50] });
        }
    } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        showError('Erreur lors du chargement des données');
    }
}

function addMarker(place) {
    if (!place.latitude || !place.longitude || !place.name) return null;

    const icon = L.divIcon({
        className: 'custom-marker',
        html: `<div class="marker-pin" style="background-color: ${getMarkerColor(place.type)}"></div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 30],
        popupAnchor: [0, -30]
    });

    const marker = L.marker([place.latitude, place.longitude], { icon })
        .bindPopup(createPopupContent(place))
        .on('click', () => showPlaceDetails(place));

    if (markersVisible) {
        marker.addTo(map);
    }

    return marker;
}

function getMarkerColor(type) {
    const colors = {
        restaurant: '#FF9500',
        hotel: '#5856D6',
        tourism: '#34C759',
        default: '#007AFF'
    };
    return colors[type.toLowerCase()] || colors.default;
}

function createPopupContent(place) {
    return `
        <div class="place-popup">
            <h3>${place.name}</h3>
            <p>${place.type || 'Inconnu'}</p>
            ${place.rating ? `<p>Note: ${place.rating}/5</p>` : ''}
            ${place.opening_hours ? `<p>Horaires: ${place.opening_hours}</p>` : ''}
        </div>
    `;
}

function showPlaceDetails(place) {
    const placeDetails = document.getElementById('place-details');
    placeDetails.innerHTML = `
        <h2>${place.name}</h2>
        <p class="place-type">${place.type || 'Inconnu'}</p>
        ${place.rating ? `<p class="place-rating">Note: ${place.rating}/5</p>` : ''}
        ${place.opening_hours ? `<p class="place-hours">Horaires: ${place.opening_hours}</p>` : ''}
        <p class="place-coordinates">Coordonnées: ${place.latitude.toFixed(4)}, ${place.longitude.toFixed(4)}</p>
    `;
    sidebar.classList.add('active');
}

function clearMarkers() {
    currentMarkers.forEach(marker => map.removeLayer(marker));
    currentMarkers = [];
}

async function performSearch() {
    const searchQuery = document.getElementById('search-input').value;
    if (!searchQuery.trim()) return;

    try {
        const response = await fetch(`/api/search?query=${encodeURIComponent(searchQuery)}`);
        if (!response.ok) throw new Error('Erreur réseau');
        const results = await response.json();
        
        if (results.length > 0) {
            const firstResult = results[0];
            map.setView([firstResult.lat, firstResult.lon], 13);
            await loadData(firstResult.lat, firstResult.lon);
        } else {
            showError('Aucun résultat trouvé pour cette recherche');
        }
    } catch (error) {
        console.error('Erreur lors de la recherche:', error);
        showError('Erreur lors de la recherche');
    }
}

function showError(message) {
    const errorElement = document.getElementById('error-message');
    errorElement.textContent = message;
    errorElement.style.display = 'block';
    setTimeout(() => {
        errorElement.style.display = 'none';
    }, 5000);
}

async function onMapMoveEnd() {
    const center = map.getCenter();
    await loadData(center.lat, center.lng);
}

document.addEventListener('DOMContentLoaded', initMap);