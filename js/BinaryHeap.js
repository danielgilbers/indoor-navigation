'use strict'

/**
 * Class for BinaryHeap with heapsort function
 */
export default class BinaryHeap {
  /**
   * Create Binary Heap
   * @param {Function} scoreFunction
   */
  constructor (scoreFunction) {
    this.content = []
    this.scoreFunction = scoreFunction
  }

  /**
   * Get index of left and right child
   * @param {Number} parentIndex
   * @returns {Array} Indices of left and right child
   */
  #childIndices (parentIndex) {
    const leftChild = (parentIndex << 1) | 1 // Bit-Shifting: 2 * parentIndex + 1
    return [leftChild, leftChild + 1]
  }

  /**
   * Get index of parent
   * @param {Number} childIndex
   * @returns {Number} Index of parent
   */
  #parentIndex (childIndex) {
    return (childIndex - 1) >> 1 // Bit-Shifting: (childindex - 1) / 2
  }

  /**
   * Swap values of two elements
   * @param {Number} x Index of first element
   * @param {Number} y Index of second element
   */
  swap (x, y) {
    [this.content[x], this.content[y]] = [this.content[y], this.content[x]]
  }

  /**
   * Sift high values down
   * @param {Number} index
   * @param {Number} size
   */
  #siftDown (index, size) {
    const [leftIndex, rightIndex] = this.#childIndices(index)
    let min = index

    if (leftIndex < size && this.scoreFunction(this.content[leftIndex]) < this.scoreFunction(this.content[min])) {
      min = leftIndex
    }
    if (rightIndex < size && this.scoreFunction(this.content[rightIndex]) < this.scoreFunction(this.content[min])) {
      min = rightIndex
    }
    if (min !== index) {
      this.swap(index, min)
      this.#siftDown(min, size)
    }
  }

  /**
   * Build up heap from last parent up to the root
   */
  build () {
    for (let i = ((this.content.length - 1) >> 1); i >= 0; i--) {
      this.#siftDown(i, this.content.length)
    }
  }

  /**
   * Decrease value and let it bubble up
   * @param {Number} index Index of element to change
   * @param {Object} newNode Value of element to change
   */
  #decrease (index, newNode) {
    this.content[index] = newNode
    let parentIndex = this.#parentIndex(index)
    while (index > 0 && this.scoreFunction(this.content[index]) < this.scoreFunction(this.content[parentIndex])) {
      this.swap(index, parentIndex)
      index = parentIndex
      parentIndex = this.#parentIndex(index)
    }
  }

  /**
   * Adds object to content array
   * @param {Object} node
   */
  push (node) {
    this.content.push(node)
    this.#decrease(this.content.length - 1, node)
  }
}
