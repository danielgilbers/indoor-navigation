'use strict'

export default class BinaryHeap {
  constructor (scoreFunction) {
    this.content = []
    this.scoreFunction = scoreFunction
  }

  #leftIndex = (parentIndex) => {
    return 2 * parentIndex + 1
  }

  #rightIndex = (parentIndex) => {
    return 2 * parentIndex + 2
  }

  swap (x, y) {
    [this.content[x], this.content[y]] = [this.content[y], this.content[x]]
  }

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

  #build () {
    for (let i = ((this.content.length - 1) >> 1); i >= 0; i--) {
      this.#siftDown(i, this.content.length)
    }
  }

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
