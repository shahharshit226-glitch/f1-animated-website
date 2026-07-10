(function(){
  const TOTAL_FRAMES = 120;
  const frames = [];
  let loaded = 0;

  // Serve a lighter frame set to small / likely-cellular screens, sharper set to desktop
  const IS_SMALL = window.innerWidth <= 768;
  const FRAME_DIR = IS_SMALL ? 'frames_mobile' : 'frames';

  const loader = document.getElementById('loader');
  const loaderFill = document.getElementById('loaderFill');
  const loaderPct = document.getElementById('loaderPct');

  const canvas = document.getElementById('scrub-canvas');
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  const frameNumEl = document.getElementById('frameNum');
  const progressFill = document.getElementById('progressFill');
  const annotations = Array.from(document.querySelectorAll('.annotation'));
  const scrubWrap = document.getElementById('engineering');

  let currentFrame = 1;
  let targetFrame = 1;

  function frameSrc(i){
    const n = String(i).padStart(3,'0');
    return FRAME_DIR + '/ezgif-frame-' + n + '.jpg';
  }

  function preload(){
    for(let i=1;i<=TOTAL_FRAMES;i++){
      const img = new Image();
      img.src = frameSrc(i);
      img.onload = img.onerror = function(){
        loaded++;
        const pct = Math.round((loaded/TOTAL_FRAMES)*100);
        loaderFill.style.width = pct + '%';
        loaderPct.textContent = pct + '%';
        if(loaded === TOTAL_FRAMES){
          setTimeout(()=>{ loader.classList.add('hidden'); }, 250);
          resize();
          draw(1);
          requestAnimationFrame(tick);
        }
      };
      frames[i] = img;
    }
  }

  function resize(){
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    ctx.setTransform(dpr,0,0,dpr,0,0);
  }

  function draw(frameIndex){
    const i = Math.min(TOTAL_FRAMES, Math.max(1, Math.round(frameIndex)));
    const img = frames[i];
    if(!img || !img.complete || img.naturalWidth === 0) return;

    const cw = window.innerWidth, ch = window.innerHeight;
    const iw = img.naturalWidth, ih = img.naturalHeight;
    const scale = Math.max(cw/iw, ch/ih);
    const sw = cw/scale, sh = ch/scale;
    const sx = (iw - sw)/2, sy = (ih - sh)/2;

    ctx.clearRect(0,0,cw,ch);
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, cw, ch);

    frameNumEl.textContent = String(i).padStart(3,'0');
    progressFill.style.width = ((i-1)/(TOTAL_FRAMES-1)*100) + '%';

    annotations.forEach(a=>{
      const from = parseFloat(a.dataset.from), to = parseFloat(a.dataset.to);
      if(i >= from && i <= to){ a.classList.add('visible'); }
      else{ a.classList.remove('visible'); }
    });
  }

  function onScroll(){
    const rect = scrubWrap.getBoundingClientRect();
    const total = rect.height - window.innerHeight;
    let progress = (-rect.top) / total;
    progress = Math.min(1, Math.max(0, progress));
    targetFrame = 1 + progress * (TOTAL_FRAMES - 1);
  }

  function tick(){
    currentFrame += (targetFrame - currentFrame) * 0.18;
    if(Math.abs(targetFrame - currentFrame) < 0.02) currentFrame = targetFrame;
    draw(currentFrame);
    requestAnimationFrame(tick);
  }

  window.addEventListener('scroll', onScroll, {passive:true});
  window.addEventListener('resize', ()=>{ resize(); draw(currentFrame); });

  preload();
})();
