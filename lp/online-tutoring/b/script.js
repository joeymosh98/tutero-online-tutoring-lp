// ═══════════════════════════════════════════════════════════════
// Tutero Landing Page — Online Tutoring Variant B
// Uses: TuteroForms, TuteroLead, TuteroConfetti,
//       TuteroSubmit, TuteroCarousel (from /shared/)
// ═══════════════════════════════════════════════════════════════

var LEAD_CONFIG = { landingPage: 'Online Tutoring Australia - Claude Code', variant: 'b' };
var REDIRECT_URL = 'https://www.tutero.com/au/form/submission-confirmed';

function animateSubmit(btn) { TuteroSubmit.animateSubmit(btn, REDIRECT_URL); }

// ── Hero Image Carousel ──
TuteroCarousel.init();

// ── Hero Modal Form ──
var modalOverlay = document.getElementById('modalOverlay');
var heroCtaBtn = document.getElementById('heroCtaBtn');
var modalClose = document.getElementById('modalClose');
var heroSubject = document.getElementById('heroSubject');

function setModalSubject(subject) {
  var el = document.getElementById('modalSubject');
  el.textContent = subject ? 'a ' + subject : 'a';
}
function clearAllModalErrors() {
  var s = document.getElementById('ms0'); if (s) TuteroForms.clearStepErrors(s);
  var s3 = document.getElementById('ms3'); if (s3) TuteroForms.clearStepErrors(s3);
}
function openModal() {
  setModalSubject();
  clearAllModalErrors();
  modalOverlay.classList.add('active');
  document.getElementById('mStudentName').focus({ preventScroll: true });
}
window.openModalWithSubject = function(subject) {
  setModalSubject(subject);
  clearAllModalErrors();
  modalOverlay.classList.add('active');
  document.getElementById('mStudentName').focus({ preventScroll: true });
};
window.openModalWithYear = function(year) {
  setModalSubject();
  clearAllModalErrors();
  document.getElementById('mYearLevel').value = year;
  modalOverlay.classList.add('active');
  document.getElementById('mStudentName').focus({ preventScroll: true });
};
heroCtaBtn.addEventListener('click', function() { openModalWithSubject(heroSubject.options[heroSubject.selectedIndex].text); });
heroSubject.addEventListener('keydown', function(e) { if (e.key === 'Enter') { e.preventDefault(); heroCtaBtn.click(); } });
var promoCta = document.getElementById('promoCta');
if (promoCta) promoCta.addEventListener('click', function(e) { e.preventDefault(); openModal(); });
modalClose.addEventListener('click', function() { modalOverlay.classList.remove('active'); });
modalOverlay.addEventListener('click', function(e) { if (e.target === modalOverlay) modalOverlay.classList.remove('active'); });

// Modal steps
var mSteps = [document.getElementById('ms0'), document.getElementById('ms1'), document.getElementById('ms2'), document.getElementById('ms3')];
var mDots = document.querySelectorAll('.modal-step-dot');
function mGoTo(n) {
  mSteps.forEach(function(s) { s.classList.remove('active'); });
  mSteps[n].classList.add('active');
  mDots.forEach(function(d, i) { d.classList.remove('active', 'done'); if (i < n) d.classList.add('done'); if (i === n) d.classList.add('active'); });
}

// Step 1: Student info
var mSN = document.getElementById('mStudentName'), mYL = document.getElementById('mYearLevel'), mTo2 = document.getElementById('mToStep2');
function validateModalStep0() {
  var valid = true;
  if (!mSN.value.trim()) { TuteroForms.showFieldError(mSN); valid = false; } else { TuteroForms.clearFieldError(mSN); }
  if (!mYL.value.trim()) { TuteroForms.showFieldError(mYL); valid = false; } else { TuteroForms.clearFieldError(mYL); }
  return valid;
}
[mSN, mYL].forEach(function(i) {
  i.addEventListener('input', function() {
    TuteroForms.toggleBtn(mTo2, mSN.value.trim() && mYL.value.trim());
    if (i.value.trim()) TuteroForms.clearFieldError(i);
  });
});
mTo2.addEventListener('click', function() {
  if (mTo2.classList.contains('btn-disabled')) { validateModalStep0(); return; }
  var name = TuteroForms.capitalise(mSN.value.trim());
  mSN.value = name;
  document.getElementById('mGoalName').textContent = name;
  document.getElementById('mStudentNameEcho').textContent = name;
  document.getElementById('mCtaName').textContent = name;
  mGoTo(1);
});
TuteroForms.enterToSubmit(mSteps[0], mTo2, validateModalStep0);

