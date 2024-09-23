'use strict'

import { KalmanFilter } from 'https://unpkg.com/kalman-filter@2.3.0/index.js'

export function rotationMatrix (event) {
  const rotationMatrix = [] // ???

  return rotationMatrix
}

export function kalmanFilter (arr) {
  const kFilter = new KalmanFilter()
  const res = kFilter.filterAll(arr)
  return res
}
