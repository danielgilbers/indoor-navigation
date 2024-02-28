// Graph UI Elements
const toggleGraphUI = document.getElementById('toggleGraphUI')
const download = document.getElementById('download')
const upload = document.getElementById('upload')
const graphUI = document.getElementsByClassName('graphUI')
// Graph Variables
let nodeA = null
let nodeB = null
const nodes = []
let edge
// JSON File für Download
let textFile = null
// Map Image
const image = '../map/Zollstock-Modellv1.png'
const boundy = 280
const boundx = 1366.6
const bounds = [[0, 0], [boundy, boundx]]

// Map erstellen
const map = L.map('map', {
  zoomControl: false,
  crs: L.CRS.Simple,
  minZoom: -1
})

map.on('click', clickOnMap)

// Bild der Karte einbinden und anzeigen
L.imageOverlay(image, bounds).addTo(map)
map.fitBounds(bounds)

function clickOnMap (e) {
  if (checkGraphToggle()) {
    // Neuen Knoten erstellen und übergeben
    edge = checkAB(addNode(e.latlng), edge)
  }
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
 * @param {node} node
 */
function checkAB (node, edge) {
  if (!nodeA) {
    nodeA = node
  } else {
    nodeB = node
    nodeA = addEdge(nodeA, nodeB)
  }
  if (edge) {
    removeLink(edge)
    addEdge(node, edge.nodeA)
    addEdge(node, edge.nodeB)
  }

  return null
}

/**
 * Entfernt Verbindung aus beiden Knoten
 *
 * @param {*} edge
 */
function removeLink (edge) {
  let i = edge.nodeA.links.indexOf(edge.nodeB.index)
  edge.nodeA.links.splice(i, 1)
  i = edge.nodeB.links.indexOf(edge.nodeA.index)
  edge.nodeB.links.splice(i, 1)
}

/**
 * Erzeugt einen neuen Knoten im Graphen und erstellt einen Marker
 *
 * @param {LatLng} latlng yx-Koordinaten
 * @returns Knoten
 */
function addNode (latlng) {
  const node = { yx: latlng, links: [] }

  const n = L.marker(node.yx)
  node.index = nodes.push(node) - 1 // Knoten dem Knoten-Array hinzufügen
  n.index = node.index
  n.on('click', clickOnNode)
  n.addTo(map)

  return node
}

/**
 * Erzeugt eine neue Kante im Graphen und erstellt eine Linie
 *
 * @param {node} nodeA Knoten eins
 * @param {node} nodeB Knoten zwei
 * @returns Null um Variable a wieder zu löschen
 */
function addEdge (nodeA, nodeB) {
  // Nachbarn in jeweilige Knoten schreiben
  nodeA.links.push(nodeB.index)
  nodeB.links.push(nodeA.index)

  const k = L.polyline([nodeA.yx, nodeB.yx])
  k.nodeA = nodeA
  k.nodeB = nodeB
  k.on('click', clickOnEdge)
  k.addTo(map)

  return null
}

function clickOnNode (e) {
  if (checkGraphToggle()) {
  // Bestehenden Knoten übergeben
    checkAB(nodes[e.target.index])
  }
}

function clickOnEdge (e) {
  if (checkGraphToggle()) {
    edge = e.target
    e.target.remove()
  }
}

function createJSON () {
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

function loadJSON () {
  fetch('./map/graph.json')
    .then((response) => response.json())
    .then((jsonFeature) => {
      jsonFeature.forEach((element) => nodes.push(element))
      drawGraph()
    })
}

function drawGraph () {
  nodes.forEach((node) => {
    L.marker(node.yx).addTo(map)
    node.links.forEach((nodeB) => {
      L.polyline([node.yx, nodes[nodeB].yx]).addTo(map)
    })
  })
}

/**
 * Position Circle
 */
const circle = L.circle([50.9058, 6.9348], {
  color: 'white',
  fillColor: 'blue',
  fillOpacity: 1,
  radius: 2
}).addTo(map)

/**
 * Search Bar with Menu Button
 */
L.Control.Search = L.Control.extend({
  onAdd: function () {
    this.container = L.DomUtil.create('div', 'input-group vw-100 pe-3')
    this.container.innerHTML =
              '<button class="btn btn-light rounded-start-5 rounded-start-0 lh-1 border-0" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasMenu" aria-controls="offcanvasMenu">' +
              '<span class="material-symbols-outlined" id="addon-wrapping">Menu</span>' +
              '</button>' +
              '<input type="text" class="graphUI form-control rounded-start-0 rounded-end-5 border-0" placeholder="Suche" aria-label="Search" aria-describedby="addon-wrapping">'

    return this.container
  }

})

new L.Control.Search({ position: 'topleft' }).addTo(map)

/**
 * QR Code Button
 */
L.Control.QRButton = L.Control.extend({
  onAdd: function () {
    this.container = L.DomUtil.create('div')
    this.container.innerHTML =
            '<button class="btn btn-primary text-dark rounded-circle p-2 lh-1 graphUI" type="button" id="qrCode">' +
            '<span class="material-symbols-outlined" style="font-variation-settings:\'FILL\' 1; font-size: 30px;">qr_code_scanner</span>' +
            '</button>'

    return this.container
  }
})

new L.Control.QRButton({ position: 'bottomright' }).addTo(map)

/**
 * Graph UI - Download- und Upload-Button
 */
L.Control.GraphButtons = L.Control.extend({
  onAdd: function () {
    this.container = L.DomUtil.create('div')
    this.container.innerHTML =
            '<button class="graphUI btn btn-primary text-dark rounded-start-5 rounded-end-0 lh-1 d-none" type="button" id="download" data-bs-toggle="modal" data-bs-target="#downloadModal" onclick="createJSON()">' +
            '<span class="material-symbols-outlined">download</span>' +
            '</button>' +
            '<button class="graphUI btn btn-primary text-dark rounded-start-0 rounded-end-5 lh-1 d-none" type="button" id="upload" onclick="loadJSON()">' +
            '<span class="material-symbols-outlined">upload</span>' +
            '</button>'

    return this.container
  }
})

new L.Control.GraphButtons({ position: 'bottomright' }).addTo(map)

/**
 * GeoJSON Map Layer
 */
/*
const myStyle = {
  color: '#ff0000',
  weight: 1,
  opacity: 1,
  fillOpacity: 0.4
}
const nvsbl = {
  opacity: 0,
  fillOpacity: 0
}

function onZoomLevelChange (e) {
  console.log(map.getZoom())

  toomLayer.setStyle(map.getZoom() < 17 ? nvsbl : myStyle)
}

map.on('zoom', onZoomLevelChange)
*/

function closeMenu () {
  const bsOffcanvas = bootstrap.Offcanvas.getInstance('#offcanvasMenu')
  bsOffcanvas.hide()
}

function activateGraphUI () {
  for (let i = 0; i < graphUI.length; i++) {
    graphUI[i].classList.toggle('d-none')
  }
}
