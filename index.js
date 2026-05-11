// ── MEMBERSHIP INQUIRY FORM HANDLER ──
// Builds a mailto: link with pre-filled subject and body, opens user's mail client.
// Replace this with a fetch() to Formspree/Web3Forms/Netlify Forms when backend is ready.
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

  // Basic validation (HTML required does most of it)
  if (!data.firstName || !data.lastName || !data.email || !data.phone || !data.plan) {
    alert('Please complete all required fields.');
    return false;
  }

  const subject = `[Membership Inquiry] ${data.plan} — ${data.firstName} ${data.lastName}`;
  const bodyLines = [
    'Hi Fitness Exclusive Sales Team,',
    '',
    'I would like to inquire about a membership. My details:',
    '',
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

  // Show success state
  document.getElementById('miSuccess').classList.add('show');
  setTimeout(() => {
    f.reset();
  }, 800);

  return false;
}

/* ══════════════════════════════════════════════════════════
   FITNESS EXCLUSIVE — 3-STEP BOOKING ENGINE
   Schedule → Sport → Details
   With Night / Regular rate selection
   ══════════════════════════════════════════════════════════ */

// ── BRANCH CONFIG ──
const BK_BRANCHES = {
  'san-sebastian': {
    name: 'San Sebastian College – Recoletos',
    offpeak: { basketball: 1800, volleyball: 1800, pickleball: 350 },
    peak:    { basketball: 2100, volleyball: 2100, pickleball: 450 }
  },
  'san-isidro': {
    name: 'San Isidro, Makati',
    offpeak: { basketball: 1200, volleyball: 1200, pickleball: 350 },
    peak:    { basketball: 1500, volleyball: 1500, pickleball: 450 }
  },
  'baesa': {
    name: 'Baesa, Quezon City',
    offpeak: { basketball: 2100, volleyball: 2100, pickleball: 350 },
    peak:    { basketball: 2400, volleyball: 2400, pickleball: 450 }
  },
  'pasay': {
    name: 'Trium Square, Pasay',
    offpeak: { basketball: 2400, volleyball: 2400, pickleball: 2400 },
    peak:    { basketball: 2400, volleyball: 2400, pickleball: 2400 }
  },
  'marconi': {
    name: 'Casa Marconi Basketball Court',
    offpeak: { basketball: 1200, volleyball: 1200, pickleball: 1200 },
    peak:    { basketball: 1400, volleyball: 1400, pickleball: 1400 }
  },
  'gen-trias': {
    name: 'General Trias, Cavite',
    offpeak: { basketball: 1200, volleyball: 1200, pickleball: 350 },
    peak:    { basketball: 1500, volleyball: 1500, pickleball: 450 }
  }
};

// ── STATE ──
const bkState = {
  location: '', locationName: '', peakMode: '',
  date: '', time: '', duration: 1,
  sport: '', subOption: '', subLabel: '',
  courtAvailable: false
};

// Simulated occupancy DB
const bkOccDB = {};
(function seedOcc() {
  const today = new Date().toISOString().split('T')[0];
  bkOccDB[`san-isidro-${today}-10:00-pb1`] = true;
  bkOccDB[`baesa-${today}-14:00-pb2`] = true;
})();

// ── OPEN / CLOSE ──
function openBooking(venueName) {
  // Map venue name to branch key
  const keyMap = {
    'Fitness Exclusive - San Sebastian College \u2013 Recoletos': 'san-sebastian',
    'Fitness Exclusive - San Isidro, Makati': 'san-isidro',
    'Fitness Exclusive - Baesa, Quezon City': 'baesa',
    'Fitness Exclusive - Trium Square, Pasay': 'pasay',
    'Casa Marconi Basketball Court': 'marconi',
    'Fitness Exclusive - General Trias, Cavite': 'gen-trias'
  };
  const key = keyMap[venueName] || 'san-isidro';
  document.getElementById('bk-location').value = key;
  document.getElementById('fePanelVenueName').textContent = (BK_BRANCHES[key]?.name || venueName);
  updatePeakRates();
  document.getElementById('bk-date').min = new Date().toISOString().split('T')[0];
  document.getElementById('feBookingOverlay').classList.add('is-open');
  document.body.style.overflow = 'hidden';
  bkShowSection('bk-step1');
  bkSetStep(1);
}

function closeBooking() {
  document.getElementById('feBookingOverlay').classList.remove('is-open');
  document.body.style.overflow = '';
}

