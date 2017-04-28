var Clock = function (canvas) {
  var dip = (num) => {
    return (num / 194) * this.radius
  }
  this.targetWidth = canvas.width;
  this.targetHeight = canvas.height;
  this.canvas = canvas;
  this.context = canvas.getContext('2d')
  this.calculateRadius = (() => {
    return Math.min(this.canvas.width, this.canvas.height) * .4;
  });
  this.radius = this.calculateRadius();
  let context = this.context;


  this.frame = function () {
    context.beginPath();
    context.strokeStyle = 'white'
    context.lineWidth = dip(4);
    context.arc(this.canvas.width / 2, this.canvas.height / 2, this.radius, 0, Math.PI * 2, true); // Outer circle
    context.stroke();

    context.beginPath();
    context.lineWidth = dip(2);
    context.arc(this.canvas.width / 2, this.canvas.height / 2, this.radius * .025, 0, Math.PI * 2, true); // Outer circle
    context.stroke();
  }

  this.ticks = function () {
    doTicks = (count, radmod, posmod) => {
      for (let i = 0; i < count; i++) {

        let t = 2.0 * Math.PI * i / count;
        let r = this.radius;
        let x = r * Math.cos(t);
        let y = r * Math.sin(t);

        context.translate(this.canvas.width / 2, this.canvas.height / 2);
        context.beginPath();
        context.moveTo(x * posmod, y * posmod);
        context.lineTo(x * radmod, y * radmod);
        context.stroke()
        context.translate(-this.canvas.width / 2, -this.canvas.height / 2);
      }
    }
    var fives = true;
    var ones = true;

    if (fives) {
      context.lineWidth = dip(2);
      doTicks(12, .9, 1)
    }

    if (ones) {
      context.lineWidth = dip(1);
      doTicks(60, .9, .95)
    }
  }

  this.hands = function () {
    let doHand = (max, callback, radmod, posmod) => {
      let t = 2.0 * Math.PI * ((callback.call(this) - (max * .25)) / max);
      let r = this.radius;
      let x = r * Math.cos(t);
      let y = r * Math.sin(t);

      context.translate(this.canvas.width / 2, this.canvas.height / 2);
      context.beginPath();
      context.moveTo(x * posmod, y * posmod);
      context.lineTo(x * radmod, y * radmod);
      context.stroke()
      context.translate(-this.canvas.width / 2, -this.canvas.height / 2);
    }

    const dt = new Date();

    let sec = (dt.getSeconds() * 1000) + (dt.getMilliseconds())
    let min = (dt.getMinutes() * 60) + (dt.getSeconds())
    let hour = (dt.getHours() * 60) + (dt.getMinutes())

    context.lineWidth = dip(2);
    doHand(60 * 1000, () => sec, 1.05, 0.1);

    context.lineWidth = dip(3);
    doHand(60 * 60, () => min, .95, .1);

    context.lineWidth = dip(4);
    doHand(12 * 60, () => hour, .2, .8);
  }

  this.draw = function () {
    context.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.frame();
    this.ticks();
    this.hands();
  }

  return this;
}

const clock = new Clock(document.getElementsByTagName('canvas')[0])

function animate() {
  clock.draw();
  requestAnimationFrame(animate);
}

animate();

let ev = function (e) {
  let ar = clock.targetWidth / clock.targetHeight;
  clock.canvas.width = window.innerWidth;
  clock.canvas.height = window.innerWidth * ar;
  clock.radius = clock.calculateRadius();
}

window.addEventListener('resize', ev);

ev();