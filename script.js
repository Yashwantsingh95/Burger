// Elements
const canvas = document.getElementById('burger-canvas');
const context = canvas.getContext('2d');

const particleCanvas = document.getElementById('particles-canvas');
const particleContext = particleCanvas.getContext('2d');

const loader = document.getElementById('loader');
const loaderPercentage = document.getElementById('loader-percentage');
const loaderBar = document.getElementById('loader-bar');

const cursorDot = document.querySelector('.cursor-dot');
const cursorOutline = document.querySelector('.cursor-outline');

const parallaxText = document.getElementById('parallax-text');
const hotspotsContainer = document.getElementById('hotspots-container');

// Settings
const frameCount = 240;
const currentFrame = index => `ezgif-frame-${index.toString().padStart(3, '0')}.jpg`;

// Resize canvases
function resizeCanvases() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    particleCanvas.width = window.innerWidth;
    particleCanvas.height = window.innerHeight;
}
resizeCanvases();
window.addEventListener('resize', resizeCanvases);

// ====================
// PRELOADER & BURGER DRAWING
// ====================
const images = [];
let imagesLoaded = 0;

for (let i = 1; i <= frameCount; i++) {
  const img = new Image();
  img.src = currentFrame(i);
  images.push(img);
  img.onload = () => {
    imagesLoaded++;
    
    // Update Loader UI
    const percent = Math.floor((imagesLoaded / frameCount) * 100);
    loaderPercentage.innerText = percent + "%";
    loaderBar.style.width = percent + "%";
    
    if(imagesLoaded === 1) {
        drawImageScaled(images[0], context);
    }
    
    if(imagesLoaded === frameCount) {
        // All loaded, hide loader
        setTimeout(() => {
            loader.classList.add('hidden');
        }, 500);
    }
  };
}

function drawImageScaled(img, ctx) {
    var canvas = ctx.canvas;
    var hRatio = canvas.width / img.width;
    var vRatio = canvas.height / img.height;
    var ratio  = Math.max(hRatio, vRatio);
    var centerShift_x = (canvas.width - img.width * ratio) / 2;
    var centerShift_y = (canvas.height - img.height * ratio) / 2;  
    ctx.clearRect(0,0,canvas.width, canvas.height);
    ctx.drawImage(img, 0,0, img.width, img.height,
                      centerShift_x,centerShift_y,img.width*ratio, img.height*ratio);  
}

// ====================
// CUSTOM CURSOR
// ====================
let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;
let outlineX = mouseX;
let outlineY = mouseY;

window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

// Interactive elements hover state
document.querySelectorAll('.interactive, .hotspot-dot').forEach(el => {
    el.addEventListener('mouseenter', () => cursorOutline.classList.add('hovering'));
    el.addEventListener('mouseleave', () => cursorOutline.classList.remove('hovering'));
});

// ====================
// PARTICLE SYSTEM (EMBERS)
// ====================
const particles = [];
const particleCount = 50;

class Particle {
    constructor() {
        this.reset();
    }
    reset() {
        this.x = Math.random() * particleCanvas.width;
        this.y = particleCanvas.height + Math.random() * 200;
        this.size = Math.random() * 3 + 1;
        this.speedY = Math.random() * -1 - 0.5;
        this.speedX = (Math.random() - 0.5) * 1;
        this.opacity = Math.random() * 0.5 + 0.1;
    }
    update() {
        this.y += this.speedY;
        this.x += this.speedX;
        if(this.y < -10) {
            this.reset();
        }
    }
    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(212, 175, 55, ${this.opacity})`; // Gold/Ember color
        ctx.fill();
    }
}

for(let i=0; i<particleCount; i++) {
    particles.push(new Particle());
}

// ====================
// MAIN ANIMATION LOOP
// ====================
function loop() {
    // Cursor Lerp
    outlineX += (mouseX - outlineX) * 0.15;
    outlineY += (mouseY - outlineY) * 0.15;
    
    cursorDot.style.left = `${mouseX}px`;
    cursorDot.style.top = `${mouseY}px`;
    cursorOutline.style.left = `${outlineX}px`;
    cursorOutline.style.top = `${outlineY}px`;

    // Draw Particles
    particleContext.clearRect(0,0,particleCanvas.width, particleCanvas.height);
    particles.forEach(p => {
        p.update();
        p.draw(particleContext);
    });

    requestAnimationFrame(loop);
}
loop();

// ====================
// SCROLL LOGIC
// ====================
window.addEventListener('scroll', () => {  
  const scrollTop = document.documentElement.scrollTop;
  const maxScrollTop = document.documentElement.scrollHeight - window.innerHeight;
  const scrollFraction = scrollTop / maxScrollTop;
  
  // 1. Map to Burger Frame
  const frameIndex = Math.min(
    frameCount - 1,
    Math.floor(scrollFraction * frameCount)
  );
  if (images[frameIndex] && images[frameIndex].complete) {
      drawImageScaled(images[frameIndex], context);
  }

  // 2. Parallax Text
  // Moves from 0 to -200px (or similar) based on scroll
  const parallaxOffset = scrollFraction * 300;
  parallaxText.style.transform = `translate(-50%, calc(-50% - ${parallaxOffset}px))`;

  // 3. Dynamic Lighting Shift
  // From #000000 to a warm very dark burgundy #1a0a05
  // We'll interpolate RGB values
  const r = Math.floor(scrollFraction * 26); // 0 to 26
  const g = Math.floor(scrollFraction * 10); // 0 to 10
  const b = Math.floor(scrollFraction * 5);  // 0 to 5
  document.documentElement.style.setProperty('--ambient-color', `rgb(${r}, ${g}, ${b})`);

  // 4. Hotspots (show at the very bottom)
  if (scrollFraction > 0.95) {
      hotspotsContainer.classList.add('active');
  } else {
      hotspotsContainer.classList.remove('active');
  }
});

// ====================
// INTERSECTION OBSERVER
// ====================
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.5
};

const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if(entry.isIntersecting) {
            entry.target.querySelector('.glass-card').classList.add('visible');
        } else {
            entry.target.querySelector('.glass-card').classList.remove('visible');
        }
    });
}, observerOptions);

document.querySelectorAll('.step').forEach(step => {
    observer.observe(step);
});
