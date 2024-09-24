/* global kalmanFilter */
'use strict'

const { KalmanFilter } = kalmanFilter

const magnitudeArrayLength = 5

const position = { lat: 0, lng: 0 }
let lastIndex, xFiltered, yFiltered, zFiltered, magnitude, lastOrientation
const magnitudeArray = []

const stepLength = 10 // Schrittweite in Metern
const stepThreshold = 2

function toRadians (deg) {
  return deg * (Math.PI / 180)
}

function rotateVector (accel, yaw, pitch, roll) {
  const theta = toRadians(yaw)
  const beta = toRadians(pitch)
  const gamma = toRadians(roll)

  // Rotationsmatrix R_yaw
  const R_yaw = [
    [Math.cos(theta), -Math.sin(theta), 0],
    [Math.sin(theta), Math.cos(theta), 0],
    [0, 0, 1]
  ]

  // Rotationsmatrix R_pitch
  const R_pitch = [
    [1, 0, 0],
    [0, Math.cos(beta), -Math.sin(beta)],
    [0, Math.sin(beta), Math.cos(beta)]
  ]

  // Rotationsmatrix R_roll
  const R_roll = [
    [Math.cos(gamma), 0, Math.sin(gamma)],
    [0, 1, 0],
    [-Math.sin(gamma), 0, Math.cos(gamma)]
  ]

  // Multipliziere die Rotationsmatrizen
  const R = multiplyMatrices(multiplyMatrices(R_yaw, R_pitch), R_roll)

  // Beschleunigung in globale Koordinaten umrechnen
  return multiplyMatrixVector(R, accel)
}

function multiplyMatrices (A, B) {
  const result = []
  for (let i = 0; i < A.length; i++) {
    result[i] = []
    for (let j = 0; j < B[0].length; j++) {
      result[i][j] = 0
      for (let k = 0; k < A[0].length; k++) {
        result[i][j] += A[i][k] * B[k][j]
      }
    }
  }
  return result
}

function multiplyMatrixVector (matrix, vector) {
  const result = []
  for (let i = 0; i < matrix.length; i++) {
    result[i] = 0
    for (let j = 0; j < vector.length; j++) {
      result[i] += matrix[i][j] * vector[j]
    }
  }
  return result
}

export function getGroundAcceleration (accel, yaw, pitch, roll) {
  // Berechne die globale Beschleunigung
  const globalAccel = rotateVector(accel, yaw, pitch, roll)

  // Extrahiere die x- und y-Komponenten der globalen Beschleunigung
  const groundAccel = {
    ax: globalAccel[0], // Beschleunigung entlang der globalen x-Achse
    ay: globalAccel[1] // Beschleunigung entlang der globalen y-Achse
  }

  return groundAccel
}

export function kFilter (arr) {
  const kFilter = new KalmanFilter({
    observation: {
      name: 'sensor',
      sensorDimension: 6,
      sensorCovariance: [3, 3, 3, 3, 3, 3]
    },
    dynamic: {
      name: 'constant-speed'
      // covariance: [0.3, 5] // 0.3, 30
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

export function calculatePosition (motionArray, userPosition) {
  position.lat = userPosition.lat
  position.lng = userPosition.lng
  const filteredArrays = kFilter(motionArray).map((element) => [element[0], element[1], element[2], element[3], element[4], element[5]]) // Wende den Filter an

  lastIndex = filteredArrays.length - 1
  xFiltered = filteredArrays[lastIndex][0]
  yFiltered = filteredArrays[lastIndex][1]
  zFiltered = filteredArrays[lastIndex][2]

  lastOrientation = motionArray[lastIndex][3]
  magnitude = Math.sqrt(xFiltered * xFiltered + yFiltered * yFiltered + zFiltered * zFiltered)
  if (magnitudeArray.length >= magnitudeArrayLength) {
    magnitudeArray.shift()
  }
  magnitudeArray.push(magnitude)

  if (detectPeak(magnitudeArray)) {
    updatePosition()
    return position
  }
}

function updatePosition () {
  const directionRad = lastOrientation * (Math.PI / 180)
  position.lat += stepLength * Math.cos(directionRad)
  position.lng += stepLength * Math.sin(directionRad)
}
