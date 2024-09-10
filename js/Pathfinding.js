'use strict'

import 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'

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

class BinaryHeap {
  constructor () {
    this.content = []
  }

  leftIndex = (parentIndex) => {
    return 2 * parentIndex + 1
  }

  rightIndex = (parentIndex) => {
    return 2 * parentIndex + 2
  }

  swap = (x, y) => {
    /*
    let temp = this.content[x]
    this.content[x] = this.content[y]
    this.content[y] = temp
    */
    [this.content[x], this.content[y]] = [this.content[y], this.content[x]]
  }

  siftDown = (index) => {
    const leftIndex = this.leftIndex(index)
    const rightIndex = this.rightIndex(index)
    let min = this.content[index]

    if (leftIndex < this.content.length - 1) {
      const calculatedCost = this.content[index].calculatedCost()
      if (this.content[leftIndex].calculatedCost() < calculatedCost) {
        min = leftIndex
      }
    }
    if (rightIndex < this.content.length - 1) {
      if (this.content[rightIndex].calculatedCost() < calculatedCost) {
        min = rightIndex
      }
    }
    if (min !== index) {
      this.swap(index, min)
      this.siftDown(min)
    }
  }
}
