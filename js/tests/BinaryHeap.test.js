/* global test, expect */
import BinaryHeap from '../BinaryHeap'

test('swap elements', () => {
  const heap = new BinaryHeap()
  heap.content = [1, 2, 3]
  const swapped = [2, 1, 3]
  heap.swap(0, 1)

  expect(heap.content).toStrictEqual(swapped)
})

test('push', () => {
  const heap = new BinaryHeap(function (node) {
    return node
  })
  heap.content = [23, 1, 6, 19, 14, 18, 8, 24, 15]
  heap.build()
  const newElement = 0
  heap.push(newElement)

  expect(heap.content[0]).toBe(newElement)
})
