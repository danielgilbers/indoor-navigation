const map = L.map('map', {
  crs: L.CRS.Simple,
  minZoom: -1
})

const boundy = 280
const boundx = 1366.6
const bounds = [[0, 0], [boundy, boundx]]
const image = L.imageOverlay('../map/Zollstock-Modellv1.png', bounds).addTo(map)
map.fitBounds(bounds)
map.on('click', onClickMap)

let a; let b = L.latLng()

let nodes = []

function onClickMap (e) {
  // set node and add neighbor
  if (!a || b) {
    a = addNode(e.latlng)
    b = L.latLng()
  } else {
    b = addNode(e.latlng)
    a = addEdge(a, b)
  }
}

function addNode (point) {
  const n = L.marker(point)
  n.on('click', onClickMarker)
  n.addTo(map)

  n.id = nodes.push({xy: point}) - 1
  console.log(n)
  console.log(nodes)
  return point
}

function addEdge (a, b) {
  const k = L.polyline([a, b])
  k.on('click', onClickEdge)
  k.addTo(map)
  a = L.latLng()

  return a
}

function onClickMarker (e) {
  if (!a) {
    a = e.latlng
    b = L.latLng()
  } else {
    b = e.latlng
    a = addEdge(a, b)
  }
}

function onClickEdge (e) {
  console.log(e)
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
            '<button class="btn btn-primary text-dark rounded-circle p-2 lh-1" type="button">' +
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
