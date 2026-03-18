// ── Lead Submission (single endpoint for all forms) ──
var WEBHOOK_URL = 'https://hook.eu1.make.com/46pou90x59vasab9ljivd78sfazjgztv';
function submitLeadData(data) {
  // Add page-level context
  data.landing_page = 'Online Tutoring Australia - Claude Code';
  data.variant = 'b';
  data.page = window.location.href;
  data.timestamp = new Date().toISOString();
  data.referrer = document.referrer || '';
  // UTM params
  var params = new URLSearchParams(window.location.search);
  data.utm_source = params.get('utm_source') || '';
  data.utm_medium = params.get('utm_medium') || '';
  data.utm_campaign = params.get('utm_campaign') || '';
  data.utm_term = params.get('utm_term') || '';
  data.utm_content = params.get('utm_content') || '';
  data.gclid = params.get('gclid') || '';
  // Send to webhook
  if (WEBHOOK_URL) {
    fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).catch(function() {});
  }
  console.log('[Lead]', data);
}

// ── Hero Image Carousel ──
(function(){
  const imgs=document.querySelectorAll('.image-wrapper img');
  const dots=document.querySelectorAll('.hero-dot');
  const badgeLabel=document.querySelector('.live-badge');
  let current=0;
  function goTo(n){
    imgs[current].classList.remove('active');
    dots[current].classList.remove('active');
    current=n;
    imgs[current].classList.add('active');
    dots[current].classList.add('active');
    if(badgeLabel&&imgs[current].dataset.badge){badgeLabel.lastChild.textContent=' '+imgs[current].dataset.badge;}
  }
  dots.forEach(d=>d.addEventListener('click',()=>goTo(parseInt(d.dataset.slide))));
  setInterval(()=>goTo((current+1)%imgs.length),5500);
})();

// ── Hero Modal Form ──
const modalOverlay=document.getElementById('modalOverlay');
const heroCtaBtn=document.getElementById('heroCtaBtn');
const modalClose=document.getElementById('modalClose');
const heroSubject=document.getElementById('heroSubject');

function setModalSubject(subject){
  var el=document.getElementById('modalSubject');
  if(subject){el.textContent='a '+subject;}else{el.textContent='a';}
}
function openModal(){
  setModalSubject();
  modalOverlay.classList.add('active');
  document.getElementById('mStudentName').focus({preventScroll:true});
}
window.openModalWithSubject=function(subject){
  setModalSubject(subject);
  modalOverlay.classList.add('active');
  document.getElementById('mStudentName').focus({preventScroll:true});
};
window.openModalWithYear=function(year){
  setModalSubject();
  document.getElementById('mYearLevel').value=year;
  modalOverlay.classList.add('active');
  document.getElementById('mStudentName').focus({preventScroll:true});
};
heroCtaBtn.addEventListener('click',function(){openModalWithSubject(heroSubject.options[heroSubject.selectedIndex].text);});
const promoCta=document.getElementById('promoCta');
if(promoCta) promoCta.addEventListener('click',e=>{e.preventDefault();openModal();});
modalClose.addEventListener('click',()=>modalOverlay.classList.remove('active'));
modalOverlay.addEventListener('click',e=>{if(e.target===modalOverlay)modalOverlay.classList.remove('active')});

// Modal steps
const mSteps=[document.getElementById('ms0'),document.getElementById('ms1'),document.getElementById('ms2'),document.getElementById('ms3')];
const mDots=document.querySelectorAll('.modal-step-dot');
function mGoTo(n){mSteps.forEach(s=>s.classList.remove('active'));mSteps[n].classList.add('active');mDots.forEach((d,i)=>{d.classList.remove('active','done');if(i<n)d.classList.add('done');if(i===n)d.classList.add('active')})}

// Auto-capitalise helper
function capitalise(str){return str.charAt(0).toUpperCase()+str.slice(1)}

// Step 1: Student info
const mSN=document.getElementById('mStudentName'),mYL=document.getElementById('mYearLevel'),mTo2=document.getElementById('mToStep2');
[mSN,mYL].forEach(i=>i.addEventListener('input',()=>{mTo2.disabled=!(mSN.value.trim()&&mYL.value.trim())}));
mTo2.addEventListener('click',()=>{
  const name=capitalise(mSN.value.trim());
  mSN.value=name;
  document.getElementById('mGoalName').textContent=name;
  document.getElementById('mStudentNameEcho').textContent=name;
  document.getElementById('mCtaName').textContent=name;
  mGoTo(1);
});

// Step 2: Goal pills (auto-advance)
document.querySelectorAll('#mGoalPills .modal-pill').forEach(p=>{
  p.addEventListener('click',()=>{
    document.querySelectorAll('#mGoalPills .modal-pill').forEach(x=>x.classList.remove('selected'));
    p.classList.add('selected');
    setTimeout(()=>mGoTo(2),350);
  });
});
document.getElementById('mBack1').addEventListener('click',()=>mGoTo(0));

