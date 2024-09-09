'use strict'

import { map, toggleGraphUI, graphUI } from './map.js'

/**
 * Class for nodes
 * @extends L.marker
 */
class Node extends L.marker {
  /**
   * Create a node and a marker
   * @param {LatLng} latlng yx-Coordinates
   */
  constructor(latlng) {
    super(latlng); // Marker
    this.latlng = latlng;
    this.links = [];
    this.index = nodes.length;
    const self = this;
    nodes.push({ latlng, get index() { return self.index; }, get links() { return self.links; } });
    this.on('click', this.clickOnNode);
    this.addTo(map);
  }

  /**
   * Select node as start- or endnode
   * @param {*} e
   */
  clickOnNode = (e) => {
    checkGraphToggle() && checkAB(this);
  };

  /**
   * Create an edge to targetnode
   * @param {Node} target targetnode
   */
  addEdge = (target) => {
    // Write linking nodes into node
    this.links.push(target.index);
    target.links.push(this.index);

    const edge = new L.polyline([this.latlng, target.latlng], { bubblingMouseEvents: false });
    edge.nodeA = this;
    edge.nodeB = target;
    edge.on('click', this.clickOnEdge);
    edge.addTo(map);
  };

  /**
   * Add node to edge
   * @param {*} e
   */
  clickOnEdge = (e) => {
    if (checkGraphToggle()) {
      const edge = e.target;
      // Create new node
      const node = new Node(e.latlng);
      checkAB(node);
      // Create new edge
      node.addEdge(edge.nodeA);
      node.addEdge(edge.nodeB);
      // remove old edge
      let i = edge.nodeA.links.indexOf(edge.nodeB.index);
      edge.nodeA.links.splice(i, 1);
      i = edge.nodeB.links.indexOf(edge.nodeA.index);
      edge.nodeB.links.splice(i, 1);
      edge.remove();
    }
  };
}

// Graph variables
/** startnode */
let nodeA = null
const loadedGraph = await loadJSON()
const nodes = []

/**
 * Check if node is start or end and connect nodes with edge
 *
 * @param {Node} node
 */
function checkAB(node) {
  if (!nodeA) {
    nodeA = node
  } else {
    node.addEdge(nodeA)
    nodeA = null
  }
}

/**
 * Create new node and check for start or end
 * @param {*} e
 */
export function clickOnMap(e) {
  checkGraphToggle() && checkAB(new Node(e.latlng))
}

/**
 * Helper function to check graph toggle and menu
 *
 * @returns true if graph toggle is checked and menu is hidden
 */
function checkGraphToggle() {
  const bsOffcanvas = document.getElementById('offcanvasMenu')
  return (!bsOffcanvas.classList.contains('showing') && toggleGraphUI.checked)
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

// JSON file for download
let textFile = null

/**
 * Create textfile for download
 * @param {*} text
 * @returns {String} URL you can use as a href
 */
function makeTextFile(text) {
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
export async function loadJSON() {
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
function drawGraph(graph) {
  graph.forEach((element) => {
    const node = new Node(element.latlng)
    element.links.forEach((link) => {
      if (link < node.index) {
        node.addEdge(nodes[link])
      }
    })
  })
}
