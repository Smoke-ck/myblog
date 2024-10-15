document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.querySelector("#stars");
  const context = canvas.getContext("2d");
  canvas.width = innerWidth;
  canvas.height = innerHeight;

  let stars = {};
  let starIndex = 0;
  let numStars = 0;
  let speed = 0.2;
  let starsToDraw = 100;

  class MovingStar {
    constructor() {
      this.x = canvas.width / 2;
      this.y = canvas.height / 2;

      this.velocityX = Math.random() * 10 - 5;
      this.velocityY = Math.random() * 10 - 5;

      let start = canvas.width > canvas.height ? canvas.width : canvas.height;

      this.x += this.velocityX * start / 10;
      this.y += this.velocityY * start / 10;

      this.width = 1;
      this.heigth = 1;
      this.radius = 1;

      starIndex++;
      this.id = starIndex;

      stars[starIndex] = this;
    }

    render() {
      this.x += this.velocityX;
      this.y += this.velocityY;

      this.velocityX += this.velocityX / (50 / speed);
      this.velocityY += this.velocityY / (50 / speed);

      this.width += 0.01 * speed;
      this.heigth += 0.01 * speed;

      if (this.x + this.width < 0 || this.x > canvas.width || this.y + this.heigth < 0 || this.y > canvas.height) {
        delete stars[this.id];
        numStars--;
      }

      context.beginPath();
      context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
      context.fillStyle = "#ffffff";
      context.fill();
      context.closePath();
    }
  }

  (function move() {
    window.requestAnimationFrame(move);
    context.fillStyle = "rgba(0, 0, 0, 1)";
    context.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = numStars; i < starsToDraw; i++) {
      new MovingStar();
      numStars++;
    }

    for (let star in stars) {
      stars[star].render();
    }
  })();
});
