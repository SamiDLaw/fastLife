let map;
let sidebar;
let currentMarkers = [];
let markersVisible = true;
let isLoading = false;
let activeFilter = 'all';

async function initMap() {
    try {
        // Charger les données avant d'initialiser la carte
        const response = await fetch('/api/aggregated-data?lat=43.2965&lon=5.3698');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (!data || !data.places || data.places.length === 0) {
            console.warn('No places data available for rendering.');
            document.getElementById('error-message').textContent = 'Aucun lieu disponible à afficher.';
            document.getElementById('error-message').style.display = 'block';
            return;
        }
        window.places = data.places;

        // Initialiser la carte
        map = L.map('map', {
            center: [43.2965, 5.3698],
            zoom: 13,
            zoomControl: true,
            zoomAnimation: true,
            markerZoomAnimation: true
        });

        // Ajouter le fond de carte
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

        // Initialiser la sidebar
        sidebar = document.getElementById('sidebar');
        if (!sidebar) {
            sidebar = document.createElement('div');
            sidebar.id = 'sidebar';
            sidebar.className = 'sidebar';
            document.body.appendChild(sidebar);
        }

        // Ajouter les boutons de contrôle
        const controlsContainer = document.createElement('div');
        controlsContainer.className = 'map-controls';
        
        // Bouton pour charger les marqueurs
        const loadMarkersButton = document.createElement('button');
        loadMarkersButton.className = 'control-button load-markers';
        loadMarkersButton.innerHTML = `
            <i class="fas fa-map-marker-alt"></i>
            <span>Charger les lieux</span>
        `;
        loadMarkersButton.onclick = loadMarkersInView;
        
        // Bouton pour afficher/masquer les marqueurs
        const toggleButton = document.createElement('button');
        toggleButton.className = 'control-button toggle-markers';
        toggleButton.innerHTML = `
            <i class="fas fa-eye"></i>
            <span>Afficher/Masquer</span>
        `;
        toggleButton.onclick = toggleMarkers;

        controlsContainer.appendChild(loadMarkersButton);
        controlsContainer.appendChild(toggleButton);
        document.querySelector('.map-wrapper').appendChild(controlsContainer);

        // Charger les données initiales
        await loadData(43.2965, 5.3698);

        // Gestionnaire d'événements pour les filtres
        document.querySelectorAll('.filter-button').forEach(button => {
            button.addEventListener('click', () => {
                document.querySelectorAll('.filter-button').forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                activeFilter = button.dataset.type;
                filterMarkers();
            });
        });

    } catch (error) {
        console.error('Error initializing map:', error);
        showError('Erreur lors du chargement de la carte');
    }
}

async function loadMarkersInView() {
    if (isLoading) return;
    
    try {
        isLoading = true;
        const button = document.querySelector('.load-markers');
        button.disabled = true;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Chargement...';

        const bounds = map.getBounds();
        const center = bounds.getCenter();
        await loadData(center.lat, center.lng);

        button.disabled = false;
        button.innerHTML = '<i class="fas fa-map-marker-alt"></i> Charger les lieux';
    } catch (error) {
        console.error('Error loading markers:', error);
        showError('Erreur lors du chargement des lieux');
    } finally {
        isLoading = false;
    }
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
    
    const button = document.querySelector('.toggle-markers');
    button.innerHTML = markersVisible ? 
        '<i class="fas fa-eye"></i> <span>Afficher/Masquer</span>' : 
        '<i class="fas fa-eye-slash"></i> <span>Afficher/Masquer</span>';
}

