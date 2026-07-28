let farmerName='',acreage=0,irrType='Drip',simTimer=null;
const N=8,on=[false,false,false,false,false,false,false,false];
const cropTypes=['corn','blueberry','watermelon','corn','blueberry','watermelon','corn','blueberry'];
const names=['Corn','Blueberry','Watermelon','Corn','Blueberry','Watermelon','Corn','Blueberry'];
let cropStages=[5,5,5,5,5,5,5,5]; // start as adults in idle background

function selectIrrType(el,type){
  document.querySelectorAll('.irr-opt').forEach(o=>o.classList.remove('selected'));
  el.classList.add('selected'); irrType=type;
}

function startGame(){
  farmerName=document.getElementById('farmerName').value.trim()||'Farmer';
  acreage=parseFloat(document.getElementById('acreage').value)||5;
  document.getElementById('inputScreen').classList.add('hidden');
  
  setTimeout(()=>{
    document.querySelector('.sim-hud').classList.add('visible');
    document.querySelector('.fast-label').classList.add('visible');
    
    document.getElementById('hudName').textContent=farmerName;
    document.getElementById('hudType').textContent=irrType+' Irrigation';
    document.getElementById('hudAcre').textContent=acreage+' Acres';
    
    document.getElementById('coPump').textContent='● Running';
    document.getElementById('coPump').style.color='#2ecc71';
    document.getElementById('coNutrients').textContent='N · P · K · pH';
    document.getElementById('coNutrients').style.color='#2ecc71';
    
    for(let i=0;i<N;i++) {
      on[i]=true;
      cropStages[i]=1; // Plant seeds
    }
    build();
    let t=15;
    document.getElementById('simTimer').textContent='00:'+(t<10?'0'+t:t);
    simTimer=setInterval(()=>{
      t--;
      document.getElementById('simTimer').textContent='00:'+(t<10?'0'+t:t);
      
      let moistureVal = Math.min(95, 45 + (15 - t) * 3.5);
      const pm = document.getElementById('probeMoisture');
      const pe = document.getElementById('probeEC');
      if (pm) {
        pm.textContent = Math.round(moistureVal) + '% (Active)';
        pm.setAttribute('fill', '#2ecc71');
      }
      if (pe) {
        pe.textContent = '1.8 mS · pH 6.4';
      }

      // Calculate growth stage
      let newStage = 1;
      if (t <= 12 && t > 9) newStage = 2; // seedling
      else if (t <= 9 && t > 6) newStage = 3; // adolescent
      else if (t <= 6 && t > 3) newStage = 4; // mature
      else if (t <= 3) newStage = 5; // adult

      let needsBuild = false;
      for(let i=0;i<N;i++){
        if (cropStages[i] !== newStage) {
          cropStages[i] = newStage;
          needsBuild = true;
        }
      }

      if(t % 3 === 0 && t > 2) {
        let r = Math.floor(Math.random() * N);
        on[r] = !on[r];
        needsBuild = true;
      }
      if(t === 2) {
        for(let i=0;i<N;i++) on[i]=true;
        needsBuild = true;
      }
      
      if (needsBuild) build();
      
      if(t<=0){clearInterval(simTimer);showResult();}
    },1000);
  },600);
}

function showResult(){
  document.querySelector('.sim-hud').classList.remove('visible');
  document.querySelector('.fast-label').classList.remove('visible');
  
  const rs=document.getElementById('resultScreen');
  rs.classList.remove('hidden');
  document.getElementById('resName').textContent=farmerName;
  const waterSaved=Math.round(acreage*6);
  const monthlySaving=Math.round(acreage*600);
  const yearlySaving=monthlySaving*12;
  document.getElementById('resWater').textContent=waterSaved+' L';
  document.getElementById('resMonthlyCost').textContent='₹ '+monthlySaving.toLocaleString('en-IN');
  document.getElementById('resYearlyCost').textContent='₹ '+yearlySaving.toLocaleString('en-IN');
  document.getElementById('resIrrType').textContent=irrType;
}

