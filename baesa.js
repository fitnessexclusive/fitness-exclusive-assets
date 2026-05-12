{
  "@context": "https://schema.org",
  "@type": "SportsActivityLocation",
  "name": "Fitness Exclusive – Baesa, Quezon City",
  "description": "Multi-sport courts and fitness gym in Baesa, Quezon City. Book basketball, volleyball, and pickleball courts online.",
  "url": "https://fitnessexclusive.ph//baesa-quezon-city",
  "telephone": "+639171440100",
  "email": "sales@fitnessexclusive.ph",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Baesa",
    "addressLocality": "Quezon City",
    "addressRegion": "Metro Manila",
    "addressCountry": "PH"
  },
  "openingHoursSpecification": {
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday"
    ],
    "opens": "06:00",
    "closes": "00:00"
  },
  "sport": [
    "Basketball",
    "Volleyball",
    "Pickleball"
  ],
  "priceRange": "₱₱",
  "currenciesAccepted": "PHP",
  "paymentAccepted": "Cash, GCash, Maya, Bank Transfer",
  "image": "https://fitnessexclusive.ph/logo-full.png",
  "sameAs": [
    "https://www.facebook.com/fitnessexclusive",
    "https://www.instagram.com/fitnessexclusive"
  ]
}

(function(){
      var RATES={basketball:{off:1800,day:2000,night:2250},volleyball:{off:1800,day:2000,night:2250},pickleball:{off:600,day:700,night:800}};
      var ADDONS=[
        {id:'adScore', label:'Score Board',         rate:250, flat:false},
        {id:'adSound', label:'Sound System',         rate:500, flat:false},
        {id:'adBall',  label:'Ball',                 rate:100, flat:false},
        {id:'adLocker',label:'Locker (ID required)', rate:100, flat:true},
        {id:'adStream',label:'Live Stream Camera',   rate:500, flat:false}
      ];
      var SCRIPT_URL='https://script.google.com/macros/s/AKfycbwzoTXJRVdGY1SURv49WqexYayDqMtH3hhZHvR4xYRziHBY1jlUCrAJSiz7bOExXO6q/exec';
      var CALENDARS={
        fullcourt:   'c_84e29baf376445d882a378579ba6315a2935e97ddc3ba80b50881eab24a646cd@group.calendar.google.com',
        pickleballA: 'c_bed199e6b021807f60edff37deb4ec271bd6bbb2e8d2a1e7103129aeb713f8bd@group.calendar.google.com',
        pickleballB: 'c_8db82df3fe50c34da5d7968116e62af5a60072929524bfe28801c82538b72945@group.calendar.google.com',
        pickleballC: 'c_148239e49a48bac167b64f8d92eee1edd9ab693877f4d163c77aa91e407a53ef@group.calendar.google.com'
      };
      var API='AIzaSyCTqw21nvJj6pirlbp7APXDG7EY07FKD1U';
      function getCalId(){
        if(selSport==='basketball'||selSport==='volleyball') return CALENDARS.fullcourt;
        if(selSport==='pickleball'){
          if(selPKCourt==='A') return CALENDARS.pickleballA;
          if(selPKCourt==='B') return CALENDARS.pickleballB;
          if(selPKCourt==='C') return CALENDARS.pickleballC;
        }
        return CALENDARS.fullcourt;
      }
      function getConflictCalIds(){
        if(selSport==='basketball'||selSport==='volleyball'){
          return[CALENDARS.fullcourt,CALENDARS.pickleballA,CALENDARS.pickleballB,CALENDARS.pickleballC];
        }
        if(selSport==='pickleball'){
          return[CALENDARS.fullcourt,getCalId()];
        }
        return[getCalId()];
      }
      async function fetchOneCal(calId,date){
        if(!calId||calId.indexOf('PLACEHOLDER')>=0)return[];
        try{var d=await(await fetch('https://www.googleapis.com/calendar/v3/calendars/'+encodeURIComponent(calId)+'/events?key='+API+'&timeMin='+new Date(date+'T00:00:00+08:00').toISOString()+'&timeMax='+new Date(date+'T23:59:59+08:00').toISOString()+'&singleEvents=true')).json();
        return(d.items||[]).map(function(e){return{start:new Date(e.start.dateTime||e.start.date+'T00:00:00+08:00'),end:new Date(e.end.dateTime||e.end.date+'T23:59:59+08:00')};});}catch(e){return[];}
      }
      async function fetchEvt(date){
        var calIds=getConflictCalIds();
        var all=[];
        for(var i=0;i<calIds.length;i++){var evts=await fetchOneCal(calIds[i],date);all=all.concat(evts);}
        return all;
      }
      var BRANCH='Baesa, Quezon City',EMAIL='sales@fitnessexclusive.ph';
      var step=1,events=[],promoOn=false,discRate=0;
      var courtTotal=0,addonTotal=0,playerTotal=0,finalTotal=0,selHour=null,selDur=null;
      var selSport='basketball',selPKCourt='A',selPlayers=1;
      var weekEvents=[],weekStart=(function(){var d=new Date();d.setHours(0,0,0,0);return d;})();
      function $(i){return document.getElementById(i);}
      function fmt(h){var p=h>=12?'PM':'AM',d=h%12===0?12:h%12;return d+':00 '+p;}
      function peso(n){return '&#8369;'+n.toLocaleString('en-PH',{minimumFractionDigits:0});}
      function getRate(h){var r=RATES[selSport]||RATES.basketball;return h<5?r.off:h<17?r.day:r.night;}
      function slotName(h){return h<5?'Off-Peak':h<17?'Day':'Night';}
      function setTabs(s){
        ['bwTab1','bwTab2','bwTab3'].forEach(function(id,i){$(id).className='bw-step-tab'+(i+1===s?' active':i+1<s?' done':'');});
        ['bwS1','bwS2','bwS3','bwDone'].forEach(function(id){$(id).style.display='none';});
        step=s;
        if(s===1)$('bwS1').style.display='block';
        else if(s===2)$('bwS2').style.display='block';
        else if(s===3)$('bwS3').style.display='block';
        else $('bwDone').style.display='block';
      }
      function blocked(h){
        var dt=new Date($('bwDate').value+'T00:00:00'),s=new Date(dt),e=new Date(dt);s.setHours(h,0,0,0);e.setHours(h+1,0,0,0);
        return events.some(function(ev){return(s>=ev.start&&s<ev.end)||(e>ev.start&&e<=ev.end)||(s<=ev.start&&e>=ev.end);});
      }
      function buildGrid(){
        var g=$('bwHourGrid');g.innerHTML='';
        var now=new Date(),isToday=new Date($('bwDate').value+'T00:00:00').toDateString()===now.toDateString();
        for(var h=0;h<=23;h++){
          var btn=document.createElement('button'),bl=blocked(h)||(isToday&&h<=now.getHours());
          btn.className='bw-hour-btn'+(bl?' blocked':'');btn.textContent=fmt(h);btn.dataset.h=h;
          (function(hh,b){btn.addEventListener('click',function(){
            if(b)return;selHour=hh;selDur=null;
            document.querySelectorAll('.bw-hour-btn').forEach(function(x){x.classList.remove('selected');});
            this.classList.add('selected');
            document.querySelectorAll('.bw-dur-btn').forEach(function(x,i){x.classList.remove('selected');x.disabled=(hh+i+1>24)||blocked(hh+i);});
            $('bwDurWrap').style.display='block';$('bwPriceBox').style.display='none';$('bwAddonsWrap').style.display='none';$('bwPromoSec').style.display='none';
          })})(h,bl);
          g.appendChild(btn);
        }
      }
      /* ── HEATMAP HELPERS ── */
      var HM_DAYS=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
      var HM_HOURS=[6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23];
      function getWeekDates(startDate){var d=new Date(startDate),a=[];for(var i=0;i<7;i++){var n=new Date(d);n.setDate(n.getDate()+i);a.push(n.toISOString().split('T')[0]);}return a;}
      async function fetchWeekEvt(startStr){
        var calIds=getConflictCalIds();
        var wS=new Date(startStr+'T00:00:00+08:00');var wE=new Date(wS);wE.setDate(wE.getDate()+7);
        var all=[];
        for(var i=0;i<calIds.length;i++){
          if(!calIds[i]||calIds[i].indexOf('PLACEHOLDER')>=0)continue;
          try{var d=await(await fetch('https://www.googleapis.com/calendar/v3/calendars/'+encodeURIComponent(calIds[i])+'/events?key='+API+'&timeMin='+wS.toISOString()+'&timeMax='+wE.toISOString()+'&singleEvents=true')).json();
          (d.items||[]).forEach(function(e){all.push({start:new Date(e.start.dateTime||e.start.date+'T00:00:00+08:00'),end:new Date(e.end.dateTime||e.end.date+'T23:59:59+08:00')});});}catch(e){}
        }
        return all;
      }
      function blockedOnDate(dateStr,h){var dt=new Date(dateStr+'T00:00:00+08:00'),s=new Date(dt),e=new Date(dt);s.setHours(h,0,0,0);e.setHours(h+1,0,0,0);return weekEvents.some(function(ev){return(s>=ev.start&&s<ev.end)||(e>ev.start&&e<=ev.end)||(s<=ev.start&&e>=ev.end);});}
      function isPastSlot(dateStr,h){var now=new Date(),d=new Date(dateStr+'T00:00:00+08:00');d.setHours(h,0,0,0);return d<=now;}
      async function loadHeatmap(){
        $('bwHmLoading').style.display='flex';$('bwHeatmap').innerHTML='';
        selHour=null;selDur=null;$('bwDate').value='';
        var startStr=weekStart.toISOString().split('T')[0];
        var dates=getWeekDates(startStr);
        var opts={month:'short',day:'numeric'};
        $('bwHmRange').textContent=new Date(dates[0]+'T12:00:00').toLocaleDateString('en-PH',opts)+' – '+new Date(dates[6]+'T12:00:00').toLocaleDateString('en-PH',opts);
        var todayStr=new Date().toISOString().split('T')[0];
        $('bwHmPrev').disabled=dates[0]<=todayStr;
        weekEvents=await fetchWeekEvt(startStr);
        $('bwHmLoading').style.display='none';
        buildHeatmap(dates);
      }
      function buildHeatmap(dates){
        var g=$('bwHeatmap');g.innerHTML='';
        var todayStr=new Date().toISOString().split('T')[0];
        // Corner cell
        var corner=document.createElement('div');corner.className='bw-hm-time';g.appendChild(corner);
        // Day headers
        dates.forEach(function(ds){var d=new Date(ds+'T12:00:00'),el=document.createElement('div');el.className='bw-hm-head'+(ds===todayStr?' today':'');el.innerHTML=HM_DAYS[d.getDay()]+'<br>'+d.getDate();g.appendChild(el);});
        // Hour rows
        HM_HOURS.forEach(function(h){
          var tl=document.createElement('div');tl.className='bw-hm-time';tl.textContent=fmt(h);g.appendChild(tl);
          dates.forEach(function(ds){
            var cell=document.createElement('div');
            var past=isPastSlot(ds,h);var bl=!past&&blockedOnDate(ds,h);
            cell.className='bw-hm-cell '+(past?'past':bl?'blocked':'avail');
            cell.dataset.date=ds;cell.dataset.h=h;
            if(!past&&!bl){cell.addEventListener('click',function(){
              document.querySelectorAll('.bw-hm-cell.selected').forEach(function(c){c.className='bw-hm-cell avail';});
              this.className='bw-hm-cell selected';
              var dd=this.dataset.date,hh=parseInt(this.dataset.h);
              $('bwDate').value=dd;selHour=hh;selDur=null;events=weekEvents;
              var dDisp=new Date(dd+'T12:00:00').toLocaleDateString('en-PH',{weekday:'short',month:'short',day:'numeric'});
              $('bwSlotDisplay').textContent=dDisp+' · '+fmt(hh);
              document.querySelectorAll('.bw-dur-btn').forEach(function(btn,i){btn.classList.remove('selected');btn.disabled=(hh+i+1>24)||blockedOnDate(dd,hh+i);});
              $('bwPriceBox').style.display='none';$('bwAddonsWrap').style.display='none';$('bwPromoSec').style.display='none';
              $('bwAgree').checked=false;
              setTabs(1);
              bwOpen();
            });}
            g.appendChild(cell);
          });
        });
      }
      function calcAddons(){
        addonTotal=0;var lines=[];
        ADDONS.forEach(function(a){
          var cb=$(a.id);if(!cb||!cb.checked)return;
          var cost=a.flat?a.rate:a.rate*selDur;addonTotal+=cost;
          lines.push(a.label+' '+peso(cost)+(a.flat?'':' ('+selDur+'hr)'));
        });
        return lines;
      }
      function calc(){
        if(selHour===null||selDur===null)return;
        var grp={off:0,day:0,night:0};courtTotal=0;
        for(var i=0;i<selDur;i++){var h=selHour+i;if(h<5)grp.off++;else if(h<17)grp.day++;else grp.night++;courtTotal+=getRate(h);}
        var r=RATES[selSport]||RATES.basketball;
        var lines=[];
        if(grp.off)lines.push('Off-Peak: '+grp.off+'hr &times; '+peso(r.off));
        if(grp.day)lines.push('Day: '+grp.day+'hr &times; '+peso(r.day));
        if(grp.night)lines.push('Night: '+grp.night+'hr &times; '+peso(r.night));
        var addonLines=calcAddons();
        playerTotal=selSport==='pickleball'?selPlayers*100:0;
        var disc=promoOn?Math.round(courtTotal*discRate):0;
        finalTotal=(courtTotal-disc)+addonTotal+playerTotal;
        var det=lines.join('<br>');
        if(disc)det+='<br><span style="color:#22c55e">Promo: &minus;'+peso(disc)+'</span>';
        if(playerTotal)det+='<br><span style="color:#aaa;font-size:0.75rem">Players: '+selPlayers+' &times; &#8369;100 = '+peso(playerTotal)+'</span>';
        if(addonLines.length)det+='<br><span style="color:#aaa;font-size:0.75rem">Add-ons: '+addonLines.join(', ')+'</span>';
        $('bwBreakdown').innerHTML=det;
        $('bwTotal').innerHTML=peso(finalTotal)+(disc?' <span style="font-size:.72rem;color:#555;text-decoration:line-through">'+peso(courtTotal)+'</span>':'');
        $('bwPriceBox').style.display='block';$('bwAddonsWrap').style.display='block';$('bwPromoSec').style.display='block';
        $('bwPayAmt').innerHTML=peso(finalTotal);
      }
      window.bwOpen=function(){$('bwBookingOverlay').classList.add('open');document.body.style.overflow='hidden';};
      window.bwClose=function(){$('bwBookingOverlay').classList.remove('open');document.body.style.overflow='';};
      window.bwApplyPromo=function(){
        var c=$('bwPromoInp').value.trim().toUpperCase();
        if(c==='FIT-EX2026'){promoOn=true;discRate=.20;$('bwPromoMsg').textContent='20% discount applied!';$('bwPromoMsg').style.color='#22c55e';}
        else{promoOn=false;discRate=0;$('bwPromoMsg').textContent='Invalid promo code.';$('bwPromoMsg').style.color='#e55';}
        calc();
      };
      function sportLabel(){
        var s=selSport.charAt(0).toUpperCase()+selSport.slice(1);
        return s+(selSport==='pickleball'?' – Court '+selPKCourt:'');
      }
      document.addEventListener('DOMContentLoaded',function(){
        document.querySelectorAll('.bw-sport-btn').forEach(function(btn){
          btn.addEventListener('click',function(){
            document.querySelectorAll('.bw-sport-btn').forEach(function(b){b.classList.remove('active');});
            this.classList.add('active');selSport=this.dataset.sport;
            $('bwPKCourtWrap').style.display=selSport==='pickleball'?'block':'none';
            if(selSport!=='pickleball'){selPlayers=1;$('bwPlayersVal').textContent='1';}
            loadHeatmap();
          });
        });
        document.querySelectorAll('.bw-pk-btn').forEach(function(btn){
          btn.addEventListener('click',function(){
            document.querySelectorAll('.bw-pk-btn').forEach(function(b){b.classList.remove('active');});
            this.classList.add('active');selPKCourt=this.dataset.court;
            loadHeatmap();
          });
        });
        $('bwPlayersDown').addEventListener('click',function(){
          if(selPlayers>1){selPlayers--;$('bwPlayersVal').textContent=selPlayers;calc();}
        });
        $('bwPlayersUp').addEventListener('click',function(){
          if(selPlayers<20){selPlayers++;$('bwPlayersVal').textContent=selPlayers;calc();}
        });
        document.querySelectorAll('.bw-addon-cb').forEach(function(cb){
          cb.addEventListener('change',function(){calc();});
        });
        $('bwHmPrev').addEventListener('click',function(){var d=new Date(weekStart);d.setDate(d.getDate()-7);var today=new Date();today.setHours(0,0,0,0);weekStart=(d>=today?d:today);loadHeatmap();});
        $('bwHmNext').addEventListener('click',function(){weekStart=new Date(weekStart);weekStart.setDate(weekStart.getDate()+7);loadHeatmap();});
        $('bwDurRow').addEventListener('click',function(e){
          var btn=e.target.closest('.bw-dur-btn');if(!btn||btn.disabled)return;
          selDur=parseInt(btn.dataset.h);
          document.querySelectorAll('.bw-dur-btn').forEach(function(b){b.classList.remove('selected');});btn.classList.add('selected');calc();
        });
        $('bwS1Btn').addEventListener('click',function(){
          if(selHour===null||!$('bwDate').value)return alert('Please select a date and time from the availability calendar.');
          if(selDur===null)return alert('Please select a duration.');
          if(!$('bwAgree').checked)return alert('Please agree to the house rules.');
          var d=new Date($('bwDate').value+'T00:00:00'),ds=d.toLocaleDateString('en-PH',{month:'short',day:'numeric',year:'numeric'});
          var eH=selHour+selDur,eLbl=eH>=24?'12:00 AM':fmt(eH);
          $('bwBar').innerHTML='<strong style="color:#ddd">'+ds+'</strong> &nbsp;|&nbsp; '+fmt(selHour)+' &ndash; '+eLbl+' &middot; '+selDur+'hr &middot; '+sportLabel();
          $('bwPayAmt').innerHTML=peso(finalTotal);setTabs(2);
        });
        $('bwBack2').addEventListener('click',function(){setTabs(1);});
        $('bwNext2').addEventListener('click',function(){
          if(!$('bwName').value.trim()||!$('bwEmail').value.trim()||!$('bwPhone').value.trim())return alert('Please fill in all contact details.');
          var d=new Date($('bwDate').value+'T00:00:00'),ds=d.toLocaleDateString('en-PH',{month:'long',day:'numeric',year:'numeric'});
          var eH=selHour+selDur,eLbl=eH>=24?'12:00 AM':fmt(eH);
          var addonTxt=ADDONS.filter(function(a){var cb=$(a.id);return cb&&cb.checked;}).map(function(a){return a.label+' ('+peso(a.flat?a.rate:a.rate*selDur)+')';}).join(', ')||'None';
          var rows=[['Branch',BRANCH],['Sport',sportLabel()],['Date',ds],['Time',fmt(selHour)+' – '+eLbl],['Duration',selDur+' hour'+(selDur>1?'s':'')]];
          if(selSport==='pickleball')rows.push(['Players',selPlayers+' × ₱100 = '+peso(playerTotal)]);
          rows.push(['Add-ons',addonTxt],['Name',$('bwName').value],['Phone',$('bwPhone').value],['Total',peso(finalTotal)]);
          $('bwSummary').innerHTML=rows.map(function(r){return '<div class="bw-summary-row"><span class="bw-summary-key">'+r[0]+'</span><span class="bw-summary-val">'+r[1]+'</span></div>';}).join('');
          setTabs(3);
        });
        $('bwBack3').addEventListener('click',function(){setTabs(2);});
        $('bwFinal').addEventListener('click',async function(){
          var btn=this;
          btn.disabled=true;btn.textContent='Booking…';
          var dateVal=$('bwDate').value;
          var startISO=dateVal+'T'+String(selHour).padStart(2,'0')+':00:00+08:00';
          var endH=selHour+selDur;
          var endDate=dateVal;
          if(endH>=24){var nd=new Date(dateVal+'T12:00:00');nd.setDate(nd.getDate()+1);endDate=nd.getFullYear()+'-'+String(nd.getMonth()+1).padStart(2,'0')+'-'+String(nd.getDate()).padStart(2,'0');endH=endH-24;}
          var endISO=endDate+'T'+String(endH).padStart(2,'0')+':00:00+08:00';
          var addonTxt=ADDONS.filter(function(a){var cb=$(a.id);return cb&&cb.checked;}).map(function(a){return a.label+' ('+peso(a.flat?a.rate:a.rate*selDur)+')';}).join(', ')||'None';
          var payload={
            action:'book',
            sport:selSport,
            pkCourt:selPKCourt,
            start:startISO,
            end:endISO,
            name:$('bwName').value,
            phone:$('bwPhone').value,
            email:$('bwEmail').value,
            total:finalTotal,
            addons:addonTxt,
            players:selSport==='pickleball'?selPlayers+' × ₱100 = ₱'+playerTotal:''
          };
          try{
            var url=new URL(SCRIPT_URL);
            Object.keys(payload).forEach(function(k){url.searchParams.set(k,payload[k]);});
            var res=await(await fetch(url.toString())).json();
            if(res.ok){
              (function(){function toGCalDate(iso){var m=iso.match(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/);return m?m[1]+m[2]+m[3]+'T'+m[4]+m[5]+m[6]:'';}var gcTitle=encodeURIComponent('[FE] '+sportLabel()+' @ '+BRANCH);var gcDates=toGCalDate(startISO)+'/'+toGCalDate(endISO);var gcDetails=encodeURIComponent('Fitness Exclusive '+BRANCH+'\nSport: '+sportLabel()+'\nTotal: ₱'+finalTotal+'\nContact: sales@fitnessexclusive.ph');var gcLoc=encodeURIComponent('Fitness Exclusive '+BRANCH);$('bwCalLink').href='https://calendar.google.com/calendar/render?action=TEMPLATE&text='+gcTitle+'&dates='+gcDates+'&details='+gcDetails+'&location='+gcLoc;})();
              setTabs(4);
            } else if(res.error==='SLOT_TAKEN'){
              alert('Sorry, that slot was just taken by another booking. Please choose a different time.');
              btn.disabled=false;btn.textContent='Send Booking Request';
              bwClose();loadHeatmap();setTabs(1);
            } else {
              alert('Something went wrong: '+res.error+'. Please email us directly at '+EMAIL);
              btn.disabled=false;btn.textContent='Send Booking Request';
            }
          }catch(err){
            alert('Connection error. Please email us at '+EMAIL);
            btn.disabled=false;btn.textContent='Send Booking Request';
          }
        });
        $('bwRulesLink').addEventListener('click',function(e){e.preventDefault();$('bwRulesBg').classList.add('open');});
        $('bwRulesClose').addEventListener('click',function(){$('bwRulesBg').classList.remove('open');});
        $('bwRulesBg').addEventListener('click',function(e){if(e.target===this)this.classList.remove('open');});
        loadHeatmap();
      });
    })();

