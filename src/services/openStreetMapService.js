const axios = require('axios');

class OpenStreetMapService {
    async getPlaces(lat, lon) {
        const overpassUrl = `https://overpass-api.de/api/interpreter?data=[out:json];(node["amenity"="restaurant"](around:1000,${lat},${lon});node["tourism"](around:1000,${lat},${lon}););out;`;
        const response = await axios.get(overpassUrl);
        
        // Transformer et filtrer les résultats
        const places = response.data.elements
            .filter(element => element.tags && element.tags.name) // Filtrer les lieux sans nom
            .map(element => ({
                name: element.tags.name,
                type: element.tags.amenity || element.tags.tourism || 'Inconnu',
                latitude: element.lat,
                longitude: element.lon,
                rating: element.tags.rating || null,
                cuisine: element.tags.cuisine || null,
                opening_hours: element.tags.opening_hours || null
            }))
            .sort((a, b) => {
                // Trier par type et présence d'informations supplémentaires
                const scoreA = this._calculateRelevanceScore(a);
                const scoreB = this._calculateRelevanceScore(b);
                return scoreB - scoreA;
            })
            .slice(0, 10); // Limiter à 10 résultats

        return places;
    }

    _calculateRelevanceScore(place) {
        let score = 0;
        if (place.rating) score += 3;
        if (place.cuisine) score += 2;
        if (place.opening_hours) score += 1;
        if (place.type === 'restaurant') score += 2; // Favoriser les restaurants
        if (place.type === 'hotel') score += 2; // Favoriser les hôtels
        return score;
    }

    async getAggregatedData(lat, lon) {
        const places = await this.getPlaces(lat, lon);
        return { places };
    }

    async searchLocations(query) {
        const searchUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=10`;
        const response = await axios.get(searchUrl);
        return response.data;
    }
}

module.exports = new OpenStreetMapService();
