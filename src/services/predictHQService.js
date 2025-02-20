const axios = require('axios');

class PredictHQService {
  constructor() {
    this.apiKey = process.env.PREDICTHQ_API_KEY;
  }

  async getEvents() {
    const response = await axios.get(`https://api.predicthq.com/v1/events/`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`
      }
    });
    return response.data.results;
  }

  async getUpcomingEvents() {
    const response = await axios.get(`https://api.predicthq.com/v1/events/?start=2024-12-01`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`
      }
    });
    return response.data.results;
  }
}

module.exports = PredictHQService;
