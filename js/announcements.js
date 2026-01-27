// announcements.js
// Handles showing announcement bubble on the site and a simple admin UI backed by Firestore.
(function(){
  const DEFAULT_ALLOWED = 'jackson.lacefield07@gmail.com';

  function el(id){ return document.getElementById(id); }

  function showBubble(text, durationSec){
    try {
      const bubble = el('holiday-bubble');
      const t = el('holiday-bubble-text');
      const close = el('holiday-bubble-close');
      if (!bubble || !t) return;
      t.textContent = text || '';
      bubble.style.display = 'flex';
      // close handler
      const closeHandler = () => { bubble.style.display = 'none'; close.removeEventListener('click', closeHandler); };
      if (close) { close.addEventListener('click', closeHandler); }
      if (durationSec && durationSec > 0) {
        setTimeout(() => { bubble.style.display = 'none'; if (close) close.removeEventListener('click', closeHandler); }, durationSec * 1000);
      }
    } catch (e){ console.warn('showBubble', e); }
  }

  function fetchLatestActiveAnnouncement(){
    if (!window.firebase || !firebase.firestore) return Promise.resolve(null);
    const db = firebase.firestore();
    return db.collection('announcements')
      .where('active','==', true)
      .orderBy('createdAt','desc')
      .limit(1)
      .get()
      .then(snap => {
        if (snap.empty) return null;
        const doc = snap.docs[0];
        return { id: doc.id, ...doc.data() };
      }).catch(err => { console.warn('fetchLatestActiveAnnouncement', err); return null; });
  }

  function initSite(){
    // run on load to display latest active announcement
    try {
      // wait for firebase to be initialized (if used)
      fetchLatestActiveAnnouncement().then(a => {
        if (a && a.text) showBubble(a.text, a.durationSeconds || 10);
      }).catch(()=>{});
    } catch (e) { console.warn('initSite error', e); }
  }

  // ----------------- Admin -----------------
  function initAdmin(opts){
    opts = opts || {};
    const allowedEmail = opts.allowedEmail || DEFAULT_ALLOWED;
    const sel = (opts.uiSelectors || {});
    const statusEl = el(sel.status || 'auth-status');
    const adminUi = el(sel.adminUi || 'admin-ui');
    const listEl = el(sel.list || 'ann-list');

    if (!window.firebase || !firebase.auth) {
      if (statusEl) statusEl.textContent = 'Firebase not initialized. Fill js/firebase-config.js and enable Auth/Firestore.';
      return;
    }

    function updateList(){
      if (!listEl) return;
      listEl.innerHTML = 'Loading...';
      const db = firebase.firestore();
      db.collection('announcements').orderBy('createdAt','desc').get().then(snap => {
        listEl.innerHTML = '';
        snap.forEach(doc => {
          const d = doc.data();
          const row = document.createElement('div'); row.className = 'list-item';
          const left = document.createElement('div');
          left.innerHTML = `<div style="font-weight:700">${escapeHtml(d.text||'')}</div><div class="muted">Duration: ${d.durationSeconds||10}s — Active: ${d.active? 'yes':'no'}</div>`;
          const right = document.createElement('div');
          const del = document.createElement('button'); del.textContent = 'Delete'; del.style.background='#c0392b'; del.addEventListener('click', ()=>{ if(confirm('Delete announcement?')){ db.collection('announcements').doc(doc.id).delete().then(updateList); } });
          const toggle = document.createElement('button'); toggle.textContent = d.active? 'Disable':'Enable'; toggle.style.marginRight='8px'; toggle.addEventListener('click', ()=>{
            db.collection('announcements').doc(doc.id).update({ active: !d.active }).then(updateList);
          });
          right.appendChild(toggle); right.appendChild(del);
          row.appendChild(left); row.appendChild(right);
          listEl.appendChild(row);
        });
        if (snap.empty) listEl.innerHTML = '<div class="muted">No announcements yet.</div>';
      }).catch(err => { console.error(err); listEl.innerHTML = '<div class="muted">Failed to load announcements.</div>'; });
    }

    function signIn(){
      const provider = new firebase.auth.GoogleAuthProvider();
      firebase.auth().signInWithPopup(provider).catch(err => { if (statusEl) statusEl.textContent = 'Sign-in failed: '+err.message; });
    }

    function signOut(){ firebase.auth().signOut(); }

    firebase.auth().onAuthStateChanged(user => {
      if (!statusEl) return;
      if (!user) {
        statusEl.innerHTML = '<div>Not signed in. <button id="__ann_sign_in">Sign in with Google</button></div>';
        const btn = document.getElementById('__ann_sign_in'); if (btn) btn.addEventListener('click', signIn);
        if (adminUi) adminUi.style.display = 'none';
        return;
      }
      // signed in
      statusEl.innerHTML = `<div>Signed in as ${escapeHtml(user.email||'')}. <button id="__ann_sign_out">Sign out</button></div>`;
      document.getElementById('__ann_sign_out').addEventListener('click', signOut);
      if (user.email !== allowedEmail) {
        if (adminUi) adminUi.style.display = 'none';
        statusEl.innerHTML += `<div class="muted">Unauthorized: only ${allowedEmail} can manage announcements.</div>`;
        return;
      }
      // authorized
      if (adminUi) adminUi.style.display = '';
      // wire create button
      const createBtn = el(opts.uiSelectors && opts.uiSelectors.createBtn || 'create-ann');
      if (createBtn) {
        createBtn.onclick = function(){
          const txt = (el(opts.uiSelectors && opts.uiSelectors.text || 'ann-text')||{}).value || '';
          const duration = parseInt((el(opts.uiSelectors && opts.uiSelectors.duration || 'ann-duration')||{}).value||10,10) || 10;
          const active = ((el(opts.uiSelectors && opts.uiSelectors.active || 'ann-active')||{}).value||'1') === '1';
          if (!txt.trim()) { alert('Enter text'); return; }
          const db = firebase.firestore();
          db.collection('announcements').add({ text: txt.trim(), durationSeconds: duration, active: active, createdAt: firebase.firestore.FieldValue.serverTimestamp() }).then(()=>{ updateList(); alert('Created'); }).catch(e=>{ console.error(e); alert('Failed to create'); });
        };
      }
      // initial list
      updateList();
    });
  }

  // Escape helper
  function escapeHtml(s){ return (s||'').replace(/[&<>"']/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[c]; }); }

  // Expose API
  window.announcements = {
    initSite: initSite,
    initAdmin: initAdmin,
    showBubble: showBubble
  };

  // Auto-init site announcements when page loads
  if (typeof window !== 'undefined') {
    window.addEventListener('load', function(){ setTimeout(initSite, 300); });
  }

})();
