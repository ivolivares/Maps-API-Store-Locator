loadingLocations(); // Loading the locations in localStorage.
let markers = []; // Set array to save the markers displayed on map.
let infoWindow; // Sets a variable to infoWindow.
let stores; // Sets a variable to references of base of stores.
let userOrigin = {}; // Sets a variable to reference to user origin lat/lng.
let directionsDisplay; // Sets a variable to reference the directions display.
let autocomplete; // Sets a variable to reference the autocomplete capability.

/**
 * @desc Create a marker into a map passed and set
 * the click listener to display a infoWindow with
 * the infoWindow instance passed as param.
 * 
 * @param {object} map - The Google Maps object.
 * @param {object} dataObject - Object with data of marker.
 * @param {string} icon - The icon to set in the marker. (Optional)
 */
function createMarker(map, { name, address, lat, lng }, icon = null) {
  // Defines the marker
  const markerOptions = {
    position: { lat, lng },
    title: name,
    map,
    animation: google.maps.Animation.DROP
  }

  if (icon) {
    Object.assign(markerOptions, { icon });
  }

  // Creates the marker
  const marker = new google.maps.Marker(markerOptions);
  
  // Set the click listener to marke
  marker.addListener('click', () => {
    // Centers the map to lat/lng of marker and set zoom
    map.setZoom(6);
    map.setCenter({ lat, lng });
    
    // Sets content to loading message...
    infoWindow.setContent('Retrieving location...');
    // Opens the info window
    infoWindow.open(map, marker);

    // Geocode marker location
    geocode({ address }, (result) => {
      const { formatted_address, address_components } = result;
      const { long_name } = address_components[1];
      distanceCalc([ userOrigin ], [{ lat, lng }], (distanceResult) => {
        const { distance, duration } = distanceResult.rows[0].elements[0];
        // Set the content of info window
        infoWindow.setContent(
          `<strong>${name} at ${long_name}</strong>
          <br><i>${formatted_address}</i>
          <br><smal>You are at ${distance.text} from here,
          about ${duration.text} driving.</smal>`
        );
        // Calculate directions from user origin and the marker destination
        directionsCalc(userOrigin, { lat, lng }, (directionsResult) => {
          directionsDisplay.setDirections(directionsResult);
          document.querySelector('body').classList.add('directions_open');
        }, (errorMessage) => displayMessage(errorMessage));

      }, (errorMessage) => displayMessage(errorMessage));
    }, (errorMessage) => displayMessage(errorMessage));
  });

  // Push the marker to markers array
  markers.push(marker);
}

/**
 * @desc Display stores as markers on a map from localStorage
 * and set to stores variable to use as stores base.
 * 
 * @param {object} map - The Google Maps object.
 */
function displayAllStores(map) {
  stores = JSON.parse(window.localStorage.getItem('stores'));
  
  stores.forEach((store, index) => {
    window.setTimeout(() => createMarker(map, store), 10 * index);
  });
}

/**
 * @desc Bind the initial events to map.
 * Behavios like, change day/night through toggle button are here.
 * 
 * @param {object} map - The Google Maps object.
 */
function bindEventsToMap(map) {
  // Toggle box to style day and night map version  
  document.querySelector('#toggle-box-checkbox')
  .addEventListener('change', (e) => {
    map.setMapTypeId(e.target.checked ? 'styled_night' : 'styled_day');
    const directionsPanel = document.querySelector('#directionsPanel');
    if (e.target.checked) {
      directionsPanel.classList.add('night');
    } else {
      directionsPanel.classList.remove('night');
    }
  });

  // Search stores from location on user input
  document.querySelector('#searchStore').addEventListener('submit', (e) => {
    e.preventDefault();
    searchStores(map);
  });

  // Set autocomplete for user input
  const userInput = document.querySelector('#userInput');
  autocomplete = new google.maps.places.Autocomplete(userInput, {
    types: ['address']
  });

  autocomplete.bindTo('bounds', map);
}


/**
 * @desc Clear all markers from a map.
 * 
 */
