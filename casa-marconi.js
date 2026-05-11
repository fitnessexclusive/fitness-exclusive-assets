{
  "@context": "https://schema.org",
  "@type": "SportsActivityLocation",
  "name": "Fitness Exclusive – Casa Marconi, Makati",
  "description": "Rooftop basketball court at 2305 Marconi St., corner Morse St., Makati City.",
  "url": "https://fitnessexclusive.ph/casa-marconi.html",
  "telephone": "+639171440100",
  "email": "sales@fitnessexclusive.ph",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "2305 Marconi St., corner Morse St.",
    "addressLocality": "Makati City",
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
    "Basketball"
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

/* ── CAROUSEL ── */
(function() {
  const total = 5;
  let current = 0;
  let autoTimer = null;

  const track   = document.getElementById('carouselTrack');
  const slides  = track.querySelectorAll('.carousel-slide');
  const dots    = document.querySelectorAll('.carousel-dot');
  const thumbs  = document.querySelectorAll('.carousel-thumb');
  const counter = document.getElementById('carouselCounter');

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

  document.getElementById('carouselPrev').addEventListener('click', () => { resetAuto(); goTo(current - 1); });
  document.getElementById('carouselNext').addEventListener('click', () => { resetAuto(); goTo(current + 1); });

  dots.forEach(d => d.addEventListener('click', () => { resetAuto(); goTo(+d.dataset.index); }));
  thumbs.forEach(t => t.addEventListener('click', () => { resetAuto(); goTo(+t.dataset.index); }));

  let startX = 0;
  const wrap = document.getElementById('courtCarousel');
  wrap.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
  wrap.addEventListener('touchend', e => {
    const diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) { resetAuto(); goTo(diff > 0 ? current + 1 : current - 1); }
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft')  { resetAuto(); goTo(current - 1); }
    if (e.key === 'ArrowRight') { resetAuto(); goTo(current + 1); }
  });

  function startAuto() { autoTimer = setInterval(() => goTo(current + 1), 4500); }
  function resetAuto()  { clearInterval(autoTimer); startAuto(); }

  startAuto();
})();

/* ══════════════════════════════════════════════════════════
   CASA MARCONI — 3-STEP BOOKING ENGINE
   Step 1: Rate + Date/Time/Duration
   Step 2: Court Size + Availability
   Step 3: Contact + GCash Summary → Confirm
   ══════════════════════════════════════════════════════════ */

const BPM_RATES = {
  offpeak: { without: 1200, with: 1500 },
  peak:    { without: 1500, with: 1800 }
};

const CM_SCRIPT_URL = 'PLACEHOLDER_CM_SCRIPT_URL';
const CM_CAL_ID     = 'PLACEHOLDER_CM_BASKETBALL_CAL_ID';
const CM_API_KEY    = 'AIzaSyCxRy0Tt54do_8loT5HscwQgKRvAacsWXA';
const CM_EMAIL      = 'sales@fitnessexclusive.ph';

const bpmState = {
  peakMode: '',
  showerAccess: '',
  date: '', time: '', duration: 1,
  courtOption: '', courtLabel: '',
  available: false
};

const bpmOccDB = {};

/* ── OPEN / CLOSE ── */
function bpmOpen() {
  document.getElementById('bpmOverlay').classList.add('is-open');
  document.body.style.overflow = 'hidden';
  bpmShowSection('bpm-step1');
  bpmSetStep(1);
  document.getElementById('bpm-date').min = new Date().toISOString().split('T')[0];
}

function bpmClose() {
  document.getElementById('bpmOverlay').classList.remove('is-open');
  document.body.style.overflow = '';
}

