if ('ws' in window) {
    console.log('Namespace "ws" already exists');
}
else {
    window.ws = {};
}


// CONSTANTS
WC_CENTER  =  [-32.8, 20.168536735117264];    
CTN_CENTER =  [-33.9249, 18.4241];


// end CONSTANTS


// Event handlers registration ******************************
document.body.addEventListener('gotJsonRsrcOk',  (event) => {
    if (event.detail.rsrcName === 'WCmerged.geojson') {
        ws.wardLayer(event.detail.data);
    }
    if (event.detail.rsrcName === 'WCshelters.geojson') {
        ws.sheltersLayer(event.detail.data);
    }

})
// end Event handlers registration **************************

// Custom Functions *****************************************
let homeIcon = L.icon({
    iconUrl: 'img/icons8-filled-circle-16.png',
    iconSize:     [16, 16], // size of the icon
    iconAnchor:   [8, 8], // point of the icon which will correspond to marker's location
    popupAnchor:  [0, 0] // point from which the popup should open relative to the iconAnchor
});



ws.sheltersLayer = (layer) => {
    let geojsonMarkerOptions = {
        className: 'shelter'
    };
    L.geoJSON(layer,  {
        pointToLayer: function(feature, latlng) {
            return L.marker(latlng, {icon: homeIcon}).bindPopup(feature.properties.name)
            // return L.circleMarker(latlng, homeIcon);
        }
    })
    .addTo(ws.map);
}

ws.wardLayer = (layer) => {
    L.geoJSON(layer, {style: ws.styleFeature}).addTo(ws.map);
    // Event timing issue
    ws.map.on('click', ws.onMapClick);
    // end Event timing issue
}

ws.getFillColor = (n) => {
    // n --> no of woman in ward
    BIN_SIZE = 2000
    if (n > BIN_SIZE * 4) {return '#b30000';}
    else if (n > BIN_SIZE * 3) {return '#e34a33';}
    else if (n > BIN_SIZE * 2) {return '#fc8d59'; }
    else if (n > BIN_SIZE * 1) {return '#fdcc8a'}
    else {return '#fef0d9'}
}


ws.styleFeature = (feature) => {
    return {
        fillColor: ws.getFillColor(feature.properties.females),
        fillOpacity: .7,
        weight: 1,
        opacity: .8,
        color: 'lighgray',
    }
}


ws.onMapClick = (e) => {
    console.log('Map clicked at ',  e.latlng);
}

// what do we do with errors ?????
ws.getJsonRsrc  = (rsrcId, rsrcName, eventName='gotJsonRsrcOk') => {
    /*
    download json file, generate event when successfully downloaded
        rsrcId:     url of json file
        rsrcName:   internal names for that particular json file
        eventName:  default name is 'gotJsonRsrcOk'
    Must add associated event handler
        document.body.addEventListener('gotJsonRsrcOk', {event} {
            event.detail.rsrcName:  rsrcName argument value
            event.detail.data:      downloaded json file data
        }         
    */
    console.log(rsrcId, rsrcName, eventName);
    fetch(rsrcId)
    .then(x => x.ok ? x.json() : console.log(rsrcId, ': fetch data error'))
    .then(jsonData => {
        document.body.dispatchEvent(new CustomEvent(
            eventName,
            {detail: {
                rsrcName: rsrcName, 
                data: jsonData
                }
            }));
    })
    .catch(err => console.log(err));
} 
// end Custom Functions *************************************


// Map Components *******************************************
let createLegend = (pos, html) => {
    /*  pos: string
        html: array of html stings

    */
    let legend = L.control({position: pos});
    let el = L.DomUtil.create('div', 'legend');

    legend.onAdd = function (map) {
        el.innerHTML = htmlToAdd;
        return el;
    }        

    // assemble html
    let htmlToAdd = ``;
    for (let each of html) {
        htmlToAdd = htmlToAdd + each
    }

    legend.addTo(ws.map)
}

let addMapTitle = (title) => {
    let legend = L.control({position: 'topright'});
    let el = L.DomUtil.create('div', 'map-title');

    legend.onAdd = function (map) {
        el.innerHTML = `<h2 class="u-center-text">${title}</h2>`;
        return el;
    }        
    legend.addTo(ws.map);
}