function switchBaesaPanel(panel) {
  document.getElementById('baesaCourtPanel').classList.toggle('active', panel === 'court');
  document.getElementById('baesaGymPanel').classList.toggle('active', panel === 'gym');
  document.getElementById('toggleCourt').classList.toggle('active', panel === 'court');
  document.getElementById('toggleGym').classList.toggle('active', panel === 'gym');
}

function submitGymInquiry(e) {
  e.preventDefault();
  const name  = document.getElementById('giName').value;
  const phone = document.getElementById('giPhone').value;
  const email = document.getElementById('giEmail').value;
  const type  = document.getElementById('giType').value;
  const msg   = document.getElementById('giMsg').value;
  const subject = encodeURIComponent('Gym Membership Inquiry – Baesa QC – ' + name);
  const body    = encodeURIComponent('Name: ' + name + '\nPhone: ' + phone + '\nEmail: ' + email + '\nMembership: ' + type + (msg ? '\n\nMessage:\n' + msg : ''));
  window.location.href = 'mailto:sales@fitnessexclusive.ph?subject=' + subject + '&body=' + body;
  document.getElementById('giSuccess').classList.add('show');
  e.target.reset();
}

const FE_SALES_EMAIL = 'sales@fitnessexclusive.ph';
function miSubmit(e) {
  e.preventDefault();
  const f = document.getElementById('miForm');
  const data = {
    firstName: f.firstName.value.trim(),
    lastName:  f.lastName.value.trim(),
    email:     f.email.value.trim(),
    phone:     f.phone.value.trim(),
    branch:    f.branch.value,
    plan:      f.plan.value,
    notes:     f.notes.value.trim(),
  };
  if (!data.firstName || !data.lastName || !data.email || !data.phone || !data.plan) {
    alert('Please complete all required fields.');
    return false;
  }
  const subject = `Membership Inquiry — ${data.plan} — ${data.firstName} ${data.lastName}`;
  const bodyLines = [
    `Name:    ${data.firstName} ${data.lastName}`,
    `Email:   ${data.email}`,
    `Phone:   ${data.phone}`,
    `Branch:  ${data.branch || 'No preference'}`,
    `Plan:    ${data.plan}`,
    '',
    'Notes:',
    data.notes || '(none)',
    '',
    'Please walk me through the onboarding process. Thank you!',
    '',
    `— ${data.firstName} ${data.lastName}`,
  ];
  const body = bodyLines.join('\n');
  const mailto = `mailto:${FE_SALES_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.location.href = mailto;
  document.getElementById('miSuccess').classList.add('show');
  setTimeout(() => { f.reset(); }, 800);
  return false;
}

/* ── BAESA PHOTO CAROUSEL ── */
(function() {
  let current = 0;
  const total = 4;
  let autoTimer = null;

  const track   = document.getElementById('baesaCarouselTrack');
  const slides  = track.querySelectorAll('.carousel-slide');
  const dots    = document.querySelectorAll('#baesaCarouselDots .carousel-dot');
  const thumbs  = document.querySelectorAll('#baesaCarouselThumbs .carousel-thumb');
  const counter = document.getElementById('baesaCarouselCounter');

  function goTo(index) {
    slides[current].classList.remove('active');
    dots[current].classList.remove('active');
    thumbs[current].classList.remove('active');

    current = (index + total) % total;

    slides[current].classList.add('active');
    dots[current].classList.add('active');
    thumbs[current].classList.add('active');
    track.style.transform = `translateX(-${current * 100}%)`;
    counter.textContent = `${current + 1} / ${total}`;
  }

  document.getElementById('baesaCarouselPrev').addEventListener('click', () => { resetAuto(); goTo(current - 1); });
  document.getElementById('baesaCarouselNext').addEventListener('click', () => { resetAuto(); goTo(current + 1); });

  dots.forEach(d => d.addEventListener('click', () => { resetAuto(); goTo(+d.dataset.index); }));
  thumbs.forEach(t => t.addEventListener('click', () => { resetAuto(); goTo(+t.dataset.index); }));

  let startX = 0;
  const wrap = document.getElementById('baesaCarousel');
  wrap.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
  wrap.addEventListener('touchend', e => {
    const diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) { resetAuto(); goTo(diff > 0 ? current + 1 : current - 1); }
  });

  function startAuto() { autoTimer = setInterval(() => goTo(current + 1), 3000); }
  function resetAuto()  { clearInterval(autoTimer); startAuto(); }

  startAuto();
})();

(function(){
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if(entry.isIntersecting){
        var el=entry.target, delay=parseInt(el.dataset.delay||0);
        setTimeout(function(){el.classList.add('visible');}, delay);
        io.unobserve(el);
      }
    });
  },{threshold:0.10});
  document.querySelectorAll('.fade-up').forEach(function(el){io.observe(el);});
  document.querySelectorAll('.amenity-item.fade-up').forEach(function(el,i){el.dataset.delay=i*50;});
})();

(function(){
  document.querySelectorAll('.faq-q').forEach(function(btn){
    btn.addEventListener('click', function(){
      var item = this.closest('.faq-item');
      var ans  = item.querySelector('.faq-a');
      var isOpen = item.classList.contains('open');
      // close all
      document.querySelectorAll('.faq-item.open').forEach(function(o){
        o.classList.remove('open');
        o.querySelector('.faq-a').style.maxHeight = '0';
      });
      if(!isOpen){
        item.classList.add('open');
        ans.style.maxHeight = ans.scrollHeight + 'px';
      }
    });
  });
})();

/* Move booking widget to inline left-col area */
document.addEventListener('DOMContentLoaded', function() {
  var area   = document.getElementById('bwInlineArea');
  var widget = document.getElementById('bw-widget');
  if (area && widget) {
    area.appendChild(widget);
    /* Add a heading above the widget */
    var h2 = document.createElement('h2');
    h2.className = 'section-title fade-up';
    h2.style.marginBottom = '16px';
    h2.textContent = 'Book This Court';
    area.insertBefore(h2, widget);
  }
  /* Keep court panel active (pricing visible by default) */
  var courtPanel = document.getElementById('baesaCourtPanel');
  if (courtPanel) { courtPanel.classList.add('active'); }
});