function handleOverlayClick(e) {
  if (e.target === document.getElementById('feBookingOverlay')) closeBooking();
}

// ── PEAK TOGGLE ──
function selectPeak(mode) {
  bkState.peakMode = mode;
  document.getElementById('pt-offpeak').className = 'peak-toggle-btn' + (mode === 'offpeak' ? ' selected-off' : '');
  document.getElementById('pt-peak').className = 'peak-toggle-btn' + (mode === 'peak' ? ' selected-peak' : '');
}

function updatePeakRates() {
  const loc = document.getElementById('bk-location').value;
  const branch = BK_BRANCHES[loc];
  if (!branch) { document.getElementById('pt-offpeak-rate').textContent = '₱—'; document.getElementById('pt-peak-rate').textContent = '₱—'; return; }
  const opRates = Object.values(branch.offpeak);
  const pkRates = Object.values(branch.peak);
  const opMin = Math.min(...opRates);
  const pkMin = Math.min(...pkRates);
  document.getElementById('pt-offpeak-rate').textContent = `₱${opMin.toLocaleString()}/hr`;
  document.getElementById('pt-peak-rate').textContent = `₱${pkMin.toLocaleString()}/hr`;
}

document.getElementById('bk-location').addEventListener('change', function() {
  document.getElementById('fePanelVenueName').textContent = (BK_BRANCHES[this.value]?.name || 'Select a branch');
  updatePeakRates();
  // Reset peak selection when branch changes
  if (bkState.peakMode) selectPeak(bkState.peakMode);
});

// ── STEP NAVIGATION ──
function bkSetStep(n) {
  [1,2,3].forEach(i => {
    const el = document.getElementById('si-'+i);
    el.classList.remove('active','done');
    if (i < n) el.classList.add('done');
    if (i === n) el.classList.add('active');
  });
}

function bkShowSection(id) {
  ['bk-step1','bk-step2','bk-step3','bk-stepSuccess'].forEach(s => {
    const el = document.getElementById(s);
    if (el) { el.className = el.className.replace('section-visible','section-hidden').trim(); }
  });
  const target = document.getElementById(id);
  if (target) { target.className = target.className.replace('section-hidden','section-visible').trim(); }
}

function bkGoStep1() { bkShowSection('bk-step1'); bkSetStep(1); }

function bkGoStep2() {
  const loc = document.getElementById('bk-location').value;
  const date = document.getElementById('bk-date').value;
  const time = document.getElementById('bk-time').value;
  if (!loc) { alert('Please select a branch.'); return; }
  if (!bkState.peakMode) { alert('Please select Regular or Night rate window.'); return; }
  if (!date) { alert('Please select a date.'); return; }
  if (!time) { alert('Please select a start time.'); return; }

  // Validate time matches selected peak window
  const hour = parseInt(time.split(':')[0]);
  if (bkState.peakMode === 'offpeak' && hour >= 18) {
    alert('Regular hours are 6:00 AM – 6:00 PM. Please choose a time before 6:00 PM, or switch to Night.');
    return;
  }
  if (bkState.peakMode === 'peak' && hour < 18) {
    alert('Night hours are 6:00 PM – 12:00 AM. Please choose a time from 6:00 PM onward, or switch to Regular.');
    return;
  }

  bkState.location = loc;
  bkState.locationName = BK_BRANCHES[loc]?.name || loc;
  bkState.date = date;
  bkState.time = time;
  bkState.duration = parseInt(document.getElementById('bk-duration').value);

  bkUpdatePills();
  bkShowSection('bk-step2');
  bkSetStep(2);
  bkResetSport();
}

function bkGoStep3() {
  if (!bkState.sport) { alert('Please select a sport.'); return; }
  if (!bkState.subOption) { alert('Please select a court option.'); return; }
  if (!bkState.courtAvailable) { alert('The selected court is not available. Please choose another option.'); return; }
  bkUpdatePills();
  bkUpdateSummary();
  bkShowSection('bk-step3');
  bkSetStep(3);
}

