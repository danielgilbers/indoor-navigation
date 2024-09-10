/* global DeviceMotionEvent */

function handleOrientation (event) {
  updateFieldIfNotNull('Orientation_a', event.alpha)
  updateFieldIfNotNull('Orientation_b', event.beta)
  updateFieldIfNotNull('Orientation_g', event.gamma)
  updateFieldIfNotNull('Orientation_compass', event.webkitCompassHeading)
  incrementEventCount()
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
