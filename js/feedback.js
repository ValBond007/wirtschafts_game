// Design Thinking support: playtest feedback (Evaluate), report for synthesis, and a making-of screen.

const FEEDBACK_KEY = 'bunker-feedback';

function loadFeedback() {
    try {
        return JSON.parse(localStorage.getItem(FEEDBACK_KEY)) || [];
    } catch (e) {
        return [];
    }
}

function storeFeedback(list) {
    try {
        localStorage.setItem(FEEDBACK_KEY, JSON.stringify(list));
        return true;
    } catch (e) {
        return false;
    }
}

function sessionMetrics() {
    if (!game || !game.metrics) return {};
    const m = game.metrics;
    const humans = game.players.filter(p => !p.isBot);
    const quiz = humans.reduce((s, p) => s + (p.stats.quiz || 0), 0);
    const right = humans.reduce((s, p) => s + (p.stats.quizRight || 0), 0);
    const topErrors = Object.entries(m.errorMsgs).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([msg, n]) => `${msg} (${n}×)`);
    return {
        mode: (GAME_MODES[game.mode] || GAME_MODES.full).label,
        players: game.players.length,
        humans: humans.length,
        rounds: game.doomsdayRound,
        minutes: Math.max(1, Math.round(((m.endedAt || Date.now()) - m.started) / 60000)),
        survivedHumans: humans.filter(p => fateOf(p).alive).length,
        actions: { ...m.actions },
        errors: m.errors,
        errorMsgs: { ...m.errorMsgs },
        topErrors,
        helpOpens: m.helpOpens,
        tour: m.tour,
        quizRate: quiz ? Math.round((right / quiz) * 100) : null,
    };
}

// ===== FEEDBACK FORM =====

function openFeedbackForm() {
    const ratings = FEEDBACK_RATINGS.map(r => `
        <div class="fb-q">
            <div class="fb-label">${esc(r.label)}</div>
            <div class="fb-scale" data-rating="${r.id}">${[1, 2, 3, 4, 5].map(n => `<button data-n="${n}">${n}</button>`).join('')}</div>
            <div class="fb-ends"><span>1 = ${esc(r.low)}</span><span>5 = ${esc(r.high)}</span></div>
        </div>`).join('');
    const open = FEEDBACK_OPEN.map(q => `
        <div class="fb-q"><div class="fb-label">${esc(q.label)}</div><textarea data-open="${q.id}" rows="2" maxlength="500"></textarea></div>`).join('');
    openModal('📝 Feedback zum Spiel', `
        <p class="muted" style="margin-bottom:12px">Danke fürs Testen! Deine ehrliche Meinung hilft, das Spiel zu verbessern (Design Thinking: <b>Prototype & Evaluate</b>). Die Antworten bleiben auf diesem Computer.</p>
        <div class="m-row"><label>Kürzel</label><input id="fb-name" maxlength="20" placeholder="optional, z. B. Initialen"></div>
        ${ratings}
        <div class="fb-q"><div class="fb-label">Wie war die Spieldauer?</div>
            <div class="seg fb-length">${FEEDBACK_LENGTH.map(l => `<button data-len="${esc(l)}">${esc(l)}</button>`).join('')}</div></div>
        ${open}
        <button class="btn btn-primary full" id="fb-save">Feedback speichern</button>`, true);

    const answer = { ratings: {}, length: null };
    $('modal-body').querySelectorAll('.fb-scale').forEach(scale => scale.querySelectorAll('button').forEach(btn => btn.addEventListener('click', () => {
        answer.ratings[scale.dataset.rating] = Number(btn.dataset.n);
        scale.querySelectorAll('button').forEach(b => b.classList.toggle('active', b === btn));
        Sound.play('click');
    })));
    $('modal-body').querySelectorAll('.fb-length button').forEach(btn => btn.addEventListener('click', () => {
        answer.length = btn.dataset.len;
        $('modal-body').querySelectorAll('.fb-length button').forEach(b => b.classList.toggle('active', b === btn));
        Sound.play('click');
    }));
    $('fb-save').addEventListener('click', () => {
        const openAnswers = {};
        $('modal-body').querySelectorAll('[data-open]').forEach(t => { openAnswers[t.dataset.open] = t.value.trim(); });
        const hasContent = Object.keys(answer.ratings).length || answer.length || Object.values(openAnswers).some(Boolean);
        if (!hasContent) {
            toast('Bitte beantworte mindestens eine Frage.', 'bad');
            return;
        }
        const entry = {
            date: new Date().toLocaleString('de-CH'),
            name: $('fb-name').value.trim(),
            ratings: answer.ratings,
            length: answer.length,
            open: openAnswers,
            metrics: sessionMetrics(),
        };
        const list = loadFeedback();
        list.push(entry);
        const ok = storeFeedback(list);
        openModal('📝 Danke!', `
            <p style="font-size:16px;margin-bottom:14px">${ok ? '✅ Dein Feedback wurde gespeichert.' : '⚠ Speichern war nicht möglich (privates Fenster?). Bitte exportiert das Feedback anders.'}</p>
            <p class="muted" style="margin-bottom:16px">Bisher gesammelt: <b>${list.length}</b> Feedback${list.length === 1 ? '' : 's'}. Die Auswertung findest du auf dem Startbildschirm unter «📊 Testauswertung».</p>
            <div class="m-row"><button class="btn btn-good" id="fb-more" style="flex:1">Weitere Person</button><button class="btn btn-ghost" id="fb-close" style="flex:1">Schliessen</button></div>`);
        Sound.play('win');
        $('fb-more').addEventListener('click', openFeedbackForm);
        $('fb-close').addEventListener('click', () => closeModal());
    });
}