// Step 2: Goal pills (auto-advance)
document.querySelectorAll('#mGoalPills .modal-pill').forEach(function(p) {
  p.addEventListener('click', function() {
    document.querySelectorAll('#mGoalPills .modal-pill').forEach(function(x) { x.classList.remove('selected'); });
    p.classList.add('selected');
    setTimeout(function() { mGoTo(2); }, 350);
  });
});
document.getElementById('mBack1').addEventListener('click', function() { mGoTo(0); });

// Step 3: Urgency pills (auto-advance)
document.querySelectorAll('#mUrgencyPills .modal-pill').forEach(function(p) {
  p.addEventListener('click', function() {
    document.querySelectorAll('#mUrgencyPills .modal-pill').forEach(function(x) { x.classList.remove('selected'); });
    p.classList.add('selected');
    setTimeout(function() { mGoTo(3); }, 350);
  });
});
document.getElementById('mBack2').addEventListener('click', function() { mGoTo(1); });

// Step 4: Contact details
var mPN = document.getElementById('mParentName'), mEM = document.getElementById('mEmail'), mPH = document.getElementById('mPhone'), mST = document.getElementById('mState'), mSub = document.getElementById('mSubmit');
var modalPhone = { digits: '' };
var phoneDigits = '';
mPH.addEventListener('input', function() { TuteroForms.formatPhone(mPH, modalPhone); phoneDigits = modalPhone.digits; });
function validateModalStep3() {
  var valid = true;
  if (!mPN.value.trim()) { TuteroForms.showFieldError(mPN); valid = false; } else { TuteroForms.clearFieldError(mPN); }
  if (!TuteroForms.isValidEmail(mEM.value.trim())) { TuteroForms.showFieldError(mEM); valid = false; } else { TuteroForms.clearFieldError(mEM); }
  if (phoneDigits.length < 10) { TuteroForms.showFieldError(mPH); valid = false; } else { TuteroForms.clearFieldError(mPH); }
  if (!mST.value) { TuteroForms.showFieldError(mST); valid = false; } else { TuteroForms.clearFieldError(mST); }
  return valid;
}
function checkStep4() { TuteroForms.toggleBtn(mSub, mPN.value.trim() && TuteroForms.isValidEmail(mEM.value.trim()) && phoneDigits.length >= 10 && mST.value); }
[mPN, mEM, mPH].forEach(function(i) {
  i.addEventListener('input', function() {
    checkStep4();
    if (i === mPN && mPN.value.trim()) TuteroForms.clearFieldError(mPN);
    if (i === mEM && TuteroForms.isValidEmail(mEM.value.trim())) TuteroForms.clearFieldError(mEM);
    if (i === mPH && phoneDigits.length >= 10) TuteroForms.clearFieldError(mPH);
  });
});
mST.addEventListener('change', function() { checkStep4(); if (mST.value) { TuteroForms.clearFieldError(mST); mST.classList.remove('is-placeholder'); } });
document.getElementById('mBack3').addEventListener('click', function() { TuteroForms.clearStepErrors(mSteps[3]); mGoTo(2); });
mSub.addEventListener('click', function() {
  if (mSub.classList.contains('btn-disabled')) { validateModalStep3(); return; }
  var selectedGoal = document.querySelector('#mGoalPills .modal-pill.selected');
  var selectedUrgency = document.querySelector('#mUrgencyPills .modal-pill.selected');
  TuteroLead.submit({
    source: 'modal',
    student_name: mSN.value.trim(),
    year_level: mYL.value.trim(),
    state: mST.value,
    subject: (document.getElementById('modalSubject').textContent || '').replace(/^a\s*/, '') || '',
    goal: selectedGoal ? selectedGoal.dataset.val : '',
    urgency: selectedUrgency ? selectedUrgency.dataset.val : '',
    parent_name: mPN.value.trim(),
    email: mEM.value.trim(),
    phone: mPH.value.trim()
  }, LEAD_CONFIG);
  animateSubmit(mSub);
});
TuteroForms.enterToSubmit(mSteps[3], mSub, validateModalStep3);
