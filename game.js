let farmerName='',acreage=0,irrType='Drip',simTimer=null;
const N=8,on=[false,false,false,false,false,false,false,false];
const crops=['🌱','🌶️','🥒','🌿','🌾','🍅','🫑','🌻'];
const names=['Tomato','Pepper','Cucumber','Herbs','Wheat','Tomato B','Capsicum','Sunflower'];

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
    
    for(let i=0;i<N;i++) on[i]=true;
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

      if(t % 3 === 0 && t > 2) {
        let r = Math.floor(Math.random() * N);
        on[r] = !on[r];
        build();
      }
      if(t === 2) {
        for(let i=0;i<N;i++) on[i]=true;
        build();
      }
      
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

  for(let i=0;i<N;i++) on[i]=false;
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
    const vg=ns('g');vg.style.cursor='pointer';
    vg.onclick=()=>{on[i]=!on[i];build();};
    
    // Valve box
    const vb=ns('rect');
    setA(vb,{x:x-11,y:railY-22,width:22,height:22,rx:'4',fill:active?'#2980b9':'#7f8c8d',stroke:active?'#2471a3':'#5d6d7e','stroke-width':'2'});
    vg.appendChild(vb);
    const vc=ns('circle');
    setA(vc,{cx:x,cy:railY-16,r:'6',fill:active?'#3498db':'#95a5a6',stroke:active?'#2e86c1':'#7f8c8d','stroke-width':'1.5'});
    vg.appendChild(vc);
    const led=ns('circle');
    setA(led,{cx:x,cy:railY-16,r:'2.5',fill:active?'#2ecc71':'#bdc3c7'});
    if(active){const an=ns('animate');setA(an,{attributeName:'opacity',values:'1;0.3;1',dur:'1.5s',repeatCount:'indefinite'});led.appendChild(an);}
    vg.appendChild(led);
    const lbl=ns('text');
    setA(lbl,{x:x,y:railY-28,'text-anchor':'middle','font-family':'Space Mono','font-size':'7','font-weight':'700',fill:active?'#2980b9':'#95a5a6'});
    lbl.textContent='V'+(i+1);vg.appendChild(lbl);g.appendChild(vg);
    
    // Uniform pipe drop for perfect horizontal alignment
    const endY = 490;
    const pp=ns('line');
    setA(pp,{x1:x,y1:railY+6,x2:x,y2:endY,stroke:active?'#8e9aa0':'#c5cdd3','stroke-width':'4','stroke-linecap':'round'});
    g.appendChild(pp);
    if(active){
      const wf=ns('line');
      setA(wf,{x1:x,y1:railY+6,x2:x,y2:endY,stroke:'#3498db','stroke-width':'2.5','stroke-linecap':'round','stroke-dasharray':'5 4'});
      wf.style.animation='flowDown 0.6s linear infinite';wf.style.animationDelay=(i*0.12)+'s';
      g.appendChild(wf);
    }
    
    // --- IRRIGATION VISUALS ACCORDING TO TYPE ---
    if (irrType === 'Sprinkler') {
      const spHead = ns('circle');
      setA(spHead, {cx:x, cy:endY, r:'4', fill:active?'#3498db':'#95a5a6'});
      g.appendChild(spHead);

      if (active) {
        const arc1 = ns('path');
        setA(arc1, {d:`M ${x} ${endY} Q ${x-22} ${endY-25} ${x-40} ${endY}`, fill:'none', stroke:'#3498db', 'stroke-width':'2', 'stroke-dasharray':'4 3'});
        arc1.style.animation = 'sprayArc 0.8s linear infinite';
        g.appendChild(arc1);

        const arc2 = ns('path');
        setA(arc2, {d:`M ${x} ${endY} Q ${x+22} ${endY-25} ${x+40} ${endY}`, fill:'none', stroke:'#3498db', 'stroke-width':'2', 'stroke-dasharray':'4 3'});
        arc2.style.animation = 'sprayArc 0.8s linear infinite';
        g.appendChild(arc2);
      }
    } else if (irrType === 'Flood') {
      const dl=ns('line');
      setA(dl,{x1:x-22,y1:endY,x2:x+22,y2:endY,stroke:active?'#2980b9':'#bdc3c7','stroke-width':'3','stroke-linecap':'round'});
      g.appendChild(dl);

      if (active) {
        const pool = ns('ellipse');
        setA(pool, {cx:x, cy:endY+25, rx:'24', ry:'6', fill:'#3498db', opacity:'0.6'});
        pool.style.animation = 'floodPulse 1.2s ease-in-out infinite';
        g.appendChild(pool);
      }
    } else {
      // Drip
      const dl=ns('line');
      setA(dl,{x1:x-22,y1:endY,x2:x+22,y2:endY,stroke:active?'#27ae60':'#bdc3c7','stroke-width':'2.5','stroke-linecap':'round'});
      g.appendChild(dl);

      if(active){
        for(let d=0;d<3;d++){
          const dr=ns('circle');setA(dr,{cx:x-16+d*16,cy:endY+4,r:'2.5',fill:'#3498db',opacity:'0'});
          const a1=ns('animate');setA(a1,{attributeName:'cy',values:(endY+4)+';'+(endY+24),dur:'1.3s',repeatCount:'indefinite',begin:(d*0.35)+'s'});dr.appendChild(a1);
          const a2=ns('animate');setA(a2,{attributeName:'opacity',values:'0;0.7;0',dur:'1.3s',repeatCount:'indefinite',begin:(d*0.35)+'s'});dr.appendChild(a2);
          g.appendChild(dr);
        }
        const wet = ns('ellipse');
        setA(wet, {cx:x, cy:endY+24, rx:'16', ry:'4', fill:'#2e86c1', opacity:'0.45'});
        g.appendChild(wet);
      }
    }

    // --- PLANT & CROP (Grounded at soilY = 515) ---
    const soilY = 515;
    const plantTopY = 465;
    const plantGroup = ns('g');
    if (active) {
      plantGroup.style.transformOrigin = `${x}px ${soilY}px`;
      plantGroup.style.animation = 'plantSway 2s ease-in-out infinite';
    }

    // Main Plant Stem
    const stem=ns('line');
    setA(stem,{x1:x,y1:soilY,x2:x,y2:plantTopY,stroke:active?'#27ae60':'#4a7832','stroke-width':'2.5','stroke-linecap':'round'});
    plantGroup.appendChild(stem);

    // Leaves along stem
    for(let lf=0;lf<3;lf++){
      const ly=soilY-12-lf*12,side=lf%2===0?-1:1;
      const leaf=ns('ellipse');
      setA(leaf,{cx:x+side*9,cy:ly,rx:active?'9':'6',ry:active?'5':'3',fill:active?'#2ecc71':'#a0a0a0',opacity:active?'0.85':'0.4',transform:'rotate('+(side*25)+' '+(x+side*9)+' '+ly+')'});
      plantGroup.appendChild(leaf);
    }

    // Crop Emoji neatly on top of stem
    const ce=ns('text');
    setA(ce,{x:x,y:plantTopY-8,'text-anchor':'middle','font-size':active?'20':'14'});
    ce.textContent=crops[i];
    plantGroup.appendChild(ce);

    if (active) {
      const spk=ns('text');
      setA(spk,{x:x+14,y:plantTopY-14,'text-anchor':'middle','font-size':'10'});
      spk.textContent='✨';
      plantGroup.appendChild(spk);
    }

    g.appendChild(plantGroup);

    // Crop Labels below ground
    const zl=ns('text');setA(zl,{x:x,y:soilY+20,'text-anchor':'middle','font-family':'Inter','font-size':'8','font-weight':'700',fill:active?'#c9b896':'#a09070'});zl.textContent=names[i];g.appendChild(zl);
    const zs=ns('text');setA(zs,{x:x,y:soilY+31,'text-anchor':'middle','font-family':'Space Mono','font-size':'6','font-weight':'700',fill:active?'#2ecc71':'#999'});zs.textContent=active?'● WATERING':'○ IDLE';g.appendChild(zs);
  }

  const flowing=on.some(z=>z);
  document.querySelectorAll('.wfh').forEach(el=>{el.style.animation=flowing?'flowRight 0.7s linear infinite':'none';el.style.opacity=flowing?'1':'0.15';});
  document.querySelectorAll('.wfv').forEach(el=>{el.style.animation=flowing?'flowDown 0.6s linear infinite':'none';el.style.opacity=flowing?'1':'0.15';});
  const pb=document.getElementById('pumpBlade');
  if(pb) pb.style.animation=flowing?'pumpSpin 0.7s linear infinite':'none';
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
