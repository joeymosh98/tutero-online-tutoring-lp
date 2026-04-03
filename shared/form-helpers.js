// /shared/form-helpers.js — Form validation, phone formatting, UI helpers
(function() {
  'use strict';

  function isValidEmail(e) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e);
  }

  function formatPhone(input, store) {
    var raw = input.value;
    var hasPlus = raw.trimStart().startsWith('+');
    var digits = raw.replace(/\D/g, '');
    if (hasPlus && digits.startsWith('61')) digits = '0' + digits.slice(2);
    else if (digits.startsWith('610') && digits.length > 10) digits = '0' + digits.slice(2);
    else if (digits.startsWith('61') && digits.length > 10) digits = '0' + digits.slice(2);
    if (digits.length > 10) digits = digits.slice(0, 10);
    store.digits = digits;
    var formatted = digits;
    if (digits.length > 4 && digits.length <= 7) formatted = digits.slice(0, 4) + ' ' + digits.slice(4);
    else if (digits.length > 7) formatted = digits.slice(0, 4) + ' ' + digits.slice(4, 7) + ' ' + digits.slice(7);
    if (input.value !== formatted) {
      var pos = input.selectionStart;
      var diff = formatted.length - input.value.length;
      input.value = formatted;
      input.setSelectionRange(pos + diff, pos + diff);
    }
    return digits;
  }

  function showFieldError(input) {
    var wrap = input.closest('.field-wrap') || input.closest('.select-wrapper');
    if (wrap) wrap.classList.add('has-error');
  }

  function clearFieldError(input) {
    var wrap = input.closest('.field-wrap') || input.closest('.select-wrapper');
    if (wrap) wrap.classList.remove('has-error');
  }

  function clearStepErrors(stepEl) {
    stepEl.querySelectorAll('.has-error').forEach(function(el) { el.classList.remove('has-error'); });
  }

  function toggleBtn(btn, enabled) {
    if (enabled) btn.classList.remove('btn-disabled');
    else btn.classList.add('btn-disabled');
  }

  function enterToSubmit(stepEl, btnEl, validateFn) {
    stepEl.querySelectorAll('input,select').forEach(function(el) {
      el.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          if (!btnEl.classList.contains('btn-disabled')) btnEl.click();
          else if (validateFn) validateFn();
        }
      });
    });
  }

  function capitalise(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  window.TuteroForms = {
    isValidEmail: isValidEmail,
    formatPhone: formatPhone,
    showFieldError: showFieldError,
    clearFieldError: clearFieldError,
    clearStepErrors: clearStepErrors,
    toggleBtn: toggleBtn,
    enterToSubmit: enterToSubmit,
    capitalise: capitalise
  };
})();
