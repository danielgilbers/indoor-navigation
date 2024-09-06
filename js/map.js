'use strict'

import 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
import 'https://unpkg.com/leaflet-rotate@0.2.8/dist/leaflet-rotate-src.js'
import 'https://unpkg.com/bootstrap@5.3.3/dist/js/bootstrap.min.js'
import { findProduct, searchProducts } from './Products.js'

/**
 * Class for nodes
 * @extends L.marker
 */
class Node extends L.marker {
  /**
   * Create a node and a marker
   * @param {LatLng} latlng yx-Coordinates
   */
  constructor (latlng) {
    super(latlng) // Marker
    this.latlng = latlng
    this.links = []
    this.index = nodes.length
    const self = this
    nodes.push({ latlng, get index () { return self.index }, get links () { return self.links } })
    this.on('click', this.clickOnNode)
    this.addTo(map)
  }

  /**
   * Select node as start- or endnode
   * @param {*} e
   */
  clickOnNode = (e) => {
    checkGraphToggle() && checkAB(this)
  }

  /**
   * Create an edge to targetnode
   * @param {Node} target targetnode
   */
  addEdge = (target) => {
    // Write linking nodes into node
    this.links.push(target.index)
    target.links.push(this.index)

    const edge = new L.polyline([this.latlng, target.latlng], { bubblingMouseEvents: false })
    edge.nodeA = this
    edge.nodeB = target
    edge.on('click', this.clickOnEdge)
    edge.addTo(map)
  }

  /**
   * Add node to edge
   * @param {*} e
   */
  clickOnEdge = (e) => {
    if (checkGraphToggle()) {
      const edge = e.target
      // Create new node
      const node = new Node(e.latlng)
      checkAB(node)
      // Create new edge
      node.addEdge(edge.nodeA)
      node.addEdge(edge.nodeB)
      // remove old edge
      let i = edge.nodeA.links.indexOf(edge.nodeB.index)
      edge.nodeA.links.splice(i, 1)
      i = edge.nodeB.links.indexOf(edge.nodeA.index)
      edge.nodeB.links.splice(i, 1)
      edge.remove()
    }
  }
}

// Graph variables
/** startnode */
let nodeA = null
const loadedGraph = await loadJSON()
const nodes = []

// JSON file for download
let textFile = null

// Map image
const image = './map/Zollstock-Modellv3.png'
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

/**
 * Create new node and check for start or end
 * @param {*} e
 */
function clickOnMap (e) {
  checkGraphToggle() && checkAB(new Node(e.latlng))
}

map.on('click', clickOnMap)

// Add background image to map
const imageOverlay = L.imageOverlay(image, bounds)
imageOverlay.addTo(map)
map.setView(userPosition, 1)

/**
 * Helper function to check graph toggle and menu
 *
 * @returns true if graph toggle is checked and menu is hidden
 */
function checkGraphToggle () {
  const bsOffcanvas = document.getElementById('offcanvasMenu')
  return (!bsOffcanvas.classList.contains('showing') && toggleGraphUI.checked)
}

/**
 * Check if node is start or end and connect nodes with edge
 *
 * @param {Node} node
 */
function checkAB (node) {
  if (!nodeA) {
    nodeA = node
  } else {
    node.addEdge(nodeA)
    nodeA = null
  }
}

/**
 * Close offcanvas menu
 */
window.closeMenu = function () {
  const bsOffcanvas = bootstrap.Offcanvas.getInstance('#offcanvasMenu')
  bsOffcanvas.hide()
}

/**
 * Load graph data if graph toggle is on
 */
window.activateGraphUI = function () {
  toggleGraphUI.checked && drawGraph(loadedGraph) // Load graph data
  if (!toggleGraphUI.checked) {
    nodes.splice(0, nodes.length)
    map.eachLayer(function (layer) {
      (layer.index !== undefined || layer.nodeA !== undefined) && layer.remove()
    })
  }
  for (const element of graphUI) {
    element.classList.toggle('d-none')
  }
}

/**
 * Create JSON from nodes array
 */
window.createJSON = function () {
  const json = JSON.stringify(nodes)
  const link = document.getElementById('downloadlink')
  link.href = makeTextFile(json)
}

/**
 * Create textfile for download
 * @param {*} text
 * @returns {String} URL you can use as a href
 */
function makeTextFile (text) {
  const data = new Blob([text], { type: 'text/plain' })

  // If we are replacing a previously generated file we need to
  // manually revoke the object URL to avoid memory leaks.
  if (textFile !== null) {
    window.URL.revokeObjectURL(textFile)
  }

  textFile = window.URL.createObjectURL(data)

  return textFile
}

/**
 * Load JSON data of graph
 */
export async function loadJSON () {
  const payload = []

  try {
    const response = await fetch('./map/graph.json')
    const jsonFeature = await response.json()
    jsonFeature.forEach((element) => payload.push(element))
    return payload
  } catch (error) {
    console.error('Fehler beim Laden der JSON-Daten:', error)
  }
}

/**
 * Create nodes and edges of graph on map
 * @param {Array} graph Array of node data
 */
function drawGraph (graph) {
  graph.forEach((element) => {
    const node = new Node(element.latlng)
    element.links.forEach((link) => {
      if (link < node.index) {
        node.addEdge(nodes[link])
      }
    })
  })
}

// Position dot icon
const iconSize = 24
const iconAnchor = iconSize / 2
const positionDot = L.icon({
  iconUrl: './img/position-dot.png',
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
    sendSearchQuery(inputValue)
  }
})

/**
 * Show product on map and hide last product
 * @param {String} inputValue Searchquery
 */
window.sendSearchQuery = (inputValue) => {
  const product = findProduct(inputValue)
  if (product) {
    if (lastProduct) {
      lastProduct.hidePosition()
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

window.findProduct = findProduct

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
const toggleGraphUI = document.getElementById('toggleGraphUI')
const download = document.getElementById('download')
const graphUI = document.getElementsByClassName('graphUI')
// Deactivate click events on map
download.addEventListener('click', function (e) { e.stopPropagation() })

// Remove leaflet link
document.getElementsByClassName('leaflet-control-attribution')[0].remove()
document.getElementsByClassName('leaflet-control-rotate')[0].remove()

// QR Code scanner
const scannerModal = new bootstrap.Modal('#qrScannerModal')

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
