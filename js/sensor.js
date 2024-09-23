/* global DeviceMotionEvent */

import { kFilter, getGroundAcceleration } from './Position.js'

const debug = false

let orientationArray = []
let accelerationArray = []
let globalX = 0
let globalY = 0
let globalAX = 0
let globalAY = 0

if (debug) {
  handleOrientation({ alpha: 69, beta: 32, gamma: 80, webkitCompassHeading: 359 })
  handleMotion()
}
function handleOrientation (event) {
  if (debug) {
    orientationArray = addValue([30, 14, 69], orientationArray)
    orientationArray = addValue([30, 14, 69], orientationArray)
  } else {
    orientationArray = addValue([event.webkitCompassHeading, event.beta, event.gamma], orientationArray)
  }
  updateFieldIfNotNull('Orientation_a', event.alpha)
  updateFieldIfNotNull('Orientation_b', event.beta)
  updateFieldIfNotNull('Orientation_g', event.gamma)
  updateFieldIfNotNull('Orientation_compass', event.webkitCompassHeading)
  incrementEventCount()
}

function addValue (newValue, lastValues = []) {
  if (lastValues.length >= 200) {
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
    accelerationArray = addValue([0.2, 0.1, 0.5], accelerationArray)
    accelerationArray = addValue([0.2, 0.1, 0.5], accelerationArray)
  } else {
    accelerationArray = addValue([event.acceleration.x, event.acceleration.y, event.acceleration.z], accelerationArray)
  }

  console.log(accelerationArray)
  console.log(orientationArray)

  const acceleration = kFilter(accelerationArray)
  const orientation = kFilter(orientationArray)

  console.log(acceleration)
  console.log(orientation)

  const accel = acceleration[acceleration.length - 1]
  const yaw = orientation[orientation.length - 1][0]
  const pitch = orientation[orientation.length - 1][1]
  const roll = orientation[orientation.length - 1][2]
  const groundAccel = getGroundAcceleration(accel, yaw, pitch, roll)

  if (!isNaN(groundAccel.ax)) {
    const intervall = 0.02
    globalAX = globalAX * intervall + 0.5 * groundAccel.ax * Math.pow(intervall, 2)
    globalAY = globalAY * intervall + 0.5 * groundAccel.ay * Math.pow(intervall, 2)
    globalX = globalX + globalAX * intervall
    globalY = globalY + globalAY * intervall
  }

  updateFieldIfNotNull('X_position', globalX)
  updateFieldIfNotNull('Y_position', globalY)

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
