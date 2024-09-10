'use strict'

export default class Astar {
  /**
     *
     * @param {*} graph
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
     * @param {Node} start
     * @param {Node} end
     */
  search = (start, end) => {
    console.log('Suche Weg von ' + start.index + ' nach ' + end.index)
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
    node.calculatedCost = 0 // f(x)
    node.previousCost = 0 // g(x)
    node.estimatedCost = 0 // h(x)
    node.visited = false
    node.closed = false
    node.parent = null
  }
}
