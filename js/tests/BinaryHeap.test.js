import BinaryHeap from '../BinaryHeap'

test('swap elements', () => {
  const heap = new BinaryHeap()
  heap.content = [1, 2, 3]
  heap.swap(0, 1)

  expect(heap.content[0]).toBe(2)
  expect(heap.content[1]).toBe(1)
  expect(heap.content[2]).toBe(3)
})
