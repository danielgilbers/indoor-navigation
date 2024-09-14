/* global L, Html5QrcodeScanner, DeviceOrientationEvent */
'use strict'

// import 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
import 'leaflet'
import 'leaflet-rotate'
import { Modal, Offcanvas } from 'bootstrap'
import { findProduct, searchProducts } from './Products.js'
import { clickOnMap } from './Graph.js'
import '../css/style.css'
import positionDotImage from '../img/position-dot.png'
import mapImage from '../data/zollstock/Zollstock-Modellv3.png'

// Map image
const boundy = 280
const boundx = 1366.6
const bounds = [[0, 0], [boundy, boundx]]

let userPosition = L.latLng(100, 645) // Start: 100, 645

// Create map
export const map = L.map('map', {
  zoomControl: false,
  crs: L.CRS.Simple,
  minZoom: -2,
  rotate: true,
  bearing: 0,
  touchRotate: true
})

map.on('click', clickOnMap)

// Add background image to map
const imageOverlay = L.imageOverlay(mapImage, bounds)
imageOverlay.addTo(map)
map.setView(userPosition, 1)

/**
 * Close offcanvas menu
 */
window.closeMenu = function () {
  const bsOffcanvas = Offcanvas.getInstance('#offcanvasMenu')
  bsOffcanvas.hide()
}

// Position dot icon
const iconSize = 24
const iconAnchor = iconSize / 2
const positionDot = L.icon({
  iconUrl: positionDotImage,
  iconSize: [iconSize, iconSize],
  iconAnchor: [iconAnchor, iconAnchor]
})

/**
 * Position dot
 */
const circle = L.marker(userPosition, {
  icon: positionDot
}).addTo(map)

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
const searchGroup = document.getElementById('searchGroup')
const clearSearchButton = L.DomUtil.create('button', 'btn btn-light rounded-start-0 rounded-end-5 lh-1 border-0')
clearSearchButton.innerHTML = '<span class="material-symbols-outlined">Cancel</span>'
clearSearchButton.id = 'clearSearchButton'

let lastProduct

const searchBar = document.getElementById('searchBar')
searchBar.addEventListener('keyup', function (event) {
  const inputValue = searchBar.value

  // add cancel butten when there is something written
  if (inputValue) {
    addClearButton()
    showList(inputValue)
  } else { // remove cancel button
    resetSearchbar()
  }
  // send event
  if (event.key === 'Enter') {
    window.sendSearchQuery(inputValue)
  }
})

/**
 * Show product on map and hide last product
 * @param {String} inputValue Searchquery
 */
window.sendSearchQuery = (inputValue) => {
  const product = findProduct(inputValue, userPosition)
  if (product) {
    if (lastProduct) {
      lastProduct.hideMarker()
    }
    product.showMarker()
    lastProduct = product
  }
  resetSearchbar()
}

/**
 * Add x-Button behind input field
 */
function addClearButton () {
  if (!document.getElementById('clearSearchButton')) {
    searchGroup.appendChild(clearSearchButton)
    searchGroup.lastChild.addEventListener('click', resetSearchbar)
  }
  searchBar.classList.remove('rounded-end-5')
  searchBar.classList.add('rounded-end-0')
}

/**
 * Remove x-Button from search group
 */
function resetSearchbar () {
  searchBar.value = ''
  document.getElementById('clearSearchButton').remove()
  document.getElementById('searchList').remove()
  searchBar.classList.remove('rounded-end-0')
  searchBar.classList.add('rounded-end-5')
}

const searchList = L.DomUtil.create('div', 'list-group pe-3')
searchList.id = 'searchList'

const topControl = document.getElementById('topControl')

/**
 * Show clickable list of possible products
 * @param {String} query Searchquery
 */
function showList (query) {
  searchList.innerHTML = ''
  for (const p of searchProducts(query)) {
    searchList.innerHTML += '<button type="button" class="list-group-item list-group-item-action" onclick="sendSearchQuery(\'' + p.item.name + '\')">' + p.item.name + '</button>'
  }
  if (!document.getElementById('searchList')) {
    topControl.appendChild(searchList)
  }
}

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

const compassSymbol = document.getElementById('compass')

// Graph UI elements
export const toggleGraphUI = document.getElementById('toggleGraphUI')
const download = document.getElementById('download')
export const graphUI = document.getElementsByClassName('graphUI')
// Deactivate click events on map
download.addEventListener('click', function (e) { e.stopPropagation() })

// Remove leaflet link
document.getElementsByClassName('leaflet-control-attribution')[0].remove()
document.getElementsByClassName('leaflet-control-rotate')[0].remove()

// QR Code scanner
const scannerModal = new Modal('#qrScannerModal')

/**
 * Handle scanned code
 * @param {*} decodedText
 * @param {*} decodedResult
 */
function onScanSuccess (decodedText, decodedResult) {
  console.log(`Code matched = ${decodedText}`, decodedResult)
  const scannedPosition = JSON.parse(decodedText) // QR Code text example: {"lat":55,"lng":500}
  userPosition = L.latLng(scannedPosition.lat, scannedPosition.lng)
  circle.setLatLng(userPosition)
  map.flyTo(userPosition, 1)
  scannerModal.hide()
}

/**
 * Handle scan failure, usually better to ignore and keep scanning.
 * @param {*} error
 */
function onScanFailure (error) {
  console.warn(`Code scan error = ${error}`)
}

const html5QrcodeScanner = new Html5QrcodeScanner(
  'reader',
  { fps: 10, qrbox: { width: 250, height: 250 } },
  /* verbose= */ false)
html5QrcodeScanner.render(onScanSuccess, onScanFailure)

/**
 * Hande the device orientation
 * @param {DeviceOrientationEvent} event
 */
function handleOrientation (event) {
  const bias = 120 // rotation of png
  const orientation = 360 - event.webkitCompassHeading
  map.setBearing(orientation + bias)
}

let compass = false

/**
 * Toggle Compass on and off
 */
window.toggleCompass = () => {
  // Request permission for iOS 13+ devices
  if (
    DeviceOrientationEvent &&
  typeof DeviceOrientationEvent.requestPermission === 'function'
  ) {
    DeviceOrientationEvent.requestPermission()
  }

  if (compass) {
    window.removeEventListener('deviceorientation', handleOrientation)
    map.touchRotate.enable()
    compassSymbol.innerHTML = 'near_me'
    compass = false
  } else {
    window.addEventListener('deviceorientation', handleOrientation)
    map.touchRotate.disable()
    compassSymbol.innerHTML = 'explore'
    compass = true
  }
}
