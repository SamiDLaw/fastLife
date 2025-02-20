const openStreetMapService = require('../services/openStreetMapService');
const DataAggregatorService = require('../services/dataAggregatorService');
const dataAggregator = new DataAggregatorService();

exports.getMap = async (req, res, next) => {
    try {
        const lat = req.query.lat || 43.2965;
        const lon = req.query.lon || 5.3698;
        const data = await dataAggregator.getAggregatedData(lat, lon);
        res.render('pages/map', { 
            places: data.places,
            events: data.events,
            title: 'Carte des Lieux',
            initialLat: lat,
            initialLon: lon
        });
    } catch (error) {
        next(error);
    }
};

exports.getAggregatedData = async (req, res, next) => {
    try {
        const { lat, lon } = req.query;
        if (!lat || !lon) {
            return res.status(400).json({ error: 'Latitude et longitude requises' });
        }
        const data = await dataAggregator.getAggregatedData(parseFloat(lat), parseFloat(lon));
        res.json(data);
    } catch (error) {
        console.error('Erreur lors de l\'agrégation des données:', error);
        res.status(500).json({ error: 'Erreur serveur', places: [], events: [] });
    }
};

exports.searchLocations = async (req, res, next) => {
    try {
        const { q } = req.query;
        if (!q || q.trim().length === 0) {
            return res.json({ places: [] });
        }
        const results = await openStreetMapService.searchLocations(q.trim());
        res.json(results);
    } catch (error) {
        console.error('Erreur lors de la recherche:', error);
        res.status(500).json({ error: 'Erreur serveur', places: [] });
    }
};