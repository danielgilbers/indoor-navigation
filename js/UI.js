'use strict'

import 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
import { map } from './map.js'

/**
 * Search bar with menu button
 */
L.Control.Search = L.Control.extend({
    onAdd: function () {
      this.container = L.DomUtil.create('div')
      this.container.innerHTML =
        '<div class="input-group vw-100 pe-3 graphUI" id="searchGroup">' +
        '<button class="btn btn-light rounded-start-5 rounded-end-0 lh-1 border-0" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasMenu" aria-controls="offcanvasMenu">' +
        '<span class="material-symbols-outlined">Menu</span>' +
        '</button>' +
        '<input id="searchBar" type="text" class="form-control rounded-start-0 rounded-end-5 border-0" placeholder="Suche" aria-label="Search" aria-describedby="addon-wrapping" autocomplete="off">' +
        '</div>'
      this.container.id = 'topControl'
      return this.container
    }
  
  })

new L.Control.Search({ position: 'topleft' }).addTo(map)

/**
 * Graph UI - Download-button
 */
L.Control.GraphButtons = L.Control.extend({
    onAdd: function () {
      this.container = L.DomUtil.create('div', 'graphUI d-none')
      this.container.innerHTML =
        '<button class="btn btn-light rounded-start-5 rounded-end-0 lh-1 border-0" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasMenu" aria-controls="offcanvasMenu">' +
        '<span class="material-symbols-outlined">Menu</span>' +
        '</button>' +
        '<button class="btn btn-light text-dark rounded-start-0 rounded-end-5 lh-1 border-0" type="button" id="download" data-bs-toggle="modal" data-bs-target="#downloadModal" onclick="createJSON()">' +
        '<span class="material-symbols-outlined">download</span>' +
        '</button>'
  
      return this.container
    }
  })

  new L.Control.GraphButtons({ position: 'topleft' }).addTo(map)

/**
 * QR Code button
 */
L.Control.QRButton = L.Control.extend({
    onAdd: function () {
      this.container = L.DomUtil.create('div', 'graphUI')
      this.container.innerHTML =
        '<button class="btn btn-primary text-dark rounded-circle p-2 lh-1" type="button" id="qrCode" data-bs-toggle="modal" data-bs-target="#qrScannerModal">' +
        '<span class="material-symbols-outlined" style="font-variation-settings:\'FILL\' 1; font-size: 30px;">qr_code_scanner</span>' +
        '</button>'
  
      return this.container
    }
  })
  
new L.Control.QRButton({ position: 'bottomright' }).addTo(map)

/**
 * Compass Button
 */
L.Control.Compass = L.Control.extend({
    onAdd: function () {
      this.container = L.DomUtil.create('div', 'graphUI')
      this.container.innerHTML =
        '<button class="btn btn-light text-primary rounded-circle p-2 lh-1" type="button" onclick="toggleCompass()">' +
        '<span class="material-symbols-outlined" style="font-variation-settings:\'FILL\' 1; font-size: 30px;" id="compass">near_me</span>' +
        '</button>'
  
      return this.container
    }
  })
  
new L.Control.Compass({ position: 'bottomright' }).addTo(map)