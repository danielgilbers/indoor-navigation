/* global DeviceMotionEvent */

import { getGroundAcceleration, KalmanFilter } from './Position.js'
import { makeTextFile } from './Graph.js'

const debug = false

const orientationArray = []
const accelerationArray = []
const downloadArray = [['x', 'y', 'z', 'compass', 'beta', 'gamma']]
const globalX = 0
const globalY = 0
const globalAX = 0
const globalAY = 0
const position = { x: 0, y: 0 }

// Beispielaufruf
const dt = 0.1 // Zeitintervall (z.B. 100 ms)
const processNoise = 0.01 // Prozessrauschen
const measurementNoise = 0.01 // Messrauschen
const estimationError = 0.01 // Anfangsfehlerabschätzung

const kalman = new KalmanFilter(dt, processNoise, measurementNoise, estimationError)

if (debug) {
  handleMotion()
  handleOrientation({ alpha: 69, beta: 32, gamma: 80, webkitCompassHeading: 359 })
}
function handleOrientation (event) {
  if (debug) {
    // orientationArray = addValue([30, 14, 69], orientationArray)
    // orientationArray = addValue([30, 14, 69], orientationArray)
    orientationArray.push([30, 14, 69])
    orientationArray.push([30, 14, 69])
  } else {
    // orientationArray = addValue([event.webkitCompassHeading, event.beta, event.gamma], orientationArray)
    downloadArray[downloadArray.length - 1].push(event.webkitCompassHeading.toFixed(4), event.beta.toFixed(4), event.gamma.toFixed(4))
  }
  updateFieldIfNotNull('Orientation_a', event.alpha)
  updateFieldIfNotNull('Orientation_b', event.beta)
  updateFieldIfNotNull('Orientation_g', event.gamma)
  updateFieldIfNotNull('Orientation_compass', event.webkitCompassHeading)
  incrementEventCount()
}

function addValue (newValue, lastValues = []) {
  if (lastValues.length >= 500) {
    lastValues.shift()
  }
  lastValues.push(newValue)
  return lastValues
}

function incrementEventCount () {
  const counterElement = document.getElementById('num-observed-events')
  const eventCount = parseInt(counterElement.innerHTML)
  counterElement.innerHTML = eventCount + 1
}

function updateFieldIfNotNull (fieldName, value, precision = 10) {
  if (value != null) { document.getElementById(fieldName).innerHTML = value.toFixed(precision) }
}

function handleMotion (event) {
  if (debug) {
    // accelerationArray = addValue([0.2, 0.1, 0.5], accelerationArray)
    // accelerationArray = addValue([0.2, 0.1, 0.5], accelerationArray)
    accelerationArray.push([0.2, 0.1, 0.5])
    accelerationArray.push([0.2, 0.1, 0.5])
  } else {
    // accelerationArray = addValue([event.acceleration.x, event.acceleration.y, event.acceleration.z], accelerationArray)
    downloadArray.push([event.acceleration.x.toFixed(4), event.acceleration.y.toFixed(4), event.acceleration.z.toFixed(4)])
  }

  // const acceleration = kFilter(accelerationArray)
  // const orientation = kFilter(orientationArray)

  /*
  const accel = acceleration[acceleration.length - 1]
  const yaw = orientation[orientation.length - 1][0]
  const pitch = orientation[orientation.length - 1][1]
  const roll = orientation[orientation.length - 1][2]

  const accel = accelerationArray[accelerationArray.length - 1]
  const yaw = orientationArray[orientationArray.length - 1][0]
  const pitch = orientationArray[orientationArray.length - 1][1]
  const roll = orientationArray[orientationArray.length - 1][2]
  const groundAccel = getGroundAcceleration(accel, yaw, pitch, roll)

  if (!isNaN(groundAccel.ax)) {
    const intervall = 0.02

    // Beispiel: Sensordaten verwenden
    position = updateKalmanFilter(groundAccel.ax, groundAccel.ay)

    globalAX = globalAX + groundAccel.ax * intervall
    globalAY = globalAY + groundAccel.ay * intervall
    globalX = globalX + globalAX * intervall + 0.5 * groundAccel.ax * Math.pow(intervall, 2)
    globalY = globalY + globalAY * intervall + 0.5 * groundAccel.ay * Math.pow(intervall, 2)
  }

  updateFieldIfNotNull('X_position', position.x)
  updateFieldIfNotNull('Y_position', position.y)
  */
  if (!debug) {
    updateFieldIfNotNull('Accelerometer_gx', event.accelerationIncludingGravity.x)
    updateFieldIfNotNull('Accelerometer_gy', event.accelerationIncludingGravity.y)
    updateFieldIfNotNull('Accelerometer_gz', event.accelerationIncludingGravity.z)

    updateFieldIfNotNull('Accelerometer_x', event.acceleration.x)
    updateFieldIfNotNull('Accelerometer_y', event.acceleration.y)
    updateFieldIfNotNull('Accelerometer_z', event.acceleration.z)

    updateFieldIfNotNull('Accelerometer_i', event.interval, 2)

    updateFieldIfNotNull('Gyroscope_z', event.rotationRate.alpha)
    updateFieldIfNotNull('Gyroscope_x', event.rotationRate.beta)
    updateFieldIfNotNull('Gyroscope_y', event.rotationRate.gamma)
  }
  incrementEventCount()
}

let isRunning = false
const demoButton = document.getElementById('start_demo')
demoButton.onclick = function (e) {
  e.preventDefault()

  // Request permission for iOS 13+ devices
  if (
    DeviceMotionEvent &&
    typeof DeviceMotionEvent.requestPermission === 'function'
  ) {
    DeviceMotionEvent.requestPermission()
  }

  if (isRunning) {
    window.removeEventListener('devicemotion', handleMotion)
    window.removeEventListener('deviceorientation', handleOrientation)
    demoButton.innerHTML = 'Start demo'
    demoButton.classList.add('btn-success')
    demoButton.classList.remove('btn-danger')
    isRunning = false
  } else {
    window.addEventListener('devicemotion', handleMotion)
    window.addEventListener('deviceorientation', handleOrientation)
    document.getElementById('start_demo').innerHTML = 'Stop demo'
    demoButton.classList.remove('btn-success')
    demoButton.classList.add('btn-danger')
    isRunning = true
  }
}

// In der Schleife, wo du deine Sensoren liest:
function updateKalmanFilter (ax, ay) {
  kalman.predict()
  kalman.update(ax, ay)
  const position = kalman.getPosition()
  console.log(`Position: x=${position.x}, y=${position.y}`)
  return position
}

/**
 * Create JSON from nodes array
 */
window.createSensordata = function () {
  const csv = downloadArray.map((d) => { return d.join(';') }).join('\n')
  const link = document.getElementById('downloadSensordatalink')
  link.href = makeTextFile(csv)
}