// ===== REPORT (input for SYNTHESIZE) =====

function average(values) {
    return values.length ? values.reduce((a, b) => a + b, 0) / values.length : null;
}

function openFeedbackReport() {
    const list = loadFeedback();
    if (!list.length) {
        openModal('📊 Testauswertung', `
            <p style="margin-bottom:10px">Noch keine Feedbacks gesammelt.</p>
            <p class="muted">So geht's: Lasst Testpersonen eine Runde spielen, ohne ihnen viel zu erklären. Beobachtet, wo sie zögern oder lachen. Am Ende klicken sie auf «📝 Feedback geben». Hier seht ihr dann die Auswertung für die Phase <b>Synthesize</b>.</p>`);
        return;
    }
    const ratingRows = FEEDBACK_RATINGS.map(r => {
        const vals = list.map(e => e.ratings && e.ratings[r.id]).filter(v => typeof v === 'number');
        const avg = average(vals);
        return `<div class="rep-row">
            <span class="rep-label">${esc(r.label)}</span>
            <div class="rep-bar"><div style="width:${avg ? (avg / 5) * 100 : 0}%"></div></div>
            <span class="rep-val">${avg ? avg.toFixed(1) : '–'} / 5</span><span class="rep-n">n=${vals.length}</span></div>`;
    }).join('');
    const lengthCounts = FEEDBACK_LENGTH.map(l => `${esc(l)}: <b>${list.filter(e => e.length === l).length}</b>`).join(' · ');

    const games = list.map(e => e.metrics || {});
    const avgMinutes = average(games.map(g => g.minutes).filter(Boolean));
    const avgErrors = average(games.map(g => g.errors).filter(v => typeof v === 'number'));
    const errorTotals = {};
    games.forEach(g => Object.entries(g.errorMsgs || {}).forEach(([msg, n]) => { errorTotals[msg] = (errorTotals[msg] || 0) + n; }));
    const topErrors = Object.entries(errorTotals).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const quizRates = games.map(g => g.quizRate).filter(v => typeof v === 'number');
    const tours = games.map(g => g.tour).filter(Boolean);
    const actionTotals = {};
    games.forEach(g => Object.entries(g.actions || {}).forEach(([a, n]) => { actionTotals[a] = (actionTotals[a] || 0) + n; }));
    const actionNames = { travel: 'Reisen', market: 'Markt', work: 'Arbeiten', study: 'Lernen', bank: 'Bank', crypto: 'Krypto', eat: 'Essen', attack: 'Angriff', contract: 'Vertrag', build: 'Bunker bauen', end: 'Zug beenden' };
    const actions = Object.entries(actionTotals).sort((a, b) => b[1] - a[1])
        .map(([a, n]) => `${actionNames[a] || a} ${n}×`).join(' · ') || '–';

    const openBlocks = FEEDBACK_OPEN.map(q => {
        const answers = list.filter(e => e.open && e.open[q.id]).map(e => `<li>${esc(e.open[q.id])}${e.name ? ` <span class="muted">– ${esc(e.name)}</span>` : ''}</li>`);
        return `<div class="m-section"><h4>${esc(q.label)}</h4>${answers.length ? `<ul class="rep-list">${answers.join('')}</ul>` : '<p>Noch keine Antworten.</p>'}</div>`;
    }).join('');

    openModal('📊 Testauswertung', `
        <p class="muted" style="margin-bottom:12px"><b>${list.length}</b> Feedback${list.length === 1 ? '' : 's'} gesammelt. Diese Auswertung ist euer Material für die Phase <b>Synthesize</b>: Muster erkennen, Insights formulieren, «How Might We»-Fragen ableiten.</p>
        <div class="m-section"><h4>Bewertungen (Durchschnitt)</h4>${ratingRows}<p style="margin-top:8px">Spieldauer: ${lengthCounts}</p></div>
        <div class="m-section"><h4>Gemessen während der Testspiele</h4>
            <p>Ø Spieldauer: <b>${avgMinutes ? Math.round(avgMinutes) : '–'} Min.</b> · Ø Fehlermeldungen pro Spiel: <b>${avgErrors !== null ? avgErrors.toFixed(1) : '–'}</b> · Quiz richtig: <b>${quizRates.length ? Math.round(average(quizRates)) + '%' : '–'}</b></p>
            <p>Tour: ${tours.length ? tours.map(esc).join(' · ') : '–'}</p>
            <p>Benutzte Aktionen: ${esc(actions)}</p>
            <p><b>Häufigste Fehlermeldungen</b> (Hinweis auf Verwirrung oder Frust, # = Zahl):</p>
            ${topErrors.length ? `<ul class="rep-list">${topErrors.map(([msg, n]) => `<li>${esc(msg)} <b>${n}×</b></li>`).join('')}</ul>` : '<p>Keine.</p>'}
        </div>
        ${openBlocks}
        <p class="muted" style="margin:8px 0 12px">Tipp: Exportiert die Daten nach Excel und sortiert die offenen Antworten in einem Affinity Diagram nach Themen (z. B. Regeln, Spieldauer, Spass, Lerneffekt).</p>
        <div class="m-row">
            <button class="btn btn-primary" id="rep-csv" style="flex:1">⬇ CSV für Excel</button>
            <button class="btn btn-ghost" id="rep-json" style="flex:1">⬇ JSON</button>
            <button class="btn btn-danger" id="rep-clear" style="flex:1">Alle löschen</button>
        </div>`, true);
    $('rep-csv').addEventListener('click', () => download('bunker-feedback.csv', feedbackCSV(list), 'text/csv;charset=utf-8'));
    $('rep-json').addEventListener('click', () => download('bunker-feedback.json', JSON.stringify(list, null, 2), 'application/json'));
    $('rep-clear').addEventListener('click', () => {
        if (!confirm('Wirklich alle gesammelten Feedbacks löschen? Das kann nicht rückgängig gemacht werden.')) return;
        storeFeedback([]);
        openFeedbackReport();
    });
}

