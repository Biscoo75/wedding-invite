(function(){
  // ---- Details (edit here) ----
  var HALL_MAP = "https://maps.app.goo.gl/KdfmKKh5rPoeByyJ6?g_st=ic";
  var MOSQUE_MAP = "https://maps.app.goo.gl/hjxxsw6H1JKEn1A57?g_st=ic";
  var EVENTS = {
    katb: {
      title: "إشهار محمد وإسراء 💍",
      details: "إشهار زواج محمد وإسراء — بعد صلاة العصر.\nبارك الله لهما وبارك عليهما وجمع بينهما في خير.",
      location: "مسجد الجمعية الشرعية",
      map: MOSQUE_MAP,
      start: "2026-10-09T15:30:00", end: "2026-10-09T17:30:00"
    },
    wedding: {
      title: "حفل زفاف محمد وإسراء 🤍",
      details: "حفل زفاف محمد وإسراء — قاعة ميراج المفتوحة.",
      location: "قاعة ميراج المفتوحة",
      map: HALL_MAP,
      start: "2026-10-12T19:00:00", end: "2026-10-12T23:30:00"
    }
  };
  var TZ = "Africa/Cairo", OFFSET = "+03:00";

  document.getElementById("map-mosque").href = MOSQUE_MAP;
  document.getElementById("map-hall").href = HALL_MAP;

  function compact(s){ return s.replace(/[-:]/g,""); }
  function googleUrl(e){
    return "https://calendar.google.com/calendar/render?action=TEMPLATE"
      + "&text=" + encodeURIComponent(e.title)
      + "&dates=" + compact(e.start) + "/" + compact(e.end)
      + "&ctz=" + encodeURIComponent(TZ)
      + "&details=" + encodeURIComponent(e.details + "\n\nالموقع: " + e.map)
      + "&location=" + encodeURIComponent(e.location);
  }
  function outlookUrl(e){
    return "https://outlook.live.com/calendar/0/deeplink/compose?path=%2Fcalendar%2Faction%2Fcompose&rru=addevent"
      + "&subject=" + encodeURIComponent(e.title)
      + "&startdt=" + encodeURIComponent(e.start + OFFSET)
      + "&enddt=" + encodeURIComponent(e.end + OFFSET)
      + "&body=" + encodeURIComponent(e.details + "\n\nالموقع: " + e.map)
      + "&location=" + encodeURIComponent(e.location);
  }

  // calendar menus
  var buttons = document.querySelectorAll("[data-cal]");
  function closeAll(){
    document.querySelectorAll(".cal-menu.show").forEach(function(m){ m.classList.remove("show"); });
    buttons.forEach(function(b){ b.setAttribute("aria-expanded","false"); });
  }
  buttons.forEach(function(btn){
    var e = EVENTS[btn.dataset.cal];
    var menu = btn.nextElementSibling;
    menu.innerHTML =
      '<a role="menuitem" target="_blank" rel="noopener" href="'+googleUrl(e)+'">تقويم جوجل / آيفون</a>' +
      '<a role="menuitem" target="_blank" rel="noopener" href="'+outlookUrl(e)+'">تقويم Outlook</a>';
    btn.addEventListener("click", function(ev){
      ev.stopPropagation();
      var open = menu.classList.contains("show");
      closeAll();
      if(!open){ menu.classList.add("show"); btn.setAttribute("aria-expanded","true"); }
    });
  });
  document.addEventListener("click", closeAll);
  document.addEventListener("keydown", function(ev){ if(ev.key==="Escape") closeAll(); });

  // ---- split verse into words ----
  var vt = document.querySelector("#verse .vt");
  var words = vt.textContent.trim().split(/\s+/);
  vt.textContent = "";
  words.forEach(function(w,i){
    var sp = document.createElement("span"); sp.className = "w"; sp.style.setProperty("--i", i); sp.textContent = w;
    vt.appendChild(sp); if(i < words.length-1) vt.appendChild(document.createTextNode(" "));
  });

  // ---- event children get staggered reveal ----
  document.querySelectorAll(".event").forEach(function(ev){
    ev.classList.add("group");
    Array.prototype.forEach.call(ev.children, function(c,i){ c.classList.add("rv"); c.style.setProperty("--d", (i*0.12)+"s"); });
  });

  // ---- falling leaves ----
  var pet = document.getElementById("petals");
  for(var i=0;i<14;i++){
    var d = document.createElement("div"), size = 14 + Math.random()*20;
    d.className = "petal";
    d.style.cssText = "left:"+(Math.random()*100)+"%;width:"+size+"px;height:"+size+"px;"
      + "--t:"+(16+Math.random()*14)+"s;--dl:-"+(Math.random()*28)+"s;--dx:"+((Math.random()*30-15))+"vw;"
      + "--rot:"+(360+Math.random()*540)+"deg;--s:"+(2.6+Math.random()*2.4)+"s";
    d.innerHTML = '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 1C5 6 4 15 12 23 20 15 19 6 12 1Z"/><path d="M12 5v16" stroke="var(--paper)" stroke-width="1" opacity=".55" fill="none"/></svg>';
    pet.appendChild(d);
  }

  // ---- countdown ----
  var AR = "٠١٢٣٤٥٦٧٨٩";
  function ar(n){ return String(n).replace(/\d/g,function(d){ return AR[d]; }); }
  var katb = new Date(EVENTS.katb.start + OFFSET).getTime();
  var wed = new Date(EVENTS.wedding.start + OFFSET).getTime();
  var cap = document.getElementById("count-cap"), box = document.getElementById("count");
  var ids = ["cd-d","cd-h","cd-m","cd-s"].map(function(i){ return document.getElementById(i); });
  var counting = false, started = false, last = [];
  function setVal(i,v){
    var t = ar(v);
    if(ids[i].textContent === t) return;
    ids[i].textContent = t;
    if(started){ ids[i].classList.remove("flip"); void ids[i].offsetWidth; ids[i].classList.add("flip"); }
  }
  function vals(){
    var now = Date.now(), target = katb, label = "حتى الإشهار";
    if(now >= katb){ target = wed; label = "حتى حفل الزفاف"; }
    var diff = target - now;
    if(diff <= 0) return null;
    return {v:[Math.floor(diff/864e5), Math.floor(diff/36e5)%24, Math.floor(diff/6e4)%60, Math.floor(diff/1e3)%60], label:label};
  }
  function tick(){
    if(counting) return;
    var r = vals();
    if(!r){ box.style.display="none"; cap.textContent = "تم بحمد الله — شكرًا لمشاركتكم فرحتنا"; return; }
    r.v.forEach(function(x,i){ setVal(i,x); });
    cap.textContent = r.label;
  }
  function startCount(){
    var r = vals(); if(!r){ started = true; tick(); return; }
    counting = true; cap.textContent = r.label;
    var t0 = performance.now(), dur = 1900;
    (function step(now){
      var p = Math.min(1,(now - t0)/dur), e = 1 - Math.pow(1-p,3);
      var cur = vals() || r;
      cur.v.forEach(function(x,i){ ids[i].textContent = ar(Math.round(x*e)); });
      if(p < 1){ requestAnimationFrame(step); } else { counting = false; started = true; tick(); }
    })(t0);
  }
  setInterval(tick, 1000);

  // ---- scroll reveal (starts when envelope opens) ----
  var firstDone = false;
  function startObserving(){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if(!e.isIntersecting) return;
        var el = e.target;
        if(firstDone && el.hasAttribute("data-hero")){ el.style.setProperty("--d","0s"); if(el.classList.contains("names")){ var nn=el.querySelectorAll(".n,.amp"); [".1s","1s",".6s"].forEach(function(d,i){ if(nn[i]) nn[i].style.setProperty("--d",d); }); } }
        el.classList.add("in");
        io.unobserve(el);
        if(el.id === "count") startCount();
      });
    }, {threshold:.2});
    document.querySelectorAll(".rv,.group,.verse,.names,.cover").forEach(function(el){ io.observe(el); });
    setTimeout(function(){ firstDone = true; }, 400);
  }

  // ---- scroll progress ----
  var prog = document.getElementById("prog"), ticking = false;
  window.addEventListener("scroll", function(){
    if(ticking) return; ticking = true;
    requestAnimationFrame(function(){
      var h = document.documentElement.scrollHeight - window.innerHeight;
      prog.style.transform = "scaleX(" + (h > 0 ? Math.min(1, window.scrollY / h) : 0) + ")";
      ticking = false;
    });
  }, {passive:true});

  var cvd=document.getElementById("cvDown");
  if(cvd) cvd.addEventListener("click",function(){ document.querySelector(".page").scrollIntoView({behavior:"smooth",block:"start"}); });

  // ---- envelope ----
  var env = document.getElementById("envelope");
  var opened = false;
  function openEnv(){
    if(opened) return; opened = true;
    env.classList.add("open");
    setTimeout(function(){ document.body.classList.remove("locked"); document.body.classList.add("opened"); startObserving(); }, 1000);
    setTimeout(function(){ env.remove(); }, 2000);
  }
  env.addEventListener("click", openEnv);
  env.addEventListener("keydown", function(ev){ if(ev.key==="Enter"||ev.key===" "){ ev.preventDefault(); openEnv(); } });
})();
