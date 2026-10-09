/* ProVizion nav: hover + click/tap dropdowns, hover bridge, open/close delays, outside click, Escape, mobile menu, lead prefill store */
(function(){
  var OPEN_DELAY=120, CLOSE_DELAY=250;
  var mq=window.matchMedia('(max-width:1060px)');
  var dds=[].slice.call(document.querySelectorAll('.dd'));
  var burger=document.querySelector('.burger');
  function setOpen(d,o,via){clearTimeout(d._t);d.classList.toggle('open',o);d._via=o?(via||d._via):null;var b=d.querySelector('.dd-btn');if(b)b.setAttribute('aria-expanded',o?'true':'false');}
  function closeAll(except){dds.forEach(function(d){if(d!==except)setOpen(d,false);});}
  dds.forEach(function(d){
    var b=d.querySelector('.dd-btn');
    d.addEventListener('pointerenter',function(e){
      if(e.pointerType!=='mouse'||mq.matches)return;
      clearTimeout(d._t);
      if(d.classList.contains('open'))return;
      d._t=setTimeout(function(){closeAll(d);setOpen(d,true,'hover');},OPEN_DELAY);
    });
    d.addEventListener('pointerleave',function(e){
      if(e.pointerType!=='mouse'||mq.matches)return;
      clearTimeout(d._t);
      if(!d.classList.contains('open'))return;
      d._t=setTimeout(function(){setOpen(d,false);},CLOSE_DELAY);
    });
    b.addEventListener('click',function(e){
      e.preventDefault();e.stopPropagation();
      var isOpen=d.classList.contains('open');
      if(isOpen&&d._via==='hover'&&!mq.matches){d._via='click';return;}
      if(!mq.matches)closeAll(d);
      setOpen(d,!isOpen,'click');
    });
    d.addEventListener('keydown',function(e){
      if(e.key==='ArrowDown'&&d.classList.contains('open')){var a=d.querySelector('.dd-panel a');if(a){e.preventDefault();a.focus();}}
    });
  });
  document.addEventListener('click',function(e){
    if(!e.target.closest('.dd'))closeAll();
    if(document.body.classList.contains('nav-open')&&!e.target.closest('.links')&&!e.target.closest('.burger'))toggleMenu(false);
  });
  document.addEventListener('keydown',function(e){
    if(e.key!=='Escape')return;
    var open=dds.filter(function(d){return d.classList.contains('open');})[0];
    closeAll();
    if(open){var b=open.querySelector('.dd-btn');if(b)b.focus();}
    else if(document.body.classList.contains('nav-open')){toggleMenu(false);if(burger)burger.focus();}
  });
  function toggleMenu(o){document.body.classList.toggle('nav-open',o);if(burger)burger.setAttribute('aria-expanded',o?'true':'false');if(!o)closeAll();}
  if(burger)burger.addEventListener('click',function(e){e.stopPropagation();toggleMenu(!document.body.classList.contains('nav-open'));});
  var onMq=function(){if(!mq.matches)toggleMenu(false);closeAll();};
  if(mq.addEventListener)mq.addEventListener('change',onMq);else if(mq.addListener)mq.addListener(onMq);
  /* remember name and email from any form so the booking calendar can be pre-filled */
  window.pvSaveLead=function(name,email){try{if(name||email)localStorage.setItem('pv_lead',JSON.stringify({name:name||'',email:email||''}));}catch(err){}};
  window.pvGetLead=function(){try{return JSON.parse(localStorage.getItem('pv_lead')||'{}');}catch(err){return {};}};

  /* cookie consent: banner on first visit, preference stored locally */
  var COOKIE_KEY='pv_cookie_consent';
  var src=(document.currentScript&&document.currentScript.getAttribute('src'))||'';
  var pvRoot=src.indexOf('../')===0?'../':'';
  function getConsent(){try{var r=localStorage.getItem(COOKIE_KEY);return r?JSON.parse(r):null;}catch(err){return null;}}
  function setConsent(analytics){
    try{localStorage.setItem(COOKIE_KEY,JSON.stringify({v:1,necessary:true,analytics:!!analytics,ts:Date.now()}));}catch(err){}
    hideBanner();
  }
  function hideBanner(){
    var el=document.getElementById('pv-cookie');
    if(el)el.remove();
    document.body.classList.remove('pv-cookie-on');
  }
  function showBanner(){
    if(document.getElementById('pv-cookie'))return;
    document.body.classList.add('pv-cookie-on');
    var bar=document.createElement('div');
    bar.id='pv-cookie';
    bar.className='pv-cookie';
    bar.setAttribute('role','dialog');
    bar.setAttribute('aria-label','Cookie preferences');
    bar.innerHTML='<div class="pv-cookie-inner"><p>We use necessary cookies to run this site and remember your booking details. Optional analytics stay off unless you accept them. Third parties such as Calendly may set cookies when you book a call. Read the <a href="'+pvRoot+'cookies.html">cookie policy</a>.</p><div class="pv-cookie-acts"><button type="button" class="btn btn-o btn-sm" data-pv-cookie="necessary">Necessary only</button><button type="button" class="btn btn-p btn-sm" data-pv-cookie="all">Accept all</button></div></div>';
    document.body.appendChild(bar);
    bar.addEventListener('click',function(e){
      var btn=e.target.closest('[data-pv-cookie]');
      if(!btn)return;
      setConsent(btn.getAttribute('data-pv-cookie')==='all');
    });
  }
  window.pvOpenCookies=function(){try{localStorage.removeItem(COOKIE_KEY);}catch(err){}showBanner();var b=document.querySelector('#pv-cookie [data-pv-cookie="all"]');if(b)b.focus();};
  var prefs=document.getElementById('pv-cookie-prefs');
  if(prefs)prefs.addEventListener('click',function(){window.pvOpenCookies();});
  if(!getConsent())showBanner();
})();