function updateMarkersSize() {
    if (!markersVisible) return;
    
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
        clearMarkers();
        
        const response = await fetch(`/api/aggregated-data?lat=${lat}&lon=${lon}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        if (!data || !data.places || data.places.length === 0) {
            showError('Aucun lieu trouvé dans cette zone');
            return;
        }

        data.places.forEach(place => {
            const marker = addMarker(place);
            currentMarkers.push(marker);
        });

        updateMarkersSize();
        filterMarkers();
    } catch (error) {
        console.error('Error loading data:', error);
        showError('Erreur lors du chargement des données');
    }
}

function addMarker(place) {
    const marker = L.marker([place.latitude, place.longitude], {
        icon: L.divIcon({
            className: `custom-marker marker-${place.type}`,
            html: `<i class="${getMarkerIcon(place.type)}"></i>`,
            iconSize: [30, 30],
            iconAnchor: [15, 30],
            popupAnchor: [0, -30]
        })
    })
    .bindPopup(createPopupContent(place))
    .on('click', () => showPlaceDetails(place));

    if (markersVisible) {
        marker.addTo(map);
    }

    marker.itemType = place.type;
    
    return marker;
}

function getMarkerIcon(type) {
    const icons = {
        restaurant: 'fas fa-utensils',
        hotel: 'fas fa-bed',
        cultural: 'fas fa-landmark',
        nature: 'fas fa-tree',
        sport: 'fas fa-running',
        entertainment: 'fas fa-ticket-alt',
        other: 'fas fa-map-marker-alt'
    };

    return icons[type] || icons.other;
}

function createPopupContent(place) {
    const rating = place.rating ? `<div class="rating">★ ${place.rating.toFixed(1)}/5</div>` : '';
    const address = place.address ? `<div class="address">${place.address}</div>` : '';
    const description = place.description ? `<div class="description">${place.description}</div>` : '';
    
    return `
        <div class="popup-content">
            <h3>${place.name}</h3>
            <div class="type">${formatType(place.type)}</div>
            ${rating}
            ${address}
            ${description}
        </div>
    `;
}

function formatType(type) {
    const types = {
        restaurant: 'Restaurant',
        hotel: 'Hôtel',
        cultural: 'Culture',
        nature: 'Nature',
        sport: 'Sport',
        entertainment: 'Loisirs',
        other: 'Autre'
    };
    return types[type] || 'Autre';
}

function filterMarkers() {
    currentMarkers.forEach(marker => {
        if (activeFilter === 'all' || marker.itemType === activeFilter) {
            marker.getElement().style.display = '';
        } else {
            marker.getElement().style.display = 'none';
        }
    });
}

async function performSearch() {
    const searchInput = document.getElementById('search-input');
    const searchTerm = searchInput.value.trim().toLowerCase();
    
    if (!searchTerm) {
        filterMarkers();
        return;
    }

    currentMarkers.forEach(marker => {
        const popupContent = marker.getPopup().getContent().toLowerCase();
        if (popupContent.includes(searchTerm) && 
            (activeFilter === 'all' || marker.itemType === activeFilter)) {
            marker.getElement().style.display = '';
        } else {
            marker.getElement().style.display = 'none';
        }
    });
}

function clearMarkers() {
    currentMarkers.forEach(marker => marker.remove());
    currentMarkers = [];
}

function showError(message) {
    const errorDiv = document.getElementById('error-message');
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
        setTimeout(() => {
            errorDiv.style.display = 'none';
        }, 3000);
    }
}

function showPlaceDetails(place) {
    if (!sidebar) {
        sidebar = document.createElement('div');
        sidebar.id = 'sidebar';
        sidebar.className = 'sidebar';
        document.body.appendChild(sidebar);
    }

    const content = `
        <div class="sidebar-header">
            <button class="close-sidebar" onclick="document.getElementById('sidebar').classList.remove('active')">&times;</button>
        </div>
        <div class="sidebar-content">
            <div class="place-info">
                <h2>${place.name}</h2>
                <p class="place-type">${formatType(place.type)}</p>
                ${place.rating ? `<p class="place-rating">Note: ${place.rating}/5</p>` : ''}
                ${place.address ? `<p class="place-address">${place.address}</p>` : ''}
                ${place.description ? `<p class="place-description">${place.description}</p>` : ''}
                <p class="place-coordinates">Coordonnées: ${place.latitude.toFixed(4)}, ${place.longitude.toFixed(4)}</p>
            </div>
        </div>
    `;

    sidebar.innerHTML = content;
    sidebar.classList.add('active');
}

// Initialisation
document.addEventListener('DOMContentLoaded', initMap);