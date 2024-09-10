'use strict'

export default class BinaryHeap {
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
