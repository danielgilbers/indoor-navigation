/* global L, bootstrap, Html5QrcodeScanner, DeviceOrientationEvent, _ */
'use strict'

import 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
import 'https://unpkg.com/leaflet-rotate@0.2.8/dist/leaflet-rotate.js'
import 'https://unpkg.com/bootstrap@5.3.3/dist/js/bootstrap.min.js'
import 'https://unpkg.com/lodash@4.17.21/lodash.min.js'
import Product, { findProduct, searchProducts } from './Products.js'
import { clickOnMap, loadJSON } from './Graph.js'
import { calculatePosition } from './Position.js'
import Astar from './Astar.js'

// Position
const loadedGraph = await loadJSON()
const astar = new Astar(loadedGraph)
let direction = ['', '']
let userPosition = L.latLng(100, 645) // Start: 100, 645
let nearestNode = null
let isCentered = true
const motionArray = []
const motionArrayLength = 100
let compass = false
let activeTarget = false

// Products
let product = new Product({ nan: 0, name: '', nodeIndex: 0 })
let lastProduct = product

// Map image
const image = './map/Zollstock-Modellv3.png'
const boundy = 280
const boundx = 1366.6
const bounds = [[0, 0], [boundy, boundx]]

// Position dot
const iconSize = 24
const iconAnchor = iconSize >> 1 // Bitshift / 2
const positionDotIcon = L.icon({
  iconUrl: './img/position-dot.png',
  iconSize: [iconSize, iconSize],
  iconAnchor: [iconAnchor, iconAnchor]
})

// Create map
export const map = L.map('map', {
  zoomControl: false,
  crs: L.CRS.Simple,
  minZoom: -2,
  maxZoom: 3,
  rotate: true,
  bearing: 0,
  touchRotate: true
})
// Remove rotation control
document.getElementsByClassName('leaflet-control-rotate')[0].remove()
// Remove leaflet link
document.getElementsByClassName('leaflet-control-attribution')[0].remove()

// -----------
// UI elements
// -----------

// Add background image to map
L.imageOverlay(image, bounds).addTo(map)

/**
 * Position dot
 */
const circle = L.marker(userPosition, {
  icon: positionDotIcon
}).addTo(map)

/**
 * Search bar with menu button
 */
