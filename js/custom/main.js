// only one namespace "ws" for our code
if ('ws' in window) {
    console.log('Namespace "ws" already exists');
}
else {
    window.ws = {};
}
// end only one namespace "ws" for our code



// CONFIG (add all provinces below) ************************
ws.CONFIG = {
    BIN_SIZE: 2000,
    COLORS: {
        BIN_1: '#fef0d9',
        BIN_2: '#fdcc8a',
        BIN_3: '#fc8d59',
        BIN_4: '#e34a33',
        BIN_5: '#b30000'
    },
    'EC': {
        center: [-32.2977935398105, 26.66272775514364],
        wardData: 'data/ECmerged.geojson',
        wardDataTopoJson: 'data/ECmerged.topojson',
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
        wardDataTopoJson: 'data/WCmerged.topojson',
        shelterData: 'data/WCshelters.geojson',
        longName: 'Western Cape'
    }
}
// end CONFIG ******************************************

// keep track of custom controls added to the map
ws.customControls = [];
// end keep track of custom controls added to the map

// keep a reference to a layer placed on the map
// ws.layer.name 
ws.layers = {};
// end keep a reference to a layer placed on the map


// Document event handlers registration ******************************
// executed when a json file has finished downloading from the server
document.body.addEventListener('gotJsonRsrcOk',  (event) => {
    if (event.detail.rsrcName === 'wardDataGeoJson') {
        ws.wardLayer(event.detail.data);
    }
    else if (event.detail.rsrcName === 'wardDataTopoJson') {
        // handle topojson stuff !!!!!
    }
    else if (event.detail.rsrcName === 'shelterData') {
        ws.sheltersLayer(event.detail.data);
    }
})
// end