/* ── PEAK TOGGLE ── */
function bpmSelectPeak(mode) {
  bpmState.peakMode = mode;
  bpmState.showerAccess = '';
  document.getElementById('bpm-pt-offpeak').className = 'bpm-peak-btn' + (mode === 'offpeak' ? ' selected-off' : '');
  document.getElementById('bpm-pt-peak').className    = 'bpm-peak-btn' + (mode === 'peak'    ? ' selected-peak' : '');

  // Reset shower buttons
  document.getElementById('bpm-sh-without').classList.remove('selected');
  document.getElementById('bpm-sh-with').classList.remove('selected');

  // Update shower rate labels based on selected mode
  const rates = BPM_RATES[mode];
  document.getElementById('bpm-sh-without-rate').textContent = `₱${rates.without.toLocaleString()}/hr`;
  document.getElementById('bpm-sh-with-rate').textContent    = `₱${rates.with.toLocaleString()}/hr`;

  // Show shower wrap
  document.getElementById('bpm-shower-wrap').style.display = 'block';
}

/* ── SHOWER SELECTION ── */
function bpmSelectShower(access) {
  bpmState.showerAccess = access;
  document.getElementById('bpm-sh-without').classList.toggle('selected', access === 'without');
  document.getElementById('bpm-sh-with').classList.toggle('selected', access === 'with');
}

/* ── STEP MANAGEMENT ── */
function bpmSetStep(n) {
  [1,2,3].forEach(i => {
    const el = document.getElementById('bpm-si-'+i);
    el.classList.remove('active','done');
    if (i < n) el.classList.add('done');
    if (i === n) el.classList.add('active');
  });
}

function bpmShowSection(id) {
  ['bpm-step1','bpm-step2','bpm-step3','bpm-stepSuccess'].forEach(s => {
    const el = document.getElementById(s);
    if (el) { el.className = el.className.replace('bpm-visible','bpm-hidden').trim(); }
  });
  const target = document.getElementById(id);
  if (target) { target.className = target.className.replace('bpm-hidden','bpm-visible').trim(); }
}

function bpmGoStep1() { bpmShowSection('bpm-step1'); bpmSetStep(1); }

function bpmGoStep2() {
  const date = document.getElementById('bpm-date').value;
  const time = document.getElementById('bpm-time').value;
  if (!bpmState.peakMode) { alert('Please select Regular or Night rate window.'); return; }
  if (!bpmState.showerAccess) { alert('Please select shower access option.'); return; }
  if (!date) { alert('Please select a date.'); return; }
  if (!time) { alert('Please select a start time.'); return; }

  const hour = parseInt(time.split(':')[0]);
  if (bpmState.peakMode === 'offpeak' && hour >= 18) {
    alert('Regular hours are 6:00 AM – 6:00 PM. Please choose a time before 6:00 PM, or switch to Night.');
    return;
  }
  if (bpmState.peakMode === 'peak' && hour < 18) {
    alert('Night hours are 6:00 PM – 12:00 AM. Please choose a time from 6:00 PM onward, or switch to Regular.');
    return;
  }

  bpmState.date = date;
  bpmState.time = time;
  bpmState.duration = parseInt(document.getElementById('bpm-duration').value);
  bpmState.courtOption = '';
  bpmState.courtLabel = '';
  bpmState.available = false;

  // Reset court selection UI
  const elWhole = document.getElementById('bpm-opt-whole');
  if (elWhole) elWhole.classList.remove('selected');
  const avail = document.getElementById('bpm-avail');
  avail.className = 'bpm-avail hidden';
  document.getElementById('bpm-step2Next').disabled = true;

  bpmUpdatePills();
  bpmShowSection('bpm-step2');
  bpmSetStep(2);
}

function bpmGoStep3() {
  if (!bpmState.courtOption) { alert('Please select a court size.'); return; }
  if (!bpmState.available) { alert('The selected court is not available at that time. Please try another slot.'); return; }
  bpmUpdatePills();
  bpmUpdateSummary();
  // Reset agree box each time step 3 is entered
  document.getElementById('bpm-rules-agree').classList.remove('checked');
  document.getElementById('bpm-confirm-btn').disabled = true;
  bpmShowSection('bpm-step3');
  bpmSetStep(3);
}

