/* global kalmanFilter */
'use strict'

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
