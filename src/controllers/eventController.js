const predictHQService = require('../services/predictHQService');

exports.getEvents = async (req, res, next) => {
    try {
        const events = await predictHQService.getEvents();
        res.render('pages/events', { events, title: 'Événements à venir' });
    } catch (error) {
        next(error);
    }
};

exports.getUpcomingEvents = async (req, res, next) => {
    try {
        const events = await predictHQService.getUpcomingEvents();
        res.json(events);
    } catch (error) {
        next(error);
    }
};