// ── DATE/TIME PILLS ──
function bkFmtDate(d) {
  return new Date(d+'T00:00:00').toLocaleDateString('en-PH',{weekday:'short',month:'short',day:'numeric',year:'numeric'});
}
function bkFmtTime(t) {
  const [h, m] = t.split(':').map(Number);
  const ap = h >= 12 ? 'PM' : 'AM';
  return `${h%12||12}:${m.toString().padStart(2,'0')} ${ap}`;
}
function bkUpdatePills() {
  const df = bkFmtDate(bkState.date);
  const tf = bkFmtTime(bkState.time);
  const dur = `${bkState.duration}hr`;
  const pk = bkState.peakMode === 'offpeak' ? 'Regular' : 'Night';
  ['','3'].forEach(sfx => {
    const d = document.getElementById('bk-dtDate'+sfx);
    const t = document.getElementById('bk-dtTime'+sfx);
    const du = document.getElementById('bk-dtDur'+sfx);
    const p = document.getElementById('bk-dtPeak'+sfx);
    if (d) d.textContent = df;
    if (t) t.textContent = tf;
    if (du) du.textContent = dur;
    if (p) p.textContent = pk;
  });
}

// ── SPORT SELECTION ──
function bkResetSport() {
  ['basketball','pickleball','volleyball'].forEach(s => {
    document.getElementById('sc-'+s).classList.remove('selected');
    const sub = document.getElementById('sub-'+s);
    if (sub) sub.classList.remove('show');
  });
  bkState.sport = ''; bkState.subOption = ''; bkState.courtAvailable = false;
  document.getElementById('bk-step2Next').disabled = true;
}

function bkSelectSport(sport) {
  bkResetSport();
  bkState.sport = sport;
  document.getElementById('sc-'+sport).classList.add('selected');
  const sub = document.getElementById('sub-'+sport);
  if (sub) sub.classList.add('show');
  if (sport === 'pickleball') bkRenderPickleball();
  if (sport === 'volleyball') {
    bkState.subOption = 'full';
    bkState.subLabel = 'Full Court';
    bkCheckAvail('volleyball', 'full');
  }
}

// ── BASKETBALL / VOLLEYBALL SUB-SELECT ──
function bkSelectSub(sport, option, label) {
  document.querySelectorAll(`[id^="opt-${sport}-"]`).forEach(el => el.classList.remove('selected'));
  const el = document.getElementById(`opt-${sport}-${option}`);
  if (el) el.classList.add('selected');
  bkState.subOption = option;
  bkState.subLabel = label;
  bkCheckAvail(sport, option);
}

// ── PICKLEBALL ──
function bkRenderPickleball() {
  const container = document.getElementById('pickle-courts');
  const courts = [
    { id: 'pb1', label: 'Court 1', priority: true },
    { id: 'pb2', label: 'Court 2', priority: true },
    { id: 'pb3', label: 'Court 3', priority: false },
  ];
  container.innerHTML = '';
  let firstAvail = null;
  courts.forEach(court => {
    const key = `${bkState.location}-${bkState.date}-${bkState.time}-${court.id}`;
    const occupied = !!bkOccDB[key];
    if (!occupied && !firstAvail) firstAvail = court;
    const div = document.createElement('div');
    div.className = 'option-btn';
    div.id = `opt-pickleball-${court.id}`;
    div.style.cssText = 'flex-direction:column;text-align:center;gap:4px;' + (occupied ? 'opacity:.45;cursor:not-allowed;' : '');
    if (!occupied) div.onclick = () => bkSelectPickleball(court.id, court.label);
    div.innerHTML = `
      
      <div class="opt-title">${court.label}</div>
      <span class="badge-tag ${occupied?'badge-occupied':'badge-available'}">${occupied?'Occupied':'Available'}</span>
    `;
    container.appendChild(div);
  });
  // Auto-suggest first available
  if (firstAvail) {
    const el = document.getElementById(`opt-pickleball-${firstAvail.id}`);
    if (el) {
      const badge = document.createElement('span');
      badge.className = 'badge-tag badge-recommended';
      badge.textContent = 'Recommended';
      badge.style.marginTop = '2px';
      el.appendChild(badge);
    }
  }
}

function bkSelectPickleball(courtId, label) {
  document.querySelectorAll('[id^="opt-pickleball-"]').forEach(el => el.classList.remove('selected'));
  const el = document.getElementById(`opt-pickleball-${courtId}`);
  if (el) el.classList.add('selected');
  bkState.subOption = courtId;
  bkState.subLabel = label;
  bkCheckAvail('pickleball', courtId);
}

