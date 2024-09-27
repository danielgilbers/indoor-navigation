/* global kalmanFilter */
'use strict'

const { KalmanFilter } = kalmanFilter

const magnitudeArrayLength = 5
const position = { lat: 0, lng: 0 }
const magnitudeArray = []
const stepLength = 0.7 // Step size in metres
const stepThreshold = 2.3

/**
 * Convert angle to radian
 * @param {*} degrees Angle in degrees
 * @returns Radian
 */
function toRadians (degrees) {
  return degrees * (Math.PI / 180)
}

/**
 * Convert relative acceleration direction to global acceleration direction
 * @param {Number} x 
 * @param {Number} y 
 * @param {Number} z 
 * @param {Number} yaw 
 * @param {Number} pitch 
 * @param {Number} roll 
 * @returns Global acceleration matrix
 */
function rotateAcceleration (x, y, z, yaw, pitch, roll) {
  const theta = toRadians(yaw)
  const beta = toRadians(pitch)
  const gamma = toRadians(roll)

  // Rotation matrix Yaw
  const rYaw = [
    [Math.cos(theta), -Math.sin(theta), 0],
    [Math.sin(theta), Math.cos(theta), 0],
    [0, 0, 1]
  ]

  // Rotation matrix Pitch
  const rPitch = [
    [1, 0, 0],
    [0, Math.cos(beta), -Math.sin(beta)],
    [0, Math.sin(beta), Math.cos(beta)]
  ]

  // Rotation matrix Roll
  const rRoll = [
    [Math.cos(gamma), 0, Math.sin(gamma)],
    [0, 1, 0],
    [-Math.sin(gamma), 0, Math.cos(gamma)]
  ]

  // Acceleration vector [x, y, z]
  const accel = [x, y, z]

  // Multiply the rotation matrices
  const R = multiplyMatrices(multiplyMatrices(rYaw, rPitch), rRoll)

  // Convert acceleration to global coordinates
  return multiplyMatrixAndVector(R, accel)
}

function multiplyMatrices (A, B) {
  const result = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0]
  ]

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      result[i][j] = A[i][0] * B[0][j] + A[i][1] * B[1][j] + A[i][2] * B[2][j]
    }
  }

  return result
}

function multiplyMatrixAndVector (matrix, vector) {
  const result = [0, 0, 0]

  for (let i = 0; i < 3; i++) {
    result[i] = matrix[i][0] * vector[0] + matrix[i][1] * vector[1] + matrix[i][2] * vector[2]
  }

  return result
}

/**
 * Apply Kalman Filter
 * @param {Number[]} arr Array of numbers
 * @returns Filtered Array of numbers
 */
export function kFilter (arr) {
  const kFilter = new KalmanFilter({
    observation: {
      name: 'sensor',
      sensorDimension: 6,
      sensorCovariance: [1, 1, 1, 1, 1, 1]
    },
    dynamic: {
      name: 'constant-speed'
    }
  })
  return kFilter.filterAll(arr)
}

/**
 * Check whether there is a peak in the middle of the last three values
 * @param {Number[]} data Array of numbers
 * @returns true if there is a peak
 */
export function detectPeak (data) {
  const len = data.length
  if (len < 3) return false

  const after = data[len - 1]
  const middle = data[len - 2]
  const before = data[len - 3]

  return (middle > after && middle > before && middle > stepThreshold)
}

/**
 * Calculate new position of user if a step has been detected
 * @param {Number[]} motionArray Array of motion data
 * @param {LatLng} userPosition Current user position
 * @param {Number} bias Rotation bias of map
 * @returns Updated userposition
 */
export function calculatePosition (motionArray, userPosition, bias) {
  position.lat = userPosition.lat
  position.lng = userPosition.lng
  const rotationBias = 360 - bias
  const filteredArrays = kFilter(motionArray)

  const lastIndex = filteredArrays.length - 1
  const [xFiltered, yFiltered, zFiltered] = filteredArrays[lastIndex].slice(0, 3)
  const lastOrientation = motionArray[lastIndex][3] + rotationBias
  // Calculation of magnitude
  const magnitude = Math.sqrt(xFiltered ** 2 + yFiltered ** 2 + zFiltered ** 2)
  if (magnitudeArray.length >= magnitudeArrayLength) {
    magnitudeArray.shift()
  }
  magnitudeArray.push(magnitude)
  // Update position if step is detected
  if (detectPeak(magnitudeArray)) {
    return updatePosition(lastOrientation)
  }
}

/**
 * Update user position based on current orientation
 * @param {Number} lastOrientation Last orientation of user
 * @returns New position of user
 */
function updatePosition (lastOrientation) {
  const directionRad = toRadians(lastOrientation)
  const cosDirection = Math.cos(directionRad)
  const sinDirection = Math.sin(directionRad)
  // Calculate new position
  position.lat += stepLength * cosDirection
  position.lng += stepLength * sinDirection

  return position
}