function feedbackCSV(list) {
    const cell = v => `"${String(v === null || v === undefined ? '' : v).replace(/"/g, '""')}"`;
    const head = ['Datum', 'Kürzel', 'Modus', 'Spieler', 'Menschen', 'Runden', 'Minuten', 'Menschen überlebt',
        ...FEEDBACK_RATINGS.map(r => r.label), 'Spieldauer', ...FEEDBACK_OPEN.map(q => q.label),
        'Fehlermeldungen', 'Häufigste Fehler', 'Hilfe geöffnet', 'Tour', 'Quiz richtig %', 'Aktionen'];
    const rows = list.map(e => {
        const m = e.metrics || {};
        return [e.date, e.name, m.mode, m.players, m.humans, m.rounds, m.minutes, m.survivedHumans,
            ...FEEDBACK_RATINGS.map(r => (e.ratings || {})[r.id]), e.length, ...FEEDBACK_OPEN.map(q => (e.open || {})[q.id]),
            m.errors, (m.topErrors || []).join(' | '), m.helpOpens, m.tour, m.quizRate,
            Object.entries(m.actions || {}).map(([a, n]) => `${a}:${n}`).join(' ')];
    });
    return '﻿' + [head, ...rows].map(r => r.map(cell).join(';')).join('\r\n');
}