let createLegend_b = (title, rows) => {
    /*  rows: array of row objects
        row:{img: imgUrl, label: string}
        returns html string
    */

   let heading = `  <div class="legend-b__heading">
                        <h4 class="u-center-text">${title}</h4>
                    </div>`
    let rowsHtml = [];
    for (let each of rows) {
        let each_row =  `<div class="legend-b__row">
                            <figure class="legend-b__figure">
                                <img src="${each.img}">
                            </figure>
                            <div class="legend-b__label">${each.label}</div>
                        </div>`;
        rowsHtml.push(each_row);     
    }
    // assemble rowsHtml
    let rowsAll = ``;
    for (let each of rowsHtml) {
        rowsAll = rowsAll + each
    }

    console.log(rowsAll);
    
    // add legend_b div wrapper
    return `<div class="legend-b">` + heading + rowsAll + `</div>`
}


let NEWcreateLegend_a = (title, rows, sep=' - ') => {
    /*  title: text string
        rows: array of row objects {color: '#b30000', low: '0', high: '1,000'}
        sep:  seperator, text string
        return html string
    */

    let rowsHtml = [];
    let heading = ` <div class="legend-a__heading">
                        <h4 class="u-center-text">${title}</h4>
                    </div>`

    for (let each of rows) {
        let each_row =  `<div class="legend-a__row">
                            <div class="legend-a__item-swatch" style="background-color: ${each.color};"></div>
                            <div class="legend-a__item-low">${each.low}</div>
                            <div class="legend-a__item-sep">${sep}</div>    
                            <div class="legend-a__item-high">${each.high}</div>    
                        </div>`
        rowsHtml.push(each_row);
    }
    // assemble rowsHtml
    let rowsAll = ``;
    for (let each of rowsHtml) {
        rowsAll = rowsAll + each
    }

    // return heading + rowsAll;
    return heading + rowsAll;
}





let createLegend_a = (title, rows, sep=' - ') => {
    /*  title: text string
        rows: array of row objects {color: '#b30000', low: '0', high: '1,000'}
        sep:  seperator, text string
    */

   let legend = L.control({position: 'bottomright'});

   legend.onAdd = function (map) {
        ref.innerHTML = htmlToAdd;
        return ref;
    }        
    
    let ref = L.DomUtil.create('div', 'legend-a');
    let rowsHtml = [];
    let heading = ` <div class="legend-a__heading">
                        <h4 class="u-center-text">${title}</h4>
                    </div>`

    for (let each of rows) {
        let each_row =  `<div class="legend-a__row">
                            <div class="legend-a__item-swatch" style="background-color: ${each.color};"></div>
                            <div class="legend-a__item-low">${each.low}</div>
                            <div class="legend-a__item-sep">${sep}</div>    
                            <div class="legend-a__item-high">${each.high}</div>    
                        </div>`
        rowsHtml.push(each_row);
    }
    // assemble rowsHtml
    let rowsAll = ``;
    for (let each of rowsHtml) {
        rowsAll = rowsAll + each
    }

    // return heading + rowsAll;
    let htmlToAdd = heading + rowsAll;
    legend.addTo(ws.map)
}
// end Map Components ***************************************


ws.mapOptions = {
    center: WC_CENTER,
    zoom: 7.3               
    }

ws.map = L.map('map').setView(ws.mapOptions.center, ws.mapOptions.zoom);
L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox.streets',
    accessToken: 'pk.eyJ1Ijoic3dhbm5zZyIsImEiOiJjamsweWEyczgwYjA5M3BvMjR2dDk0aTIwIn0.9I1LlFyhj77n1_Xgz__uTA'
}).addTo(ws.map);

// download geojson data for wards
ws.getJsonRsrc('data/WCmerged.geojson', 'WCmerged.geojson');

// download geojson data for shelters
ws.getJsonRsrc('data/WCshelters.geojson', 'WCshelters.geojson');

// add legend 
/*
createLegend_a('Female Population Density',
    [   {color: '#fef0d9', low: '0', high: '2,000'},
        {color: '#fdcc8a', low: '2,000', high: '4,000'},
        {color: '#fc8d59', low: '4,000', high: '6,000'},
        {color: '#e34a33', low: '6,000', high: '8,000'},
        {color: '#b30000', low: '8,000', high: 'more'},
    ]
)
*/

b = createLegend_b('Map Legend',
    [{img: 'img/icons8-filled-circle-16.png', label: 'Shelters for woman'}]
)

a = NEWcreateLegend_a('Female Population Density',
    [   {color: '#fef0d9', low: '0', high: '2,000'},
        {color: '#fdcc8a', low: '2,000', high: '4,000'},
        {color: '#fc8d59', low: '4,000', high: '6,000'},
        {color: '#e34a33', low: '6,000', high: '8,000'},
        {color: '#b30000', low: '8,000', high: 'more'},
    ]
)

addMapTitle("Western Cape Shelters For Woman")

createLegend('bottomright', [a]);
createLegend('bottomright', [b]);

