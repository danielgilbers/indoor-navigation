'use strict'

import BinaryHeap from './BinaryHeap.js'

// import 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'

/**
 * Class for A*-Pathfinding
 */
export default class Astar {
  /**
     * Create a search object
     * @param {Array} graph Array of Nodes
     */
  constructor (graph) {
    for (const node of graph) {
      this.cleanNode(node)
    }
    this.graph = graph
    this.dirtyNodes = []
  }

  /**
     * Perform an A* Search on a graph given a start and end node.
     * @param {Node} start Start Node
     * @param {Node} end End Node
     */
  search = (start, end) => {
    console.log('Suche Weg von ' + start.index + ' nach ' + end.index)
    this.cleanDirty()

    const openHeap = new BinaryHeap()

    const closestNode = start
    start.estimatedCost = this.heuristic(start, end)
  }

  markDirty = (node) => {
    this.dirtyNodes.push(node)
  }

  cleanDirty = () => {
    for (const node of this.dirtyNodes) {
      this.cleanNode(node)
    }
    this.dirtyNodes = []
  }

  cleanNode = (node) => {
    node.previousCost = 0 // g(x)
    node.estimatedCost = 0 // h(x)
    node.calculatedCost = () => {
      return this.previousCost + this.estimatedCost
    }
    node.visited = false
    node.closed = false
    node.parent = null
  }

  heuristic = (start, end) => {
    return L.point(start.latlng).distanceTo(L.point(end.latlng))
  }
}
