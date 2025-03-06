const axios = require('axios');

class OpenStreetMapService {
    async getPlaces(lat, lon) {
        const overpassUrl = `https://overpass-api.de/api/interpreter?data=[out:json];(
            node["amenity"="restaurant"](around:1000,${lat},${lon});
            node["amenity"="cafe"](around:1000,${lat},${lon});
            node["amenity"="bar"](around:1000,${lat},${lon});
            node["amenity"="pub"](around:1000,${lat},${lon});
            node["amenity"="cinema"](around:1000,${lat},${lon});
            node["amenity"="theatre"](around:1000,${lat},${lon});
            node["amenity"="nightclub"](around:1000,${lat},${lon});
            node["shop"="mall"](around:1000,${lat},${lon});
            node["shop"="supermarket"](around:1000,${lat},${lon});
            node["tourism"="hotel"](around:1000,${lat},${lon});
            node["tourism"="museum"](around:1000,${lat},${lon});
            node["tourism"="gallery"](around:1000,${lat},${lon});
            node["tourism"="attraction"](around:1000,${lat},${lon});
            node["tourism"="viewpoint"](around:1000,${lat},${lon});
            node["leisure"="park"](around:1000,${lat},${lon});
            node["leisure"="garden"](around:1000,${lat},${lon});
            node["leisure"="swimming_pool"](around:1000,${lat},${lon});
            node["leisure"="sports_centre"](around:1000,${lat},${lon});
            node["historic"="monument"](around:1000,${lat},${lon});
            node["historic"="castle"](around:1000,${lat},${lon});
            node["historic"="ruins"](around:1000,${lat},${lon});
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
            .slice(0, 40); // Augmenté à 40 résultats pour plus de variété

        return places;
    }

    _getPlaceType(tags) {
        // Catégories de restauration
        if (tags.amenity === 'restaurant') return 'restaurant';
        if (tags.amenity === 'cafe') return 'cafe';
        if (tags.amenity === 'bar') return 'bar';
        if (tags.amenity === 'pub') return 'bar';
        
        // Catégories de divertissement
        if (tags.amenity === 'cinema') return 'cinema';
        if (tags.amenity === 'theatre') return 'theatre';
        if (tags.amenity === 'nightclub') return 'nightlife';
        
        // Catégories de shopping
        if (tags.shop === 'mall') return 'shopping';
        if (tags.shop === 'supermarket') return 'shopping';
        
        // Catégories touristiques
        if (tags.tourism === 'hotel') return 'hotel';
        if (tags.tourism === 'museum') return 'cultural';
        if (tags.tourism === 'gallery') return 'cultural';
        if (tags.tourism === 'attraction') return 'attraction';
        if (tags.tourism === 'viewpoint') return 'attraction';
        
        // Catégories de loisirs
        if (tags.leisure === 'park') return 'nature';
        if (tags.leisure === 'garden') return 'nature';
        if (tags.leisure === 'swimming_pool') return 'sport';
        if (tags.leisure === 'sports_centre') return 'sport';
        
        // Catégories historiques
        if (tags.historic === 'monument') return 'cultural';
        if (tags.historic === 'castle') return 'cultural';
        if (tags.historic === 'ruins') return 'cultural';
        
        // Catégories génériques
        if (tags.leisure) return 'nature';
        if (tags.sport) return 'sport';
        if (tags.shop) return 'shopping';
        
        return 'other';
    }

    _calculateRelevanceScore(place) {
        let score = 0;
        
        // Points pour les informations disponibles
        if (place.rating) score += 3;
        if (place.cuisine) score += 2;
        if (place.opening_hours) score += 1;
        if (place.description) score += 2;
        if (place.website) score += 1;
        if (place.phone) score += 1;
        
        // Attribution de points par catégorie pour équilibrer l'affichage
        const typeScores = {
            'restaurant': 1,
            'cafe': 1,
            'bar': 1,
            'hotel': 1,
            'cultural': 2,    // Favoriser légèrement les lieux culturels
            'attraction': 2,   // Favoriser légèrement les attractions
            'nature': 2,       // Favoriser légèrement les espaces naturels
            'sport': 1,
            'cinema': 1,
            'theatre': 1,
            'nightlife': 1,
            'shopping': 1
        };
        
        // Ajouter le score correspondant au type
        score += typeScores[place.type] || 0;
        
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
