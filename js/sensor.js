/* global DeviceMotionEvent */

import { getGroundAcceleration, kFilter } from './Position.js'
import { makeTextFile } from './Graph.js'

const debug = false

const orientationArray = []
const accelerationArray = []
// const downloadArray = [['x', 'y', 'z', 'compass', 'beta', 'gamma', 'x-filter', 'y-filter', 'z-filter', 'compass-filter', 'beta-filter', 'gamma-filter']]

const downloadArray = [['x', 'y', 'z', 'compass', 'beta', 'gamma'], [-0.0114717033094028, 0.00418359669442288, -0.0255740017175674, 0, -0.848926260585234, 0.267244395239223], [-0.0121591056182514, 0.00837291074357926, -0.0342523982137441, 354.748474121093, -0.848929402972943, 0.266889163885687], [-0.00331094661231618, 0.00230272398442029, -0.0162947167187929, 354.748474121093, -0.84942421532424, 0.263277566060056], [0.00260306777101941, -0.000763403854239732, -0.0243733937561511, 354.748474121093, -0.849852910106526, 0.260197824139838], [-0.00258012985342647, -0.00860909411963075, -0.0212310040771961, 354.748474121093, -0.850230007792838, 0.259007269693749], [-0.00445552723729051, -0.00423177408454939, -0.0203279177576303, 354.748474121093, -0.849134693124831, 0.255101348892952], [0.0121951587457442, -0.0126492363559082, -0.0191278943181037, 354.748474121093, -0.849355297214773, 0.250490444265228]]

const globalX = 0
const globalY = 0
const globalAX = 0
const globalAY = 0

function handleOrientation (event) {
  if (debug) {
    // orientationArray = addValue([30, 14, 69], orientationArray)
    // orientationArray = addValue([30, 14, 69], orientationArray)
    downloadArray[downloadArray.length - 1].push(30, 14, 69)
  } else {
    // orientationArray = addValue([event.webkitCompassHeading, event.beta, event.gamma], orientationArray)
    downloadArray[downloadArray.length - 1].push(event.webkitCompassHeading, event.beta, event.gamma)
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
    // downloadArray.push([0.2, 0.1, 0.5])
  } else {
    // accelerationArray = addValue([event.acceleration.x, event.acceleration.y, event.acceleration.z], accelerationArray)
    downloadArray.push([event.acceleration.x, event.acceleration.y, event.acceleration.z])
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

/**
 * Create JSON from nodes array
 */
window.createSensordata = function () {
  const filteredArray = useKalman()
  const csv = filteredArray.map((d) => { return d.join(';') }).join('\n')
  const link = document.getElementById('downloadSensordatalink')
  link.href = makeTextFile(csv)
}

function useKalman () {
  // Hilfsfunktion, um Daten zu extrahieren, den ersten Eintrag zu entfernen und den Filter anzuwenden
  const applyKalmanFilter = (index) => {
    const data = downloadArray.map((dataPoint) => dataPoint[index])
    data.shift() // Entferne den ersten Eintrag
    const result = kFilter(data).map((element) => element[0]) // Wende den Filter an
    return result
  }

  // Liste der Datenindices, die verarbeitet werden sollen
  const dataIndices = [0, 1, 2, 3, 4, 5]

  // Verarbeite alle Datenreihen und wende den Kalman-Filter an
  const filteredArrays = dataIndices.map(applyKalmanFilter)

  // Kombiniere die gefilterten Arrays mit den originalen Daten
  const combinedArray = downloadArray.map((arr, index) => {
    if (index === 0) {
      return arr // Überspringe den ersten Eintrag
    }

    const combined = [...arr]
    filteredArrays.forEach((filteredData) => {
      combined.push(filteredData[index - 1]) // Index - 1 wegen shift()
    })
    return combined
  })

  return combinedArray
}
