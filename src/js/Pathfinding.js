/* global L */
'use strict'

import 'leaflet'
import BinaryHeap from './BinaryHeap.js'
import { map } from './map.js'

/**
 * Class for A*-Pathfinding
 */
export default class Astar {
  /**
     * Create a search object
     * @param {Array} graph Array of Nodes
     */
  constructor (graph) {
    this.graph = [...graph]
    for (const node of this.graph) {
      this.cleanNode(node)
    }
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

    start.estimatedCost = this.heuristic(start, end)
    this.markDirty(start)

    openList.push(start)

    while (openList.content.length > 0) {
      const currentNode = openList.pop()

      if (currentNode === end) {
        return this.pathTo(currentNode)
      }

      currentNode.closed = true
      this.expandNode(currentNode, openList, end)
    }
  }

  /**
   * Check all neighbors and push new or better ones to openList
   * @param {Node} currentNode
   * @param {BinaryHeap} openList
   * @param {Node} end
   */
  expandNode (currentNode, openList, end) {
    const neighbors = this.getNeighbors(currentNode)

    for (const neighbor of neighbors) {
      if (neighbor.closed) {
        continue
      }
      const linkCost = currentNode.previousCost + this.heuristic(currentNode, neighbor)

      if (neighbor.visited && linkCost >= neighbor.previousCost) {
        continue
      }

      neighbor.parent = currentNode.index
      neighbor.previousCost = linkCost
      neighbor.estimatedCost = this.heuristic(neighbor, end)
      if (!neighbor.visited) {
        neighbor.visited = true
        openList.push(neighbor)
      } else {
        openList.reScore(neighbor)
      }
      this.markDirty(neighbor)
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

  /**
   * Return Array of path nodes
   * @param {Node} node
   * @returns {Array} path
   */
  pathTo (node) {
    let curr = node
    const path = []
    path.unshift(curr)
    do {
      curr = this.graph[curr.parent]
      path.unshift(curr)
    } while (curr.parent != null)
    this.drawRoute(path)
    return path
  }

  drawRoute (path) {
    this.hideRoute()
    const pathLatLngs = []
    for (const node of path) {
      pathLatLngs.push(node.latlng)
    }
    this.polyline = new L.polyline([pathLatLngs])
    this.polyline.addTo(map)
  }

  hideRoute () {
    if (this.polyline) {
      this.polyline.remove()
    }
  }

  nearestNode (position, graph) {
    const nearestHeap = new BinaryHeap(function (node) {
      return L.point(position.lat, position.lng).distanceTo(L.point(node.latlng.lat, node.latlng.lng))
    })
    nearestHeap.content = [...graph]
    nearestHeap.build()

    return graph[nearestHeap.content[0].index]
  }
}
