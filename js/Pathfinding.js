/* global L */
'use strict'

import '../node_modules/leaflet/dist/leaflet.js'
import BinaryHeap from './BinaryHeap.js'

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
  search (start, end) {
    this.cleanDirty()

    const openList = new BinaryHeap(function (node) {
      return node.previousCost + node.estimatedCost
    })

    const closestNode = start
    start.estimatedCost = this.heuristic(start, end)
    this.markDirty(start)

    openList.push(start)

    while (openList.content.length > 0) {
      const currentNode = openList.pop()

      if (currentNode === end) {
        return this.pathTo(currentNode)
      }

      currentNode.closed = true

      const neighbors = this.getNeighbors(currentNode)

      for (const neighbor of neighbors) {
        if (neighbor.closed) {
          continue
        }
        const linkCost = currentNode.previousCost + this.heuristic(currentNode, neighbor)

        if (neighbor.visited && linkCost >= neighbor.previousCost) {
          continue
        }

        neighbor.visited = true
        neighbor.parent = currentNode.index
        neighbor.previousCost = linkCost
        neighbor.estimatedCost = this.heuristic(neighbor, end)

        openList.push(neighbor)
        this.markDirty(neighbor)
      }
    }
  }

  getNeighbors (node) {
    const result = []

    for (const index of node.links) {
      result.push(this.graph[index])
    }

    return result
  }

  markDirty (node) {
    this.dirtyNodes.push(node)
  }

  cleanDirty () {
    for (const node of this.dirtyNodes) {
      this.cleanNode(node)
    }
    this.dirtyNodes = []
  }

  cleanNode (node) {
    node.previousCost = 0 // g(x)
    node.estimatedCost = 0 // h(x)
    node.visited = false
    node.closed = false
    node.parent = null
  }

  heuristic (start, end) {
    return L.point(start.latlng.lat, start.latlng.lng).distanceTo(L.point(end.latlng.lat, end.latlng.lng))
  }

  pathTo (node) {
    console.log('Pfad gefunden')
  }
}
