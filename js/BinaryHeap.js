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
   * Get index of left child
   * @param {Number} parentIndex
   * @returns {Number} Index of left child
   */
  #leftIndex (parentIndex) {
    return 2 * parentIndex + 1
  }

  /**
   * Get index of right child
   * @param {Number} parentIndex
   * @returns {Number} Index of right child
   */
  #rightIndex (parentIndex) {
    return 2 * parentIndex + 2
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
   * Sift high values up to the root
   * @param {Number} index
   * @param {Number} size
   */
  #siftDown (index, size) {
    const leftIndex = this.#leftIndex(index)
    const rightIndex = this.#rightIndex(index)
    let max = index

    if (leftIndex < size && this.scoreFunction(this.content[leftIndex]) > this.scoreFunction(this.content[max])) {
      max = leftIndex
    }
    if (rightIndex < size && this.scoreFunction(this.content[rightIndex]) > this.scoreFunction(this.content[max])) {
      max = rightIndex
    }
    if (max !== index) {
      this.swap(index, max)
      this.#siftDown(max, size)
    }
  }

  /**
   * Build up heap from last parent up to the root
   */
  #build () {
    for (let i = ((this.content.length - 1) >> 1); i >= 0; i--) {
      this.#siftDown(i, this.content.length)
    }
  }

  /**
   * Sort content from lowest to highest value
   */
  sort () {
    this.#build()
    let size = this.content.length
    while (size > 1) {
      this.swap(0, size - 1)
      size--
      this.#siftDown(0, size)
    }
  }

  /**
   * Adds object to content array
   * @param {Object} node
   */
  push (node) {
    this.content.push(node)
    this.#siftDown(this.content.length - 1, this.content.length)
  }
}