// ── AVAILABILITY CHECK ──
function bkCheckAvail(sport, option) {
  const bannerId = `avail-${sport}`;
  const banner = document.getElementById(bannerId);
  if (!banner) return;
  banner.className = 'avail-banner checking';
  banner.innerHTML = '<div class="avail-dot"></div> Checking availability…';
  bkState.courtAvailable = false;
  document.getElementById('bk-step2Next').disabled = true;

  setTimeout(() => {
    const key = sport === 'pickleball'
      ? `${bkState.location}-${bkState.date}-${bkState.time}-${option}`
      : `${bkState.location}-${bkState.date}-${bkState.time}-${sport}-${option}`;
    const occupied = !!bkOccDB[key];
    if (occupied) {
      banner.className = 'avail-banner occupied';
      banner.innerHTML = '<div class="avail-dot"></div> This court is occupied at the selected time.';
      bkState.courtAvailable = false;
      document.getElementById('bk-step2Next').disabled = true;
    } else {
      banner.className = 'avail-banner available';
      banner.innerHTML = `<div class="avail-dot"></div> ✓ Available on ${bkFmtDate(bkState.date)} at ${bkFmtTime(bkState.time)}`;
      bkState.courtAvailable = true;
      document.getElementById('bk-step2Next').disabled = false;
    }
  }, 800);
}

// ── SUMMARY ──
function bkUpdateSummary() {
  const branch = BK_BRANCHES[bkState.location];
  const rates = branch?.[bkState.peakMode] || {};
  let rate = rates[bkState.sport] || 0;
  // Half court = 50% rate
  if (bkState.subOption === 'half') rate = Math.round(rate * 0.5);
  const total = rate * bkState.duration;
  const peakLabel = bkState.peakMode === 'offpeak' ? 'Regular (6AM–6PM)' : 'Night (6PM–12AM)';
  const sportName = bkState.sport.charAt(0).toUpperCase() + bkState.sport.slice(1);

  document.getElementById('bk-summaryBox').innerHTML = `
    <div class="summary-title">Booking Summary</div>
    <div class="summary-row"><span class="s-key">Branch</span><span class="s-val">${bkState.locationName}</span></div>
    <div class="summary-row"><span class="s-key">Rate Window</span><span class="s-val">${peakLabel}</span></div>
    <div class="summary-row"><span class="s-key">Sport</span><span class="s-val">${sportName}</span></div>
    <div class="summary-row"><span class="s-key">Court</span><span class="s-val">${bkState.subLabel}</span></div>
    <div class="summary-row"><span class="s-key">Date</span><span class="s-val">${bkFmtDate(bkState.date)}</span></div>
    <div class="summary-row"><span class="s-key">Time</span><span class="s-val">${bkFmtTime(bkState.time)}</span></div>
    <div class="summary-row"><span class="s-key">Duration</span><span class="s-val">${bkState.duration} hour${bkState.duration>1?'s':''}</span></div>
    <div class="summary-row"><span class="s-key">Rate</span><span class="s-val">₱${rate.toLocaleString()}/hr</span></div>
    <hr class="summary-divider" />
    <div class="summary-row summary-total">
      <span class="s-key">Total</span>
      <span class="s-val">₱${total.toLocaleString()}</span>
    </div>
  `;
}

// ── CONFIRM ──
function bkConfirm() {
  const name = document.getElementById('bk-name').value.trim();
  const email = document.getElementById('bk-email').value.trim();
  const phone = document.getElementById('bk-phone').value.trim();
  if (!name || !email || !phone) { alert('Please fill in all contact details.'); return; }

  const ref = 'FE-' + Date.now().toString(36).toUpperCase().slice(-6);
  const sportName = bkState.sport.charAt(0).toUpperCase() + bkState.sport.slice(1);

  document.getElementById('bk-refCode').textContent = ref;
  document.getElementById('bk-sucName').textContent = `${name} · ${email}`;
  document.getElementById('bk-sucCourt').textContent = `${sportName} — ${bkState.subLabel} · ${bkState.locationName}`;
  document.getElementById('bk-sucDT').textContent = `${bkFmtDate(bkState.date)} · ${bkFmtTime(bkState.time)} · ${bkState.duration}hr · ${bkState.peakMode === 'offpeak' ? 'Regular' : 'Night'}`;

  // Mark occupied
  const key = bkState.sport === 'pickleball'
    ? `${bkState.location}-${bkState.date}-${bkState.time}-${bkState.subOption}`
    : `${bkState.location}-${bkState.date}-${bkState.time}-${bkState.sport}-${bkState.subOption}`;
  bkOccDB[key] = true;

  bkShowSection('bk-stepSuccess');
  [1,2,3].forEach(i => document.getElementById('si-'+i).classList.add('done'));
}

