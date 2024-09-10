/* global test, expect */
import BinaryHeap from '../BinaryHeap'

test('swap elements', () => {
  const heap = new BinaryHeap()
  heap.content = [1, 2, 3]
  heap.swap(0, 1)

  expect(heap.content[0]).toBe(2)
  expect(heap.content[1]).toBe(1)
  expect(heap.content[2]).toBe(3)
})

test('sift down', () => {
  const heap = new BinaryHeap(function (node) {
    return node
  })
  heap.content = [1, 2, 0]
  const sorted = [0, 1, 2]
  console.log(heap.content)
  heap.build()
  console.log(heap.content)

  expect(heap.content).toStrictEqual(sorted)
})