L.Control.Search = L.Control.extend({
  onAdd: function () {
    this.container = L.DomUtil.create('div', 'vw-100 pe-3')
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

/**
 * X at the end of search bar
 */
const clearSearchButton = L.DomUtil.create('button', 'btn btn-light rounded-start-0 rounded-end-5 lh-1 border-0')
clearSearchButton.id = 'clearSearchButton'
clearSearchButton.innerHTML = '<span class="material-symbols-outlined">Cancel</span>'

/**
 * Search list
 */
const searchList = L.DomUtil.create('div', 'list-group pe-3')
searchList.id = 'searchList'

/**
 * Compass button
 */
L.Control.Compass = L.Control.extend({
  onAdd: function () {
    this.container = L.DomUtil.create('div', 'graphUI')
    this.container.innerHTML =
      '<button class="btn btn-light text-primary rounded-circle p-2 lh-1" type="button" onclick="toggleCompass()">' +
      '<span class="material-symbols-outlined m-1 ms-filled" id="compass">near_me</span>' +
      '</button>'

    return this.container
  }
})

/**
 * QR Code button
 */
L.Control.QRButton = L.Control.extend({
  onAdd: function () {
    this.container = L.DomUtil.create('div', 'graphUI')
    this.container.innerHTML =
      '<button class="btn btn-primary rounded-circle p-2 lh-1" type="button" id="qrCode" data-bs-toggle="modal" data-bs-target="#qrScannerModal">' +
      '<span class="material-symbols-outlined m-1">qr_code_scanner</span>' +
      '</button>'

    return this.container
  }
})

/**
 * Navigation button
 */
L.Control.Navigation = L.Control.extend({
  onAdd: function () {
    this.container = L.DomUtil.create('div', 'graphUI')
    this.container.innerHTML =
      '<button class="btn btn-lg btn-primary rounded-5 p-2 lh-1 d-flex align-items-center d-none" type="button"  id="navigation">' +
      '<span class="material-symbols-outlined m-1 ms-filled">navigation</span>' +
      '<span class="ms-2 me-2">Starten</span></button>'

    return this.container
  }
})

/**
 * Directions
 */
const directions = L.DomUtil.create('div', 'card text-bg-success mb-3')
directions.id = 'directions'
/**
 * Update current directions
 */
function refreshDirections () {
  directions.innerHTML =
    '<div class="card-body d-flex align-items-center">' +
    '<span class="material-symbols-outlined me-3 mb-bg">' + direction[0] + '</span>' +
    '<h5 class="card-title mb-0">' + direction[1] + '</h5>' +
    '</div>'
}

/**
 * Graph UI - Download button
 */
L.Control.GraphButtons = L.Control.extend({
  onAdd: function () {
    this.container = L.DomUtil.create('div', 'graphUI d-none')
    this.container.innerHTML =
      '<button class="btn btn-light rounded-start-5 rounded-end-0 lh-1 border-0" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasMenu" aria-controls="offcanvasMenu">' +
      '<span class="material-symbols-outlined">Menu</span>' +
      '</button>' +
      '<a download="graph.json" id="downloadlink" class="btn btn-light text-dark rounded-start-0 rounded-end-5 lh-1 border-0" type="button" id="download" onclick="createJSON()">' +
      '<span class="material-symbols-outlined">download</span>' +
      '</button>'

    return this.container
  }
})

// -------------------
// Add elements to map
// -------------------

new L.Control.Search({ position: 'topleft' }).addTo(map)
new L.Control.GraphButtons({ position: 'topleft' }).addTo(map)
new L.Control.QRButton({ position: 'bottomright' }).addTo(map)
new L.Control.Compass({ position: 'bottomright' }).addTo(map)
new L.Control.Navigation({ position: 'bottomleft' }).addTo(map)

// -----------------
// Find DOM elements
// -----------------
const searchGroup = document.getElementById('searchGroup')
const searchBar = document.getElementById('searchBar')
const topControl = document.getElementById('topControl')
const compassSymbol = document.getElementById('compass')
const navigationButton = document.getElementById('navigation')
export const toggleGraphUI = document.getElementById('toggleGraphUI')
export const graphUI = document.getElementsByClassName('graphUI')
const download = document.getElementById('downloadlink')
// QR Code scanner
const scannerModal = new bootstrap.Modal('#qrScannerModal')
const html5QrcodeScanner = new Html5QrcodeScanner(
  'reader',
  { fps: 10, qrbox: { width: 250, height: 250 } },
  /* verbose= */ false)

// ------------------
// Add eventListeners
// ------------------
map.on('click', clickOnMap)
map.on('moveend', endOfMapMovement)
searchGroup.addEventListener('click', function (e) { e.stopPropagation() })
searchGroup.addEventListener('dblclick', function (e) { e.stopPropagation() })
searchGroup.addEventListener('mousedown', function (e) { e.stopPropagation() })
searchGroup.addEventListener('touchstart', function (e) { e.stopPropagation() })
download.addEventListener('click', function (e) { e.stopPropagation() })
searchBar.addEventListener('keyup', useSearchbar)
navigationButton.addEventListener('click', startNavigation)
html5QrcodeScanner.render(onScanSuccess, onScanFailure)

// ----------------
// Browse functions
// ----------------

/**
 * Close offcanvas menu
 */
window.closeMenu = function () {
  const bsOffcanvas = new bootstrap.Offcanvas('#offcanvasMenu')
  bsOffcanvas.hide()
}

// ----------------
// Search functions
// ----------------

/**
 * Process searchbar input
 * @param {Event} e
 */
function useSearchbar (e) {
  const inputValue = searchBar.value
  // add cancel butten when there is something written
  if (inputValue) {
    addClearButton()
    showList(inputValue)
    if (e.key === 'Enter') {
      window.sendSearchQuery(inputValue)
    }
  } else { // remove cancel button if it exists
    searchGroup.lastChild.id === 'clearSearchButton' && resetSearchbar()
    activeTarget = false
  }
}

/**
 * Show product with route on map and hide last product
 * @param {String} inputValue Searchquery
 */
window.sendSearchQuery = (inputValue) => {
  searchBar.value = inputValue
  removeList()
  product = findProduct(inputValue, userPosition)
  if (product.nan !== 0) {
    activeTarget = true
    if (lastProduct.nan !== 0) {
      lastProduct.hideMarker()
    }
    product.showMarker()
    nearestNode = astar.nearestNode(userPosition)
    astar.search(nearestNode, product.nodeIndex)
    map.fitBounds(astar.polyline.getBounds())
    navigationButton.classList.remove('d-none')
    lastProduct = product
  }
}

/**
 * Add x-Button behind search bar
 */
function addClearButton () {
  if (!document.getElementById('clearSearchButton')) {
    searchGroup.appendChild(clearSearchButton)
    searchGroup.lastChild.addEventListener('click', resetSearchbar)
  }
  searchBar.classList.remove('rounded-end-5')
  searchBar.classList.add('rounded-end-0')
}

function resetSearchbar () {
  searchBar.value = ''
  document.getElementById('clearSearchButton').remove()
  if (lastProduct.nan !== 0) {
    lastProduct.hideMarker()
    astar.hideRoute()
    !navigationButton.classList.contains('d-none') && navigationButton.classList.add('d-none')
  }
  searchBar.classList.remove('rounded-end-0')
  searchBar.classList.add('rounded-end-5')
  removeList()
}

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

function removeList () {
  topControl.childElementCount > 1 && topControl.removeChild(searchList)
}

// --------------------
// Navigation functions
// --------------------

function startNavigation () {
  navigationButton.innerHTML = '<span class="material-symbols-outlined m-1 ms-filled">close</span>'
  navigationButton.classList.remove('btn-primary')
  navigationButton.classList.add('btn-danger')
  searchGroup.classList.add('d-none')

  navigationButton.removeEventListener('click', startNavigation)
  navigationButton.addEventListener('click', stopNavigation)

  direction = astar.getDirection()
  refreshDirections()
  topControl.appendChild(directions)

  if (!isCentered) {
    centerPosition()
  }
  requestSensors()
  activateCompass()
}

function stopNavigation () {
  navigationButton.innerHTML = '<span class="material-symbols-outlined m-1 ms-filled">navigation</span><span class="ms-2 me-2">Starten</span>'
  navigationButton.classList.remove('btn-danger')
  navigationButton.classList.add('btn-primary')
  searchGroup.classList.remove('d-none')

  navigationButton.removeEventListener('click', stopNavigation)
  navigationButton.addEventListener('click', startNavigation)

  topControl.removeChild(directions)

  deactivateCompass()
  map.setBearing(0)
  map.fitBounds(astar.polyline.getBounds())
}

/**
 * Request sensor permission for iOS 13+ devices
 */
function requestSensors () {
  if (
    DeviceOrientationEvent &&
  typeof DeviceOrientationEvent.requestPermission === 'function'
  ) {
    DeviceOrientationEvent.requestPermission()
  }
}

/**
 * Hande the device motion
 * @param {DeviceMotionEvent} event
 */
function handleMotion (event) {
  if (motionArray.length >= motionArrayLength) {
    motionArray.shift()
  }
  motionArray.push([event.acceleration.x, event.acceleration.y, event.acceleration.z])
}

/**
 * Hande the device orientation
 * @param {DeviceOrientationEvent} event
 */
function handleOrientation (event) {
  const bias = 120 // rotation of png
  const orientation = 360 - event.webkitCompassHeading
  map.setBearing(orientation + bias)
  motionArray[motionArray.length - 1].push(event.webkitCompassHeading, event.beta, event.gamma)
  const newPosition = calculatePosition(motionArray, userPosition, bias)
  userPosition = L.latLng(newPosition.lat, newPosition.lng)
  circle.setLatLng(userPosition)
  centerPosition()

  if (activeTarget) {
    const temp = astar.nearestNode(userPosition)
    if (temp !== nearestNode) {
      nearestNode = temp
      astar.search(nearestNode, product.nodeIndex)
      direction = astar.getDirection()
      refreshDirections()
    }
  }
}

/**
 * Change compass symbol based on view (centered / not centered)
 * @param {Event} e
 */
function endOfMapMovement (e) {
  if (typeof compassSymbol !== 'undefined') {
    const mapCenter = map.getCenter()
    const mapPosRounded = { lat: Math.round(mapCenter.lat), lng: Math.round(mapCenter.lng) }
    const userPosRounded = { lat: Math.round(userPosition.lat), lng: Math.round(userPosition.lng) }

    isCentered = _.isEqual(mapPosRounded, userPosRounded)
    if (!isCentered) {
      compassSymbol.classList.contains('ms-filled') && compassSymbol.classList.toggle('ms-filled')
    } else {
      !compassSymbol.classList.contains('ms-filled') && compassSymbol.classList.toggle('ms-filled')
    }
  }
}

/**
 * Center view on userposition
 */
function centerPosition () {
  map.flyTo(userPosition, map.getZoom())
}

/**
 * Toggle Compass on and off
 */
window.toggleCompass = () => {
  if (!isCentered) {
    centerPosition()
    return
  }
  requestSensors()
  if (compass) {
    deactivateCompass()
  } else {
    activateCompass()
  }
}

/**
 * Add eventListener and disable touch rotation
 */
function activateCompass () {
  window.addEventListener('devicemotion', handleMotion)
  window.addEventListener('deviceorientation', handleOrientation)
  map.touchRotate.disable()
  compassSymbol.innerHTML = 'explore'
  compass = true
}

/**
 * Remove eventListener and enable touch rotation
 */
function deactivateCompass () {
  window.removeEventListener('devicemotion', handleMotion)
  window.removeEventListener('deviceorientation', handleOrientation)
  map.touchRotate.enable()
  compassSymbol.innerHTML = 'near_me'
  compass = false
}

// -----------------
// QR code functions
// -----------------

/**
 * Handle scanned code
 * @param {String} decodedText
 * @param {String} decodedResult
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

map.setView(userPosition, 1)
