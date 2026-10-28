/** Dependency-free 2D navigation controller; works with native links when JS is unavailable. */
export function mountExploration(root, navigate) {
  if (!root) return () => {};
  const stage = root.querySelector('.rex-stage');
  const rider = root.querySelector('[data-rider]');
  const route = root.querySelector('[data-route]');
  const tracks = root.querySelector('[data-tracks]');
  const status = root.querySelector('[data-status]');
  const skip = root.querySelector('[data-skip]');
  if (!stage || !rider || !route || !tracks || !status || !skip) return () => {};
  const links = Array.from(root.querySelectorAll('[data-destination]'));
  const media = window.matchMedia('(prefers-reduced-motion: reduce)');
  const disposers = [];
  const listen = (el, type, fn, opts) => {
    el.addEventListener(type, fn, opts);
    disposers.push(() => el.removeEventListener(type, fn, opts));
  };
  let position = {x: 50.5, y: 55};
  let lastPrint = {...position};
  let heading = 0, frame = 0, timer = 0, idle = 0, pointer = null;
  let dragging = false, draggingOffset = {x: 0, y: 0}, selected = null;
  let trackSide = 1, destroyed = false;
  const bounds = () => stage.getBoundingClientRect();
  const distance = (a, b) => {
    const r = bounds();
    return Math.hypot((b.x-a.x)*r.width/100, (b.y-a.y)*r.height/100);
  };
  const targetOf = (link) => ({x: Number(link.dataset.x), y: Number(link.dataset.y)});
  function pause() {
    cancelAnimationFrame(frame); clearTimeout(timer); clearTimeout(idle);
    frame = timer = idle = 0;
    rider.classList.remove('is-walking');
  }
  function cancel() {
    pause(); selected = null; route.setAttribute('d', ''); skip.hidden = true; rider.style.width = '';
    links.forEach(link => link.classList.remove('is-active'));
    status.textContent = 'Arrastra el caballo o toca una colección';
  }
  function print(next, angle) {
    const r = bounds(), spacing = distance(lastPrint, next);
    if (media.matches || spacing < 16) return;
    lastPrint = {...next};
    const mark = document.createElement('span');
    mark.className = 'rex-hoof';
    const rad = angle*Math.PI/180;
    mark.style.left = (next.x + Math.cos(rad)*trackSide*4/r.width*100) + '%';
    mark.style.top = (next.y + Math.sin(rad)*trackSide*4/r.height*100) + '%';
    mark.style.transform = `translate(-50%,-50%) rotate(${angle}deg)`;
    tracks.append(mark); trackSide *= -1;
    while (tracks.childElementCount > 36) tracks.firstElementChild.remove();
  }
  function move(next) {
    const r = bounds();
    next = {x: Math.max(10,Math.min(90,next.x)), y: Math.max(19,Math.min(81,next.y))};
    const dx = (next.x-position.x)*r.width/100;
    const dy = (next.y-position.y)*r.height/100;
    if (Math.hypot(dx,dy) < .15) return;
    const wanted = Math.atan2(dx,-dy)*180/Math.PI;
    heading += ((wanted-heading+180)%360+360)%360-180;
    print(position,heading);
    position = next;
    rider.style.left = next.x+'%'; rider.style.top = next.y+'%';
    rider.style.setProperty('--heading',heading+'deg');
    rider.classList.toggle('is-walking',!media.matches);
    clearTimeout(idle);
    idle = window.setTimeout(() => rider.classList.remove('is-walking'),120);
  }
  function visit(link) {
    if (destroyed) return;
    pause();
    const href = link.getAttribute('href');
    if (href?.startsWith('/') && !href.startsWith('//')) navigate(href);
  }
  function choose(link) {
    cancel(); selected = link;
    if (media.matches) {visit(link); return;}
    link.classList.add('is-active');
    skip.href = link.href; skip.hidden = false;
    status.textContent = 'Rumbo a '+link.textContent.trim()+'…';
    const origin = {...position}, end = targetOf(link);
    const control = {x:(origin.x+end.x)/2-6,y:(origin.y+end.y)/2-5};
    route.setAttribute('d',`M${origin.x} ${origin.y} Q${control.x} ${control.y} ${end.x} ${end.y}`);
    route.style.strokeDasharray = 'none'; route.style.strokeDashoffset = '0';
    const total = distance(origin, end);
    const noseClearance = Math.min(80, bounds().width * .18 * 205 / 71 * .44);
    const arrivalAt = total > noseClearance ? (total - noseClearance) / total : 0;
    if (arrivalAt < .05) {visit(link); return;}
    rider.style.width = '18%';
    const started = performance.now(), duration = Math.min(1150,Math.max(550,distance(origin,end)*3));
    function tick(now) {
      if (destroyed || dragging || document.hidden) {pause(); return;}
      const t = Math.min(1,(now-started)/duration), u = t*t*(3-2*t)*arrivalAt;
      move({x:(1-u)**2*origin.x+2*(1-u)*u*control.x+u*u*end.x,
            y:(1-u)**2*origin.y+2*(1-u)*u*control.y+u*u*end.y});
      if (t < 1) frame = requestAnimationFrame(tick);
      else {
        rider.classList.remove('is-walking');
        status.textContent = 'Has llegado a '+link.textContent.trim();
        timer = window.setTimeout(() => visit(link),220);
      }
    }
    frame = requestAnimationFrame(tick);
  }
  function coords(event) {
    const r = bounds();
    return {x:(event.clientX-r.left)/r.width*100,y:(event.clientY-r.top)/r.height*100};
  }
  listen(rider,'pointerdown',(event) => {
    if (!event.isPrimary || (event.pointerType==='mouse' && event.button!==0)) return;
    cancel(); dragging = true; pointer = event.pointerId;
    const p=coords(event); draggingOffset={x:position.x-p.x,y:position.y-p.y};
    rider.classList.add('is-dragging'); rider.setPointerCapture(pointer);
    event.preventDefault();
  });
  listen(rider,'pointermove',(event) => {
    if (!dragging || event.pointerId!==pointer) return;
    const p=coords(event); move({x:p.x+draggingOffset.x,y:p.y+draggingOffset.y});
  });
  function release(event) {
    if (event.pointerId!==pointer) return;
    dragging=false; pointer=null; rider.classList.remove('is-dragging','is-walking');
    if (event.type==='pointercancel' || event.type==='lostpointercapture') return;
    const nearest=links.map(link=>({link,d:distance(position,targetOf(link))})).sort((a,b)=>a.d-b.d)[0];
    if (nearest && nearest.d<45) choose(nearest.link);
  }
  listen(rider,'pointerup',release); listen(rider,'pointercancel',release); listen(rider,'lostpointercapture',release);
  listen(rider,'keydown',(event)=>{
    const deltas={ArrowUp:[0,-4],ArrowDown:[0,4],ArrowLeft:[-4,0],ArrowRight:[4,0]};
    if(deltas[event.key]){event.preventDefault();cancel();const [x,y]=deltas[event.key];move({x:position.x+x,y:position.y+y});}
    if(event.key==='Enter'){event.preventDefault();const nearest=[...links].sort((a,b)=>distance(position,targetOf(a))-distance(position,targetOf(b)))[0];if(nearest)choose(nearest);}
  });
  links.forEach(link=>listen(link,'click',(event)=>{
    if(event.button!==0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();choose(link);
  }));
  listen(skip,'click',(event)=>{if(selected){event.preventDefault();visit(selected);}});
  listen(document,'keydown',(event)=>{if(event.key==='Escape') cancel();});
  listen(document,'visibilitychange',()=>{if(document.hidden)cancel();});
  listen(media,'change',()=>{cancel();tracks.replaceChildren();});
  return () => {destroyed=true;pause();disposers.forEach(fn=>fn());tracks.replaceChildren();};
}
