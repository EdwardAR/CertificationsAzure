(function(){
  'use strict';

  const canvas = document.getElementById('bg-canvas');
  const ctx = canvas.getContext('2d');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let particles = [];
  let width = 0;
  let height = 0;

  function resize(){
    const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * ratio);
    canvas.height = Math.floor(height * ratio);
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  function initParticles(count){
    particles = Array.from({length: count}, function(){
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 1.5 + .35,
        vx: (Math.random() - .5) * .18,
        vy: (Math.random() - .5) * .18,
        alpha: Math.random() * .45 + .08
      };
    });
  }

  function drawParticles(){
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#06101c';
    ctx.fillRect(0, 0, width, height);
    for(const particle of particles){
      if(!reducedMotion){
        particle.x += particle.vx;
        particle.y += particle.vy;
        if(particle.x < -10) particle.x = width + 10;
        if(particle.x > width + 10) particle.x = -10;
        if(particle.y < -10) particle.y = height + 10;
        if(particle.y > height + 10) particle.y = -10;
      }
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(104,218,255,' + particle.alpha + ')';
      ctx.fill();
    }
    ctx.strokeStyle = 'rgba(80,190,240,.07)';
    ctx.lineWidth = 1;
    for(let i = 0; i < particles.length; i++){
      for(let j = i + 1; j < particles.length; j++){
        const a = particles[i];
        const b = particles[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if(distance < 105){
          ctx.globalAlpha = 1 - distance / 105;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }
    ctx.globalAlpha = 1;
    if(!reducedMotion) requestAnimationFrame(drawParticles);
  }

  resize();
  initParticles(reducedMotion ? 45 : 78);
  window.addEventListener('resize', function(){ resize(); initParticles(reducedMotion ? 45 : 78); });
  requestAnimationFrame(drawParticles);

  const slides = Array.from(document.querySelectorAll('.slide'));
  const total = slides.length;
  const counterEl = document.getElementById('counter');
  const progressEl = document.getElementById('progress');
  const dotsEl = document.getElementById('dots');
  let index = 0;
  let previousIndex = -1;

  slides.forEach(function(slide, slideIndex){
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'dot' + (slideIndex === 0 ? ' active' : '');
    dot.title = slide.dataset.label || ('Diapositiva ' + (slideIndex + 1));
    dot.setAttribute('aria-label', 'Ir a ' + (slide.dataset.label || ('diapositiva ' + (slideIndex + 1))));
    dot.addEventListener('click', function(){ goTo(slideIndex); });
    dotsEl.appendChild(dot);
  });
  const dots = Array.from(dotsEl.children);

  function animateCounters(slide){
    slide.querySelectorAll('[data-count]').forEach(function(element){
      const target = Number(element.dataset.count);
      if(reducedMotion){ element.textContent = target; return; }
      const start = performance.now();
      function tick(now){
        const progress = Math.min(1, (now - start) / 950);
        const eased = 1 - Math.pow(1 - progress, 3);
        element.textContent = Math.round(target * eased);
        if(progress < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    });
  }

  function render(){
    slides.forEach(function(slide, slideIndex){
      slide.classList.remove('active', 'prevslide');
      if(slideIndex === index) slide.classList.add('active');
      else if(slideIndex === previousIndex) slide.classList.add('prevslide');
    });
    const active = slides[index];
    const themeAccents = {
      azure: 'var(--blue-bright)',
      data: 'var(--data-bright)',
      ai: '#f4b654',
      github: 'var(--github-accent)',
      compare: '#d8a85d',
      roadmap: '#7de0bd',
      resources: '#f5c76b'
    };
    document.documentElement.style.setProperty('--accent', themeAccents[active.dataset.theme] || 'var(--blue-bright)');
    progressEl.style.width = (((index + 1) / total) * 100) + '%';
    counterEl.textContent = (index + 1) + ' / ' + total;
    dots.forEach(function(dot, dotIndex){ dot.classList.toggle('active', dotIndex === index); });
    animateCounters(active);
  }

  function goTo(nextIndex){
    previousIndex = index;
    index = Math.max(0, Math.min(total - 1, nextIndex));
    render();
  }

  document.getElementById('next').addEventListener('click', function(){ goTo(index + 1); });
  document.getElementById('prev').addEventListener('click', function(){ goTo(index - 1); });
  document.getElementById('fs').addEventListener('click', function(){
    if(!document.fullscreenElement) document.documentElement.requestFullscreen();
    else document.exitFullscreen();
  });

  window.addEventListener('keydown', function(event){
    if(['ArrowRight','PageDown',' '].includes(event.key)){ event.preventDefault(); goTo(index + 1); }
    if(['ArrowLeft','PageUp'].includes(event.key)){ event.preventDefault(); goTo(index - 1); }
    if(event.key === 'Home') goTo(0);
    if(event.key === 'End') goTo(total - 1);
    if(event.key.toLowerCase() === 'f'){
      if(!document.fullscreenElement) document.documentElement.requestFullscreen();
      else document.exitFullscreen();
    }
  });

  window.addEventListener('pointermove', function(event){
    if(reducedMotion) return;
    const x = event.clientX / window.innerWidth;
    const y = event.clientY / window.innerHeight;
    document.documentElement.style.setProperty('--mx', (x * 100).toFixed(1) + '%');
    document.documentElement.style.setProperty('--my', (y * 100).toFixed(1) + '%');
    document.querySelector('.ambient-one').style.transform = 'translate(' + ((x - .5) * 22).toFixed(1) + 'px,' + ((y - .5) * 22).toFixed(1) + 'px)';
    document.querySelector('.ambient-two').style.transform = 'translate(' + ((.5 - x) * 16).toFixed(1) + 'px,' + ((.5 - y) * 16).toFixed(1) + 'px)';
  });

  document.addEventListener('pointermove', function(event){
    if(reducedMotion) return;
    const card = event.target.closest('.card, .focus-card, .choice-card');
    if(!card || !slides[index].contains(card)) return;
    const rect = card.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width - .5;
    const py = (event.clientY - rect.top) / rect.height - .5;
    card.style.transform = 'perspective(900px) rotateX(' + (-py * 3.5).toFixed(2) + 'deg) rotateY(' + (px * 3.5).toFixed(2) + 'deg) translateY(-5px)';
  });
  document.addEventListener('pointerout', function(event){
    const card = event.target.closest('.card, .focus-card, .choice-card');
    if(card && !card.contains(event.relatedTarget)) card.style.transform = '';
  });

  let touchStartX = null;
  window.addEventListener('touchstart', function(event){ touchStartX = event.touches[0].clientX; }, {passive:true});
  window.addEventListener('touchend', function(event){
    if(touchStartX === null) return;
    const delta = event.changedTouches[0].clientX - touchStartX;
    if(delta > 60) goTo(index - 1);
    if(delta < -60) goTo(index + 1);
    touchStartX = null;
  }, {passive:true});

  render();
})();
