'use strict'

import 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
import 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js'

/**
 * Klasse für Knoten
 * @extends L.marker
 */
class Node extends L.marker {
  /**
   * Erzeugt einen neuen Knoten im Graphen und erstellt einen Marker
   * @param {LatLng} latlng yx-Koordinaten
   */
  constructor (latlng) {
    super(latlng)
    this.latlng = latlng
    this.links = []
    this.index = nodes.length
    const self = this
    nodes.push({ latlng, get index () { return self.index }, get links () { return self.links } })
    this.on('click', this.clickOnNode)
    this.addTo(map)
  }

  /**
   * Bestehenden Knoten übergeben
   * @param {*} e
   */
  clickOnNode = (e) => {
    checkGraphToggle() && checkAB(this)
  }

  /**
   *
   * @param {Node} target Ziel Knoten
   */
  addEdge = (target) => {
    // Nachbarn in jeweilige Knoten schreiben
    this.links.push(target.index)
    target.links.push(this.index)

    const edge = new L.polyline([this.latlng, target.latlng], { bubblingMouseEvents: false })
    edge.nodeA = this
    edge.nodeB = target
    edge.on('click', this.clickOnEdge)
    edge.addTo(map)
  }

  /**
   * Knoten zu Kante hinzufügen
   * @param {*} e
   */
  clickOnEdge = (e) => {
    if (checkGraphToggle()) {
      const edge = e.target
      // neuen Knoten erstellen
      const node = new Node(e.latlng)
      checkAB(node)
      // neue Kanten hinzufügen
      node.addEdge(edge.nodeA)
      node.addEdge(edge.nodeB)
      // alte Kante entfernen
      let i = edge.nodeA.links.indexOf(edge.nodeB.index)
      edge.nodeA.links.splice(i, 1)
      i = edge.nodeB.links.indexOf(edge.nodeA.index)
      edge.nodeB.links.splice(i, 1)
      edge.remove()
    }
  }
}

// Graph Variables
let nodeA = null
const nodes = []
const loadedGraph = []

// JSON File für Download
let textFile = null

// Map Image
const image = './map/Zollstock-Modellv3.png'
const boundy = 280
const boundx = 1366.6
const bounds = [[0, 0], [boundy, boundx]]

let userPosition = L.latLng(100, 645) // Start: 100, 645

// Map erstellen
const map = L.map('map', {
  zoomControl: false,
  crs: L.CRS.Simple,
  minZoom: -2
})

map.on('click', clickOnMap)

// Bild der Karte einbinden und anzeigen
const imageOverlay = L.imageOverlay(image, bounds)
imageOverlay.addTo(map)
map.setView(userPosition, 1)

/**
 * Neuen Knoten erstellen und übergeben
 * @param {*} e
 */
function clickOnMap (e) {
  checkGraphToggle() && checkAB(new Node(e.latlng))
}

/**
 * Helper Function to check Graph Toggle and Menu
 *
 * @returns true if Graph Toggle is checked and Menu is hidden
 */
function checkGraphToggle () {
  const bsOffcanvas = document.getElementById('offcanvasMenu')
  return (!bsOffcanvas.classList.contains('showing') && toggleGraphUI.checked)
}

/**
 * Funktion prüft ob der Knoten Anfang oder Ende der Kante ist und verbindet diese
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

window.closeMenu = function () {
  const bsOffcanvas = bootstrap.Offcanvas.getInstance('#offcanvasMenu')
  bsOffcanvas.hide()
}

window.activateGraphUI = function () {
  toggleGraphUI.checked && loadJSON() // Graphdaten laden
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

window.createJSON = function () {
  const json = JSON.stringify(nodes)
  const link = document.getElementById('downloadlink')
  link.href = makeTextFile(json)
}

function makeTextFile (text) {
  const data = new Blob([text], { type: 'text/plain' })

  // If we are replacing a previously generated file we need to
  // manually revoke the object URL to avoid memory leaks.
  if (textFile !== null) {
    window.URL.revokeObjectURL(textFile)
  }

  textFile = window.URL.createObjectURL(data)

  // returns a URL you can use as a href
  return textFile
}
/**
 * JSON Daten des Graphen laden
 */
function loadJSON () {
  fetch('./map/graph.json')
    .then((response) => response.json())
    .then((jsonFeature) => {
      jsonFeature.forEach((element) => loadedGraph.push(element))
      drawGraph(loadedGraph)
    })
}
/**
 * Geladenen Graphen erstellen
 * @param {Array} graph Knoten des Graphen mit Position und Verbindungen als Array
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

const iconSize = 24
const iconAnchor = iconSize / 2
const positionDot = L.icon({
  iconUrl: './img/position-dot.png',
  iconSize: [iconSize, iconSize],
  iconAnchor: [iconAnchor, iconAnchor]
})

/**
 * Position Circle
 */
const circle = L.marker(userPosition, {
  icon: positionDot
}).addTo(map)

/**
 * Search Bar with Menu Button
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
 * Graph UI - Download- und Upload-Button
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
 * QR Code Button
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

// Graph UI Elements
const toggleGraphUI = document.getElementById('toggleGraphUI')
const download = document.getElementById('download')
const graphUI = document.getElementsByClassName('graphUI')
// Click Event der Map deaktivieren, damit keine Marker gesetzt werden wenn man auf den Button drückt
download.addEventListener('click', function (e) { e.stopPropagation() })

// Entferne Leaflet Link
document.getElementsByClassName('leaflet-control-attribution')[0].remove()

// QR Code Scanner
const scannerModal = new bootstrap.Modal('#qrScannerModal')

function onScanSuccess (decodedText, decodedResult) {
  // handle the scanned code
  console.log(`Code matched = ${decodedText}`, decodedResult)
  const scannedPosition = JSON.parse(decodedText) // QR Code text example: {"lat":55,"lng":500}
  userPosition = L.latLng(scannedPosition.lat, scannedPosition.lng)
  circle.setLatLng(userPosition)
  map.panTo(userPosition)
  scannerModal.hide()
}

function onScanFailure (error) {
  // handle scan failure, usually better to ignore and keep scanning.
  // for example:
  console.warn(`Code scan error = ${error}`)
}

const html5QrcodeScanner = new Html5QrcodeScanner(
  'reader',
  { fps: 10, qrbox: { width: 250, height: 250 } },
  /* verbose= */ false)
html5QrcodeScanner.render(onScanSuccess, onScanFailure)
