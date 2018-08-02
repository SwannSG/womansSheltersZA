if ('ws' in window) {
    console.log('Namespace "ws" already exists');
}
else {
    window.ws = {};
}

// CTN_CENTER =  [-33.9249, 18.4241];
// CONFIG (add all provinces below)
ws.CONFIG = {
    'EC': {
        center: [-32.0, 27.0],
        wardData: 'data/ECmerged.geojson',
        shelterData: 'data/ECshelters.geojson',
        longName: 'Eastern Cape'
    },
    'FS': {
        center: [-29.0, 26.0],
        wardData: 'data/FSmerged.geojson',
        shelterData: 'data/FSshelters.geojson',
        longName: 'Free State'
    },
    'KZN': {
        center: [-30.57, 30.57],
        wardData: 'data/KZNmerged.geojson',
        shelterData: 'data/KZNshelters.geojson',
        longName: 'KwaZulu-Natal'
    },
    'LIM': {
        center: [-24.0, 29.0],
        wardData: 'data/LIMmerged.geojson',
        shelterData: 'data/LIMshelters.geojson',
        longName: 'Limpopo'
    },
    'MP': {
        center: [-30.57, 30.57],
        wardData: 'data/MPmerged.geojson',
        shelterData: 'data/MPshelters.geojson',
        longName: 'Mpumalanga'
    },
    'NC': {
        center: [-30.57, 30.57],
        wardData: 'data/NCmerged.geojson',
        shelterData: 'data/NCshelters.geojson',
        longName: 'Northern Cape'
    },
    'NW': {
        center: [-30.57, 30.57],
        wardData: 'data/NWmerged.geojson',
        shelterData: 'data/NWshelters.geojson',
        longName: 'North West'
    },
    'WC': {
        center: [-32.8, 20.168536735117264],
        wardData: 'data/WCmerged.geojson',
        shelterData: 'data/WCshelters.geojson',
        longName: 'Western Cape'
    }
}
// end CONFIG

// keep track of custom controls added to the map
ws.customControls = []
// end keep track of custom controls added to the map


// Event handlers registration ******************************
document.body.addEventListener('gotJsonRsrcOk',  (event) => {
    if (event.detail.rsrcName === 'wardData') {
        ws.wardLayer(event.detail.data);
    }
    if (event.detail.rsrcName === 'shelterData') {
        ws.sheltersLayer(event.detail.data);
    }
})

document.getElementsByClassName("user-select__get-data")[0].addEventListener('click', (event) => {
    
    let autoTitle = (province, title) => {
        if (!title) {
            return ws.CONFIG[province].longName;
        } else {return title;} 
    }
    
    event.stopPropagation();
    let province = document.getElementsByClassName('user-select__select')[0].value;
    let title = document.getElementsByClassName('user-select__input')[0].value;
    // download correct data
    if (province === 'WC') {
        ws.getJsonRsrc(ws.CONFIG.WC.wardData, 'wardData');    
        ws.getJsonRsrc(ws.CONFIG.WC.shelterData, 'shelterData');
        ws.map.panTo(ws.CONFIG.WC.center);
    }

    // create legends
    let col2legend = createLegend_b(autoTitle(province, title),
                [{img: 'img/icons8-filled-circle-16.png', label: 'Shelters for woman'}]
            )

    let col3legend = NEWcreateLegend_a('Female Population Density',
        [   {color: '#fef0d9', low: '0', high: '2,000'},
            {color: '#fdcc8a', low: '2,000', high: '4,000'},
            {color: '#fc8d59', low: '4,000', high: '6,000'},
            {color: '#e34a33', low: '6,000', high: '8,000'},
            {color: '#b30000', low: '8,000', high: 'more'},
        ]
    )
    // end create legends

    // clear legends
    for (each of ws.customControls) {
        ws.map.removeControl(each);
    }
    ws.customControls = []
    // end clear legends

    // add legends to map
    ws.customControls.push(createLegend('bottomright', [col3legend]));
    ws.customControls.push(createLegend('bottomright', [col2legend]));
    // end add legends to map
})

document.getElementsByClassName('user-select__toggle-zoom')[0].addEventListener('click', (event) => {
    // toggle zoom control
    // check if zoomControl on map
    if (ws.map.zoomControl._map) {
        ws.map.zoomControl.remove()
    } else {ws.map.zoomControl.addTo(ws.map)}
    

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
    return legend;
}

let addMapTitle = (title) => {
    let legend = L.control({position: 'topleft'});
    let el = L.DomUtil.create('div', 'map-title');

    legend.onAdd = function (map) {
        el.innerHTML = `<h2 class="u-center-text">${title}</h2>`;
        return el;
    }        
    legend.addTo(ws.map);
    return legend;
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
    center: ws.CONFIG.WC.center,
    zoom: 7.3               
    }

ws.map = L.map('map').setView(ws.mapOptions.center, ws.mapOptions.zoom);
L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox.streets',
    accessToken: 'pk.eyJ1Ijoic3dhbm5zZyIsImEiOiJjamsweWEyczgwYjA5M3BvMjR2dDk0aTIwIn0.9I1LlFyhj77n1_Xgz__uTA'
}).addTo(ws.map);



