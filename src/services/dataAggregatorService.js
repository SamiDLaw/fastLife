const OpenStreetMapService = require('./openStreetMapService');
const PredictHQService = require('./predictHQService');
const FoursquareService = require('./foursquareService');

class DataAggregatorService {
    constructor() {
        this.osmService = new OpenStreetMapService();
        this.predictHQService = new PredictHQService();
        this.foursquareService = new FoursquareService();
    }

    async getAggregatedData(lat, lon) {
        try {
            // Lancer toutes les requêtes en parallèle
            const [osmPlaces, fsqPlaces, events] = await Promise.all([
                this.getPlacesFromOSM(lat, lon),
                this.getPlacesFromFoursquare(lat, lon),
                this.getEventsFromPredictHQ(lat, lon)
            ]);

            // Fusionner et dédupliquer les résultats
            const places = this._mergePlaces(osmPlaces, fsqPlaces);

            return {
                places: places,
                events: events
            };
        } catch (error) {
            console.error('Error in data aggregation:', error);
            throw error;
        }
    }

    async getPlacesFromOSM(lat, lon) {
        try {
            const places = await this.osmService.getPlaces(lat, lon);
            return places.map(place => ({
                ...place,
                source: 'osm'
            }));
        } catch (error) {
            console.error('Error fetching OSM data:', error);
            return [];
        }
    }

    async getPlacesFromFoursquare(lat, lon) {
        try {
            const categories = [
                FoursquareService.CATEGORIES.HOTEL,
                FoursquareService.CATEGORIES.RESTAURANT,
                FoursquareService.CATEGORIES.CULTURAL,
                FoursquareService.CATEGORIES.NATURE,
                FoursquareService.CATEGORIES.SPORTS,
                FoursquareService.CATEGORIES.ENTERTAINMENT
            ];

            const places = await this.foursquareService.searchPlaces(lat, lon, categories);
            return places.map(place => ({
                ...place,
                source: 'foursquare'
            }));
        } catch (error) {
            console.error('Error fetching Foursquare data:', error);
            return [];
        }
    }

    async getEventsFromPredictHQ(lat, lon) {
        try {
            return await this.predictHQService.getEvents();
        } catch (error) {
            console.error('Error fetching PredictHQ data:', error);
            return [];
        }
    }

    _mergePlaces(osmPlaces, fsqPlaces) {
        const allPlaces = [...osmPlaces, ...fsqPlaces];
        
        // Regrouper les lieux par nom similaire
        const groupedPlaces = allPlaces.reduce((acc, place) => {
            const key = this._normalizeString(place.name);
            if (!acc[key]) {
                acc[key] = [];
            }
            acc[key].push(place);
            return acc;
        }, {});

        // Fusionner les données pour chaque lieu
        return Object.values(groupedPlaces).map(places => {
            if (places.length === 1) return places[0];

            // Prendre les meilleures données disponibles
            const mergedPlace = {
                name: places[0].name,
                type: places[0].type,
                latitude: places[0].latitude,
                longitude: places[0].longitude,
                rating: places.find(p => p.rating)?.rating || null,
                description: places.find(p => p.description)?.description || null,
                opening_hours: places.find(p => p.opening_hours)?.opening_hours || null,
                website: places.find(p => p.website)?.website || null,
                phone: places.find(p => p.phone)?.phone || null,
                address: places.find(p => p.address)?.address || null,
                sources: places.map(p => p.source).join(',')
            };

            return mergedPlace;
        });
    }

    _normalizeString(str) {
        return str.toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]/g, '');
    }
}

module.exports = DataAggregatorService;