function clearLocations() {
  // Closes the info window
  infoWindow.close();
  
  // Delete all markers from the map setted to null map pointer.
  markers.forEach(marker => marker.setMap(null));

  // Reset array length of markers
  markers = [];

  // Closes the directions panel
  document.querySelector('body').classList.remove('directions_open');
}

/**
 * @desc Search locations near
 * 
 * @param {object} map - The Google Maps object.
 * @param {object} center - An lat/lng location to use as center.
 */
function searchLocationsNearOnMap(center, map) {
  // Clear locations
  clearLocations();

  // From a radius...
  const radius = document.querySelector('#userRadius').value;
  
  // search locations near...
  const locationsNear = Object.values(stores).filter(store => {
    const { lat, lng } = store; // Gets the lat/lng from store
    
    // Validate if the store pair is in radius and center defined in search
    return arePointsNear({ lat, lng }, {
      lat: center.lat(),
      lng: center.lng()
    }, radius);
  });

  // and in a bound...
  const bounds = new google.maps.LatLngBounds();

  // set markers from each location found...
  locationsNear.forEach((location) => {
    const latLng = new google.maps.LatLng(
      parseFloat(location.lat), parseFloat(location.lng)
    );
    
    createMarker(map, location);
    bounds.extend(latLng);
  });

  // and finally, fit bounds.
  map.fitBounds(bounds);
}


/**
 * @desc Search stores method
 * Use the Geocoder API to find the user input address.
 * 
 * @param {object} map - The Google Maps object.
*/
function searchStores(map) {
  const userInput = document.querySelector('#userInput');
  const userRadius = document.querySelector('#userRadius');
  
  if (userInput.value !== '') {
    if (userRadius.value !== '0') {
      const address = userInput.value;
      
      geocode({ address }, (result) => {
        // By geocode result, search locations nearing on map...
        searchLocationsNearOnMap(result.geometry.location, map);
        // Geo code user by navigator
        geoCodeUser(map);
      }, (errorMessage) =>  displayMessage(errorMessage));
    } else {
      userRadius.focus();
    }
  } else {
    userInput.focus();
  }
}

/**
 * @desc Geocode user from navigator.geolocation API
 * 
 * @param {object} map - The Google Maps object.
 */
function geoCodeUser(map) {
  if (navigator.geolocation) {
    window.navigator.geolocation.getCurrentPosition(position => {
      userOrigin = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      // Geocode the user position and set a marker with a custom icon
      geocode({ location: userOrigin }, (result) => {
        createMarker(map, {
          name: result.address_components[1].long_name,
          address: result.formatted_address,
          lat: result.geometry.location.lat(),
          lng: result.geometry.location.lng()
        }, iconGPS);
      }, (errorMessage) => displayMessage(errorMessage));

      // Create a circle for display a position on map
      const circle = new google.maps.Circle({
        center: userOrigin,
        radius: position.coords.accuracy
      });

      autocomplete.setBounds(circle.getBounds());
    }, () => {
      displayMessage('Error: The Geolocation service failed.');
    });

  } else {
    displayMessage('Error: Your browser does not support geolocation.');
  }
}

/**
 * @desc Init the map, a Google Map by JS v3 API
 * Sets infowindow and initialize the stores,
 * styles and bind events.
 * @default Location center = USA
 */
function initMap() {
  // Define USA as default location center
  const usa = new google.maps.LatLng(37.09024, -95.712891);
  
  // Initialize map
  const map = new google.maps.Map(document.querySelector('#map'), {
    zoom: 4,
    center: usa
  });

  // Initialize directions renderer class
  directionsDisplay = new google.maps.DirectionsRenderer({
    map,
    panel: document.querySelector('#directionsPanel')
  });

  // Initialize infoWindow object
  infoWindow = new google.maps.InfoWindow;
  
  // Display stores markers on map
  displayAllStores(map);

  // Styling map, by default styled has day map
  setStyledMaps(map);
  map.setMapTypeId('styled_day');

  // Geo code user by navigator
  geoCodeUser(map);

  // Bind events to map
  bindEventsToMap(map);
}