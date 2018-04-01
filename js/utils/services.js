/**
 * @desc Geocode some address or location with Geocoder service API.
 * 
 * @param {object} geoCodeSource - The type of geocode (use one): address or location.
 * @param {function} success - Callback when geocoder service success.
 * @param {function} error - Callback when geocoder service has error.
 */
function geocode({ address, location }, success, error) {
  const geocoder = new google.maps.Geocoder();

  const query = {};

  if (address) {
    Object.assign(query, { address });
  } else {
    Object.assign(query, { location });
  }

  geocoder.geocode(query, (results, status) => {
    if (status === google.maps.GeocoderStatus.OK) {
      success(results[0]);
    } else {
      error(`${address ? address : location} not found :(`);
    }
  });
}

/**
 * @desc Calculate distance from origins and destinations
 * 
 * @param {array} origins - The list of origins (lat/lng pair)
 * @param {array} destinations - The list of destinations (lat/lng pair)
 * @param {function} success - Callback whenc calc service return success status.
 * @param {function} error - Callback when distance matrix service has error.
 */
function distanceCalc(origins, destinations, success, error) {
  const service = new google.maps.DistanceMatrixService;

  service.getDistanceMatrix({
    origins,
    destinations,
    travelMode: 'DRIVING',
    unitSystem: google.maps.UnitSystem.METRIC,
    avoidHighways: false,
    avoidTolls: false
  }, (response, status) => {
    if (status === 'OK') {
      success(response);
    } else {
      error(`An error occurred when try to calculate distances.<br>
      ${status}`);
    }
  });
}

/**
 * @desc Calculate directions from an origin and destination.
 * 
 * @param {array} origin - The origin to calculate route (lat/lng pair or direction)
 * @param {array} destination - The destination to calculate route (lat/lng pair or direction)
 * @param {function} success - Callback whenc calc service return success status.
 * @param {function} error - Callback when directions service has error.
 */
function directionsCalc(origin, destination, success, error) {
  const service = new google.maps.DirectionsService();
  const travelMode = google.maps.TravelMode.DRIVING;

  service.route({ origin, destination, travelMode }, (response, status) => {
    if (status == 'OK') {
      success(response);
    } else {
      error(`An error occurred when try to calculate directions.<br>
      ${status}`);
    }
  });
}