// ── RESET ──
function bkReset() {
  bkState.sport=''; bkState.subOption=''; bkState.courtAvailable=false; bkState.peakMode='';
  document.getElementById('bk-location').value = '';
  document.getElementById('bk-date').value = '';
  document.getElementById('bk-time').value = '';
  document.getElementById('bk-duration').value = '1';
  document.getElementById('bk-name').value = '';
  document.getElementById('bk-email').value = '';
  document.getElementById('bk-phone').value = '';
  document.getElementById('pt-offpeak').className = 'peak-toggle-btn';
  document.getElementById('pt-peak').className = 'peak-toggle-btn';
  document.getElementById('pt-offpeak-rate').textContent = '₱—';
  document.getElementById('pt-peak-rate').textContent = '₱—';
  document.getElementById('fePanelVenueName').textContent = 'Select a facility';
  bkShowSection('bk-step1');
  bkSetStep(1);
}

// ── FACILITY CARD CLICK (from main page) ──
function selectFacility(loc) {
  const el = document.getElementById('bk-location');
  if (el) el.value = loc;
  updatePeakRates();
  if (document.getElementById('fePanelVenueName'))
    document.getElementById('fePanelVenueName').textContent = (BK_BRANCHES[loc]?.name || loc);
  document.getElementById('feBookingOverlay').classList.add('is-open');
  document.body.style.overflow = 'hidden';
  bkShowSection('bk-step1');
  bkSetStep(1);
  document.getElementById('bk-date').min = new Date().toISOString().split('T')[0];
}

// ── LOCATION AUTOCOMPLETE ──
const FE_BRANCHES_AC = [
  { key: 'san-sebastian', name: 'San Sebastian College – Recoletos', loc: 'Recto Ave, Quiapo, Manila', sports: ['Basketball','Volleyball','Pickleball'], icon: '' },
  { key: 'san-isidro',    name: 'San Isidro, Makati',               loc: '2254 Marconi St., Manila',  sports: ['Basketball','Volleyball','Pickleball','Events'], icon: '' },
  { key: 'baesa',         name: 'Baesa, Quezon City',               loc: 'Baesa, Quezon City',         sports: ['Basketball','Volleyball','Pickleball','Wall Climbing','Gym'], icon: '' },
  { key: 'pasay',         name: 'Trium Square, Pasay',              loc: 'Sen. Gil Puyat Ave., Pasay', sports: ['Gym: Day Access'], icon: '' },
  { key: 'marconi',       name: 'Casa Marconi Basketball Court',    loc: '2305 Marconi cor. Morse, Makati — Rooftop 4F', sports: ['Basketball','Events'], icon: '' },
  { key: 'gen-trias',     name: 'General Trias, Cavite',            loc: 'General Trias, Cavite',      sports: ['Basketball','Volleyball','Pickleball'], icon: '' },
];

let feAcActiveIdx = -1;

function feAcInput(val) {
  const drop = document.getElementById('feAcDropdown');
  const q = val.trim().toLowerCase();
  feAcActiveIdx = -1;

  if (!q) {
    // Show all branches when field is focused and empty
    feAcRender(FE_BRANCHES_AC, '');
  } else {
    const matches = FE_BRANCHES_AC.filter(b =>
      b.name.toLowerCase().includes(q) ||
      b.loc.toLowerCase().includes(q) ||
      b.sports.some(s => s.toLowerCase().includes(q))
    );
    feAcRender(matches, q);
  }
  drop.classList.add('open');
}

function feAcRender(matches, q) {
  const drop = document.getElementById('feAcDropdown');
  if (!matches.length) {
    drop.innerHTML = `<div class="search-ac-empty">No branches found for "<strong>${q}</strong>"</div>`;
    return;
  }
  drop.innerHTML = matches.map((b, i) => {
    const hlName = q ? b.name.replace(new RegExp(`(${q})`, 'gi'), '<mark>$1</mark>') : b.name;
    const tags = b.sports.map(s => `<span class="search-ac-sport-tag">${s}</span>`).join('');
    return `<div class="search-ac-item" data-idx="${i}" data-name="${b.name}" data-key="${b.key}" onclick="feAcSelect('${b.name}','${b.key}')">
      <div class="search-ac-icon">${b.icon}</div>
      <div>
        <div class="search-ac-name">${hlName}</div>
        <div class="search-ac-loc">${b.loc}</div>
        <div class="search-ac-sports">${tags}</div>
      </div>
    </div>`;
  }).join('');
}