// Step 3: Urgency pills (auto-advance)
document.querySelectorAll('#mUrgencyPills .modal-pill').forEach(p=>{
  p.addEventListener('click',()=>{
    document.querySelectorAll('#mUrgencyPills .modal-pill').forEach(x=>x.classList.remove('selected'));
    p.classList.add('selected');
    setTimeout(()=>mGoTo(3),350);
  });
});
document.getElementById('mBack2').addEventListener('click',()=>mGoTo(1));

// Step 4: Contact details
const mPN=document.getElementById('mParentName'),mEM=document.getElementById('mEmail'),mPH=document.getElementById('mPhone'),mSub=document.getElementById('mSubmit');
var modalPhone={digits:''};
var phoneDigits='';
mPH.addEventListener('input',()=>{formatPhone(mPH,modalPhone);phoneDigits=modalPhone.digits});
function isValidEmail(e){return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e)}
function formatPhone(input,store){
  let raw=input.value;
  let hasPlus=raw.trimStart().startsWith('+');
  let digits=raw.replace(/\D/g,'');
  if(hasPlus&&digits.startsWith('61')){digits='0'+digits.slice(2)}
  else if(digits.startsWith('610')&&digits.length>10){digits='0'+digits.slice(2)}
  else if(digits.startsWith('61')&&digits.length>10){digits='0'+digits.slice(2)}
  if(digits.length>10) digits=digits.slice(0,10);
  store.digits=digits;
  let formatted=digits;
  if(digits.length>4&&digits.length<=7) formatted=digits.slice(0,4)+' '+digits.slice(4);
  else if(digits.length>7) formatted=digits.slice(0,4)+' '+digits.slice(4,7)+' '+digits.slice(7);
  if(input.value!==formatted){
    const pos=input.selectionStart;
    const diff=formatted.length-input.value.length;
    input.value=formatted;
    input.setSelectionRange(pos+diff,pos+diff);
  }
}
[mPN,mEM,mPH].forEach(i=>i.addEventListener('input',()=>{
  mSub.disabled=!(mPN.value.trim()&&isValidEmail(mEM.value.trim())&&phoneDigits.length>=10);
}));
document.getElementById('mBack3').addEventListener('click',()=>mGoTo(2));
mSub.addEventListener('click',()=>{
  var selectedGoal=document.querySelector('#mGoalPills .modal-pill.selected');
  var selectedUrgency=document.querySelector('#mUrgencyPills .modal-pill.selected');
  submitLeadData({
    source: 'modal',
    student_name: mSN.value.trim(),
    year_level: mYL.value.trim(),
    subject: (document.getElementById('modalSubject').textContent||'').replace(/^a\s*/,'') || '',
    goal: selectedGoal ? selectedGoal.dataset.val : '',
    urgency: selectedUrgency ? selectedUrgency.dataset.val : '',
    parent_name: mPN.value.trim(),
    email: mEM.value.trim(),
    phone: mPH.value.trim()
  });
  document.getElementById('modalForm').style.display='none';
  document.getElementById('mSuccessName').textContent=capitalise(mSN.value.trim());
  document.getElementById('modalSuccess').classList.add('active');
  launchConfetti();
});

// ── Confetti ──
function launchConfetti(){const c=document.getElementById('confettiCanvas'),ctx=c.getContext('2d');c.width=window.innerWidth;c.height=window.innerHeight;const cols=['#FF8412','#F8B200','#4CB092','#00A3FF','#1D49E3','#FF6B6B'],ps=[];for(let i=0;i<120;i++)ps.push({x:c.width/2+(Math.random()-.5)*200,y:c.height/2,vx:(Math.random()-.5)*16,vy:Math.random()*-18-4,w:Math.random()*8+4,h:Math.random()*6+3,color:cols[Math.floor(Math.random()*cols.length)],rot:Math.random()*360,rs:(Math.random()-.5)*12,g:.3+Math.random()*.2,o:1});let f=0;function a(){ctx.clearRect(0,0,c.width,c.height);let alive=false;ps.forEach(p=>{p.x+=p.vx;p.vy+=p.g;p.y+=p.vy;p.rot+=p.rs;p.vx*=.99;if(f>40)p.o-=.015;if(p.o<=0)return;alive=true;ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.rot*Math.PI/180);ctx.globalAlpha=Math.max(0,p.o);ctx.fillStyle=p.color;ctx.fillRect(-p.w/2,-p.h/2,p.w,p.h);ctx.restore()});f++;if(alive)requestAnimationFrame(a);else ctx.clearRect(0,0,c.width,c.height)}a()}
