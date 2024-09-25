/* global kalmanFilter */
'use strict'

const { KalmanFilter } = kalmanFilter

const magnitudeArrayLength = 5
const position = { lat: 0, lng: 0 }
const magnitudeArray = []
const stepLength = 0.7 // Schrittweite in Metern
const stepThreshold = 2.3

/**
 * Konvertiere Winkel in Radiant
 * @param {*} degrees Winkel in Grad
 * @returns Radiant
 */
function toRadians (degrees) {
  return degrees * (Math.PI / 180)
}

function rotateAcceleration (x, y, z, yaw, pitch, roll) {
  const theta = toRadians(yaw)
  const beta = toRadians(pitch)
  const gamma = toRadians(roll)

  // Rotationsmatrix Yaw
  const rYaw = [
    [Math.cos(theta), -Math.sin(theta), 0],
    [Math.sin(theta), Math.cos(theta), 0],
    [0, 0, 1]
  ]

  // Rotationsmatrix Pitch
  const rPitch = [
    [1, 0, 0],
    [0, Math.cos(beta), -Math.sin(beta)],
    [0, Math.sin(beta), Math.cos(beta)]
  ]

  // Rotationsmatrix Roll
  const rRoll = [
    [Math.cos(gamma), 0, Math.sin(gamma)],
    [0, 1, 0],
    [-Math.sin(gamma), 0, Math.cos(gamma)]
  ]

  // Beschleunigungsvektor [x, y, z]
  const accel = [x, y, z]

  // Multipliziere die Rotationsmatrizen
  const R = multiplyMatrices(multiplyMatrices(rYaw, rPitch), rRoll)

  // Beschleunigung in globale Koordinaten umrechnen
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

export function kFilter (arr) {
  const kFilter = new KalmanFilter({
    observation: {
      name: 'sensor',
      sensorDimension: 6,
      sensorCovariance: [1, 1, 1, 1, 1, 1]
    },
    dynamic: {
      name: 'constant-speed'
      // covariance: [0.1, 0.5]
    }
  })
  const res = kFilter.filterAll(arr)
  return res
}

export function detectPeak (data) {
  const len = data.length
  if (len < 3) return false

  const last = data[len - 1]
  const beforeLast = data[len - 2]
  const twoBeforeLast = data[len - 3]

  // Prüfe, ob es einen Peak gibt (der mittlere Wert ist größer als die umliegenden)
  return (beforeLast > last && beforeLast > twoBeforeLast && beforeLast > stepThreshold)
}

export function calculatePosition (motionArray, userPosition, bias) {
  const rotationBias = 360 - bias
  position.lat = userPosition.lat
  position.lng = userPosition.lng
  const filteredArrays = kFilter(motionArray)

  const lastIndex = filteredArrays.length - 1
  const [xFiltered, yFiltered, zFiltered] = filteredArrays[lastIndex].slice(0, 3)

  const lastOrientation = motionArray[lastIndex][3] + rotationBias
  const magnitude = Math.sqrt(xFiltered ** 2 + yFiltered ** 2 + zFiltered ** 2)
  if (magnitudeArray.length >= magnitudeArrayLength) {
    magnitudeArray.shift()
  }
  magnitudeArray.push(magnitude)

  if (detectPeak(magnitudeArray)) {
    return updatePosition(lastOrientation)
  }
}

function updatePosition (lastOrientation) {
  const directionRad = toRadians(lastOrientation)
  const cosDirection = Math.cos(directionRad)
  const sinDirection = Math.sin(directionRad)

  position.lat += stepLength * cosDirection
  position.lng += stepLength * sinDirection

  return position
}
