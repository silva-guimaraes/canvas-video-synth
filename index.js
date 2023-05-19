var canvas = document.getElementById("main");
canvas.height = canvas.getBoundingClientRect().height / 4;
canvas.width = canvas.getBoundingClientRect().width / 4;

var ctx = canvas.getContext("2d");
var canvas_data = ctx.getImageData(0, 0, canvas.width, canvas.height);
var time = 0;
const tube_size = canvas.width * canvas.height;
const update_interval = 10; // milliseconds
const line_rate = 40;
let speed_slider = document.getElementById("speed");
let speed = 2500;
// speed_slider.oninput = function () { // fixme: line feed fica todo preto
//     speed = this.value
// }

function drawPixel (x, y, r, g, b, a) {
    var timeex = (x + y * canvas.width) * 4;

    canvas_data.data[timeex + 0] += r;
    canvas_data.data[timeex + 1] += g;
    canvas_data.data[timeex + 2] += b;
    canvas_data.data[timeex + 3] += a;
}

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

function sine_wave(amount, channel, wavelen, phase) {
    wavelen = 1 / wavelen;
    let index = time;
    let temp_array = new Uint8ClampedArray(amount);

    for (let i = 0; i < amount; i += 4) {
        const sine_result = Math.sin(index++ * wavelen + phase);
        const normalized_value = Math.round(((sine_result + 1) / 2) * 255);
        temp_array[i + channel] += normalized_value;
        temp_array[i + ALPHA] = 255;
    }
    return temp_array;
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

function shift_elements_right(shift_amount, output) {
    const len = canvas_data.data.length;
    if (shift_amount === 0) {
        return;
    }

    // Create a temporary array to store the shifted elements
    const temp_array = new Uint8ClampedArray(shift_amount);
    for (let i = 0; i < shift_amount; i++) {
        temp_array[i] = canvas_data.data[len - shift_amount + i];
    }

    // Shift the remaining elements to the right
    for (let i = len - 1; i >= shift_amount; i--) {
        canvas_data.data[i] = canvas_data.data[i - shift_amount];
    }

    for (let i = 0; i < shift_amount; i++) 
        canvas_data.data[i] = output[i];
}



function add(a, b) {

    if (a.length != b.length)
        throw new Error("a.length != b.length");

    let ret = new Uint8ClampedArray(a.length);
    for (let i = 0; i < ret.length; i++) {
        ret[i] = a[i] + b[i];
    }
    return ret;
}

function start() {
    blank();

    return setInterval(() => {
        const len = canvas_data.data.length;
        const n = (tube_size * line_rate) / update_interval + speed;
        const shift_amount = (n * 4) % len;

        let red = sine_wave(shift_amount, RED,      250000,     1);
        let green = sine_wave(shift_amount, GREEN,  250000,     2);
        let blue = sine_wave(shift_amount, BLUE,   250000,      3);

        shift_elements_right(shift_amount, add(red, add(green, blue)));

        time += shift_amount / 4; // overflow!
            console.log(time);
        update_canvas();
    }, update_interval);
}

// sine_wave(canvas_data.data, BLUE,   .03,    3);
// sine_wave(canvas_data.data, RED,    .3,     3);

let synth = start();
