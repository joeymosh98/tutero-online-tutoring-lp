// /shared/analytics.js — Centralized analytics: GA4, Facebook Pixel, Google Ads
(function() {
  'use strict';

  var CONFIG = { ga4Id: '', fbPixelId: '', gadsId: '', gadsLabel: '' };
  var initialized = false;

  function init(opts) {
    if (initialized) return;
    initialized = true;
    opts = opts || {};
    CONFIG.ga4Id = opts.ga4Id || '';
    CONFIG.fbPixelId = opts.fbPixelId || '';
    CONFIG.gadsId = opts.gadsId || '';
    CONFIG.gadsLabel = opts.gadsLabel || '';

    // Only load tracking scripts on production
    if (window.location.hostname !== 'try.tutero.com') return;

    if (CONFIG.ga4Id) loadGA4(CONFIG.ga4Id);
    if (CONFIG.fbPixelId) loadFBPixel(CONFIG.fbPixelId);
    if (CONFIG.gadsId) loadGAds(CONFIG.gadsId);
  }

  function loadGA4(id) {
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + id;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function() { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', id, { send_page_view: true });
  }

  function loadFBPixel(id) {
    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){
    n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;
    s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}
    (window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
    window.fbq('init', id);
    window.fbq('track', 'PageView');
  }

  function loadGAds(id) {
    if (window.gtag) {
      window.gtag('config', id);
      return;
    }
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + id;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function() { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', id);
  }

  function trackLead(data) {
    if (!initialized) return;
    if (window.gtag && CONFIG.ga4Id) {
      window.gtag('event', 'generate_lead', {
        event_category: 'conversion',
        landing_page: data.landing_page || '',
        variant: data.variant || '',
        source: data.source || ''
      });
    }
    if (window.fbq) {
      window.fbq('track', 'Lead', {
        content_name: data.landing_page || '',
        content_category: data.variant || ''
      });
    }
    if (window.gtag && CONFIG.gadsId && CONFIG.gadsLabel) {
      window.gtag('event', 'conversion', {
        send_to: CONFIG.gadsId + '/' + CONFIG.gadsLabel
      });
    }
  }

  function trackStep(stepName, stepIndex) {
    if (!initialized) return;
    if (window.gtag) {
      window.gtag('event', 'form_step', {
        event_category: 'engagement',
        step_name: stepName,
        step_index: stepIndex
      });
    }
  }

  function trackEvent(name, params) {
    if (!initialized) return;
    if (window.gtag) window.gtag('event', name, params || {});
    if (window.fbq) window.fbq('trackCustom', name, params || {});
  }

  window.TuteroAnalytics = {
    init: init,
    trackLead: trackLead,
    trackStep: trackStep,
    trackEvent: trackEvent
  };
})();