function download(filename, text, mime) {
    const blob = new Blob([text], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    toast(`⬇ ${filename} heruntergeladen`, 'good');
}

// ===== MAKING-OF =====

function openMakingOf() {
    const card = (ph, i) => `
        <div class="dt-card" style="--c:${ph.color}">
            <div class="dt-num">${i + 1}</div>
            <div class="dt-name">${esc(ph.name)}</div>
            <div class="dt-de">${esc(ph.de)}</div>
            <ul>${ph.points.map(pt => `<li>${esc(pt)}</li>`).join('')}</ul>
        </div>`;
    const group = (id, title, color) => `
        <div class="dt-group-title" style="color:${color}">${title}</div>
        <div class="dt-cards">${DESIGN_PHASES.map((ph, i) => (ph.group === id ? card(ph, i) : '')).join('')}</div>`;
    const cards = group('right', 'Designing the right thing – das richtige Problem finden', '#f87171')
        + group('things', 'Designing things right – die Lösung richtig umsetzen', '#34d399');
    const timeline = ITERATIONS.map(it => `<div class="dt-it"><span class="dt-v">${esc(it.v)}</span><span class="dt-date">${esc(it.date)}</span><span>${esc(it.text)}</span></div>`).join('');
    const count = loadFeedback().length;
    openModal('🛠️ Making-of: So ist BUNKER entstanden', `
        <p class="muted" style="margin-bottom:12px">Entwickelt mit <b>Design Thinking</b> – einem iterativen, nutzerzentrierten Prozess. Erkenntnisse aus Tests führen immer wieder zurück zu früheren Phasen.</p>
        ${cards}
        <div class="dt-loop">↻ Iterativ: Testen → neue Erkenntnisse → zurück zu Research, Synthese oder Ideen</div>
        <div class="m-section"><h4>Iterationen</h4>${timeline}</div>
        <div class="m-section"><h4>Testphase mit Menschen</h4>
            <p>Bisher gesammelte Feedbacks auf diesem Computer: <b>${count}</b>. Jede Testperson füllt nach dem Spiel das Formular «📝 Feedback geben» aus.</p>
            <button class="btn btn-primary btn-small" id="mo-report">📊 Testauswertung öffnen</button></div>`, true);
    $('mo-report').addEventListener('click', openFeedbackReport);
}

window.addEventListener('DOMContentLoaded', () => {
    $('btn-makingof').addEventListener('click', () => { Sound.init(); openMakingOf(); });
    $('btn-report').addEventListener('click', () => { Sound.init(); openFeedbackReport(); });
    $('btn-feedback').addEventListener('click', openFeedbackForm);
});
