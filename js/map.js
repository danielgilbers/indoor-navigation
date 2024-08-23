'use strict'

import 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
import 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js'

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

/**
 * Class for products
 */
class Product {
  /**
   * Create a product
   * @param {Number} nan 
   * @param {String} name 
   * @param {Number} nodeIndex 
   */
  constructor (nan, name, nodeIndex) {
    this.nan = nan
    this.name = name
    this.nodeIndex = nodeIndex
  }
}

// Graph variables
/** startnode */
let nodeA = null
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
const map = L.map('map', {
  zoomControl: false,
  crs: L.CRS.Simple,
  minZoom: -2
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
  toggleGraphUI.checked && loadJSON() // Load graph data
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
function loadJSON () {
  const loadedGraph = []
  fetch('./map/graph.json')
    .then((response) => response.json())
    .then((jsonFeature) => {
      jsonFeature.forEach((element) => loadedGraph.push(element))
      drawGraph(loadedGraph)
    })
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
    this.container = L.DomUtil.create('div', 'input-group vw-100 pe-3 graphUI')
    this.container.innerHTML =
      '<button class="btn btn-light rounded-start-5 rounded-end-0 lh-1 border-0" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasMenu" aria-controls="offcanvasMenu">' +
      '<span class="material-symbols-outlined">Menu</span>' +
      '</button>' +
      '<input type="text" class="form-control rounded-start-0 rounded-end-5 border-0" placeholder="Suche" aria-label="Search" aria-describedby="addon-wrapping">'

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

// Graph UI elements
const toggleGraphUI = document.getElementById('toggleGraphUI')
const download = document.getElementById('download')
const graphUI = document.getElementsByClassName('graphUI')
// Deactivate click events on map
download.addEventListener('click', function (e) { e.stopPropagation() })

// Remove leaflet link
document.getElementsByClassName('leaflet-control-attribution')[0].remove()

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
  map.panTo(userPosition)
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
