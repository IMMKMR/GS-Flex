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
    
    // --- VALVE ASSEMBLY ---
    const vg=ns('g');vg.style.cursor='pointer';
    vg.onclick=()=>{on[i]=!on[i];build();};
    
    const vbShadow=ns('rect');
    setA(vbShadow,{x:x-12,y:railY-21,width:24,height:24,rx:'5',fill:'rgba(0,0,0,0.15)'});
    vg.appendChild(vbShadow);
    const vb=ns('rect');
    setA(vb,{x:x-11,y:railY-22,width:22,height:22,rx:'4',fill:active?'#2980b9':'#7f8c8d',stroke:active?'#1a5276':'#566573','stroke-width':'2'});
    vg.appendChild(vb);
    
    const vc=ns('circle');
    setA(vc,{cx:x,cy:railY-16,r:'6',fill:active?'#3498db':'#95a5a6',stroke:active?'#2471a3':'#7f8c8d','stroke-width':'1.5'});
    vg.appendChild(vc);
    
    const led=ns('circle');
    setA(led,{cx:x,cy:railY-16,r:'2.5',fill:active?'#2ecc71':'#bdc3c7'});
    if(active){
      led.setAttribute('filter','url(#glow)');
      const an=ns('animate');setA(an,{attributeName:'opacity',values:'1;0.3;1',dur:'1.5s',repeatCount:'indefinite'});led.appendChild(an);
    }
    vg.appendChild(led);
    
    const lbl=ns('text');
    setA(lbl,{x:x,y:railY-28,'text-anchor':'middle','font-family':'Space Mono','font-size':'7','font-weight':'700',fill:active?'#2471a3':'#95a5a6'});
    lbl.textContent='V'+(i+1);vg.appendChild(lbl);
    g.appendChild(vg);
    
    // --- DROP PIPE ---
    const endY = 490;
    const ppSh=ns('line');
    setA(ppSh,{x1:x+1,y1:railY+7,x2:x+1,y2:endY+1,stroke:'rgba(0,0,0,0.12)','stroke-width':'5','stroke-linecap':'round'});
    g.appendChild(ppSh);
    
    const pp=ns('line');
    setA(pp,{x1:x,y1:railY+6,x2:x,y2:endY,stroke:active?'url(#pipeG)':'#c5cdd3','stroke-width':'4','stroke-linecap':'round'});
    g.appendChild(pp);
    
    if(active){
      const wf=ns('line');
      setA(wf,{x1:x,y1:railY+6,x2:x,y2:endY,stroke:'url(#waterFlow)','stroke-width':'2.5','stroke-linecap':'round','stroke-dasharray':'5 4'});
      wf.style.animation='flowDown 0.6s linear infinite';wf.style.animationDelay=(i*0.12)+'s';
      g.appendChild(wf);
    }
    
    // --- SHADOW FOR PIXEL TILE ---
    const soilY=515;
    const shadow=ns('ellipse');
    setA(shadow,{cx:x,cy:soilY+8,rx:'26',ry:'6',fill:'rgba(0,0,0,0.25)'});
    g.appendChild(shadow);
    
    // --- IRRIGATION VISUALS ---
    if (irrType === 'Sprinkler') {
      const spBase=ns('rect');
      setA(spBase,{x:x-3,y:endY-2,width:6,height:6,rx:'1',fill:active?'#2980b9':'#95a5a6'});
      g.appendChild(spBase);
      const spHead=ns('circle');
      setA(spHead,{cx:x,cy:endY-4,r:'3',fill:active?'#3498db':'#aab7b8'});
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
    } else if (irrType === 'Flood') {
      const dl=ns('line');
      setA(dl,{x1:x-24,y1:endY,x2:x+24,y2:endY,stroke:active?'#2980b9':'#bdc3c7','stroke-width':'3','stroke-linecap':'round'});
      g.appendChild(dl);

      if(active){
        const pool1=ns('ellipse');
        setA(pool1,{cx:x,cy:endY+12,rx:'26',ry:'7',fill:'#3498db',opacity:'0.5'});
        pool1.style.animation='floodPulse 1.5s ease-in-out infinite';
        g.appendChild(pool1);
        const pool2=ns('ellipse');
        setA(pool2,{cx:x,cy:endY+20,rx:'22',ry:'5',fill:'#5dade2',opacity:'0.3'});
        pool2.style.animation='floodPulse 1.5s ease-in-out infinite';
        pool2.style.animationDelay='0.4s';
        g.appendChild(pool2);
      }
    } else {
      const dl=ns('line');
      setA(dl,{x1:x-22,y1:endY,x2:x+22,y2:endY,stroke:active?'#27ae60':'#bdc3c7','stroke-width':'2.5','stroke-linecap':'round'});
      g.appendChild(dl);

      if(active){
        for(let d=0;d<3;d++){
          const nz=ns('circle');
          setA(nz,{cx:x-16+d*16,cy:endY,r:'2',fill:'#27ae60'});
          g.appendChild(nz);
          
          const dr=ns('circle');setA(dr,{cx:x-16+d*16,cy:endY+4,r:'2',fill:'#3498db',opacity:'0'});
          const a1=ns('animate');setA(a1,{attributeName:'cy',values:(endY+4)+';'+(endY+22),dur:'1.2s',repeatCount:'indefinite',begin:(d*0.3)+'s'});dr.appendChild(a1);
          const a2=ns('animate');setA(a2,{attributeName:'opacity',values:'0;0.8;0',dur:'1.2s',repeatCount:'indefinite',begin:(d*0.3)+'s'});dr.appendChild(a2);
          const a3=ns('animate');setA(a3,{attributeName:'r',values:'2;1',dur:'1.2s',repeatCount:'indefinite',begin:(d*0.3)+'s'});dr.appendChild(a3);
          g.appendChild(dr);
        }
        const wet=ns('ellipse');
        setA(wet,{cx:x,cy:endY+22,rx:'18',ry:'4',fill:'#2e86c1',opacity:'0.35'});
        g.appendChild(wet);
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

    // Crop name label
    const zl=ns('text');
    setA(zl,{x:x,y:soilY+28,'text-anchor':'middle','font-family':'Inter','font-size':'8','font-weight':'700',fill:active?'#d4c89a':'#9e8e6e'});
    zl.textContent=names[i];
    g.appendChild(zl);
    
    const zs=ns('text');
    setA(zs,{x:x,y:soilY+39,'text-anchor':'middle','font-family':'Space Mono','font-size':'6','font-weight':'700',fill:active?'#2ecc71':'#888'});
    zs.textContent=active?'● WATERING':'○ IDLE';
    g.appendChild(zs);
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

// Function to draw beautiful vector plants based on growth stage
function drawCrop(group, x, y, type, stage, active) {
  const op = active ? 1 : 0.6;
  const filter = active ? 'url(#shSm)' : '';

  if (stage === 1) { // Seed
    const seed = ns('ellipse');
    setA(seed, {cx:x, cy:y-2, rx:3, ry:2, fill:'#e67e22', opacity:op});
    group.appendChild(seed);
    return;
  }

  if (type === 'corn') {
    const h = (stage-1) * 16; 
    const stem = ns('line');
    setA(stem, {x1:x, y1:y, x2:x, y2:y-h, stroke:'#2ecc71', 'stroke-width':3, 'stroke-linecap':'round', opacity:op});
    group.appendChild(stem);
    
    const numLeaves = stage * 2;
    for(let l=0; l<numLeaves; l++){
      const ly = y - 5 - (l*7);
      if (ly < y-h) break;
      const side = l%2===0 ? -1 : 1;
      const leaf = ns('path');
      setA(leaf, {d:`M ${x} ${ly} Q ${x+side*12} ${ly-8} ${x+side*18} ${ly+2} Q ${x+side*8} ${ly+4} ${x} ${ly}`, fill:'#27ae60', opacity:op, filter});
      group.appendChild(leaf);
    }
    
    if (stage >= 4) {
      for(let c=0; c<(stage===5?2:1); c++){
        const cy = y - 20 - c*15;
        const side = c%2===0 ? 1 : -1;
        const cob = ns('ellipse');
        setA(cob, {cx:x+side*6, cy:cy, rx:4, ry:8, fill:'#f1c40f', transform:`rotate(${side*20} ${x+side*6} ${cy})`, opacity:op, filter});
        group.appendChild(cob);
      }
    }
  } 
  else if (type === 'blueberry') {
    const r = (stage-1) * 7;
    
    const bushBack = ns('circle');
    setA(bushBack, {cx:x, cy:y-r+2, r:r, fill:'#1e8449', opacity:op, filter});
    group.appendChild(bushBack);
    
    const bushFront = ns('circle');
    setA(bushFront, {cx:x-r*0.2, cy:y-r*0.8, r:r*0.7, fill:'#2ecc71', opacity:op});
    group.appendChild(bushFront);

    if (stage >= 4) {
      const bColor = stage === 5 ? '#3498db' : '#85c1e9';
      const numBerries = stage === 5 ? 8 : 4;
      for(let b=0; b<numBerries; b++){
        const bx = x + Math.sin(b*45) * (r*0.6);
        const by = (y-r) + Math.cos(b*45) * (r*0.6);
        const berry = ns('circle');
        setA(berry, {cx:bx, cy:by, r:2.5, fill:bColor, opacity:op});
        group.appendChild(berry);
      }
    }
  }
  else if (type === 'watermelon') {
    const spread = (stage-1) * 12;
    
    const vine = ns('path');
    setA(vine, {d:`M ${x-spread} ${y-2} Q ${x} ${y-10} ${x+spread} ${y-2}`, fill:'none', stroke:'#229954', 'stroke-width':2.5, opacity:op});
    group.appendChild(vine);
    
    const numLeaves = stage * 2;
    for(let l=0; l<numLeaves; l++){
      const lx = (x-spread) + (l * (spread*2 / numLeaves));
      const leaf = ns('circle');
      setA(leaf, {cx:lx, cy:y-4, r:4+(stage*0.5), fill:'#27ae60', opacity:op, filter});
      group.appendChild(leaf);
    }

    if (stage >= 4) {
      const mColor = stage === 5 ? '#196f3d' : '#abebc6';
      const mSize = stage === 5 ? 8 : 4;
      const melon1 = ns('ellipse');
      setA(melon1, {cx:x-spread*0.5, cy:y-mSize+2, rx:mSize+2, ry:mSize, fill:mColor, opacity:op, filter});
      group.appendChild(melon1);
      
      if (stage === 5) {
        const melon2 = ns('ellipse');
        setA(melon2, {cx:x+spread*0.6, cy:y-mSize+2, rx:mSize+2, ry:mSize, fill:mColor, opacity:op, filter});
        group.appendChild(melon2);
        
        // Add stripes
        const stripe = ns('path');
        setA(stripe, {d:`M ${x-spread*0.5-mSize} ${y-mSize+2} Q ${x-spread*0.5} ${y-mSize-2} ${x-spread*0.5+mSize} ${y-mSize+2}`, fill:'none', stroke:'#2ecc71', 'stroke-width':1.5, opacity:op});
        group.appendChild(stripe);
      }
    }
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