// executed when user clicks on "Get Data" button ***********************************************
document.getElementsByClassName("user-select__get-data")[0].addEventListener('click', (event) => {
    let autoTitle = (province, title) => {
        if (!title) {
            return ws.CONFIG[province].longName;
        } else {return title;} 
    }
    
    event.stopPropagation();
    // read UI input
    let province = document.getElementsByClassName('user-select__select')[0].value;
    let title = document.getElementsByClassName('user-select__input')[0].value;
    // end read UI input

    // remove map layers.
    ws.map.eachLayer((layer) => {
        if (layer.name === 'wards' || layer.name === 'shelters') {
            ws.map.removeLayer(layer);
        }
    })
    // end remove map layers

    // download data
    // geoJson map layer
    ws.getJsonRsrc(ws.CONFIG[province].wardData, 'wardDataGeoJson'); 

    // also want a topoJson layer !!!!
    // pssoible also want a compressed topoJson layer !!!!

    ws.getJsonRsrc(ws.CONFIG.WC.shelterData, 'shelterData');
    ws.map.panTo(ws.CONFIG[province].center);
    // end download correct data

     // create legends
    let col2legend = createLegend_c(autoTitle(province, title),
                [{img: 'img/icons8-filled-circle-16.png', label: 'Shelters for woman'}]
            )

    let col3legend = createLegend_a('Female Population Density',
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
// end executed when user clicks on "Get Data" button ***************************************


// executed when user clicks on "Map zoom toggle" button
document.getElementsByClassName('user-select__toggle-zoom')[0].addEventListener('click', (event) => {
    // toggle zoom control
    // check if zoomControl on map
    if (ws.map.zoomControl._map) {
        ws.map.zoomControl.remove()
    } else {ws.map.zoomControl.addTo(ws.map)}
})
// end
// end document event handlers registration ************************************************


// Custom Functions *****************************************


// give a layer a name so we can easily reference it later
ws.nameLayer = (layerObj, layerName) => {
    if (layerObj.hasOwnProperty('name')) {
        console.log('cannot add "name" to layer')
    } else {layerObj.name = layerName;}
}
// end give a layer a name so we can easily reference it later

// NOT USED
// use an image instead of an SVG
// only kept as an example  
ws.OLDsheltersLayer = (layer) => {
    let homeIcon = L.icon({
        iconUrl: 'img/icons8-filled-circle-16.png',
        iconSize:     [16, 16], // size of the icon
        iconAnchor:   [8, 8], // point of the icon which will correspond to marker's location
        popupAnchor:  [0, 0] // point from which the popup should open relative to the iconAnchor
    });
   
    L.geoJSON(layer,  {
        pointToLayer: function(feature, latlng) {
            return L.marker(latlng, {icon: homeIcon}).bindPopup(feature.properties.name)
        }
    })
    .addTo(ws.map);
}
// end NOT USED

// create and add shelters layer
ws.sheltersLayer = (layer) => {
    layerObj = L.geoJSON(layer, {
        pointToLayer: function(feature, latlng) {
                        return L.circleMarker(latlng, {
                            radius: ws.map.getZoom()*0.8,
                            fillColor: 'yellow',
                            fillOpacity: 1,
                            className: 'shelter-marker',
                            color: 'black',
                            weight: 1, 
                        }).bindPopup(feature.properties.name); 
        }
    })
    // name  the layer
    ws.nameLayer(layerObj, 'shelters');
    // add layer to map
    layerObj.addTo(ws.map);
    // keep reference to layer in ws.layers.shelters
    ws.layers.shelters = layerObj;
}
// end 


// create and add wardLayer from geoJson data
ws.wardLayer = (layer) => {
    // layer argument: geoJSON data as json
    layer = L.geoJSON(layer, {style: ws.styleFeature})
    // layer: becomes a layer object
    
    // name the layer
    ws.nameLayer(layer, 'wards')
    // add layer to map
    layer.addTo(ws.map);

    // Event timing issue NOTE!
    ws.layers.shelters.bringToFront();
    ws.map.on('click', ws.onMapClick);
    // end Event timing issue
}



// used to style ward areas with fill color based on female population size
ws.styleFeature = (feature) => {

    let getFillColor = (n) => {
        // n --> no of woman in ward
        let BIN_SIZE = ws.CONFIG.BIN_SIZE;
        if (n > BIN_SIZE * 4) {return ws.CONFIG.COLORS.BIN_5;}
        else if (n > BIN_SIZE * 3) {return ws.CONFIG.COLORS.BIN_4;}
        else if (n > BIN_SIZE * 2) {return ws.CONFIG.COLORS.BIN_3; }
        else if (n > BIN_SIZE * 1) {return ws.CONFIG.COLORS.BIN_2}
        else {return ws.CONFIG.COLORS.BIN_1}
    }

    return {
        fillColor: getFillColor(feature.properties.females),
        fillOpacity: .7,
        weight: 1,
        opacity: .8,
        color: 'lighgray',
    }
}
// end

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


// legend(_b) of the form 
//  title
//  img     label
//  img     label
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
// end

// legend(_c) of the form 
//  title
//  circle     label
//  circle     label
let createLegend_c = (title, rows) => {
    /*  rows: array of row objects
        row:{label: string}
        returns html string
    */

   let heading = `  <div class="legend-c__heading">
                        <h4 class="u-center-text">${title}</h4>
                    </div>`
    let rowsHtml = [];
    for (let each of rows) {
        let each_row =  `<div class="legend-c__row">
                            <div class=legend-c__swatch>
                                <div class=legend-c__swatch-circle></div>
                            </div>
                            <div class="legend-c__label">${each.label}</div>
                        </div>`;
        rowsHtml.push(each_row);     
    }
    // assemble rowsHtml
    let rowsAll = ``;
    for (let each of rowsHtml) {
        rowsAll = rowsAll + each
    }

    // add legend_c div wrapper
    return `<div class="legend-c">` + heading + rowsAll + `</div>`
}
// end


// legend(_c) of the form 
//  title
//  swatch  low <sep> high
let createLegend_a = (title, rows, sep=' - ') => {
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
// end




// end Map Components ***************************************


// create map ***********************************************
ws.mapOptions = {
    center: ws.CONFIG.WC.center,
    zoom: 7.3               
    }

ws.map = L.map('map').setView(ws.mapOptions.center, ws.mapOptions.zoom);
ws.map.addEventListener('zoomend', (event) => {
    // do something when zoom changes
    if (ws.layers.shelters) {
        //layerShelters object exists, apply different styling
        ws.layers.shelters.setStyle({radius: ws.map.getZoom()*0.8});
    }
})



L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox.streets',
    accessToken: 'pk.eyJ1Ijoic3dhbm5zZyIsImEiOiJjamsweWEyczgwYjA5M3BvMjR2dDk0aTIwIn0.9I1LlFyhj77n1_Xgz__uTA'
}).addTo(ws.map);
// end create map *******************************************