/* ── DATE/TIME PILLS ── */
function bpmFmtDate(d) {
  return new Date(d+'T00:00:00').toLocaleDateString('en-PH',{weekday:'short',month:'short',day:'numeric',year:'numeric'});
}
function bpmFmtTime(t) {
  const [h, m] = t.split(':').map(Number);
  const ap = h >= 12 ? 'PM' : 'AM';
  return `${h%12||12}:${m.toString().padStart(2,'0')} ${ap}`;
}
function bpmUpdatePills() {
  const df = bpmFmtDate(bpmState.date);
  const tf = bpmFmtTime(bpmState.time);
  const dur = `${bpmState.duration}hr`;
  const pk = bpmState.peakMode === 'offpeak' ? 'Regular' : 'Night';
  ['','3'].forEach(sfx => {
    const d = document.getElementById('bpm-dtDate'+sfx);
    const t = document.getElementById('bpm-dtTime'+sfx);
    const du = document.getElementById('bpm-dtDur'+sfx);
    const p = document.getElementById('bpm-dtPeak'+sfx);
    if (d) d.textContent = df;
    if (t) t.textContent = tf;
    if (du) du.textContent = dur;
    if (p) p.textContent = pk;
  });
}

/* ── COURT SELECTION ── */
function bpmSelectCourt(option, label) {
  const elWhole = document.getElementById('bpm-opt-whole');
  if (elWhole) elWhole.classList.remove('selected');
  const el = document.getElementById('bpm-opt-'+option);
  if (el) el.classList.add('selected');
  bpmState.courtOption = option;
  bpmState.courtLabel = label;
  bpmCheckAvail(option);
}

async function bpmCheckAvail(option) {
  const banner = document.getElementById('bpm-avail');
  banner.className = 'bpm-avail checking';
  banner.innerHTML = '<div class="bpm-avail-dot"></div> Checking availability…';
  bpmState.available = false;
  document.getElementById('bpm-step2Next').disabled = true;

  try {
    const startISO = bpmState.date + 'T' + bpmState.time + ':00+08:00';
    const endH = parseInt(bpmState.time.split(':')[0]) + bpmState.duration;
    const endDate = endH >= 24
      ? (() => { const d = new Date(bpmState.date+'T00:00:00'); d.setDate(d.getDate()+1); return d.toISOString().split('T')[0]; })()
      : bpmState.date;
    const endHH = endH >= 24 ? endH - 24 : endH;
    const endISO = endDate + 'T' + String(endHH).padStart(2,'0') + ':' + (bpmState.time.split(':')[1]||'00') + ':00+08:00';

    if (!CM_CAL_ID || CM_CAL_ID.indexOf('PLACEHOLDER') >= 0) {
      banner.className = 'bpm-avail available';
      banner.innerHTML = `<div class="bpm-avail-dot"></div> ✓ Available on ${bpmFmtDate(bpmState.date)} at ${bpmFmtTime(bpmState.time)}`;
      bpmState.available = true;
      document.getElementById('bpm-step2Next').disabled = false;
      return;
    }
    const url = 'https://www.googleapis.com/calendar/v3/calendars/' +
      encodeURIComponent(CM_CAL_ID) +
      '/events?key=' + CM_API_KEY +
      '&timeMin=' + encodeURIComponent(startISO) +
      '&timeMax=' + encodeURIComponent(endISO) +
      '&singleEvents=true';
    const data = await (await fetch(url)).json();
    const occupied = (data.items || []).length > 0;
    if (occupied) {
      banner.className = 'bpm-avail occupied';
      banner.innerHTML = '<div class="bpm-avail-dot"></div> This court is occupied at the selected time.';
      bpmState.available = false;
      document.getElementById('bpm-step2Next').disabled = true;
    } else {
      banner.className = 'bpm-avail available';
      banner.innerHTML = `<div class="bpm-avail-dot"></div> ✓ Available on ${bpmFmtDate(bpmState.date)} at ${bpmFmtTime(bpmState.time)}`;
      bpmState.available = true;
      document.getElementById('bpm-step2Next').disabled = false;
    }
  } catch (err) {
    // On error, allow booking to proceed (fallback)
    banner.className = 'bpm-avail available';
    banner.innerHTML = `<div class="bpm-avail-dot"></div> ✓ Slot looks open — please confirm.`;
    bpmState.available = true;
    document.getElementById('bpm-step2Next').disabled = false;
  }
}

