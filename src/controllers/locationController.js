const openStreetMapService = require('../services/openStreetMapService');

exports.getMap = async (req, res, next) => {
    try {
        const lat = req.query.lat || 43.2965;
        const lon = req.query.lon || 5.3698;
        const places = await openStreetMapService.getPlaces(lat, lon);
        res.render('pages/map', { places, title: 'Carte des Lieux' });
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
        const data = await openStreetMapService.getAggregatedData(parseFloat(lat), parseFloat(lon));
        res.json(data);
    } catch (error) {
        console.error('Erreur lors de l\'agrégation des données:', error);
        next(error);
    }
};

exports.searchLocations = async (req, res, next) => {
    try {
        const { query } = req.query;
        const results = await openStreetMapService.searchLocations(query);
        res.json(results);
    } catch (error) {
        next(error);
    }
};