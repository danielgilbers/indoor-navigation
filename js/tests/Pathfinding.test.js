/* global test, expect */
import Astar from '../Pathfinding'

test('heuristic', () => {
  const graph = []
  const astar = new Astar(graph)
  const start = { latlng: { lat: 0, lng: 0 } }
  const end = { latlng: { lat: 1, lng: 0 } }
  expect(astar.heuristic(start, end)).toBe(1)
})