/* ── SUMMARY ── */
function bpmUpdateSummary() {
  const rate = BPM_RATES[bpmState.peakMode]?.[bpmState.showerAccess] || 0;
  const total = rate * bpmState.duration;
  const peakLabel = bpmState.peakMode === 'offpeak' ? 'Regular (6AM–6PM)' : 'Night (6PM–12AM)';
  const showerLabel = bpmState.showerAccess === 'with' ? 'With Shower Access' : 'Without Shower Access';

  document.getElementById('bpm-summaryBox').innerHTML = `
    <div class="bpm-summary-title">Booking Summary</div>
    <div class="bpm-summary-row"><span class="s-key">Facility</span><span class="s-val">Casa Marconi Basketball Court</span></div>
    <div class="bpm-summary-row"><span class="s-key">Rate Window</span><span class="s-val">${peakLabel}</span></div>
    <div class="bpm-summary-row"><span class="s-key">Shower Access</span><span class="s-val">${showerLabel}</span></div>
    <div class="bpm-summary-row"><span class="s-key">Sport</span><span class="s-val">Basketball</span></div>
    <div class="bpm-summary-row"><span class="s-key">Court</span><span class="s-val">${bpmState.courtLabel}</span></div>
    <div class="bpm-summary-row"><span class="s-key">Date</span><span class="s-val">${bpmFmtDate(bpmState.date)}</span></div>
    <div class="bpm-summary-row"><span class="s-key">Time</span><span class="s-val">${bpmFmtTime(bpmState.time)}</span></div>
    <div class="bpm-summary-row"><span class="s-key">Duration</span><span class="s-val">${bpmState.duration} hour${bpmState.duration>1?'s':''}</span></div>
    <div class="bpm-summary-row"><span class="s-key">Rate</span><span class="s-val">₱${rate.toLocaleString()}/hr</span></div>
    <hr class="bpm-summary-divider" />
    <div class="bpm-summary-row bpm-summary-total">
      <span class="s-key">Total</span>
      <span class="s-val">₱${total.toLocaleString()}</span>
    </div>
  `;
}

