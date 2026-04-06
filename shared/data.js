// /shared/data.js — Shared data helpers and Australian state mappings
(function() {
  'use strict';

  var STATE_MAP = {
    'NSW': 'New South Wales',
    'VIC': 'Victoria',
    'QLD': 'Queensland',
    'SA': 'South Australia',
    'WA': 'Western Australia',
    'TAS': 'Tasmania',
    'NT': 'Northern Territory',
    'ACT': 'Australian Capital Territory'
  };

  function getStateFullName(abbr) {
    return STATE_MAP[abbr] || abbr;
  }

  function escHtml(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  window.TuteroData = {
    getStateFullName: getStateFullName,
    escHtml: escHtml,
    STATE_MAP: STATE_MAP
  };
})();
