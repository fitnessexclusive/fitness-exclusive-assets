{
  "@context": "https://schema.org",
  "@type": "SportsActivityLocation",
  "name": "Fitness Exclusive – General Trias, Cavite",
  "description": "Multi-sport courts and fitness gym in General Trias, Cavite.",
  "url": "https://fitnessexclusive.ph//general-trias-cavite",
  "telephone": "+639171440100",
  "email": "sales@fitnessexclusive.ph",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "General Trias",
    "addressLocality": "General Trias",
    "addressRegion": "Cavite",
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
      var SCRIPT_URL='https://script.google.com/macros/s/AKfycbyT4RTD1ZrIj7AVGTEwBT6jb63CxRNOOi-kiuJnAyPM9wYOQ-5wIw2hYTCIIiy5kpzJRg/exec';
      var CALENDARS={
        fullcourt:   'c_f80a71e9a5f50bd5ec7ff27553a53c33efea180166eaf8566da42766184f11fb@group.calendar.google.com',
        pickleballA: 'c_73c8edef7110e0c2a582aaba4a87456aa879e3e5f6ebc5f4c6dd1746b06c9d1f@group.calendar.google.com',
        pickleballB: 'c_0c8e9ef5a3bd7920e6d7295c06e3e863a1f58a86b0ff533a7487ab623c9927c2@group.calendar.google.com',
        pickleballC: 'c_341b63197e7566718300161253b31a0b9fe85dfda5cb265eff15cbf5623f3e58@group.calendar.google.com'
      };
      var API='AIzaSyCxRy0Tt54do_8loT5HscwQgKRvAacsWXA';
      var BRANCH='General Trias, Cavite',EMAIL='sales@fitnessexclusive.ph';
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
      function getCalId(){
        if(selSport==='basketball'||selSport==='volleyball') return CALENDARS.fullcourt;
        if(selSport==='pickleball'){
          if(selPKCourt==='A') return CALENDARS.pickleballA;
          if(selPKCourt==='B') return CALENDARS.pickleballB;
          if(selPKCourt==='C') return CALENDARS.pickleballC;
        }
        return CALENDARS.fullcourt;
      }
      // Shared-court conflict logic:
      // Basketball/Volleyball = full court → conflicts with fullcourt + all pickleball courts
      // Pickleball = 1/3 court → conflicts with fullcourt + own pickleball court only
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
          });}(h,bl));
          g.appendChild(btn);
        }
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
        $('bwHmLoading').style.display='flex';$('bwHeatmap').innerHTML='';$('bwHmSelected').style.display='none';
        selHour=null;selDur=null;$('bwDate').value='';
        $('bwDurWrap').style.display='none';$('bwPriceBox').style.display='none';$('bwAddonsWrap').style.display='none';$('bwPromoSec').style.display='none';
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
        var corner=document.createElement('div');corner.className='bw-hm-time';g.appendChild(corner);
        dates.forEach(function(ds){var d=new Date(ds+'T12:00:00'),el=document.createElement('div');el.className='bw-hm-head'+(ds===todayStr?' today':'');el.innerHTML=HM_DAYS[d.getDay()]+'<br>'+d.getDate();g.appendChild(el);});
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
              $('bwHmSelected').textContent='✓ '+dDisp+' · '+fmt(hh)+' — choose duration below';
              $('bwHmSelected').style.display='block';
              document.querySelectorAll('.bw-dur-btn').forEach(function(btn,i){btn.classList.remove('selected');btn.disabled=(hh+i+1>24)||blockedOnDate(dd,hh+i);});
              $('bwDurWrap').style.display='block';$('bwPriceBox').style.display='none';$('bwAddonsWrap').style.display='none';$('bwPromoSec').style.display='none';
            });}
            g.appendChild(cell);
          });
        });
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
        $('bwDate').setAttribute('min',new Date().toISOString().split('T')[0]);
        $('bwDate').addEventListener('change',async function(){
          selHour=null;selDur=null;$('bwDurWrap').style.display='none';$('bwPriceBox').style.display='none';$('bwAddonsWrap').style.display='none';$('bwPromoSec').style.display='none';
          $('bwLoading').style.display='flex';events=await fetchEvt(this.value);buildGrid();$('bwLoading').style.display='none';
        });
        $('bwDurRow').addEventListener('click',function(e){
          var btn=e.target.closest('.bw-dur-btn');if(!btn||btn.disabled)return;
          selDur=parseInt(btn.dataset.h);
          document.querySelectorAll('.bw-dur-btn').forEach(function(b){b.classList.remove('selected');});btn.classList.add('selected');calc();
        });
        $('bwS1Btn').addEventListener('click',function(){
          if(selHour===null||!$('bwDate').value)return alert('Please select a date and time on the calendar above.');
          if(selDur===null)return alert('Please select a duration.');
          if(!$('bwAgree').checked)return alert('Please agree to the house rules.');
          var d=new Date($('bwDate').value+'T00:00:00'),ds=d.toLocaleDateString('en-PH',{month:'short',day:'numeric',year:'numeric'});
          var eH=selHour+selDur,eLbl=eH>=24?'12:00 AM':fmt(eH);
          $('bwBar').innerHTML='<strong style="color:#ddd">'+ds+'</strong> &nbsp;|&nbsp; '+fmt(selHour)+' – '+eLbl+' · '+selDur+'hr · '+sportLabel();
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
            action:'book',sport:selSport,pkCourt:selPKCourt,
            start:startISO,end:endISO,
            name:$('bwName').value,phone:$('bwPhone').value,email:$('bwEmail').value,
            total:finalTotal,addons:addonTxt,
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
              events=await fetchEvt(dateVal);buildGrid();setTabs(1);
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
        $('bwHmPrev').addEventListener('click',function(){var d=new Date(weekStart);d.setDate(d.getDate()-7);var today=new Date();today.setHours(0,0,0,0);weekStart=(d>=today?d:today);loadHeatmap();});
        $('bwHmNext').addEventListener('click',function(){weekStart=new Date(weekStart);weekStart.setDate(weekStart.getDate()+7);loadHeatmap();});
        loadHeatmap();
      });
    })();

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
  var area = document.getElementById('bwInlineArea');
  var widget = document.getElementById('bw-widget');
  if (area && widget) {
    area.appendChild(widget);
    var h2 = document.createElement('h2');
    h2.className = 'section-title fade-up';
    h2.style.marginBottom = '16px';
    h2.textContent = 'Book This Court';
    area.insertBefore(h2, widget);
  }
});