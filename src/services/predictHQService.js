const axios = require('axios');

class PredictHQService {
  async getEvents() {
    const response = await axios.get(`https://api.predicthq.com/v1/events/`, {
      headers: {
        'Authorization': `Bearer rgOxVTpbvpivV52OdNiYs78UgVMQX4rX5J3rJUHG`
      }
    });
    return response.data.results;
  }

  async getUpcomingEvents() {
    const response = await axios.get(`https://api.predicthq.com/v1/events/?start=2024-12-01`, {
      headers: {
        'Authorization': `Bearer rgOxVTpbvpivV52OdNiYs78UgVMQX4rX5J3rJUHG`
      }
    });
    return response.data.results;
  }
}

module.exports = new PredictHQService();
