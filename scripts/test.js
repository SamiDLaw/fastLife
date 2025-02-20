const predictHQUrl = 'https://api.predicthq.com/v1/events/';
const headers = {
    'Authorization': 'Bearer rgOxVTpbvpivV52OdNiYs78UgVMQX4rX5J3rJUHG',
    'Accept': 'application/json'
};

fetch(`${predictHQUrl}?location_around.origin=43.2965,5.3698&radius=2km`, { headers })
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(error => console.error('Erreur PredictHQ:', error));