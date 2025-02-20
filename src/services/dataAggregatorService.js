const fetch = require('node-fetch');
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 600 }); // Cache de 10 minutes

// Fonction pour récupérer les données depuis OpenStreetMap Overpass API
async function getPlacesFromOSM(lat, lon, type) {
    const cacheKey = `osm_${lat}_${lon}_${type}`;
    const cachedData = cache.get(cacheKey);
    if (cachedData) return cachedData;

    const query = `
    [out:json];
    (
        node["${type}"](around:5000,${lat},${lon});
        way["${type}"](around:5000,${lat},${lon});
        relation["${type}"](around:5000,${lat},${lon});
    );
    out body;
    `;

    try {
        const response = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        const places = data.elements.map(element => ({
            name: element.tags.name || 'Inconnu',
            type,
            latitude: element.lat || (element.center && element.center.lat),
            longitude: element.lon || (element.center && element.center.lon)
        })).filter(place => place.latitude && place.longitude); // Filtrer les éléments sans coordonnées

        cache.set(cacheKey, places);
        return places;
    } catch (error) {
        console.error(`Erreur lors de la récupération des données OSM pour ${type}:`, error);
        throw error;
    }
}

// Fonction pour récupérer les événements depuis PredictHQ
async function getEventsFromPredictHQ(lat, lon) {
    const apiKey = process.env.PREDICTHQ_API_KEY;
    if (!apiKey) throw new Error('Clé API PredictHQ non définie');

    const url = `https://api.predicthq.com/v1/events/?within=50km@${lat},${lon}`;
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${apiKey}`
            }
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        return data.results.map(event => ({
            name: event.title,
            type: 'EVENT',
            latitude: event.location[1], // PredictHQ utilise [lon, lat]
            longitude: event.location[0],
            date: event.start
        }));
    } catch (error) {
        console.error('Erreur lors de la récupération des événements PredictHQ:', error);
        throw error;
    }
}

// Fonction principale pour agréger les données
async function getAggregatedData(lat, lon) {
    const cacheKey = `aggregated_data_${lat}_${lon}`;
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
        return cachedData;
    }

    try {
        const [hotels, restaurants, activities, events] = await Promise.all([
            getPlacesFromOSM(lat, lon, 'tourism=hotel'),
            getPlacesFromOSM(lat, lon, 'amenity=restaurant'),
            getPlacesFromOSM(lat, lon, 'tourism=attraction'),
            getEventsFromPredictHQ(lat, lon)
        ]);

        const aggregatedData = {
            places: [...hotels, ...restaurants, ...activities],
            events
        };
        cache.set(cacheKey, aggregatedData);
        return aggregatedData;
    } catch (error) {
        console.error('Erreur lors de l\'agrégation des données:', error);
        throw error;
    }
}

module.exports = {
    getAggregatedData
};