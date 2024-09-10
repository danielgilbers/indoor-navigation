'use strict'

export default class BinaryHeap {
  constructor (scoreFunction) {
    this.content = []
    this.scoreFunction = scoreFunction
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
    let min = index
    const calculatedCost = this.scoreFunction(this.content[index])
    console.log('Calculated: ' + calculatedCost)
    if (leftIndex < this.content.length - 1) {
      if (this.scoreFunction(this.content[leftIndex]) < calculatedCost) {
        min = leftIndex
      }
    }
    if (rightIndex < this.content.length - 1) {
      if (this.scoreFunction(this.content[rightIndex]) < calculatedCost) {
        min = rightIndex
      }
    }
    if (min !== index) {
      this.swap(index, min)
      this.siftDown(min)
    }
  }

  build =() => {
    for (let i = (this.content.length - 1) / 2 - 1; i >= 0; i--) {
      this.siftDown(i)
    }
  }
}
