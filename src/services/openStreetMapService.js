const axios = require('axios');

class OpenStreetMapService {
    async getPlaces(lat, lon) {
        const overpassUrl = `https://overpass-api.de/api/interpreter?data=[out:json];(
            node["amenity"="restaurant"](around:1000,${lat},${lon});
            node["tourism"="hotel"](around:1000,${lat},${lon});
            node["leisure"](around:1000,${lat},${lon});
            node["sport"](around:1000,${lat},${lon});
            node["tourism"~"museum|attraction|viewpoint"](around:1000,${lat},${lon});
        );out;`;
        
        const response = await axios.get(overpassUrl);
        
        // Transformer et filtrer les résultats
        const places = response.data.elements
            .filter(element => element.tags && element.tags.name)
            .map(element => ({
                name: element.tags.name,
                type: this._getPlaceType(element.tags),
                latitude: element.lat,
                longitude: element.lon,
                rating: element.tags.rating || null,
                cuisine: element.tags.cuisine || null,
                opening_hours: element.tags.opening_hours || null,
                description: element.tags.description || null,
                website: element.tags.website || null,
                phone: element.tags.phone || element.tags['contact:phone'] || null
            }))
            .sort((a, b) => {
                const scoreA = this._calculateRelevanceScore(a);
                const scoreB = this._calculateRelevanceScore(b);
                return scoreB - scoreA;
            })
            .slice(0, 20); // Augmenté à 20 résultats vu qu'on a plus de types

        return places;
    }

    _getPlaceType(tags) {
        if (tags.amenity === 'restaurant') return 'restaurant';
        if (tags.tourism === 'hotel') return 'hotel';
        if (tags.tourism === 'museum') return 'museum';
        if (tags.tourism === 'attraction') return 'attraction';
        if (tags.tourism === 'viewpoint') return 'viewpoint';
        if (tags.leisure) return `activity-${tags.leisure}`;
        if (tags.sport) return `sport-${tags.sport}`;
        return 'other';
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
        try {
            const places = await this.getPlaces(lat, lon);
            return { places };
        } catch (error) {
            console.error('Erreur lors de la récupération des données agrégées:', error);
            return { places: [] };
        }
    }

    async searchLocations(query) {
        try {
            if (!query) {
                return { places: [] };
            }

            const searchUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5`;
            const response = await axios.get(searchUrl, {
                headers: {
                    'User-Agent': 'FastLife/1.0'
                }
            });

            const places = response.data.map(item => ({
                name: item.display_name.split(',')[0],
                type: item.type,
                latitude: parseFloat(item.lat),
                longitude: parseFloat(item.lon),
                rating: null,
                opening_hours: null
            }));

            return { places };
        } catch (error) {
            console.error('Erreur lors de la recherche:', error);
            return { places: [] };
        }
    }
}

module.exports = OpenStreetMapService;
