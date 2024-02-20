var map = L.map('map').setView([50.9058, 6.9348], 17);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 25,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

/**
 * Button definieren
 */
L.Control.Button = L.Control.extend({
    onAdd: function (map) {
        this.container = L.DomUtil.create('div');
        this.container.innerHTML =
            '<button class="btn btn-primary text-dark rounded-circle p-2 lh-1" type="button">' +
            '<span class="material-symbols-outlined" style="font-variation-settings:\'FILL\' 1; font-size: 30px;">directions</span>' +
            '</button>';

        return this.container;
    },

    onRemove: function (map) {

    }
});

L.control.button = function (opts) {
    return new L.Control.Button(opts);
}

L.control.button({ position: 'bottomright' }).addTo(map);

/**
 * GeoJSON Map Layer
 */
var myStyle = {
    "color": "#ff0000",
    "weight": 1,
    "opacity": 1,
    "fillOpacity": 0.4
};

fetch('./map/map.geojson')
    .then((response) => response.json())
    .then((geojsonFeature) => {
        L.geoJSON(geojsonFeature, {
            style: myStyle
        }).addTo(map);
    });