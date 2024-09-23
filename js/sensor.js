/* global DeviceMotionEvent */

import { kFilter, getGroundAcceleration } from './Position.js'

let orientationArray = new Array(3)
let accelerationArray = new Array(3)
let globalX = 0
let globalY = 0
const lastValues = []

// handleOrientation({ alpha: 69, beta: 32, gamma: 80, webkitCompassHeading: 359 })
// handleMotion()
function handleOrientation (event) {
  orientationArray = addValue([event.webkitCompassHeading, event.beta, event.gamma])
  // orientationArray = addValue([30, 14, 69])
  updateFieldIfNotNull('Orientation_a', event.alpha)
  updateFieldIfNotNull('Orientation_b', event.beta)
  updateFieldIfNotNull('Orientation_g', event.gamma)
  updateFieldIfNotNull('Orientation_compass', event.webkitCompassHeading)
  incrementEventCount()
}

function addValue (newValue) {
  if (lastValues.lengh >= 100) {
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
  accelerationArray = addValue([event.acceleration.x, event.acceleration.y, event.acceleration.z])
  // accelerationArray = addValue([0.2, 0.1, 0.5])
  const acceleration = kFilter(accelerationArray)
  const orientation = kFilter(orientationArray)

  const accel = acceleration[acceleration.length - 1]
  const yaw = orientation[orientation.length - 1][0]
  const pitch = orientation[orientation.length - 1][1]
  const roll = orientation[orientation.length - 1][2]
  const groundAccel = getGroundAcceleration(accel, yaw, pitch, roll)

  if (!isNaN(groundAccel.ax)) {
    globalX += groundAccel.ax
    globalY += groundAccel.ay
  }

  updateFieldIfNotNull('X_position', globalX)
  updateFieldIfNotNull('Y_position', globalY)

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

/*
Light and proximity are not supported anymore by mainstream browsers.
window.addEventListener('devicelight', function(e) {
   document.getElementById("DeviceLight").innerHTML="AmbientLight current Value: "+e.value+" Max: "+e.max+" Min: "+e.min;
});

window.addEventListener('lightlevel', function(e) {
   document.getElementById("Lightlevel").innerHTML="Light level: "+e.value;
});

window.addEventListener('deviceproximity', function(e) {
   document.getElementById("DeviceProximity").innerHTML="DeviceProximity current Value: "+e.value+" Max: "+e.max+" Min: "+e.min;
});

window.addEventListener('userproximity', function(event) {
   document.getElementById("UserProximity").innerHTML="UserProximity: "+event.near;
});
*/
