// mapbox access token
// 'pk.eyJ1Ijoic3dhbm5zZyIsImEiOiJjamsweWEyczgwYjA5M3BvMjR2dDk0aTIwIn0.9I1LlFyhj77n1_Xgz__uTA'

if ('ws' in window) {
    console.log('Namespace "ws" already exists');
}
else {
    window.ws = {}
}

ws.mapOptions = {
    center: [-33.9249, 18.4241], // latitude, longitude Cape Town
    zoom: 12               
    }

ws.map = L.map('map').setView(ws.mapOptions.center, ws.mapOptions.zoom);

L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 12,
    id: 'mapbox.streets',
    accessToken: 'pk.eyJ1Ijoic3dhbm5zZyIsImEiOiJjamsweWEyczgwYjA5M3BvMjR2dDk0aTIwIn0.9I1LlFyhj77n1_Xgz__uTA'
}).addTo(map);
 
let a;
let y;
let url = 'data/kml/WC/CPT.kml';
let x = omnivore.kml(url)
    .on('ready', function() {
        y = x.toGeoJSON();
        a = JSON.stringify(y);
    })
    .on('error', function() {
        // fired if the layer can't be loaded over AJAX
        // or can't be parsed
        console.log('omnivore ajax error');
    })



