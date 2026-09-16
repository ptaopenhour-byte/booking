// Calendar presentation only. Booking authorization and transactions stay in app.book.
const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const chevron = direction => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="${direction === 'left' ? 'm14 6-6 6 6 6' : 'm10 6 6 6-6 6'}"/></svg>`;
const formatDate = key => new Date(`${key}T12:00:00Z`).toLocaleDateString('en-US', {timeZone:'UTC',weekday:'long',month:'long',day:'numeric'});

export function calendarDate(value) {
    const match = String(value || '').match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
    if (!match) return null;
    const key = `${match[1]}-${match[2].padStart(2,'0')}-${match[3].padStart(2,'0')}`;
    const date = new Date(`${key}T12:00:00Z`);
    return !Number.isNaN(+date) && date.toISOString().slice(0,10) === key ? key : null;
}

export function slotAvailable(slot, uid) {
    if (slot.status === 'booked') return false;
    return !(slot.status === 'locked' && Date.now() - (slot.lockedAt || 0) < 300000 && (!uid || slot.lockedBy !== uid));
}

export function mountBookingCalendar(container, teacher, {state = {}, uid, onBook}) {
    const groups = new Map();
    for (const slot of teacher.slots || []) {
        const key = calendarDate(slot.date) || slot.date || 'General';
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key).push(slot);
    }
    const dates = [...groups.keys()].filter(calendarDate).sort();
    const others = [...groups.keys()].filter(key => !calendarDate(key));
    const selectable = [...dates, ...others];
    if (!groups.has(state.day)) state.day = selectable.find(day => groups.get(day).some(s => slotAvailable(s, uid))) || selectable[0];
    if (!state.month) state.month = dates.includes(state.day) ? state.day.slice(0,7) : dates[0]?.slice(0,7);
    if (dates.length && (state.month < dates[0].slice(0,7) || state.month > dates.at(-1).slice(0,7))) state.month = dates[0].slice(0,7);

    function render(focus) {
        let calendar = '';
        if (dates.length) {
            const [year, month] = state.month.split('-').map(Number);
            const offset = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
            const count = new Date(Date.UTC(year, month, 0)).getUTCDate();
            const label = new Date(Date.UTC(year, month - 1, 1)).toLocaleDateString('en-US', {timeZone:'UTC',month:'long',year:'numeric'});
            const cells = Array.from({length:offset}, () => '<span class="calendar-blank" aria-hidden="true"></span>');
            const today = new Intl.DateTimeFormat('en-CA', {timeZone:'Asia/Taipei',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
            for (let day = 1; day <= count; day++) {
                const key = `${state.month}-${String(day).padStart(2,'0')}`;
                const available = groups.get(key)?.some(s => slotAvailable(s, uid));
                cells.push(`<button type="button" class="calendar-day ${groups.has(key) ? 'has-slots' : ''} ${state.day === key ? 'selected' : ''} ${key === today ? 'today' : ''}" data-day="${key}" ${groups.has(key) ? '' : 'disabled'} aria-pressed="${state.day === key}" aria-label="${formatDate(key)}${groups.has(key) && !available ? ', fully booked' : ''}">${day}</button>`);
            }
            calendar = `<div class="calendar-month"><h3 aria-live="polite">${label}</h3><div class="calendar-navigation"><button type="button" data-month="-1" aria-label="Previous month" ${state.month <= dates[0].slice(0,7) ? 'disabled' : ''}>${chevron('left')}</button><button type="button" data-month="1" aria-label="Next month" ${state.month >= dates.at(-1).slice(0,7) ? 'disabled' : ''}>${chevron('right')}</button></div></div><div class="calendar-weekdays" aria-hidden="true">${['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d=>`<span>${d}</span>`).join('')}</div><div class="calendar-grid">${cells.join('')}</div>`;
        }
        const undated = others.map(day => `<button type="button" class="calendar-other ${state.day === day ? 'selected' : ''}" data-day="${escape(day)}" aria-pressed="${state.day === day}">${escape(day === 'General' ? 'Other available times' : day)}</button>`).join('');
        const selected = groups.get(state.day) || [];
        const slots = selected.map(slot => {
            const available = slotAvailable(slot, uid);
            return `<button type="button" class="slot-btn ${available ? 'slot-available' : slot.status === 'booked' ? 'slot-booked' : 'slot-locked'}" data-slot="${escape(slot.id)}" ${available ? '' : 'disabled'}>${escape(slot.time)}${available ? '' : `<span>${slot.status === 'booked' ? 'Booked' : 'Being booked'}</span>`}</button>`;
        }).join('');
        container.innerHTML = `<h2 class="schedule-title">Select date &amp; time</h2><div class="schedule-picker"><section class="calendar-panel" aria-label="Choose a meeting date">${calendar}${undated}<p class="schedule-timezone"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c6 6 6 12 0 18-6-6-6-12 0-18Z"/></svg>(GMT+08:00) Taipei</p></section><section class="time-panel" aria-label="Available meeting times"><h3 aria-live="polite">${state.day ? calendarDate(state.day) ? formatDate(state.day) : escape(state.day === 'General' ? 'Available times' : state.day) : 'No dates available'}</h3><div class="time-list">${slots || `<p class="schedule-empty">${escape(teacher.noSlotsMessage || 'No meeting times have been published yet. Please check back later.')}</p>`}</div></section></div>`;
        container.querySelectorAll('[data-day]').forEach(button => button.addEventListener('click', () => { state.day = button.dataset.day; render({day:state.day}); }));
        container.querySelectorAll('[data-month]').forEach(button => button.addEventListener('click', () => {
            const [year, month] = state.month.split('-').map(Number);
            state.month = new Date(Date.UTC(year, month - 1 + Number(button.dataset.month), 1)).toISOString().slice(0,7);
            render({month:button.dataset.month});
        }));
        container.querySelectorAll('.slot-available').forEach(button => button.addEventListener('click', () => {
            const slot = selected.find(item => String(item.id) === button.dataset.slot);
            if (slot && slotAvailable(slot, uid)) onBook(teacher.id, slot.id, slot.time, slot.date || 'General');
        }));
        if (focus) [...container.querySelectorAll('button')].find(button => focus.day ? button.dataset.day === focus.day : button.dataset.month === focus.month)?.focus({preventScroll:true});
    }
    render();
    return state;
}
