// Initialize Mapbox GL JS
mapboxgl.accessToken = 'pk.eyJ1Ijoic2FzY2h1IiwiYSI6ImNrazFueHh2dzBjYm8yc3J5bWZpN2hpcDgifQ.jYquCPw4qWJj7d5wDMSWsA'
var map = new mapboxgl.Map({
  container: 'map', // container id
  style: 'mapbox://styles/mapbox/light-v10', // stylesheet location
  center: [-122.4443, 47.2529], // starting position
  zoom: 10 // starting zoom
});
// GeoJSON data embedded here rather than independent files. Removes the need for a JQuery line.
var hospitalPoints = {
  "type":"FeatureCollection",
  "features":[
    {"type":"Feature","geometry":{"type":"Point","coordinates":[-122.48083069805091,47.24158294247902]},"properties":{"NAME":"Allenmore Hospital","ADDRESS":"1901 S Union Ave","CITY":"Tacoma","ZIP":98405}},
    {"type":"Feature","geometry":{"type":"Point","coordinates":[-122.29012358186617,47.17861596384059]},"properties":{"NAME":"Good Samaritan Hospital","ADDRESS":"401 15th Ave SE","CITY":"Puyallup","ZIP":98372}},
    {"type":"Feature","geometry":{"type":"Point","coordinates":[-122.55190153531765,47.109023185217126]},"properties":{"NAME":"Madigan Hospital","ADDRESS":"9040 Jackson Ave\r\n","CITY":"Tacoma","ZIP":98431}},
    {"type":"Feature","geometry":{"type":"Point","coordinates":[-122.50212346172164,47.15457916145514]},"properties":{"NAME":"St Clare Hospital","ADDRESS":"11315 Bridgeport Way SW","CITY":"Lakewood","ZIP":98499}},
    {"type":"Feature","geometry":{"type":"Point","coordinates":[-122.44793640184797,47.24530738056208]},"properties":{"NAME":"St Joseph Medical Center","ADDRESS":"1717 S J St","CITY":"Tacoma","ZIP":98405}},
    {"type":"Feature","geometry":{"type":"Point","coordinates":[-122.45305284917963,47.25946004827884]},"properties":{"NAME":"Tacoma General Hospital","ADDRESS":"315 Martin Luther King Jr Way","CITY":"Tacoma","ZIP":98405}},
    {"type":"Feature","geometry":{"type":"Point","coordinates":[-122.61346848763097,47.3644245711541]},"properties":{"NAME":"St Anthony Hospital","ADDRESS":"11567 Canterwood Blvd NW","CITY":"Gig Harbor","ZIP":98332}},
    {"type":"Feature","geometry":{"type":"Point","coordinates":[-122.57559702458708,47.13526338360076]},"properties":{"NAME":"VA Puget Sound Health - American Lake","ADDRESS":"9600 Veterans Dr SW","CITY":"Tacoma","ZIP":98493}}
  ]
};

var libraryPoints = {
  "type":"FeatureCollection",
  "features":[
    {"type":"Feature","geometry":{"type":"Point","coordinates":[-122.44286601671358,47.18153501572299]},"properties":{"STREET":"765 S 84TH ST","CITY":"TACOMA","ZIPCODE_TX":98444,"NAME":"Fern Hill Branch Library"}},
    {"type":"Feature","geometry":{"type":"Point","coordinates":[-122.38636926841266,47.28798760158585]},"properties":{"STREET":"212 BROWNS POINT BLVD NE","CITY":"TACOMA","ZIPCODE_TX":98422,"NAME":"Kobetich Branch Library"}},
    {"type":"Feature","geometry":{"type":"Point","coordinates":[-122.44477915321865,47.2523969123164]},"properties":{"STREET":"1102 TACOMA AVE S","CITY":"TACOMA","ZIPCODE_TX":98402,"NAME":"Main Branch Library"}},
    {"type":"Feature","geometry":{"type":"Point","coordinates":[-122.43572732043167,47.20666248779983]},"properties":{"STREET":"215 S 56TH ST","CITY":"TACOMA","ZIPCODE_TX":98408,"NAME":"Moore Branch Library"}},
    {"type":"Feature","geometry":{"type":"Point","coordinates":[-122.42186773444043,47.228734823576495]},"properties":{"STREET":"3523 E G ST","CITY":"TACOMA","ZIPCODE_TX":98404,"NAME":"Mottet Branch Library"}},
    {"type":"Feature","geometry":{"type":"Point","coordinates":[-122.48204739978517,47.20640222475374]},"properties":{"STREET":"3411 S 56TH ST","CITY":"TACOMA","ZIPCODE_TX":98409,"NAME":"South Tacoma Branch Library"}},
    {"type":"Feature","geometry":{"type":"Point","coordinates":[-122.53048124147489,47.255795771423095]},"properties":{"STREET":"7001 6TH AVE","CITY":"TACOMA","ZIPCODE_TX":98406,"NAME":"Swasey Branch Library"}},
    {"type":"Feature","geometry":{"type":"Point","coordinates":[-122.48637925763215,47.27079139854106]},"properties":{"STREET":"3722 N 26TH ST","CITY":"TACOMA","ZIPCODE_TX":98406,"NAME":"Wheelock Branch Library"}}
  ]
};

// Put the above data onto the map as layers
map.on('load', function() {
  map.addLayer({
    id: 'hospitals',
    type: 'symbol',
    source: {
      type: 'geojson',
      data: hospitalPoints
    },
    layout: {
      'icon-image': 'hospital-15',
      'icon-allow-overlap': true
    },
    paint: { }
  });
  map.addLayer({
    id: 'libraries',
    type: 'symbol',
    source: {
      type: 'geojson',
      data: libraryPoints
    },
    layout: {
      'icon-image': 'library-15',
      'icon-allow-overlap': true
    },
    paint: { }
  });
  // Blank layer to display circles around selected hospitals
  map.addSource('nearest-hospital', {
    type: 'geojson',
    data: {
      type: 'FeatureCollection',
      features: [
    ]
  }
});
});

// Popups
var popup = new mapboxgl.Popup();

map.on('click', 'hospitals', function(e) {
  var feature = e.features[0];
  popup.setLngLat(feature.geometry.coordinates)
    .setHTML("<b>" + feature.properties.NAME + "</b><br>" + feature.properties.ADDRESS)
    .addTo(map);
});

// Use Turf to find the nearest hospital to library clicked
map.on('click', 'libraries', function(f) {
  var refLibrary = f.features[0];
  var nearestHospital = turf.nearest(refLibrary, hospitalPoints);
  var distance = turf.distance(refLibrary, nearestHospital, {
    units: 'miles'
  });

  // Update the 'nearest-hospital' data source to include the nearest library
  map.getSource('nearest-hospital').setData({
    type: 'FeatureCollection',
    features: [
      nearestHospital
    ]
  });

  // Create a new circle layer from the 'nearest-hospital' data source
  map.addLayer({
    id: 'nearestHospitalLayer',
    type: 'circle',
    source: 'nearest-hospital',
    paint: {
      'circle-radius': 12,
      'circle-color': '#486DE0'
    }
  }, 'hospitals');

  // Popup that explains: 1. This library's info, 2. Nearest hospital
  popup.setLngLat(refLibrary.geometry.coordinates)
    .setHTML('<b>' + refLibrary.properties.NAME + '</b><br>The nearest hospital is ' + nearestHospital.properties.NAME + ', located at ' + nearestHospital.properties.ADDRESS + ". It is " + distance.toFixed(2) + " miles away.")
    .addTo(map);
});