/* ── CONFIRM ── */
async function bpmConfirm() {
  const name  = document.getElementById('bpm-name').value.trim();
  const email = document.getElementById('bpm-email').value.trim();
  const phone = document.getElementById('bpm-phone').value.trim();
  if (!name || !email || !phone) { alert('Please fill in all contact details.'); return; }

  const btn = document.getElementById('bpm-confirm-btn');
  btn.disabled = true; btn.textContent = 'Booking…';

  const rate = BPM_RATES[bpmState.peakMode]?.[bpmState.showerAccess] || 0;
  const total = rate * bpmState.duration;
  const startISO = bpmState.date + 'T' + bpmState.time + ':00+08:00';
  const endH = parseInt(bpmState.time.split(':')[0]) + bpmState.duration;
  const endDate = endH >= 24
    ? (() => { const d = new Date(bpmState.date+'T00:00:00'); d.setDate(d.getDate()+1); return d.toISOString().split('T')[0]; })()
    : bpmState.date;
  const endHH = endH >= 24 ? endH - 24 : endH;
  const endISO = endDate + 'T' + String(endHH).padStart(2,'0') + ':' + (bpmState.time.split(':')[1]||'00') + ':00+08:00';

  const payload = {
    action: 'book',
    sport: 'basketball',
    start: startISO, end: endISO,
    name: name, phone: phone, email: email,
    total: total,
    addons: (bpmState.showerAccess === 'with' ? 'With Shower Access' : 'No Shower') +
            ' · ' + (bpmState.peakMode === 'offpeak' ? 'Regular Rate' : 'Night Rate'),
    players: ''
  };

  try {
    if (!CM_SCRIPT_URL || CM_SCRIPT_URL.indexOf('PLACEHOLDER') >= 0) {
      // fallback: just show success
    } else {
      const url = new URL(CM_SCRIPT_URL);
      Object.keys(payload).forEach(k => url.searchParams.set(k, payload[k]));
      const res = await (await fetch(url.toString())).json();
      if (!res.ok && res.error === 'SLOT_TAKEN') {
        alert('Sorry, that slot was just taken by another booking. Please choose a different time.');
        btn.disabled = false; btn.textContent = 'Confirm Booking';
        return;
      }
      if (!res.ok) {
        alert('Something went wrong: ' + res.error + '. Please email us at ' + CM_EMAIL);
        btn.disabled = false; btn.textContent = 'Confirm Booking';
        return;
      }
    }
  } catch (err) {
    alert('Connection error. Please email us at ' + CM_EMAIL);
    btn.disabled = false; btn.textContent = 'Confirm Booking';
    return;
  }

  const ref = 'FE-CM-' + Date.now().toString(36).toUpperCase().slice(-6);
  document.getElementById('bpm-refCode').textContent = ref;
  document.getElementById('bpm-sucName').textContent  = `${name} · ${email}`;
  document.getElementById('bpm-sucCourt').textContent = `Basketball — ${bpmState.courtLabel} · ${bpmState.showerAccess === 'with' ? 'With Shower' : 'No Shower'} · Casa Marconi`;
  document.getElementById('bpm-sucDT').textContent    = `${bpmFmtDate(bpmState.date)} · ${bpmFmtTime(bpmState.time)} · ${bpmState.duration}hr · ${bpmState.peakMode === 'offpeak' ? 'Regular' : 'Night'}`;

  (function(){function toGCalDate(iso){var m=iso.match(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/);return m?m[1]+m[2]+m[3]+'T'+m[4]+m[5]+m[6]:'';}var gcTitle=encodeURIComponent('[FE] Basketball @ Casa Marconi, Manila');var gcDates=toGCalDate(startISO)+'/'+toGCalDate(endISO);var gcDetails=encodeURIComponent('Fitness Exclusive Casa Marconi, Manila\nCourt: '+bpmState.courtLabel+'\nTotal: ₱'+total+'\nContact: sales@fitnessexclusive.ph');var gcLoc=encodeURIComponent('Fitness Exclusive Casa Marconi, Manila');document.getElementById('bpmCalLink').href='https://calendar.google.com/calendar/render?action=TEMPLATE&text='+gcTitle+'&dates='+gcDates+'&details='+gcDetails+'&location='+gcLoc;})();
  bpmShowSection('bpm-stepSuccess');
  [1,2,3].forEach(i => document.getElementById('bpm-si-'+i).classList.add('done'));
}

/* ── RESET ── */
function bpmReset() {
  bpmState.peakMode = ''; bpmState.showerAccess = ''; bpmState.date = ''; bpmState.time = '';
  bpmState.duration = 1; bpmState.courtOption = ''; bpmState.courtLabel = '';
  bpmState.available = false;
  document.getElementById('bpm-date').value = '';
  document.getElementById('bpm-time').value = '';
  document.getElementById('bpm-duration').value = '1';
  document.getElementById('bpm-name').value = '';
  document.getElementById('bpm-email').value = '';
  document.getElementById('bpm-phone').value = '';
  document.getElementById('bpm-pt-offpeak').className = 'bpm-peak-btn';
  document.getElementById('bpm-pt-peak').className = 'bpm-peak-btn';
  document.getElementById('bpm-sh-without').classList.remove('selected');
  document.getElementById('bpm-sh-with').classList.remove('selected');
  document.getElementById('bpm-shower-wrap').style.display = 'none';
  document.getElementById('bpm-avail').className = 'bpm-avail hidden';
  document.getElementById('bpm-step2Next').disabled = true;
  document.getElementById('bpm-rules-agree').classList.remove('checked');
  document.getElementById('bpm-confirm-btn').disabled = true;
  bpmShowSection('bpm-step1');
  bpmSetStep(1);
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('bpm-date').min = new Date().toISOString().split('T')[0];
});

