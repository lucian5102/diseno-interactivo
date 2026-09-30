/* Static site. Author-supplied media is local; the HCI reader embeds Wikipedia. */
(() => {
  'use strict';
  const data = window.RECORRIDO;
  const $ = s => document.querySelector(s);
  const reading = $('#reading'), panel = $('#panel'), body = $('#panel-content');
  const projection = $('#projection'), paths = [...projection.children];
  const narrow = matchMedia('(max-width: 950px)');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const labels = { framing:'framing', 'frame-analysis':'frame analysis', jev:'Jev', collection:'unstructured collection', vr:'VR glasses', haptics:'haptics', tracking:'eye tracking', muse:'Muse', hci:'HCI', paths:'distintos rumbos', fortunate:'afortunada', slide:'2da slide' };
  const slotMap = {jev:'jev',vr:'vr',haptics:'haptics',tracking:'tracking',muse:'muse',fortunate:'fortunate',slide:'slide'};
  const linkedOnce = new Set();
  let typingTimer=0, switching=false, restoringFocus=false;
  let mode = 'sketch', active = null, pinned = false, currentPage = 0, frame = 0, scrollFrame = 0, leaveTimer = 0;
  const el = (tag, cls, text) => { const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n; };
  function makeTrigger(id, className) {
    const b=el('button',className);b.type='button';b.dataset.resource=id;
    b.setAttribute('aria-label',labels[id]);b.setAttribute('aria-expanded','false');b.setAttribute('aria-controls','panel');
    b.addEventListener('pointerenter',e=>{clearTimeout(leaveTimer);if(e.pointerType==='mouse'&&!pinned)open(b);});
    b.addEventListener('pointerleave',()=>{if(!pinned)leaveTimer=setTimeout(()=>close(false),650);});
    b.addEventListener('focus',()=>{if(!restoringFocus&&b.matches(':focus-visible'))open(b);});
    b.addEventListener('click',()=>{clearTimeout(leaveTimer);if(active===b&&pinned){close(false);return;}open(b);pinned=true;const video=body.querySelector('video');if(video)video.play().catch(()=>{});if(narrow.matches)panel.scrollIntoView({behavior:reduced.matches?'instant':'smooth',block:'nearest'});});
    return b;
  }
  function appendText(parent, text, interactive=true) {
    const p=el('p');
    if(!interactive){p.textContent=text;parent.append(p);return;}
    const terms = Object.entries(labels).map(([id,term])=>({id,term:id==='slide'?'segunda slide':term}));
    const regex = new RegExp('('+terms.map(x=>x.term.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).sort((a,b)=>b.length-a.length).join('|')+')','g');
    let offset=0;for(const match of text.matchAll(regex)){
      p.append(document.createTextNode(text.slice(offset,match.index)));
      const id=terms.find(x=>x.term===match[0]).id;
      if((id==='jev'&&linkedOnce.has(id))||(id==='hci'&&!text.slice(0,match.index).endsWith('“haberle pegado” a esta visión sobre el futuro de la '))){p.append(document.createTextNode(match[0]));}else{const b=makeTrigger(id,'word');b.textContent=match[0];p.append(b);linkedOnce.add(id);}offset=match.index+match[0].length;
    }
    p.append(document.createTextNode(text.slice(offset)));parent.append(p);
  }
  const intro=el('div','digital intro');intro.hidden=true;intro.setAttribute('aria-label','Texto final, introducción');data.intro.forEach(t=>appendText(intro,t,false));reading.append(intro);
  const hint=el('p','hover-hint');hint.innerHTML='<span class="mouse-hint">Pasá el mouse por los subrayados violetas.</span><span class="tap-hint">Tocá los subrayados violetas.</span>';reading.append(hint);
  document.body.dataset.mode=mode;
  data.pages.forEach((page,i)=>{
    const section=el('section','sheet');section.id='hoja-'+page.id;section.dataset.index=i;section.setAttribute('aria-label','Hoja '+(i+1));
    const col=el('div','paper-column'), manuscript=el('div','manuscript');
    const [x,y,w,h]=page.crop;
    manuscript.style.setProperty('--ratio',`${1536*w} / ${2048*h}`);
    const photo=el('div','photo-window'),img=el('img');img.src='assets/'+page.file;img.alt='Boceto manuscrito de Lucian, hoja '+(i+1);img.width=1536;img.height=2048;img.loading=i===0?'eager':'lazy';img.decoding='async';
    img.style.cssText=`width:${10000/w}%;height:auto;left:${-100*x/w}%;top:${-100*y/h}%;--outline:polygon(${page.outline})`;
    photo.append(img);manuscript.append(photo);
    page.hotspots.forEach(([id,hx,hy,hw,hh])=>{
      const b=makeTrigger(id,'hotspot');b.style.cssText=`left:${100*(hx-x)/w}%;top:${100*(hy-y)/h}%;width:${100*hw/w}%;height:${100*hh/h}%`;manuscript.append(b);
    });
    const digital=el('div','digital');digital.hidden=true;page.text.forEach(t=>appendText(digital,t));col.append(manuscript,digital);section.append(col);reading.append(section);
    const a=el('a','',String(i+1).padStart(2,'0'));a.href='#'+section.id;a.setAttribute('aria-label','Ir a hoja '+(i+1));a.addEventListener('click',()=>close(false));$('.page-nav').append(a);
  });
  const sheets=[...document.querySelectorAll('.sheet')];
  function centerFirstSheet(){
    const leaf=sheets[0].querySelector('.manuscript');
    if(mode!=='sketch')return;
    const leafHeight=leaf.getBoundingClientRect().height;
    const hintHeight=hint.getBoundingClientRect().height+22;
    const desiredTop=Math.max(narrow.matches?125:155,(innerHeight-leafHeight)/2);
    reading.style.setProperty('--sketch-top',Math.max(narrow.matches?95:110,desiredTop-hintHeight)+'px');
  }
  centerFirstSheet();
  addEventListener('resize',centerFirstSheet);
  function updateReading(){
    const focusY=innerHeight*.36;
    let nearest=Infinity;
    sheets.forEach((s,i)=>{const r=s.getBoundingClientRect();const d=r.top<=focusY&&r.bottom>=focusY?0:Math.min(Math.abs(r.top-focusY),Math.abs(r.bottom-focusY));if(d<nearest){nearest=d;currentPage=i;}});
    document.documentElement.style.setProperty('--paper',data.pages[currentPage].tone);
    const total=document.documentElement.scrollHeight-innerHeight;
    $('.timeline').style.setProperty('--progress',Math.max(0,Math.min(1,total?scrollY/total:0)));
    [...$('.page-nav').children].forEach((a,i)=>a.setAttribute('aria-current',String(i===currentPage)));
    positionPanel();scrollFrame=0;
  }
  function onScroll(){if(!scrollFrame)scrollFrame=requestAnimationFrame(updateReading);}
  addEventListener('scroll',onScroll,{passive:true});addEventListener('resize',onScroll);
  document.querySelectorAll('[data-mode]').forEach(b=>b.addEventListener('click',()=>{
    if(mode===b.dataset.mode||switching)return;
    switching=true;close(false);
    const anchor=sheets[currentPage], previousTop=anchor.getBoundingClientRect().top, wasTop=scrollY<100;
    const direction=b.dataset.mode==='text'?1:-1;
    let stage=null;
    if(!reduced.matches){
      const rect=reading.getBoundingClientRect(),ghost=reading.cloneNode(true);
      ghost.removeAttribute('id');ghost.querySelectorAll('[id]').forEach(n=>n.removeAttribute('id'));
      ghost.querySelectorAll('aside').forEach(n=>n.remove());
      ghost.className='transition-ghost';ghost.setAttribute('aria-hidden','true');ghost.inert=true;
      ghost.style.cssText=`left:${rect.left}px;top:${rect.top}px;width:${rect.width}px;margin:0;padding:${getComputedStyle(reading).padding};--slide-exit:${direction*110}vw;`;
      stage=el('div','transition-stage');stage.setAttribute('aria-hidden','true');stage.append(ghost);document.body.append(stage);
    }
    mode=b.dataset.mode;document.body.dataset.mode=mode;intro.hidden=mode!=='text';hint.hidden=mode!=='sketch';
    reading.querySelectorAll('.manuscript').forEach(n=>n.hidden=mode!=='sketch');
    sheets.forEach(s=>s.querySelector('.digital').hidden=mode!=='text');
    centerFirstSheet();
    document.querySelectorAll('[data-mode]').forEach(n=>{n.setAttribute('aria-pressed',String(n===b));n.disabled=true;});
    const target=wasTop?0:scrollY+anchor.getBoundingClientRect().top-previousTop;
    scrollTo({top:target,behavior:'instant'});updateReading();
    if(!reduced.matches){
      reading.style.setProperty('--slide-enter',`${-direction*110}vw`);
      reading.classList.add('is-sliding');
      reading.inert=true;
    }
    setTimeout(()=>{
      stage?.remove();reading.classList.remove('is-sliding');reading.inert=false;switching=false;
      document.querySelectorAll('[data-mode]').forEach(n=>n.disabled=false);updateReading();
    },reduced.matches?0:950);
  }));
  function close(restoreFocus=false){
    clearTimeout(leaveTimer);clearTimeout(typingTimer);cancelAnimationFrame(frame);frame=0;
    const source=active;if(source)source.setAttribute('aria-expanded','false');active=null;pinned=false;panel.hidden=true;paths.forEach(p=>p.setAttribute('d',''));
    panel.querySelectorAll('video').forEach(v=>v.pause());
    body.querySelectorAll('iframe').forEach(f=>f.remove());
    if(restoreFocus&&source){restoringFocus=true;source.focus({preventScroll:true});restoringFocus=false;}
  }
  $('#close').addEventListener('click',()=>close(true));
  addEventListener('keydown',e=>{if(e.key==='Escape'&&active){e.preventDefault();close(true);}});
  document.addEventListener('pointerdown',e=>{if(active&&!panel.contains(e.target)&&!e.target.closest('[data-resource]'))close(false);});
  panel.addEventListener('pointerenter',()=>clearTimeout(leaveTimer));
  panel.addEventListener('pointerleave',()=>{if(!pinned)leaveTimer=setTimeout(()=>close(false),650);});
  panel.addEventListener('focusin',()=>{clearTimeout(leaveTimer);pinned=true;});
  $('#replay').addEventListener('click',()=>{if(active)renderResource(active.dataset.resource);});
  function open(b){
    clearTimeout(leaveTimer);if(active===b&&!panel.hidden)return;
    if(active)active.setAttribute('aria-expanded','false');pinned=false;active=b;b.setAttribute('aria-expanded','true');
    $('#panel-label').textContent=labels[b.dataset.resource];panel.setAttribute('aria-label',labels[b.dataset.resource]);
    if(narrow.matches)b.closest('.sheet').append(panel);else document.body.append(panel);
    panel.hidden=false;renderResource(b.dataset.resource);positionPanel();
  }
  function positionPanel(){
    if(!active||panel.hidden)return;
    const section=active.closest('.sheet'),source=active.getBoundingClientRect();
    if(!narrow.matches){
      const leaf=section.querySelector('.paper-column').getBoundingClientRect();
      const width=Math.max(220,Math.min(360,innerWidth*.935-leaf.right-36));
      panel.style.width=width+'px';panel.style.left=(leaf.right+36)+'px';
      panel.style.top=Math.max(104,Math.min(innerHeight-panel.offsetHeight-35,source.top+source.height/2-panel.offsetHeight/2))+'px';
    }
    const dest=panel.getBoundingClientRect();
    if(source.bottom<0||source.top>innerHeight||dest.top>innerHeight||dest.bottom<0){paths.forEach(p=>p.setAttribute('d',''));return;}
    const start=narrow.matches?[source.left+source.width/2,source.bottom]:[source.right,source.bottom];
    const corners=[[dest.left,dest.top],[dest.right,dest.top],[dest.right,dest.bottom],[dest.left,dest.bottom]];
    paths.forEach((p,i)=>{const [x,y]=corners[i];p.setAttribute('d',`M ${start[0]} ${start[1]} L ${x} ${y}`);p.style.setProperty('--length',Math.hypot(x-start[0],y-start[1]));});
  }
  narrow.addEventListener('change',()=>{if(active){if(narrow.matches)active.closest('.sheet').append(panel);else document.body.append(panel);positionPanel();}});
  function renderResource(id){
    clearTimeout(typingTimer);cancelAnimationFrame(frame);panel.dataset.kind=slotMap[id]?'media':'concept';body.querySelectorAll('video').forEach(v=>v.pause());body.replaceChildren();$('#replay').hidden=true;
    if(slotMap[id]){renderMedia(slotMap[id]);return;}
    if(id==='hci'){renderWiki();return;}
    if(id==='frame-analysis'){
      const quote=el('blockquote','', '“Frame analysis may help practitioners to become aware of their tacit frames […]”');quote.lang='en';
      const cite=el('cite');const a=el('a','', 'Donald A. Schön · The Reflective Practitioner, 1983, p. 311');a.href='https://studylib.net/doc/26322586/donald-a-schon-the-reflective-practition';a.target='_blank';a.rel='noopener noreferrer';cite.append(a);body.append(quote,cite);typeQuote(quote);return;
    }
    const canvas=el('canvas');canvas.setAttribute('role','img');canvas.setAttribute('aria-label',{
      framing:'Marcos rectangulares, circulares y ondulados emergen del centro; aparece frame.',collection:'Bloques dispersos se ordenan en tres grupos por color.',paths:'Tres caminos: estudiar en el exterior, IVIA; maestría más exacta, sistemática o procedural; trabajar freelance, Figma.',hci:'Dos nodos intercambian señales: una representación conceptual de HCI.'
    }[id]);body.append(canvas);$('#replay').hidden=false;
    if(id==='paths'){
      const layer=el('div','path-labels');[['estudiar en el exterior','IVIA'],['maestría más exacta','sistemática o procedural'],['Trabajar freelance','Figma']].forEach(([title,subtitle],i)=>{const item=el('div','',title);item.style.setProperty('--i',i);item.append(el('small','',subtitle));layer.append(item);});body.append(layer);
    }
    animate(canvas,id);
  }
  function typeQuote(quote){
    if(reduced.matches)return;
    const text=quote.textContent;quote.setAttribute('aria-label',text);quote.classList.add('quote-reserve');
    quote.textContent='';const measure=el('span','quote-measure',text),typed=el('span','quote-typed'),caret=el('i','typing-caret');
    measure.setAttribute('aria-hidden','true');typed.setAttribute('aria-hidden','true');quote.append(measure,typed);
    let index=0;const tick=()=>{typed.textContent=text.slice(0,++index);if(index<text.length){typed.append(caret);typingTimer=setTimeout(tick,32);} };tick();
  }
  function renderWiki(){
    panel.dataset.kind='media';
    const url='https://en.wikipedia.org/wiki/Human%E2%80%93computer_interaction';
    const chrome=el('div','browser-chrome');for(let i=0;i<3;i++)chrome.append(el('i'));
    const link=el('a','', 'en.wikipedia.org · HCI');link.href=url;link.target='_blank';link.rel='noopener noreferrer';chrome.append(link);
    const iframe=el('iframe','wiki-window');iframe.title='Human–computer interaction — Wikipedia';iframe.src=url;iframe.referrerPolicy='no-referrer';
    iframe.setAttribute('sandbox','allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox');
    const fallback=el('a','media-fallback','Abrir en Wikipedia ↗');fallback.href=url;fallback.target='_blank';fallback.rel='noopener noreferrer';
    body.append(chrome,iframe,fallback);
  }
  function renderMedia(key){
    const media=window.RECORRIDO_MEDIA[key];
    if(media&&media.src){
      let url;try{url=new URL(media.src,location.href);}catch{return placeholder(key);}
      if(!['http:','https:','file:'].includes(url.protocol))return placeholder(key);
      if(media.type==='image'){const img=el('img','media-image');img.alt=media.alt||labels[key]||'Meta';img.src=media.src;img.addEventListener('error',()=>{body.replaceChildren();placeholder(key);},{once:true});body.append(img);img.addEventListener('load',positionPanel,{once:true});return;}
      if(media.type==='video'){const v=el('video');v.controls=true;v.playsInline=true;v.preload='metadata';v.muted=!!media.muted;v.defaultMuted=!!media.muted;if(media.muted){v.setAttribute('muted','');v.autoplay=!reduced.matches;v.addEventListener('volumechange',()=>{if(!v.muted)v.muted=true;});}if(media.poster)v.poster=media.poster;v.src=media.src;v.addEventListener('error',()=>{body.replaceChildren();placeholder(key);},{once:true});body.append(v);v.addEventListener('loadedmetadata',positionPanel,{once:true});return;}
      if(media.type==='link'){const a=el('a','resource-link',media.label||labels[key]||'Meta');a.href=url.href;a.target='_blank';a.rel='noopener noreferrer';body.append(a);return;}
    }
    placeholder(key);
  }
  function placeholder(key){
    const slot=el('div','slot');slot.dataset.mediaSlot=key;const mark=el('span','slot-mark',key==='fortunate'?'+':'▷');mark.setAttribute('aria-hidden','true');
    const msg=el('span','',key==='fortunate'?'Foto personal · pendiente':'Recurso pendiente · '+(key==='meta'?'Meta':labels[key]));slot.append(mark,msg);body.append(slot);
  }
  function animate(canvas,id){
    const ctx=canvas.getContext('2d');if(!ctx)return;
    const dpr=Math.min(devicePixelRatio||1,2),W=360,H=280;canvas.width=W*dpr;canvas.height=H*dpr;ctx.scale(dpr,dpr);
    const violet='#71428d',ink='#493452',colors=['#785493','#ab7971','#9b9368'];const start=performance.now(),duration=4800;
    const ease=t=>1-Math.pow(1-Math.max(0,Math.min(1,t)),3);
    const line=(x1,y1,x2,y2)=>{ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();};
    function draw(now){
      const t=reduced.matches?duration:Math.min(duration,now-start);ctx.clearRect(0,0,W,H);ctx.strokeStyle=violet;ctx.fillStyle=violet;ctx.lineWidth=1.2;
      if(id==='framing'){
        for(let i=0;i<7;i++){
          const k=ease((t-i*280)/2600),r=6+k*(155-i*15);if(k<=0)continue;
          ctx.save();ctx.translate(W/2,H/2);ctx.rotate((i%2?1:-1)*k*.10);ctx.globalAlpha=.2+.65*k;
          ctx.beginPath();if(i%3===0)ctx.rect(-r,-r*.68,r*2,r*1.36);else if(i%3===1)ctx.ellipse(0,0,r,r*.72,0,0,Math.PI*2);else{for(let a=0;a<=100;a++){const angle=a/100*Math.PI*2;const radius=r*(1+.065*Math.sin(angle*8));const x=Math.cos(angle)*radius,y=Math.sin(angle)*radius*.78;if(a===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);}ctx.closePath();}ctx.stroke();ctx.restore();
        }
        const alpha=ease((t-2600)/900);ctx.globalAlpha=alpha;ctx.fillStyle=getComputedStyle(document.documentElement).getPropertyValue('--paper');ctx.fillRect(123,114,114,52);ctx.fillStyle=ink;ctx.font='italic 39px Georgia';ctx.textAlign='center';ctx.fillText('frame',180,151);ctx.globalAlpha=1;
      }else if(id==='collection'){
        for(let i=0;i<18;i++){
          const group=i%3,row=Math.floor(i/3),k=ease((t-1300-i*25)/1700);
          const sx=35+((i*73)%280),sy=28+((i*57)%222),ex=90+group*90,ey=48+row*36;
          ctx.save();ctx.translate(sx+(ex-sx)*k,sy+(ey-sy)*k);ctx.rotate((1-k)*Math.sin(i*2)*1.3);ctx.fillStyle=colors[group];ctx.fillRect(-12,-11,24,22);ctx.restore();
        }
      }else if(id==='paths'){
        const k=ease(t/2200);ctx.lineWidth=1.2;
        [61,143,224].forEach((end,i)=>{ctx.strokeStyle=colors[i];ctx.setLineDash([230]);ctx.lineDashOffset=230*(1-k);ctx.beginPath();ctx.moveTo(22,140);ctx.bezierCurveTo(76,140,66,end,129,end);ctx.stroke();ctx.setLineDash([]);if(k>.97){ctx.fillStyle=colors[i];ctx.beginPath();ctx.arc(129,end,3,0,Math.PI*2);ctx.fill();}});
        ctx.fillStyle=violet;ctx.beginPath();ctx.arc(22,140,4,0,Math.PI*2);ctx.fill();
      }else if(id==='hci'){
        [87,273].forEach((x,i)=>{ctx.beginPath();ctx.arc(x,140,37,0,Math.PI*2);ctx.stroke();for(let j=0;j<5;j++){const a=j/5*Math.PI*2;ctx.beginPath();ctx.arc(x+Math.cos(a)*23,140+Math.sin(a)*23,i?3:2,0,Math.PI*2);ctx.fill();}});
        ctx.globalAlpha=.45;line(126,126,234,126);line(126,155,234,155);ctx.globalAlpha=1;
        const k=t===duration?.5:(t/1800)%1;ctx.beginPath();ctx.arc(126+108*k,126,4,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(234-108*k,155,4,0,Math.PI*2);ctx.fill();ctx.font='italic 24px Georgia';ctx.textAlign='center';ctx.fillText('HCI',180,222);
      }
      if(t<duration&&!document.hidden)frame=requestAnimationFrame(draw);
    }
    frame=requestAnimationFrame(draw);
  }
  document.addEventListener('visibilitychange',()=>{if(document.hidden)cancelAnimationFrame(frame);else if(active&&!panel.hidden&&body.querySelector('canvas'))renderResource(active.dataset.resource);});
  reduced.addEventListener('change',()=>{if(active&&!panel.hidden)renderResource(active.dataset.resource);});
  updateReading();
})();
