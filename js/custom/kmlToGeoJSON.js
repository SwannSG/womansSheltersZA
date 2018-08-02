if ('kml' in window) {
    console.log('Namespace "kml" already exists');
}
else {
    window.kml = {}
}

/*
http://www.demarcation.org.za/site/shapefiles/
2016 Boundaries - Wards Municipalities
KML files
Each province
    data/kml/WC/...
            /EC/...  

let url = 'data/kml/WC/CPT.kml';

WC.kml is a different file type

*/

// we start with WC
kml.PROVINCE = 'WC';
// !!! still need to add all filenames for WC
kml.FILENAMES = ['CPT.kml']
kml.FEATURE_PROPERTY_DELETE = ['CAT_B', 'MapCode', 'OBJECTID', 'Shape_Area', 'Shape_Leng', 'WardNo', 'name', 'shpFID']
for (let filename of kml.FILENAMES) {
    // handle each kml file
    kml.url = `data/kml/${kml.PROVINCE}/${filename}`
    console.log(kml.url);
    kml.temp = omnivore.kml(kml.url)
    .on('ready', function() {
        kml.temp = kml.temp.toGeoJSON();
        // cleam GeoJSON data
        kml.final = kml.clean(kml.temp);
    })
    .on('error', function() {
        // fired if the layer can't be loaded over AJAX
        // or can't be parsed
        console.log('omnivore ajax error for:', kml.url);
    })

}


/*
    type: 'FeatureCollection',
    features: [{}, {}, ...]
        type:       'Feature',
        geometry:   
                    coordinates:    [lng, lat, height],
                    type:           'point',
        properties: 
                    description:    <needs to be parsed>,
                                        to extract !!!!!
                    
                    name:           '1' 
*/


kml.clean = function(x) {
    // x is a GeoJSON object, clean it
    let result = {};
    result.type = 'FeatureCollection';
    result.features = [];

    for (let each of x.features) {
        // loop thro' features
        // initialise feature
        let feature = {};           // item inside the 'result.features' array
        feature.type = 'Feature';
        feature.geometry = {};
        feature.properties = {};
        // end initialise feature

        // add feature props and values
        feature.geometry.coordinates = each.geometry.coordinates;
        feature.geometry.type = each.geometry.type;
        feature.properties.name =  each.properties.name
        kml.featurePropertiesExplode(kml.parseDescription(each.properties.description), feature.properties)
        // end add feature props and values

        // remove feature.properties.<key> that are not required    
        for (let key of kml.FEATURE_PROPERTY_DELETE) {
            delete feature.properties[key];
        }
        // end remove feature.properties.<key> that are not required


        // only add geometry.type = 'Polygon'
        if (feature.geometry.type === 'Polygon') {
            result.features.push(feature);
        }
    }
    return result;
}

kml.parseDescription = function (s) {
    // 's' is feature.properties.description
    //      HTML in a string
    let result = {};
    let parser = new DOMParser();
    let x = parser.parseFromString(s, 'text/html');
    x = x.getElementsByTagName('table')[0].getElementsByTagName('tr');
    let temp = {};
    for (let each of x) {
        temp[each.innerText.split(':')[0]] = each.innerText.split(':')[1];   
    }
    return temp;
} 

kml.featurePropertiesExplode = function (desc, ref) {
    for (let key in desc) {
        ref[key] = desc[key]
    }
}