/* ── RULES MODAL ── */
function bpmOpenRules() {
  document.getElementById('bpmRulesOverlay').classList.add('open');
}
function bpmCloseRules() {
  document.getElementById('bpmRulesOverlay').classList.remove('open');
}
function bpmAgreeFromModal() {
  // Check the box and close the modal
  const box = document.getElementById('bpm-rules-agree');
  box.classList.add('checked');
  document.getElementById('bpm-confirm-btn').disabled = false;
  bpmCloseRules();
}

/* ── RULES AGREE TOGGLE ── */
function bpmToggleAgree() {
  const box = document.getElementById('bpm-rules-agree');
  const isChecked = box.classList.toggle('checked');
  document.getElementById('bpm-confirm-btn').disabled = !isChecked;
}

/* ══════════════════════════════════════════════════════════
   CASA MARCONI — AVAILABILITY HEATMAP (inline left column)
   ══════════════════════════════════════════════════════════ */
var cmWeekEvents=[],cmWeekStart=(function(){var d=new Date();d.setHours(0,0,0,0);return d;})();
var CM_HM_DAYS=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
var CM_HM_HOURS=[6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23];
function cmFmt(h){var p=h>=12?'PM':'AM',d=h%12===0?12:h%12;return d+':00 '+p;}
function cmGetWeekDates(s){var d=new Date(s),a=[];for(var i=0;i<7;i++){var n=new Date(d);n.setDate(n.getDate()+i);a.push(n.toISOString().split('T')[0]);}return a;}
async function cmFetchWeekEvt(startStr){
  if(!CM_CAL_ID||CM_CAL_ID.indexOf('PLACEHOLDER')>=0)return[];
  var wS=new Date(startStr+'T00:00:00+08:00');var wE=new Date(wS);wE.setDate(wE.getDate()+7);
  try{
    var d=await(await fetch('https://www.googleapis.com/calendar/v3/calendars/'+encodeURIComponent(CM_CAL_ID)+'/events?key='+CM_API_KEY+'&timeMin='+wS.toISOString()+'&timeMax='+wE.toISOString()+'&singleEvents=true')).json();
    return(d.items||[]).map(function(e){return{start:new Date(e.start.dateTime||e.start.date+'T00:00:00+08:00'),end:new Date(e.end.dateTime||e.end.date+'T23:59:59+08:00')};});
  }catch(e){return[];}
}
function cmBlockedOnDate(dateStr,h){var dt=new Date(dateStr+'T00:00:00+08:00'),s=new Date(dt),e=new Date(dt);s.setHours(h,0,0,0);e.setHours(h+1,0,0,0);return cmWeekEvents.some(function(ev){return(s>=ev.start&&s<ev.end)||(e>ev.start&&e<=ev.end)||(s<=ev.start&&e>=ev.end);});}
function cmIsPastSlot(dateStr,h){var now=new Date(),d=new Date(dateStr+'T00:00:00+08:00');d.setHours(h,0,0,0);return d<=now;}
async function cmLoadHeatmap(){
  document.getElementById('cmHmLoading').style.display='flex';
  document.getElementById('cmHeatmap').innerHTML='';
  document.getElementById('cmHmSelected').style.display='none';
  var startStr=cmWeekStart.toISOString().split('T')[0];
  var dates=cmGetWeekDates(startStr);
  var opts={month:'short',day:'numeric'};
  document.getElementById('cmHmRange').textContent=new Date(dates[0]+'T12:00:00').toLocaleDateString('en-PH',opts)+' – '+new Date(dates[6]+'T12:00:00').toLocaleDateString('en-PH',opts);
  var todayStr=new Date().toISOString().split('T')[0];
  document.getElementById('cmHmPrev').disabled=dates[0]<=todayStr;
  cmWeekEvents=await cmFetchWeekEvt(startStr);
  document.getElementById('cmHmLoading').style.display='none';
  cmBuildHeatmap(dates);
}
function cmBuildHeatmap(dates){
  var g=document.getElementById('cmHeatmap');g.innerHTML='';
  var todayStr=new Date().toISOString().split('T')[0];
  var corner=document.createElement('div');corner.className='bpm-hm-time';g.appendChild(corner);
  dates.forEach(function(ds){var d=new Date(ds+'T12:00:00'),el=document.createElement('div');el.className='bpm-hm-head'+(ds===todayStr?' today':'');el.innerHTML=CM_HM_DAYS[d.getDay()]+'<br>'+d.getDate();g.appendChild(el);});
  CM_HM_HOURS.forEach(function(h){
    var tl=document.createElement('div');tl.className='bpm-hm-time';tl.textContent=cmFmt(h);g.appendChild(tl);
    dates.forEach(function(ds){
      var cell=document.createElement('div');
      var past=cmIsPastSlot(ds,h);var bl=!past&&cmBlockedOnDate(ds,h);
      cell.className='bpm-hm-cell '+(past?'past':bl?'blocked':'avail');
      cell.dataset.date=ds;cell.dataset.h=h;
      if(!past&&!bl){cell.addEventListener('click',function(){
        document.querySelectorAll('.bpm-hm-cell.selected').forEach(function(c){c.className='bpm-hm-cell avail';});
        this.className='bpm-hm-cell selected';
        var dd=this.dataset.date,hh=parseInt(this.dataset.h);
        var dDisp=new Date(dd+'T12:00:00').toLocaleDateString('en-PH',{weekday:'short',month:'short',day:'numeric'});
        var sel=document.getElementById('cmHmSelected');
        sel.textContent=dDisp+' · '+cmFmt(hh)+' — complete booking in the form below';
        sel.style.display='flex';
        // Pre-fill the modal's date & time then open it
        document.getElementById('bpm-date').value=dd;
        document.getElementById('bpm-time').value=String(hh).padStart(2,'0')+':00';
        bpmOpen();
      });}
      g.appendChild(cell);
    });
  });
}
document.addEventListener('DOMContentLoaded',function(){
  var area=document.getElementById('bpmInlineArea');
  if(!area)return;
  area.innerHTML=
    '<h2 class="section-title fade-up" style="margin-bottom:16px">Book This Court</h2>'
   +'<div class="bpm-inline-card">'
   +'<div class="bpm-hm-wrap">'
   +'<div class="bpm-hm-nav">'
   +'<button type="button" class="bpm-hm-nav-btn" id="cmHmPrev">&#8249;</button>'
   +'<span class="bpm-hm-range" id="cmHmRange"></span>'
   +'<button type="button" class="bpm-hm-nav-btn" id="cmHmNext">&#8250;</button>'
   +'</div>'
   +'<div class="bpm-hm-legend">'
   +'<div class="bpm-hm-legend-item"><div class="bpm-hm-legend-dot" style="background:#14532d;border:1px solid #22c55e"></div>Available</div>'
   +'<div class="bpm-hm-legend-item"><div class="bpm-hm-legend-dot" style="background:#1c1c1c;border:1px solid #2e2e2e"></div>Booked</div>'
   +'<div class="bpm-hm-legend-item"><div class="bpm-hm-legend-dot" style="background:#181818;border:1px solid #252525;opacity:.55"></div>Past</div>'
   +'</div>'
   +'<div class="bpm-hm-loading-row" id="cmHmLoading" style="display:none"><span class="bpm-hm-spinner"></span>Loading availability…</div>'
   +'<div class="bpm-hm-scroll"><div class="bpm-hm-grid" id="cmHeatmap"></div></div>'
   +'<div class="bpm-hm-selected" id="cmHmSelected" style="display:none"></div>'
   +'<p style="font-size:0.74rem;color:#888;margin-top:12px;line-height:1.5">Click any <span style="color:#4ade80;font-weight:700">green</span> slot to pre-fill the booking form with that date &amp; time.</p>'
   +'</div></div>';
  document.getElementById('cmHmPrev').addEventListener('click',function(){var d=new Date(cmWeekStart);d.setDate(d.getDate()-7);var today=new Date();today.setHours(0,0,0,0);cmWeekStart=(d>=today?d:today);cmLoadHeatmap();});
  document.getElementById('cmHmNext').addEventListener('click',function(){cmWeekStart=new Date(cmWeekStart);cmWeekStart.setDate(cmWeekStart.getDate()+7);cmLoadHeatmap();});
  cmLoadHeatmap();
});

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