/* global L */
'use strict'

import 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
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
      this.#cleanNode(node)
    }
    this.dirtyNodes = []
  }

  /**
     * Perform an A* Search on a graph given a start and end node.
     * @param {Node} start Start Node
     * @param {Node} end End Node
     */
  search (start, endIndex) {
    const end = this.graph[endIndex]
    this.#cleanDirty()

    const openList = new BinaryHeap(function (node) {
      return node.previousCost + node.estimatedCost
    })

    start.estimatedCost = this.#heuristic(start, end)
    this.#markDirty(start)

    openList.push(start)

    while (openList.content.length > 0) {
      const currentNode = openList.pop()

      if (currentNode === end) {
        return this.#pathTo(currentNode)
      }

      currentNode.closed = true
      this.#expandNode(currentNode, openList, end)
    }
  }

  /**
   * Check all neighbors and push new or better ones to openList
   * @param {Node} currentNode
   * @param {BinaryHeap} openList
   * @param {Node} end
   */
  #expandNode (currentNode, openList, end) {
    const neighbors = this.getNeighbors(currentNode)

    for (const neighbor of neighbors) {
      if (neighbor.closed) {
        continue
      }
      const linkCost = currentNode.previousCost + this.#heuristic(currentNode, neighbor)

      if (neighbor.visited && linkCost >= neighbor.previousCost) {
        continue
      }

      neighbor.parent = currentNode.index
      neighbor.previousCost = linkCost
      neighbor.estimatedCost = this.#heuristic(neighbor, end)
      if (!neighbor.visited) {
        neighbor.visited = true
        openList.push(neighbor)
      } else {
        openList.reScore(neighbor)
      }
      this.#markDirty(neighbor)
    }
  }

  getNeighbors (node) {
    const result = []

    for (const index of node.links) {
      result.push(this.graph[index])
    }

    return result
  }

  #markDirty (node) {
    this.dirtyNodes.push(node)
  }

  #cleanDirty () {
    for (const node of this.dirtyNodes) {
      this.#cleanNode(node)
    }
    this.dirtyNodes = []
  }

  #cleanNode (node) {
    node.previousCost = 0 // g(x)
    node.estimatedCost = 0 // h(x)
    node.visited = false
    node.closed = false
    node.parent = null
  }

  #heuristic (start, end) {
    return L.point(start.latlng.lat, start.latlng.lng).distanceTo(L.point(end.latlng.lat, end.latlng.lng))
  }

  /**
   * Return Array of path nodes
   * @param {Node} node
   * @returns {Array} path
   */
  #pathTo (node) {
    let curr = node
    const path = []
    path.unshift(curr)
    do {
      curr = this.graph[curr.parent]
      path.unshift(curr)
    } while (curr.parent != null)
    this.#drawRoute(path)
    return path
  }

  #drawRoute (path) {
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

  nearestNode (position) {
    const nearestHeap = new BinaryHeap(function (node) {
      return L.point(position.lat, position.lng).distanceTo(L.point(node.latlng.lat, node.latlng.lng))
    })
    nearestHeap.content = [...this.graph]
    nearestHeap.build()

    return this.graph[nearestHeap.content[0].index]
  }

  getDirection () {
    const points = this.polyline.getLatLngs()
    // Überprüfen, ob es weniger als drei Punkte gibt
    if (points[0].length < 3) {
      return ['sports_score', 'Ziel erreicht']
    }

    // Punkte extrahieren
    const p1 = points[0][0]
    const p2 = points[0][1]
    const p3 = points[0][2]

    // Vektoren berechnen
    const v1 = { x: p2.lng - p1.lng, y: p2.lat - p1.lat }
    const v2 = { x: p3.lng - p2.lng, y: p3.lat - p2.lat }

    // Längen der Vektoren berechnen
    const v1Length = Math.sqrt(v1.x * v1.x + v1.y * v1.y)
    const v2Length = Math.sqrt(v2.x * v2.x + v2.y * v2.y)

    // Skalarprodukt berechnen
    const dotProduct = v1.x * v2.x + v1.y * v2.y

    // Winkel berechnen (in Grad)
    const angle = Math.acos(dotProduct / (v1Length * v2Length)) * (180 / Math.PI)

    // Kreuzprodukt berechnen (um die Richtung zu bestimmen)
    const crossProduct = v1.x * v2.y - v1.y * v2.x

    // Entscheiden, ob gerade, links oder rechts
    if (angle < 45) {
      return ['north', 'Weiter geradeaus']
    } else if (crossProduct > 0) {
      return ['arrow_top_left', 'Links abbiegen']
    } else {
      return ['arrow_top_right', 'Rechts abbiegen']
    }
  }
}