function restart(){
  document.getElementById('resultScreen').classList.add('hidden');
  document.getElementById('coPump').textContent='○ Idle';
  document.getElementById('coPump').style.color='#95a5a6';
  document.getElementById('coNutrients').textContent='○ Standby';
  document.getElementById('coNutrients').style.color='#95a5a6';
  
  const pm = document.getElementById('probeMoisture');
  const pe = document.getElementById('probeEC');
  if (pm) {
    pm.textContent = '42% (Dry)';
    pm.setAttribute('fill', '#e67e22');
  }
  if (pe) {
    pe.textContent = '1.2 mS · pH 6.8';
  }

  for(let i=0;i<N;i++) {
    on[i]=false;
    cropStages[i]=5; // reset to adults for background
  }
  build();
  setTimeout(()=>{document.getElementById('inputScreen').classList.remove('hidden');},500);
}

// SVG helpers
function setA(el,a){for(const[k,v]of Object.entries(a))el.setAttribute(k,v)}
function ns(t){return document.createElementNS('http://www.w3.org/2000/svg',t)}

function build(){
  const g=document.getElementById('zones');
  if(!g)return;
  g.innerHTML='';
  
  for(let i=0;i<N;i++){
    const x=360+i*58,railY=398,active=on[i];
    
    // --- VALVE ASSEMBLY (PIXEL ART STYLE) ---
    const vg=ns('g');vg.style.cursor='pointer';
    vg.onclick=()=>{on[i]=!on[i];build();};
    
    // Valve body shadow
    const vbShadow=ns('rect');
    setA(vbShadow,{x:x-12,y:railY-21,width:24,height:24,fill:'rgba(0,0,0,0.15)', style:'shape-rendering:crispEdges;'});
    vg.appendChild(vbShadow);
    
    // Valve body (square)
    const vb=ns('rect');
    setA(vb,{x:x-11,y:railY-22,width:22,height:22,fill:active?'#2980b9':'#7f8c8d',stroke:active?'#1a5276':'#566573','stroke-width':'2', style:'shape-rendering:crispEdges;'});
    vg.appendChild(vb);
    
    // Valve center (square)
    const vc=ns('rect');
    setA(vc,{x:x-6,y:railY-21,width:12,height:12,fill:active?'#3498db':'#95a5a6',stroke:active?'#2471a3':'#7f8c8d','stroke-width':'2', style:'shape-rendering:crispEdges;'});
    vg.appendChild(vc);
    
    // Status LED (square)
    const led=ns('rect');
    setA(led,{x:x-2,y:railY-17,width:4,height:4,fill:active?'#2ecc71':'#bdc3c7', style:'shape-rendering:crispEdges;'});
    if(active){
      led.setAttribute('filter','url(#glow)');
      const an=ns('animate');setA(an,{attributeName:'opacity',values:'1;0.3;1',dur:'1.5s',repeatCount:'indefinite'});led.appendChild(an);
    }
    vg.appendChild(led);
    
    const lbl=ns('text');
    setA(lbl,{x:x,y:railY-28,'text-anchor':'middle','font-family':'Space Mono','font-size':'7','font-weight':'700',fill:active?'#2471a3':'#95a5a6'});
    lbl.textContent='V'+(i+1);vg.appendChild(lbl);
    g.appendChild(vg);
    
    // --- DROP PIPE (PIXEL ART STYLE) ---
    const endY = 490;
    const ppSh=ns('line');
    setA(ppSh,{x1:x+2,y1:railY+7,x2:x+2,y2:endY+1,stroke:'rgba(0,0,0,0.12)','stroke-width':'4', style:'shape-rendering:crispEdges;'});
    g.appendChild(ppSh);
    
    const pp=ns('line');
    setA(pp,{x1:x,y1:railY+6,x2:x,y2:endY,stroke:'#bdc3c7','stroke-width':'4', style:'shape-rendering:crispEdges;'});
    g.appendChild(pp);
    
    if(active){
      const wf=ns('line');
      setA(wf,{x1:x,y1:railY+6,x2:x,y2:endY,stroke:'#3498db','stroke-width':'2','stroke-dasharray':'4 4', style:'shape-rendering:crispEdges;'});
      wf.style.animation='flowDown 0.6s linear infinite';wf.style.animationDelay=(i*0.12)+'s';
      g.appendChild(wf);
    }
    
    const soilY = 510;
    // --- IRRIGATION VISUALS (PIXEL ART STYLE) ---
    if (irrType === 'Sprinkler') {
      const spBase=ns('rect');
      setA(spBase,{x:x-3,y:endY-2,width:6,height:6,fill:active?'#2980b9':'#95a5a6', style:'shape-rendering:crispEdges;'});
      g.appendChild(spBase);
      const spHead=ns('rect');
      setA(spHead,{x:x-3,y:endY-6,width:6,height:4,fill:active?'#3498db':'#aab7b8', style:'shape-rendering:crispEdges;'});
      g.appendChild(spHead);

      if(active){
        for(let s=0;s<3;s++){
          const arc=ns('path');
          const spread=15+s*12;
          setA(arc,{d:`M ${x} ${endY-2} Q ${x-spread*0.6} ${endY-spread} ${x-spread} ${endY+5}`,fill:'none',stroke:'#5dade2','stroke-width':'1.5','stroke-dasharray':'3 3',opacity:String(0.6-s*0.15)});
          arc.style.animation='sprayArc '+(0.7+s*0.15)+'s linear infinite';
          g.appendChild(arc);
        }
        for(let s=0;s<3;s++){
          const arc=ns('path');
          const spread=15+s*12;
          setA(arc,{d:`M ${x} ${endY-2} Q ${x+spread*0.6} ${endY-spread} ${x+spread} ${endY+5}`,fill:'none',stroke:'#5dade2','stroke-width':'1.5','stroke-dasharray':'3 3',opacity:String(0.6-s*0.15)});
          arc.style.animation='sprayArc '+(0.7+s*0.15)+'s linear infinite';
          g.appendChild(arc);
        }
      }
    } else if (irrType === 'Drip') {
      const dl=ns('line');
      setA(dl,{x1:x,y1:railY+2,x2:x,y2:endY,stroke:'#7f8c8d','stroke-width':'3', style:'shape-rendering:crispEdges;'});
      g.appendChild(dl);
      const wet=ns('ellipse');
      // Position puddle exactly at ground level
      setA(wet,{cx:x,cy:soilY,rx:active?'22':'12',ry:active?'6':'4',fill:'#3498db',opacity:active?'0.35':'0.15',filter:'url(#shSm)'});
      if(active) wet.style.animation='floodPulse 2s ease-in-out infinite';
      g.appendChild(wet);
      if(active){
        const d=ns('rect');
        setA(d,{x:x-2,y:railY+15,width:4,height:4,fill:'#3498db', style:'shape-rendering:crispEdges;'});
        d.style.animation='flowDown 0.8s ease-in infinite';
        g.appendChild(d);
      }
    } else {
      // Flood
      const pool=ns('ellipse');
      // Position pool perfectly at ground level
      setA(pool,{cx:x,cy:soilY+4,rx:'32',ry:'8',fill:'#3498db',opacity:active?'0.4':'0.1',filter:'url(#shSm)'});
      if (active) pool.style.animation='floodPulse 3s ease-in-out infinite';
      g.appendChild(pool);
      
      const dl=ns('line');
      setA(dl,{x1:x-22,y1:endY,x2:x+22,y2:endY,stroke:active?'#27ae60':'#bdc3c7','stroke-width':'3', style:'shape-rendering:crispEdges;'});
      g.appendChild(dl);

      if(active){
        for(let d=0;d<3;d++){
          const nz=ns('rect');
          setA(nz,{x:x-18+d*16,y:endY-2,width:4,height:4,fill:'#27ae60', style:'shape-rendering:crispEdges;'});
          g.appendChild(nz);
          
          const dr=ns('rect');setA(dr,{x:x-18+d*16,y:endY+4,width:4,height:4,fill:'#3498db',opacity:'0', style:'shape-rendering:crispEdges;'});
          const a1=ns('animate');setA(a1,{attributeName:'y',values:(endY+4)+';'+(soilY+4),dur:'1.2s',repeatCount:'indefinite',begin:(d*0.3)+'s'});dr.appendChild(a1);
          const a2=ns('animate');setA(a2,{attributeName:'opacity',values:'0;0.8;0',dur:'1.2s',repeatCount:'indefinite',begin:(d*0.3)+'s'});dr.appendChild(a2);
          g.appendChild(dr);
        }
      }
    }
    // --- VECTOR ART CROP ---
    const plantGroup = ns('g');
    if(active){
      plantGroup.style.transformOrigin=`${x}px ${soilY}px`;
      plantGroup.style.animation='plantSway 2.5s ease-in-out infinite';
      plantGroup.style.animationDelay=(i*0.2)+'s';
    }

    const cropType = cropTypes[i];
    const stage = cropStages[i];
    
    // Draw highly detailed SVG crop based on type and stage
    drawCrop(plantGroup, x, soilY, cropType, stage, active);

    if(active && stage >= 4){
      const spk=ns('text');
      setA(spk,{x:x+14,y:soilY-64,'text-anchor':'middle','font-size':'9'});
      spk.textContent='✨';
      plantGroup.appendChild(spk);
    }

    g.appendChild(plantGroup);

    // Removed floating text labels from the dirt
  }

  const flowing=on.some(z=>z);
  document.querySelectorAll('.wfh').forEach(el=>{
    el.style.animation=flowing?'flowRight 0.7s linear infinite':'none';
    el.style.opacity=flowing?'1':'0.15';
  });
  document.querySelectorAll('.wfv').forEach(el=>{
    el.style.animation=flowing?'flowDown 0.6s linear infinite':'none';
    el.style.opacity=flowing?'1':'0.15';
  });
  const pb=document.getElementById('pumpBlade');
  if(pb) pb.style.animation=flowing?'pumpSpin 0.7s linear infinite':'none';
  
  const pLed=document.getElementById('pumpLed');
  if(pLed) pLed.setAttribute('fill',flowing?'#2ecc71':'#95a5a6');
}

