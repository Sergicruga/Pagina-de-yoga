/*
Supabase client loader for a static site or bundler-based app.

Usage (static, no bundler):
  1) Add supabase-js UMD before this script in `index.html`:
     <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js/dist/umd/supabase.min.js"></script>
  2) Add meta tags with your project values in the <head>:
     <meta name="supabase-url" content="https://xyz.supabase.co">
     <meta name="supabase-anon-key" content="sb_publishable_...">
  3) Include this script after the meta tags:
     <script src="/supabaseClient.js"></script>
  4) Use the client via the global `getSupabase()` promise:
     getSupabase().then(supabase => { /* use supabase */ });

Usage (bundler / ESM):
  import { getSupabase } from './supabaseClient.js';
  const supabase = await getSupabase();

This file attempts multiple approaches to create a client:
 - Reads config from `window.__SUPABASE_CONFIG` (preferred for programmatic injection)
 - Falls back to meta tags `supabase-url` and `supabase-anon-key`
 - Uses a global UMD `supabase.createClient` if you included the CDN
 - Falls back to dynamic ESM import from jsDelivr
*/
(function (global) {
  function readMeta(name) {
    if (typeof document === 'undefined') return '';
    var m = document.querySelector('meta[name="' + name + '"]');
    return m ? m.content : '';
  }

  function getConfig() {
    var cfg = (global && global.__SUPABASE_CONFIG) || {};
    var url = cfg.url || readMeta('supabase-url') || (typeof process !== 'undefined' && process.env && (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL)) || '';
    var anonKey = cfg.anonKey || readMeta('supabase-anon-key') || (typeof process !== 'undefined' && process.env && (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY)) || '';
    return { url: url, anonKey: anonKey };
  }

  async function createClientInstance() {
    var _a;
    var cfg = getConfig();
    var url = cfg.url;
    var anonKey = cfg.anonKey;

    if (!url || !anonKey) {
      console.warn('Supabase config not found. Set window.__SUPABASE_CONFIG or meta tags before loading supabaseClient.js');
      return null;
    }

    // 1) UMD global from CDN: `supabase.createClient`
    if (global && global.supabase && typeof global.supabase.createClient === 'function') {
      try {
        return global.supabase.createClient(url, anonKey);
      } catch (e) {
        console.error('Error creating supabase client from global UMD:', e);
      }
    }

    // 2) If a bundler has provided `createClient` in scope (rare for globals), try it
    try {
      if (typeof createClient === 'function') {
        return createClient(url, anonKey);
      }
    } catch (e) {
      // ignore
    }

    // 3) Dynamic ESM import from jsDelivr (+esm build)
    try {
      var mod = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm');
      if (mod && typeof mod.createClient === 'function') {
        return mod.createClient(url, anonKey);
      }
    } catch (e) {
      // ignore
    }

    console.error('Unable to initialize Supabase client. Include @supabase/supabase-js or use a bundler.');
    return null;
  }

  var clientPromise = null;
  function getSupabase() {
    if (!clientPromise) clientPromise = createClientInstance();
    return clientPromise;
  }

  // Expose helpers
  global.getSupabase = getSupabase;
  global.supabaseClientPromise = clientPromise;

  // ESM export support
  try {
    if (typeof exports !== 'undefined') {
      exports.getSupabase = getSupabase;
    }
  } catch (e) {
    // ignore
  }
})(typeof window !== 'undefined' ? window : global);
