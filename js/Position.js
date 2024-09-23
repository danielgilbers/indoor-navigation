/* global kalmanFilter */
'use strict'

import './kalman-filter.min.js'

const { KalmanFilter } = kalmanFilter

export function rotationMatrix (event) {
  const rotationMatrix = [] // ???

  return rotationMatrix
}

export function kFilter (arr) {
  const kFilter = new KalmanFilter()
  const res = kFilter.filterAll(arr)
  return res
}