function feAcSelect(name, key) {
  document.getElementById('feSearchLocation').value = name;
  feAcClose();
  filterFacilities();
}

function feAcClose() {
  document.getElementById('feAcDropdown').classList.remove('open');
  feAcActiveIdx = -1;
}

function feAcKeydown(e) {
  const drop = document.getElementById('feAcDropdown');
  const items = drop.querySelectorAll('.search-ac-item');
  if (!drop.classList.contains('open') || !items.length) return;
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    feAcActiveIdx = Math.min(feAcActiveIdx + 1, items.length - 1);
    feAcHighlight(items);
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    feAcActiveIdx = Math.max(feAcActiveIdx - 1, 0);
    feAcHighlight(items);
  } else if (e.key === 'Enter') {
    e.preventDefault();
    if (feAcActiveIdx >= 0 && items[feAcActiveIdx]) items[feAcActiveIdx].click();
    else filterFacilities();
  } else if (e.key === 'Escape') {
    feAcClose();
  }
}

function feAcHighlight(items) {
  items.forEach((el, i) => el.classList.toggle('active', i === feAcActiveIdx));
  if (feAcActiveIdx >= 0) {
    document.getElementById('feSearchLocation').value = items[feAcActiveIdx].dataset.name;
  }
}

// Close dropdown when clicking outside
document.addEventListener('click', e => {
  if (!e.target.closest('.search-field--location')) feAcClose();
});

// ── SEARCH FILTER ──
function onActivityChange(val) {
  const evSec = document.getElementById('eventsInquiry');
  if (val === 'Events') {
    evSec.classList.add('open');
    setTimeout(() => evSec.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  } else {
    evSec.classList.remove('open');
  }
}

function filterFacilities() {
  const sport = document.getElementById('feSearchSport').value;
  if (sport === 'Events') {
    onActivityChange('Events');
    return;
  }
  document.getElementById('eventsInquiry').classList.remove('open');
  const loc = document.getElementById('feSearchLocation').value.toLowerCase();
  const sportL = sport.toLowerCase();
  document.querySelectorAll('.facility-card').forEach(card => {
    const text = card.textContent.toLowerCase();
    card.style.display = (!loc||text.includes(loc))&&(!sportL||text.includes(sportL)) ? 'block' : 'none';
  });
  document.getElementById('facilities').scrollIntoView({ behavior: 'smooth' });
}

function submitEventInquiry(e) {
  e.preventDefault();
  const name    = document.getElementById('eiName').value;
  const phone   = document.getElementById('eiPhone').value;
  const email   = document.getElementById('eiEmail').value;
  const branch  = document.getElementById('eiBranch').value || 'Any branch';
  const guests  = document.getElementById('eiGuests').value;
  const details = document.getElementById('eiDetails').value;
  const subject = encodeURIComponent(`Event Inquiry – ${name}`);
  const body    = encodeURIComponent(
    `Name: ${name}\nPhone: ${phone}\nEmail: ${email}\nBranch: ${branch}\nGuests: ${guests}\n\nEvent Details:\n${details}`
  );
  window.location.href = `mailto:sales@fitnessexclusive.ph?subject=${subject}&body=${body}`;
  document.getElementById('eiSuccess').classList.add('show');
  e.target.reset();
}

// ── SCROLL FADE-UP ──
(function() {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const delay = el.dataset.delay || 0;
        setTimeout(() => el.classList.add('visible'), delay);
        io.unobserve(el);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.fade-up').forEach(el => io.observe(el));
})();

// ── INIT ──
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('bk-date').min = new Date().toISOString().split('T')[0];

  // Stagger facility cards
  document.querySelectorAll('.facility-card.fade-up').forEach((el, i) => {
    el.dataset.delay = i * 80;
  });

  // Stagger feature cards
  document.querySelectorAll('.feature-card.fade-up').forEach((el, i) => {
    el.dataset.delay = i * 100;
  });

  // Re-init observer after delays are set
  const io2 = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        setTimeout(() => el.classList.add('visible'), +(el.dataset.delay||0));
        io2.unobserve(el);
      }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.fade-up').forEach(el => io2.observe(el));
});