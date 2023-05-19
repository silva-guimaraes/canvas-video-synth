var canvas = document.getElementById("main");
canvas.height = canvas.getBoundingClientRect().height / 4;
canvas.width = canvas.getBoundingClientRect().width / 4;

var ctx = canvas.getContext("2d");
var canvas_data = ctx.getImageData(0, 0, canvas.width, canvas.height);

// That's how you define the value of a pixel
function drawPixel (x, y, r, g, b, a) {
    var timeex = (x + y * canvas.width) * 4;

    canvas_data.data[timeex + 0] += r;
    canvas_data.data[timeex + 1] += g;
    canvas_data.data[timeex + 2] += b;
    canvas_data.data[timeex + 3] += a;
}

// That's how you update the canvas, so that your
// modification are taken in consideration
function update_canvas() {
    ctx.putImageData(canvas_data, 0, 0);
}

function noise() {
    for (let i = 0; i < canvas.width; i++) {
        for (let j = 0; j < canvas.height; j++) {
            let r = Math.floor(Math.random() * 255);
            let g = Math.floor(Math.random() * 255);
            let b = Math.floor(Math.random() * 255);
            drawPixel(i, j, r, g, b, 255);
        }
    }
}

function blank() {
    for (let i = 0; i < canvas.width; i++) {
        for (let j = 0; j < canvas.height; j++) {
            drawPixel(i, j, 0, 0, 0, 255);
        }
    }
}

const RED = 0;
const GREEN = 1;
const BLUE = 2;
const ALPHA = 3;

function sine_wave(arr, time, amount, channel, wavelen, phase) {
    wavelen = 1 / wavelen;
    for (let i = 0; i < amount; i += 4) {
        const sine_result = Math.sin(time++ * wavelen + phase);
        const normalized_value = Math.round(((sine_result + 1) / 2) * 255);
        arr[i + channel] += normalized_value;
        arr[i + ALPHA] = 255;
    }
    return time;
}

function triangle_wave(arr, channel, wavelength, phase) {
  const halfPeriod = Math.floor(wavelength / 2);

  for (let i = 0; i < arr.length; i += 4) {
    const scaledtimeex = (i + phase) % wavelength;
    const triangleResult = scaledtimeex <= halfPeriod ? scaledtimeex : wavelength - scaledtimeex;
    const normalizedValue = Math.round((triangleResult / halfPeriod) * 255);
    arr[i + channel] += normalizedValue;
    arr[i + ALPHA] = 255;
  }
}

function square_wave(arr, channel, n) {
    for (let i = 0; i < arr.length; i += 4) {
        arr[i + channel] += (i % n) * 255 ;
        arr[i + ALPHA] = 255;
    }
}

function shift_elements_right(arr, n) {
    const len = arr.length;
    const shift_amount = (n * 4) % len;

    if (shift_amount === 0) {
        return;
    }

    // Create a temporary array to store the shifted elements
    const tempArray = new Uint8ClampedArray(shift_amount);
    for (let i = 0; i < shift_amount; i++) {
        tempArray[i] = arr[len - shift_amount + i];
    }

    // Shift the remaining elements to the right
    for (let i = len - 1; i >= shift_amount; i--) {
        arr[i] = arr[i - shift_amount];
    }

    for (let i = 0; i < shift_amount; i++) arr[i] = 0;
    return shift_amount
}


const tube_size = canvas.width * canvas.height;
const update_interval = 10; // milliseconds
const line_rate = 40;

let speed_slider = document.getElementById("speed");
let speed = 2500;
// speed_slider.oninput = function () { // fixme: line feed fica todo preto
//     speed = this.value
// }


function start() {
    blank();
    let time = 0;

    return setInterval(() => {
        let deficit = shift_elements_right(canvas_data.data, (tube_size * line_rate) / update_interval + speed);
        // console.log(deficit);
        sine_wave(canvas_data.data, time, deficit, RED,     250000,    1);
        sine_wave(canvas_data.data, time, deficit, GREEN,   250000,    2);
        sine_wave(canvas_data.data, time, deficit, BLUE,    250000,    3);

        time += deficit / 4; // overflow!
        update_canvas();
    }, update_interval);
}

// sine_wave(canvas_data.data, BLUE,   .03,    3);
// sine_wave(canvas_data.data, RED,    .3,     3);

let synth = start();
