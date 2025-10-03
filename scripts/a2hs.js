(function(){
  var banner = document.getElementById('a2hsBanner');
  var getBtn = document.getElementById('a2hsGet');
  var modal = document.getElementById('a2hsModal');
  if(!banner || !getBtn || !modal){
    return;
  }

  var closeBtn = banner.querySelector('.close');
  var modalClose = modal.querySelector('.x');
  var deferredPrompt = null;
  var isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  var firedBIP = false;

  function isStandalone(){
    var mql = window.matchMedia && window.matchMedia('(display-mode: standalone)').matches;
    var iosStandalone = window.navigator && window.navigator.standalone === true;
    return !!(mql || iosStandalone);
  }

  function showBanner(){
    banner.classList.add('show');
  }

  function hideBanner(){
    banner.classList.remove('show');
  }

  function openGuide(){
    hideBanner();
    modal.classList.add('open');
  }

  function closeGuide(){
    modal.classList.remove('open');
  }

  window.addEventListener('beforeinstallprompt', function(e){
    e.preventDefault();
    deferredPrompt = e;
    firedBIP = true;
    try{
      if(!isStandalone() && sessionStorage.getItem('a2hs_dismissed') !== '1' && !isIOS){
        showBanner();
      }
    }catch(_){/* ignore */}
  });

  if(closeBtn){
    closeBtn.addEventListener('click', function(){
      hideBanner();
      try{ sessionStorage.setItem('a2hs_dismissed','1'); }catch(_){/* ignore */}
    });
  }

  if(modalClose){
    modalClose.addEventListener('click', closeGuide);
  }

  modal.addEventListener('click', function(e){
    if(e.target === modal){
      closeGuide();
    }
  });

  getBtn.addEventListener('click', async function(){
    if(deferredPrompt){
      try{
        deferredPrompt.prompt();
        await deferredPrompt.userChoice;
      }catch(_){/* ignore */}
      deferredPrompt = null;
      hideBanner();
    }else if(isIOS){
      openGuide();
    }else{
      alert('In your browser menu, choose “Install app” or “Create shortcut / Add to Home screen”.');
      hideBanner();
    }
  });

  window.addEventListener('load', function(){
    var dismissed = '0';
    try{
      dismissed = sessionStorage.getItem('a2hs_dismissed') || '0';
    }catch(_){/* ignore */}

    if(isStandalone() || dismissed === '1'){
      return;
    }

    if(isIOS){
      setTimeout(showBanner, 600);
    }else{
      setTimeout(function(){
        if(!firedBIP && !isStandalone()){
          try{
            if(sessionStorage.getItem('a2hs_dismissed') !== '1'){
              showBanner();
            }
          }catch(_){
            showBanner();
          }
        }
      }, 1200);
    }
  });
})();
