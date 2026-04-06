// src/proxy.conf.js
const TARGET = 'https://hci-bio-app-old.hci.utah.edu:8445';
const TARGET_ORIGIN = 'https://hci-bio-app-old.hci.utah.edu:8445';

module.exports = {
  '/gnomex': {
    target: TARGET,
    secure: false,
    changeOrigin: true,
    logLevel: 'debug',

    // Let Angular dev server serve the SPA shell (prevents old index.html from Tomcat)
    bypass(req) {
      const accept = req.headers.accept || '';
      if (accept.includes('text/html')) {
        return '/gnomex/index.html';
      }
      return null; // proxy everything else
    },

    onProxyReq(proxyReq, req, res) {
      // ✅ Make backend think requests originate from itself (or at least an allowed origin)
      proxyReq.setHeader('Origin', TARGET_ORIGIN);
      proxyReq.setHeader('Referer', `${TARGET_ORIGIN}/gnomex/`);

      // Alternative approach (sometimes better): remove Origin entirely
      // proxyReq.removeHeader('origin');
    },

    // Optional if you run into session cookie domain issues:
    // cookieDomainRewrite: 'localhost',
  },
};
