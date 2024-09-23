/* global kalmanFilter */
'use strict'

// const { KalmanFilter } = kalmanFilter

function toRadians (deg) {
  return deg * (Math.PI / 180)
}

export function rotateVector (accel, yaw, pitch, roll) {
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
    observation: 3
  })
  const res = kFilter.filterAll(arr)
  return res
}

export class KalmanFilter {
  constructor (dt, processNoise, measurementNoise, estimationError) {
    this.dt = dt // Zeitintervall zwischen Messungen

    // Zustandsvariablen (Position und Geschwindigkeit)
    this.x = 0 // Position in x-Richtung
    this.y = 0 // Position in y-Richtung
    this.vx = 0 // Geschwindigkeit in x-Richtung
    this.vy = 0 // Geschwindigkeit in y-Richtung

    // Kovarianzmatrix (Unsicherheit in Zuständen)
    this.P = [
      [1, 0, 0, 0], // Unsicherheit in x, vx, y, vy
      [0, 1, 0, 0],
      [0, 0, 1, 0],
      [0, 0, 0, 1]
    ]

    // Prozessrauschen (Modellunsicherheit)
    this.Q = [
      [processNoise, 0, 0, 0],
      [0, processNoise, 0, 0],
      [0, 0, processNoise, 0],
      [0, 0, 0, processNoise]
    ]

    // Messrauschen (Unsicherheit in den Sensorwerten)
    this.R = [
      [measurementNoise, 0],
      [0, measurementNoise]
    ]

    // Messung
    this.Z = [0, 0] // Aktuelle Messwerte (Beschleunigung in x und y)

    // Unsicherheit im Zustand
    this.estimationError = estimationError
  }

  predict () {
    // Vorhersage der neuen Position basierend auf der Geschwindigkeit
    this.x += this.vx * this.dt + 0.5 * this.Z[0] * this.dt * this.dt // Position = alte Position + Geschwindigkeit * Zeit + 0.5 * Beschleunigung * Zeit^2
    this.y += this.vy * this.dt + 0.5 * this.Z[1] * this.dt * this.dt

    // Geschwindigkeit aktualisieren (basierend auf der Beschleunigung)
    this.vx += this.Z[0] * this.dt
    this.vy += this.Z[1] * this.dt

    // Unsicherheit der Vorhersage erhöhen (Prozessrauschen hinzufügen)
    this.P[0][0] += this.Q[0][0]
    this.P[1][1] += this.Q[1][1]
    this.P[2][2] += this.Q[2][2]
    this.P[3][3] += this.Q[3][3]
  }

  update (ax, ay) {
    // Messung aktualisieren
    this.Z[0] = ax // Aktuelle Beschleunigung in x-Richtung
    this.Z[1] = ay // Aktuelle Beschleunigung in y-Richtung

    // Kalman Gain berechnen
    const S = [
      [this.P[0][0] + this.R[0][0], 0],
      [0, this.P[2][2] + this.R[1][1]]
    ]

    const K = [
      [this.P[0][0] / S[0][0], 0],
      [this.P[1][1] / S[0][0], 0],
      [0, this.P[2][2] / S[1][1]],
      [0, this.P[3][3] / S[1][1]]
    ]

    // Zustandsvariablen aktualisieren basierend auf den neuen Messungen
    this.x += K[0][0] * (ax - this.vx)
    this.vx += K[1][0] * (ax - this.vx)
    this.y += K[2][1] * (ay - this.vy)
    this.vy += K[3][1] * (ay - this.vy)

    // Kovarianzmatrix aktualisieren
    this.P[0][0] *= (1 - K[0][0])
    this.P[1][1] *= (1 - K[1][0])
    this.P[2][2] *= (1 - K[2][1])
    this.P[3][3] *= (1 - K[3][1])
  }

  getPosition () {
    return { x: this.x, y: this.y }
  }
}
