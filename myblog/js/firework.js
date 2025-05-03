 // 初始化canvas
 const canvas = document.getElementById('fireworks-canvas');
 const ctx = canvas.getContext('2d');

 // 设置canvas尺寸
 function resizeCanvas() {
     canvas.width = window.innerWidth;
     canvas.height = window.innerHeight;
 }
 window.addEventListener('resize', resizeCanvas);
 resizeCanvas();

 class Particle {
     constructor(x, y, color) {
         this.x = x;
         this.y = y;
         this.color = color;
         this.radius = Math.random() * 2 + 1;
         this.velocity = {
             x: (Math.random() - 0.5) * 5,
             y: (Math.random() - 0.5) * 5
         };
         this.alpha = 1;
         this.gravity = 0.03;
     }

     draw() {
         ctx.save();
         ctx.globalAlpha = this.alpha;
         ctx.beginPath();
         ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
         ctx.fillStyle = this.color;
         ctx.fill();
         ctx.restore();
     }

     update() {
         this.velocity.y += this.gravity;
         this.x += this.velocity.x;
         this.y += this.velocity.y;
         this.alpha -= 0.01;
         this.draw();
     }
 }

 class Firework {
     constructor(x, y) {
         this.particles = [];
         this.color = `hsl(${Math.random() * 360}, 50%, 50%)`;
         
         for(let i = 0; i < 50; i++) {
             this.particles.push(new Particle(x, y, this.color));
         }
     }

     update() {
         this.particles.forEach((particle, index) => {
             if(particle.alpha <= 0) {
                 this.particles.splice(index, 1);
             } else {
                 particle.update();
             }
         });
     }
 }

 const fireworks = [];

 // 鼠标点击事件监听
 window.addEventListener('click', (e) => {
     fireworks.push(new Firework(e.clientX, e.clientY));
 });

 // 动画循环
 function animate() {
     ctx.clearRect(0, 0, canvas.width, canvas.height);
     
     fireworks.forEach((firework, index) => {
         firework.update();
         if(firework.particles.length === 0) {
             fireworks.splice(index, 1);
         }
     });
     
     requestAnimationFrame(animate);
 }

 animate();