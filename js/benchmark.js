'use strict'

/**
 * Benchmark
 * @param {String} name Name of benchmark
 * @param {Function} benchFn Function to benchmark
 * @param {Number} iterations Iterations to walk through function
 * @returns Object with min, max and average ms
 */
export async function bench (name, benchFn, iterations = 500) {
  const options = {}
  options.warmupIterations = iterations
  options.iterations = iterations

  for (let i = 0; i < options.warmupIterations; i++) {
    await benchFn()
  }

  const runs = []

  for (let i = 0; i < options.iterations; i++) {
    const start = performance.now()
    await benchFn()
    runs.push(performance.now() - start)
  }

  return {
    name,
    origin: window.location.href,
    n: options.iterations,
    runs,
    min: Math.min(...runs),
    max: Math.max(...runs),
    avg: runs.reduce((sum, currentValue) => sum + currentValue, 0) / runs.length
  }
}
