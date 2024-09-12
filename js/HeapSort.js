'use strict'

/**
 * Class for Heapsort
 */
export default class HeapSort {
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
   * Swap values of two elements
   * @param {Number} x Index of first element
   * @param {Number} y Index of second element
   */
  swap (x, y) {
    [this.content[x], this.content[y]] = [this.content[y], this.content[x]]
  }

  /**
   * Sift low values down
   * @param {Number} index
   * @param {Number} size
   */
  #siftDown (index, size) {
    const [leftIndex, rightIndex] = this.#childIndices(index)
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
}