// Function to draw crops using provided PNG assets
function drawCrop(group, x, y, type, stage, active) {
  const op = active ? 1 : 0.6;
  const filter = active ? 'url(#glow)' : '';
  
  // Base plant image and size based on stage (scaled down for neatness)
  let imgSrc = '';
  let size = 48; 

  if (stage === 1) { imgSrc = 'grow  (1).png'; size = 20; }
  else if (stage === 2) { imgSrc = 'grow  (2).png'; size = 28; }
  else if (stage === 3) { imgSrc = 'grow  (3).png'; size = 38; }
  else if (stage >= 4) { imgSrc = 'grow 2 (3).png'; size = 48; } // Fully grown plant base

  // Draw base plant
  const img = ns('image');
  setA(img, {
    href: imgSrc,
    x: x - (size / 2),
    y: y - size,
    width: size,
    height: size,
    preserveAspectRatio: 'xMidYMax meet',
    opacity: op,
    filter: filter
  });
  img.style.imageRendering = 'pixelated';
  group.appendChild(img);

  // Stage 5: Overlay the fruit on top of the grown plant
  if (stage === 5) {
    let fruitSrc = '';
    if (type === 'corn') fruitSrc = 'Corn.png';
    else if (type === 'blueberry') fruitSrc = 'Blueberry.png';
    else if (type === 'watermelon') fruitSrc = 'Watermelon.png';

    const fruitSize = 32;
    const fruit = ns('image');
    setA(fruit, {
      href: fruitSrc,
      x: x - (fruitSize / 2),
      // Position the fruit completely above the plant (not overlapping)
      y: y - size - fruitSize + 2, // +2 so it rests exactly on the very top pixel of the leaves
      width: fruitSize,
      height: fruitSize,
      preserveAspectRatio: 'xMidYMid meet',
      opacity: op,
      filter: filter
    });
    fruit.style.imageRendering = 'pixelated';
    group.appendChild(fruit);
  }
}

let baseWater=1247;
setInterval(()=>{
  const m=document.getElementById('meterVal');
  const w=document.getElementById('coWater');
  if(m){
    baseWater += Math.floor(Math.random()*5);
    const txt = baseWater.toLocaleString()+' m³';
    m.textContent=txt;
    if(w) w.textContent=txt;
  }
},2000);
