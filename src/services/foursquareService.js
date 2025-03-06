const axios = require('axios');

class FoursquareService {
    constructor() {
        this.apiKey = process.env.FOURSQUARE_API_KEY;
        this.baseUrl = 'https://api.foursquare.com/v3';
    }

    async searchPlaces(lat, lon, categories) {
        try {
            const response = await axios.get(`${this.baseUrl}/places/search`, {
                headers: {
                    'Authorization': this.apiKey,
                    'Accept': 'application/json'
                },
                params: {
                    ll: `${lat},${lon}`,
                    radius: 1000,
                    categories: categories.join(','),
                    limit: 20,
                    sort: 'RATING',
                    fields: 'fsq_id,name,geocodes,location,categories,rating,description,distance'
                }
            });

            return response.data.results.map(place => ({
                name: place.name,
                type: this._getCategoryType(place.categories),
                latitude: place.geocodes.main.latitude,
                longitude: place.geocodes.main.longitude,
                rating: place.rating ? place.rating / 2 : null, // Convertir en échelle /5
                description: place.description || null,
                address: place.location.formatted_address,
                categories: place.categories.map(cat => cat.name),
                distance: place.distance
            }));
        } catch (error) {
            console.error('Error fetching places from Foursquare:', error);
            if (error.response) {
                console.error('Response data:', error.response.data);
            }
            return [];
        }
    }

    _getCategoryType(categories) {
        if (!categories || categories.length === 0) return 'other';

        // Vérifier chaque catégorie du lieu
        for (const category of categories) {
            const id = category.id;
            const name = category.name.toLowerCase();

            // Vérification par ID
            if (id === '19014' || name.includes('hotel') || name.includes('lodging')) return 'hotel';
            if (id === '13065' || name.includes('restaurant') || name.includes('food')) return 'restaurant';
            if (id === '10000' || name.includes('entertainment') || name.includes('theater')) return 'entertainment';
            if (id === '16000' || name.includes('museum') || name.includes('cultural')) return 'cultural';
            if (id === '16032' || name.includes('park') || name.includes('nature')) return 'nature';
            if (id === '18000' || name.includes('sport') || name.includes('fitness')) return 'sport';
        }

        return 'other';
    }

    // Catégories Foursquare courantes
    static get CATEGORIES() {
        return {
            HOTEL: '19014',
            RESTAURANT: '13065',
            CULTURAL: '16000', // Landmarks & Outdoors
            NATURE: '16032',  // Park
            SPORTS: '18000',
            ENTERTAINMENT: '10000'  // Arts & Entertainment
        };
    }
}

module.exports = FoursquareService;
