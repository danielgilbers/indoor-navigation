// Map erstellen
const map = L.map('map', {
  crs: L.CRS.Simple,
  minZoom: -1
})
// Bild der Karte einbinden und anzeigen
const boundy = 280
const boundx = 1366.6
const bounds = [[0, 0], [boundy, boundx]]
const image = L.imageOverlay('../map/Zollstock-Modellv1.png', bounds).addTo(map)
map.fitBounds(bounds)

map.on('click', clickOnMap)
let node_A = null; let node_B = null
const nodes = []
let edge

function clickOnMap (e) {
  // Neuen Knoten erstellen und übergeben
  edge = checkAB(addNode(e.latlng), edge)
}

/**
 * Funktion prüft ob der Knoten Anfang oder Ende der Kante ist und verbindet diese
 *
 * @param {node} node
 */
function checkAB (node, edge) {
  if (!node_A) {
    node_A = node
  } else {
    node_B = node
    node_A = addEdge(node_A, node_B)
  }
  if (edge) {
    addEdge(node, edge.node_A)
    addEdge(node, edge.node_B)
  }

  return null
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
 * @param {node} node_A Knoten eins
 * @param {node} node_B Knoten zwei
 * @returns Null um Variable a wieder zu löschen
 */
function addEdge (node_A, node_B) {
  // Nachbarn in jeweilige Knoten schreiben
  node_A.links.push(node_B.index)
  node_B.links.push(node_A.index)

  const k = L.polyline([node_A.yx, node_B.yx])
  k.node_A = node_A
  k.node_B = node_B
  k.on('click', clickOnEdge)
  k.addTo(map)

  return null
}

function clickOnNode (e) {
  // Bestehenden Knoten übergeben
  checkAB(nodes[e.target.index])
}

function clickOnEdge (e) {
  edge = e.target
}
// Save Graph as JSON
const download = document.getElementById('download')
download.addEventListener('click', createJSON)

function createJSON () {
  const json = JSON.stringify(nodes)
  const link = document.getElementById('downloadlink')
  link.href = makeTextFile(json)
}

let textFile = null
var makeTextFile = function (text) {
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

/*
//var line = L.polyline([boundleft, boundright]).addTo(map);
let gridSize = 10
for (let x = 0; x < boundx/gridSize; x++) {
  //L.polyline([L.latLng(0, x*gridSize), L.latLng(boundy,  x*gridSize)]).addTo(map);
  for (let y = 0; y < boundy/gridSize; y++) {
    //L.polyline([L.latLng(y*gridSize, 0), L.latLng(y*gridSize, boundx)]).addTo(map);
    let m = L.marker(L.latLng(y*gridSize,x*gridSize));
    m.on('click', onHoverM)
    m.addTo(map);
  }
}
for (let y = 0; y < boundy/gridSize; y++) {
  //L.polyline([L.latLng(y*gridSize, 0), L.latLng(y*gridSize, boundx)]).addTo(map);
}
*/
/*
const map = L.map('map').setView([50.9058, 6.9348], 17)
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 25,
  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map)
*/

/**
 * Button definieren
 */
L.Control.Button = L.Control.extend({
  onAdd: function (map) {
    this.container = L.DomUtil.create('div')
    this.container.innerHTML =
            '<button class="btn btn-primary text-dark rounded-circle p-2 lh-1" type="button" id="butt">' +
            '<span class="material-symbols-outlined" style="font-variation-settings:\'FILL\' 1; font-size: 30px;">qr_code_scanner</span>' +
            '</button>'

    return this.container
  },

  onRemove: function (map) {

  }
})

L.control.button = function (opts) {
  return new L.Control.Button(opts)
}

L.control.button({ position: 'bottomright' }).addTo(map)

/**
 * GeoJSON Map Layer
 */
/*
let toomLayer = L.geoJSON()

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

fetch('./map/map.geojson')
  .then((response) => response.json())
  .then((geojsonFeature) => {
    toomLayer = L.geoJSON(geojsonFeature, {
      style: myStyle
    })
    toomLayer.addTo(map)
  })

function onZoomLevelChange (e) {
  console.log(map.getZoom())

  toomLayer.setStyle(map.getZoom() < 17 ? nvsbl : myStyle)
}

map.on('zoom', onZoomLevelChange)

*/
/**
 * Image Overlay
 */
/*
var imageUrl = 'https://maps.lib.utexas.edu/maps/historical/newark_nj_1922.jpg',
    imageBounds = [[50.905161614551105, 6.933763722837313], [50.90664496069397, 6.935829109662222]];
L.imageOverlay(imageUrl, imageBounds).addTo(map);
*/
