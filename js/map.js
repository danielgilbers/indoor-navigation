var map = L.map('map', {zoomControl: false}).setView([50.9058, 6.9348], 17);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 20,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

/**
 * QR Code Button
 */
L.Control.Button = L.Control.extend({
    onAdd: function(map) {
        this.container = L.DomUtil.create('div');
        this.container.innerHTML =
        '<button class="btn btn-primary text-dark rounded-circle p-2 lh-1" type="button">'+
        '<span class="material-symbols-outlined" style="font-variation-settings:\'FILL\' 1; font-size: 30px;">qr_code_scanner</span>'+
        '</button>';

        return this.container;
    },

    onRemove: function(map) {

    }
});

L.control.button = function(opts) {
    return new L.Control.Button(opts);
}

L.control.button({ position: 'bottomright'}).addTo(map);

/**
 * Search Bar with Menu Button
 */
L.Control.Search = L.Control.extend({
onAdd: function(map) {
    this.container = L.DomUtil.create('div', 'input-group vw-100 pe-3');
    this.container.innerHTML =
    '<button class="btn btn-light rounded-start-5 lh-1" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasMenu" aria-controls="offcanvasMenu">' +
    '<span class="material-symbols-outlined" id="addon-wrapping">Menu</span>'+
    '</button>'+
    '<input type="text" class="form-control rounded-end-5" placeholder="Suche" aria-label="Search" aria-describedby="addon-wrapping">';

    return this.container;
}

});

L.control.search = function(opts) {
    return new L.Control.Search(opts);
}

L.control.search({position: 'topleft'}).addTo(map);