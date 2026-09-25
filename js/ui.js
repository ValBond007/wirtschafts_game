const $ = id => document.getElementById(id);

function fmt(n) {
    return Math.round(n).toLocaleString('de-CH');
}

function esc(s) {
    return String(s).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
}

function curTag(c) {
    const dark = ['usd', 'ara', 'crypto'].includes(c);
    return `<span class="cur" style="background:${CURRENCIES[c].color};color:${dark ? '#fff' : '#111'}">${CURRENCIES[c].name === 'BunkerCoin' ? '₿' : CURRENCIES[c].name}</span>`;
}

function charOf(p) {
    return CHARACTERS[p.char] || { name: '', icon: '', power: '' };
}

function targetName(target) {
    if (typeof target === 'number') return game.players[target] ? game.players[target].name : '';
    if (typeof target === 'string' && LOCATIONS[target]) return LOCATIONS[target].name;
    return '';
}

// ===== FEEDBACK =====

function toast(text, type = '') {
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.textContent = text;
    $('toasts').appendChild(el);
    while ($('toasts').children.length > 4) $('toasts').firstChild.remove();
    setTimeout(() => el.remove(), 2900);
}

function log(text, type = '') {
    const el = document.createElement('div');
    el.className = type;
    el.textContent = type === 'round' ? `— ${text} —` : text;
    const box = $('log');
    box.prepend(el);
    while (box.children.length > 120) box.lastChild.remove();
}

const tickerItems = [];
function news(text) {
    tickerItems.unshift(text);
    if (tickerItems.length > 10) tickerItems.pop();
    $('ticker-inner').innerHTML = tickerItems.map(t => `<span>${esc(t)}</span>`).join('');
}

function flash(kind = '') {
    const f = $('flash');
    f.className = kind;
    void f.offsetWidth;
    f.className = `${kind} go`;
}

// ===== RENDER =====

function showHUD() {
    $('intro').classList.remove('active');
    $('setup').classList.remove('active');
    $('hud').classList.remove('hidden');
    render();
}

function render() {
    if (!game || game.over) return;
    const p = cp();
    renderTop(p);
    renderPlayerCard(p);
    renderMarket();
    renderLists();
    renderActions(p);
    Globe.setHighlights(p.location, p.isBot ? [] : ADJACENCY[p.location]);
}

function renderTop(p) {
    $('tb-round').textContent = game.round;
    document.querySelectorAll('#defcon div').forEach(d => d.classList.toggle('on', Number(d.dataset.l) === game.defcon));
    $('tb-player').innerHTML = `<span class="dot" style="background:${p.color};color:${p.color}"></span><span>${charOf(p).icon} ${esc(p.name)}</span>${p.isBot ? ' 🤖' : ''}`;
    const total = Math.max(p.ap, CONFIG.actionsPerTurn);
    let pips = '';
    for (let i = 0; i < total; i++) pips += `<div class="pip ${i < p.ap ? '' : 'used'}"></div>`;
    $('tb-ap').innerHTML = pips;
    $('btn-mute').textContent = Sound.isMuted() ? '🔇' : '🔊';
    $('btn-speed').title = `KI-Tempo: ${AI_SPEEDS[game.speed].label} (klicken zum Ändern)`;
    const bar = $('bot-bar');
    bar.classList.toggle('hidden', !p.isBot);
    if (p.isBot) $('bot-bar-text').textContent = `${charOf(p).icon} ${p.name} ist am Zug und plant ... (Tempo: ${AI_SPEEDS[game.speed].label})`;
}

function adviceFor(p) {
    if (p.ap < 1) {
        const canEat = p.resources.food > 0 && p.foodBoosts < maxFoodBoosts(p);
        return canEat ? 'Keine Aktionspunkte mehr. Iss etwas für +1 AP (Taste 6) oder beende deinen Zug (Taste 0).'
            : 'Keine Aktionspunkte mehr – beende deinen Zug (Taste 0).';
    }
    const own = ownedBunker(p);
    const loc = LOCATIONS[p.location];
    if (own) {
        const b = game.bunkers[own];
        if (!b.completed) {
            return p.location === own ? `Baue weiter am Bunker (${b.progress}/${stepsFor(p)}) – Taste 9.`
                : `Reise zurück zu deiner Baustelle in ${LOCATIONS[own].name}!`;
        }
        if (p.location !== own) return `⚠ Reise SOFORT zurück in deinen Bunker in ${LOCATIONS[own].name}!`;
        if (p.debt > 0) return 'Zahle deine Schulden an der Bank zurück – sonst pfändet sie deinen Bunker!';
        return 'Du bist in Sicherheit. Bleib hier und beende deinen Zug. Mehr Militär schützt vor Angriffen.';
    }
    if (p.debt > 0 && game.defcon <= 2) return 'Der Krieg naht! Zahle deine Schulden zurück, sonst verlierst du den Bunker.';
    const needed = botNeededResources(p);
    const keys = Object.keys(needed);
    if (!keys.length) {
        const free = botFreeBunker(p);
        if (free) return p.location === free ? 'Du hast alles! Starte jetzt den Bunkerbau (Taste 9).'
            : `Du hast alles! Reise zum freien Bunker ${LOCATIONS[free].name} und baue ihn.`;
        return 'Alle Bunker sind vergeben. Sammle Militär und stürme einen Bunker, wenn der Besitzer nicht da ist!';
    }
    const list = keys.map(k => `${needed[k]}${RESOURCES[k].icon}`).join(' ');
    if (!loc.isBunker && needed[loc.resource]) {
        if (isEmbargoed(p, p.location)) return `Embargo! Hier darfst du diese Runde nicht kaufen. Dir fehlt: ${list}`;
        const q = purchaseQuote(p, p.location, 1);
        if (q.affordable && !q.usesForeign) return `Kaufe hier ${RESOURCES[loc.resource].name} im Markt (Taste 2). Dir fehlt: ${list}`;
        if (q.affordable) return `Zu wenig ${CURRENCIES[q.c].name}. Wechsle Geld an der Bank (Taste 4) oder kaufe teurer mit Fremdwährung.`;
        return 'Zu wenig Geld! Arbeite (Taste 3) oder nimm an der Bank einen Kredit auf.';
    }
    const dests = keys.map(botSourceOf).filter(Boolean).sort((a, b) => travelCostEUR(p, a) - travelCostEUR(p, b));
    const dest = dests[0];
    if (!dest) return `Dir fehlt: ${list}.`;
    if (fiatEUR(p) < travelCostEUR(p, dest)) return loc.isBunker ? 'Zu wenig Geld zum Reisen – nimm einen Kredit (Bank).' : 'Zu wenig Geld zum Reisen – arbeite zuerst (Taste 3).';
    return `Dir fehlt: ${list}. Reise nach ${LOCATIONS[dest].name} (${RESOURCES[LOCATIONS[dest].resource].name}) – klicke dort auf die Weltkugel.`;
}

function renderPlayerCard(p) {
    const loc = LOCATIONS[p.location];
    const ch = charOf(p);
    const chips = [];
    if (p.isBot) chips.push('<span class="chip info">🤖 KI-Spieler</span>');
    if (p.debt > 0) chips.push(`<span class="chip bad">💳 Schulden ${fmt(p.debt)} €</span>`);
    if (p.cryptoLock > 0) chips.push('<span class="chip bad">🔒 Wechselsperre (Krypto)</span>');
    if (p.insurance > 0) chips.push('<span class="chip good">🛡️ Versichert</span>');
    if (p.record > 0) chips.push(`<span class="chip bad">🚔 Vorstrafen ${p.record}</span>`);
    game.pacts.filter(x => x.until >= game.round && (x.a === p.id || x.b === p.id)).forEach(x => {
        const o = game.players[x.a === p.id ? x.b : x.a];
        chips.push(`<span class="chip good">🤝 Pakt ${esc(o.name)} (R${x.until})</span>`);
    });
    const travelFactor = (p.resources.tech > 0 ? 0.7 : 1) * (p.resources.energy > 0 ? 0.8 : 1) * (has(p, 'diplomat') ? 0.85 : 1);
    if (travelFactor < 1) chips.push(`<span class="chip info">✈️ Reisen −${Math.round((1 - travelFactor) * 100)}%</span>`);

    const money = ['usd', 'eur', 'peso', 'ara', 'crypto'].map(c =>
        `<div class="money ${p.money[c] <= 0 ? 'zero' : ''}">${curTag(c)}<span>${fmt(p.money[c])}</span></div>`).join('');

    const req = reqFor(p);
    const res = Object.keys(RESOURCES).map(k => {
        const r = RESOURCES[k];
        const need = req[k];
        const have = p.resources[k];
        const pct = need ? Math.min(100, (have / need) * 100) : Math.min(100, have * 25);
        return `<div class="res-row ${need && have >= need ? 'done' : ''}">
            <span class="ri">${r.icon}</span><span class="rn">${r.name}</span>
            <div class="res-bar"><div style="width:${pct}%;background:${r.color}"></div></div>
            <span class="rc">${have}${need ? '/' + need : ''}</span></div>`;
    }).join('');

    let bunker = '';
    const own = ownedBunker(p);
    if (own) {
        const b = game.bunkers[own];
        const steps = stepsFor(p);
        bunker = `<div class="bunker-progress">🛖 <b>Bunker ${LOCATIONS[own].name}</b> – ${b.completed ? '<span style="color:#86efac">FERTIG</span>' : `${b.progress}/${steps}`}
            <div class="bar"><div style="width:${Math.min(100, (b.progress / steps) * 100)}%"></div></div>
            ${b.completed && p.location !== own ? '<div style="color:#fca5a5;margin-top:6px">⚠ Du bist nicht im Bunker!</div>' : ''}
            ${p.debt > 0 ? '<div style="color:#fca5a5;margin-top:6px">⚠ Mit Schulden pfändet die Bank deinen Bunker!</div>' : ''}</div>`;
    } else {
        const { missingAfterWild } = bunkerNeeds(p);
        bunker = `<div class="bunker-progress">${missingAfterWild === 0
            ? '✅ Genug Ressourcen! Reise zu einem freien Bunker und baue ihn.'
            : `Noch <b>${missingAfterWild}</b> Ressourcen bis zum Bunker (💎 = Joker).`}</div>`;
    }

    let extra = '';
    if (has(p, 'oekonomin')) {
        const f = forecast();
        if (f) {
            const t = targetName(f.target);
            extra += `<div class="forecast">📊 <b>Prognose nächste Runde:</b> ${f.card.icon} ${esc(f.card.title)}${t ? ` (${esc(t)})` : ''}</div>`;
        }
    }
    if (!p.isBot) extra += `<div class="advisor"><span class="adv-icon">💡</span><span>${esc(adviceFor(p))}</span></div>`;

    $('player-card').innerHTML = `
        <div class="pc-head">
            <div class="pc-avatar" style="background:${p.color};color:${p.color}"><span>${ch.icon || esc(p.name[0])}</span></div>
            <div><div class="pc-name">${esc(p.name)}</div><div class="pc-loc">${ch.name ? `${ch.name} · ` : ''}📍 ${loc.name}${loc.isBunker ? '' : ` · ${CURRENCIES[loc.currency].name}`}</div></div>
        </div>
        ${ch.power ? `<div class="pc-power">⭐ ${esc(ch.power)}</div>` : ''}
        <div class="chips">${chips.join('')}</div>
        ${extra}
        <div class="panel-title">Geld</div>
        <div class="money-list">${money}<div class="money-total">Bargeld total ≈ <b>${fmt(fiatEUR(p))} €</b></div></div>
        <div class="panel-title">Ressourcen</div>
        ${res}
        ${bunker}`;
}

function sparkline(canvas, data, color) {
    const dpr = window.devicePixelRatio || 1;
    const w = 70;
    const h = 22;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    const g = canvas.getContext('2d');
    g.scale(dpr, dpr);
    const min = Math.min(...data);
    const max = Math.max(...data);
    const span = max - min || 1;
    g.strokeStyle = color;
    g.lineWidth = 1.6;
    g.lineJoin = 'round';
    g.beginPath();
    data.forEach((v, i) => {
        const x = data.length === 1 ? w / 2 : (i / (data.length - 1)) * (w - 2) + 1;
        const y = h - 2 - ((v - min) / span) * (h - 4);
        i ? g.lineTo(x, y) : g.moveTo(x, y);
    });
    g.stroke();
}

function trend(hist) {
    if (hist.length < 2) return '';
    const chg = (hist[hist.length - 1] / hist[hist.length - 2] - 1) * 100;
    if (Math.abs(chg) < 0.5) return '<span class="fx-chg">•</span>';
    return `<span class="fx-chg ${chg >= 0 ? 'down' : 'up'}">${chg >= 0 ? '▲' : '▼'}${Math.abs(chg).toFixed(0)}%</span>`;
}

function renderMarket() {
    const rows = ['usd', 'peso', 'ara', 'crypto'].map(c => {
        const hist = game.history[c];
        const prev = hist.length > 1 ? hist[hist.length - 2] : hist[0];
        const chg = (game.rates[c] / prev - 1) * 100;
        const unit = c === 'peso' || c === 'ara' ? 100 : 1;
        return `<div class="fx-row">
            <span class="fx-name" style="color:${CURRENCIES[c].color}">${unit > 1 ? '100 ' : ''}${CURRENCIES[c].name === 'BunkerCoin' ? '₿Coin' : CURRENCIES[c].name}</span>
            <canvas data-spark="${c}"></canvas>
            <span class="fx-val">${(game.rates[c] * unit).toFixed(c === 'crypto' ? 0 : 2)} €</span>
            <span class="fx-chg ${chg >= 0 ? 'up' : 'down'}">${chg >= 0 ? '▲' : '▼'}${Math.abs(chg).toFixed(0)}%</span></div>`;
    }).join('');
    $('fx').innerHTML = rows + `<div class="fx-row" style="grid-template-columns:1fr auto"><span class="muted">Kreditzins</span><span class="fx-val">${Math.round(game.interest * 100)}% / Runde</span></div>`;
    document.querySelectorAll('[data-spark]').forEach(cv => {
        const c = cv.dataset.spark;
        sparkline(cv, game.history[c], CURRENCIES[c].color);
    });
    $('infl-label').textContent = `· Teuerung ${((game.cpi - 1) * 100).toFixed(0)}%`;

    const p = cp();
    $('prices').innerHTML = CONTINENT_IDS.map(id => {
        const loc = LOCATIONS[id];
        const r = RESOURCES[loc.resource];
        const emb = isEmbargoed(p, id);
        return `<div class="price-row ${emb ? 'embargo' : ''}" title="${emb ? 'Embargo!' : ''}">
            <span>${r.icon}</span><span>${r.name} <span class="muted">(${loc.name})</span></span>
            <span class="pv">${fmt(priceLocal(id))} ${CURRENCIES[loc.currency].name} <small>≈${fmt(unitPriceEUR(id))}€</small> ${trend(game.priceHistory[id])}</span></div>`;
    }).join('');
}

function renderLists() {
    $('bunker-list').innerHTML = BUNKER_ORDER.map(id => {
        const b = game.bunkers[id];
        let st = '<span class="st" style="color:#6b7280">gesperrt</span>';
        if (b.available) {
            if (b.owner === null) st = '<span class="st" style="color:#c084fc">FREI</span>';
            else {
                const o = game.players[b.owner];
                st = `<span class="st"><span class="dot-inline" style="background:${o.color}"></span>${esc(o.name)} ${b.completed ? '✔' : `${b.progress}/${stepsOfBunker(b)}`}</span>`;
            }
        }
        return `<div class="bl-row">🛖 ${LOCATIONS[id].name}${st}</div>`;
    }).join('');

    $('player-list').innerHTML = game.players.map(p => {
        const resCount = Object.values(p.resources).reduce((a, b) => a + b, 0);
        return `<div class="pl-row ${p.id === game.cur ? 'active' : ''}" title="${esc(charOf(p).name)}: ${esc(charOf(p).power)}">
            <span class="dot" style="background:${p.color}"></span>
            <span>${charOf(p).icon} ${esc(p.name)}${p.isBot ? ' 🤖' : ''}</span>
            <span class="pl-meta">${LOCATIONS[p.location].name}<br>${fmt(fiatEUR(p))}€ · ${resCount} Res. · ⚔${p.resources.military}</span></div>`;
    }).join('');
}

function renderActions(p) {
    const loc = LOCATIONS[p.location];
    const locked = game.busy || p.isBot || game.over;
    const noAP = p.ap < 1;
    const others = game.players.filter(o => o.id !== p.id && o.location === p.location);
    const b = loc.isBunker ? game.bunkers[p.location] : null;
    const raidable = b && b.owner !== null && b.owner !== p.id;
    const state = {
        travel: noAP,
        market: noAP || loc.isBunker,
        work: noAP || loc.isBunker,
        bank: noAP || game.roundMods.bankClosed,
        crypto: noAP || game.roundMods.bankClosed,
        eat: p.resources.food < 1 || p.foodBoosts >= maxFoodBoosts(p),
        attack: noAP || p.resources.military < 1 || p.attackedThisTurn || game.roundMods.noAttacks || (!others.length && !raidable),
        contract: game.players.length < 2,
        build: noAP || !loc.isBunker || !b.available || b.completed || (b.owner !== null && b.owner !== p.id),
        end: false,
    };
    document.querySelectorAll('#actions .act').forEach(btn => {
        btn.disabled = locked || state[btn.dataset.act];
    });
    $('actions').classList.toggle('hidden', p.isBot);
}

// ===== GLOBE INTERACTION =====

function onGlobeClick(locId) {
    if (!game || game.over || game.busy) return;
    const p = cp();
    if (p.isBot || locId === p.location) return;
    actTravel(p, locId);
}

function hideTooltip() {
    $('tooltip').style.display = 'none';
}

function onGlobeHover(locId, x, y) {
    const tt = $('tooltip');
    if (!locId) return hideTooltip();
    const loc = LOCATIONS[locId];
    let html = `<h4 style="color:${loc.color}">${loc.name}</h4>`;
    if (!game) {
        html += loc.isBunker ? 'Bunker-Standort' : `${CURRENCIES[loc.currency].name} · ${RESOURCES[loc.resource].icon} ${RESOURCES[loc.resource].name}`;
    } else {
        const p = cp();
        if (loc.isBunker) {
            const b = game.bunkers[locId];
            html += b.owner === null ? 'Bunker: <b style="color:#c084fc">frei</b>' :
                `Bunker von <b>${esc(game.players[b.owner].name)}</b> ${b.completed ? '✔ fertig' : `(${b.progress}/${stepsOfBunker(b)})`}`;
        } else {
            html += `Währung: <b>${CURRENCIES[loc.currency].name}</b><br>Ressource: ${RESOURCES[loc.resource].icon} <b>${RESOURCES[loc.resource].name}</b> – ${fmt(priceLocal(locId))} ${CURRENCIES[loc.currency].name}`;
            if (isEmbargoed(p, locId)) html += '<br><b style="color:#f87171">🚫 Embargo!</b>';
            const cr = game.crates.filter(c => c.loc === locId).length;
            if (cr) html += `<br>💎 ${cr} Rohstoff-Fund${cr > 1 ? 'e' : ''}!`;
        }
        const here = game.players.filter(o => o.location === locId);
        if (here.length) html += `<br>👥 ${here.map(o => `${charOf(o).icon} ${esc(o.name)}`).join(', ')}`;
        if (!p.isBot && locId !== p.location && !(loc.isBunker && !game.bunkers[locId].available)) {
            const near = ADJACENCY[p.location].includes(locId);
            html += `<div class="tt-click">Klicken = Reisen (${near ? 'nah' : 'weit'}, ≈${travelCostEUR(p, locId)} €, 1 AP)</div>`;
        }
    }
    tt.innerHTML = html;
    tt.style.display = 'block';
    tt.style.left = `${Math.min(x + 16, window.innerWidth - 240)}px`;
    tt.style.top = `${Math.min(y + 16, window.innerHeight - 160)}px`;
}

// ===== MODAL =====

function openModal(title, html, wide = false) {
    $('modal-title').textContent = title;
    $('modal-body').innerHTML = html;
    $('modal').classList.toggle('wide', wide);
    $('modal-bg').classList.add('active');
    Sound.play('click');
}

function closeModal() {
    $('modal-bg').classList.remove('active');
    if (closeModal.onClose) {
        const fn = closeModal.onClose;
        closeModal.onClose = null;
        fn();
    }
}

function modalOpen() {
    return $('modal-bg').classList.contains('active');
}

function option(icon, title, sub, right, attrs, disabled = false) {
    return `<button class="m-option" ${attrs} ${disabled ? 'disabled' : ''}>
        <span class="mo-icon">${icon}</span><span class="mo-main">${title}<span class="mo-sub">${sub}</span></span>
        <span class="mo-right">${right}</span></button>`;
}

function bindModal(selector, handler) {
    $('modal-body').querySelectorAll(selector).forEach(el => el.addEventListener('click', () => handler(el)));
}

function human() {
    if (!game || game.over || game.busy) return null;
    const p = cp();
    return p.isBot ? null : p;
}

async function afterAction(promiseOrBool) {
    const ok = await promiseOrBool;
    if (ok) closeModal();
    render();
    return ok;
}

function openTravel() {
    const p = human();
    if (!p) return;
    const html = Object.keys(LOCATIONS).filter(id => id !== p.location).map(id => {
        const loc = LOCATIONS[id];
        const locked = loc.isBunker && !game.bunkers[id].available;
        const cost = travelCostEUR(p, id);
        const near = ADJACENCY[p.location].includes(id);
        const crates = game.crates.filter(c => c.loc === id).length;
        const sub = loc.isBunker ? (locked ? 'gesperrt' : 'Bunker-Standort') : `${CURRENCIES[loc.currency].name} · ${RESOURCES[loc.resource].name}${crates ? ` · 💎×${crates}` : ''}`;
        return option(loc.isBunker ? '🛖' : '🌍', loc.name, `${near ? 'Nahe' : 'Weit'} · ${sub}`, `≈${cost} €`, `data-to="${id}"`, locked || fiatEUR(p) < cost);
    }).join('');
    openModal('✈️ Wohin reisen?', `<p class="muted" style="margin-bottom:10px">Tipp: Du kannst auch direkt auf die Weltkugel klicken. Gelb gestrichelte Routen sind nah und billig. Technik (−30%) und Energie (−20%) machen Reisen günstiger.</p><div class="m-options">${html}</div>`);
    bindModal('[data-to]', el => { closeModal(); actTravel(p, el.dataset.to); });
}

function openMarket() {
    const p = human();
    if (!p) return;
    const loc = LOCATIONS[p.location];
    const r = RESOURCES[loc.resource];
    const emb = isEmbargoed(p, p.location);
    const markupPct = Math.round((foreignMarkup() - 1) * 100);
    let buy = '';
    for (let q = 1; q <= 3; q++) {
        const quote = purchaseQuote(p, p.location, q);
        const price = quote.usesForeign
            ? `${fmt(quote.fromLocal)} ${CURRENCIES[quote.c].name} + ≈${fmt(quote.foreignEUR)} € fremd`
            : `${fmt(quote.totalLocal)} ${CURRENCIES[quote.c].name}`;
        buy += option(r.icon, `${q}× ${r.name}`, quote.usesForeign ? `Mit Fremdwährung (+${markupPct}% Aufschlag)` : 'In Lokalwährung', price, `data-buy="${q}"`, emb || !quote.affordable);
    }
    const sell = Object.keys(RESOURCES).filter(k => p.resources[k] > 0).map(k => {
        const source = CONTINENT_IDS.find(id => LOCATIONS[id].resource === k);
        const eur = RESOURCES[k].baseEUR * (source ? game.priceIndex[source] : game.cpi) * 0.65;
        return option(RESOURCES[k].icon, `1× ${RESOURCES[k].name} verkaufen`, `Du hast ${p.resources[k]}`, `≈${fmt(eur)} €`, `data-sell="${k}"`);
    }).join('') || '<p>Du hast nichts zu verkaufen.</p>';
    const terms = smuggleTerms(p);
    const black = CONTINENT_IDS.filter(id => id !== p.location).map(id => {
        const k = LOCATIONS[id].resource;
        const eur = unitPriceEUR(id) * terms.markup;
        return option('🕶️', `1× ${RESOURCES[k].name} schmuggeln`, `${Math.round(terms.chance * 100)}% Risiko erwischt zu werden`, `≈${fmt(eur)} €`, `data-smuggle="${k}"`, fiatEUR(p) < eur);
    }).join('');

    openModal(`🛒 Markt ${loc.name}`, `
        <div class="m-section"><h4>Kaufen ${emb ? '<span style="color:#f87171">– EMBARGO!</span>' : ''}</h4>
            <p>Jeder Kauf erhöht den Preis um ${Math.round(CONFIG.demandPriceBump * 100)}% (Nachfrage steigt → Preis steigt).${has(p, 'diplomat') && game.roundMods.embargo === p.location ? ' Dein Diplomatenpass umgeht das Embargo!' : ''}</p>
            <div class="m-options">${buy}</div></div>
        <div class="m-section"><h4>Verkaufen</h4><p>Händler zahlen 65% des Marktwerts – in Lokalwährung.</p><div class="m-options">${sell}</div></div>
        <div class="m-section"><h4>🕶️ Schwarzmarkt (illegal!)</h4><p>Ware aus anderen Kontinenten zum ${terms.markup}-fachen Preis. Wirst du erwischt: Ware weg, Busse, Vorstrafe und dein Zug ist vorbei.</p><div class="m-options">${black}</div></div>`, true);
    bindModal('[data-buy]', el => afterAction(actBuy(p, Number(el.dataset.buy))));
    bindModal('[data-sell]', el => afterAction(actSell(p, el.dataset.sell)));
    bindModal('[data-smuggle]', el => afterAction(actSmuggle(p, el.dataset.smuggle)));
}

function openBank() {
    const p = human();
    if (!p) return;
    const blocked = bankBlocked(p, true);
    const opts = FIAT.map(c => `<option value="${c}">${CURRENCIES[c].name} (${fmt(p.money[c])})</option>`).join('');
    const local = localCurrency(p);
    const from = FIAT.slice().sort((a, b) => toEUR(b, p.money[b]) - toEUR(a, p.money[a])).find(c => c !== local) || 'eur';
    const fee = feeFor(p);
    const interest = game.interest * (has(p, 'bankerin') ? 0.5 : 1);
    openModal('🏦 Bank', `
        <div class="m-section"><h4>Geld wechseln</h4>
            ${blocked ? `<p style="color:#fca5a5">${blocked}</p>` : `<p>Gebühr ${fee === 0 ? '<b>0%</b>' : `${fee * 100}%`}. Kurse schwanken jede Runde – wechsle, wenn der Kurs gut ist!</p>`}
            <div class="m-row"><label>Von</label><select id="ex-from">${opts}</select></div>
            <div class="m-row"><label>Nach</label><select id="ex-to">${opts}</select></div>
            <div class="m-row"><label>Betrag</label><input type="number" id="ex-amount" min="1"><button class="btn btn-small" id="ex-half">Hälfte</button><button class="btn btn-small" id="ex-max">Alles</button></div>
            <div class="m-preview" id="ex-preview"></div>
            <button class="btn btn-primary full" id="ex-go" ${blocked ? 'disabled' : ''}>Wechseln (1 AP)</button></div>
        <div class="m-section"><h4>💳 Kredit</h4>
            <p>Leihe dir ${CONFIG.loanAmountEUR} € (in Lokalwährung). Zins: <b>${Math.round(interest * 100)}% pro Runde</b> (Zinseszins!). Ab ${CONFIG.seizureDebtEUR} € Schulden pfändet die Bank jede Runde Ressourcen. <b style="color:#fca5a5">Wer bei Kriegsausbruch Schulden hat, verliert den Bunker!</b></p>
            <p>Aktuelle Schulden: <b>${fmt(p.debt)} €</b></p>
            <div class="m-row"><button class="btn btn-ghost" id="loan-take" style="flex:1">Kredit aufnehmen</button><button class="btn btn-good" id="loan-repay" style="flex:1" ${p.debt <= 0 ? 'disabled' : ''}>Zurückzahlen</button></div></div>
        <div class="m-section"><h4>🛡️ Versicherung gegen Raub</h4>
            <p>Prämie ${CONFIG.insuranceEUR} €. Für ${CONFIG.insuranceTurns} Züge ersetzt die Versicherung alles, was dir bei einem Angriff oder einem Raketeneinschlag verloren geht.</p>
            <button class="btn btn-ghost full" id="insure" ${p.insurance > 0 ? 'disabled' : ''}>${p.insurance > 0 ? 'Bereits versichert' : 'Versichern (1 AP)'}</button></div>`);
    $('ex-from').value = from;
    $('ex-to').value = local === from ? 'eur' : local;
    const preview = () => {
        const f = $('ex-from').value;
        const t = $('ex-to').value;
        const a = Number($('ex-amount').value);
        if (f === t) return ($('ex-preview').textContent = 'Wähle zwei verschiedene Währungen.');
        if (!(a > 0)) return ($('ex-preview').textContent = `1 ${CURRENCIES[f].name} = ${(toEUR(f, 1) / game.rates[t]).toFixed(4)} ${CURRENCIES[t].name}`);
        const q = exchangeQuote(p, f, t, a);
        $('ex-preview').textContent = `→ ${fmt(q.received)} ${CURRENCIES[t].name}${a > p.money[f] ? '  (zu wenig!)' : ''}`;
    };
    ['ex-from', 'ex-to', 'ex-amount'].forEach(id => $(id).addEventListener('input', preview));
    $('ex-max').addEventListener('click', () => { $('ex-amount').value = Math.floor(p.money[$('ex-from').value]); preview(); });
    $('ex-half').addEventListener('click', () => { $('ex-amount').value = Math.floor(p.money[$('ex-from').value] / 2); preview(); });
    $('ex-go').addEventListener('click', () => afterAction(actExchange(p, $('ex-from').value, $('ex-to').value, Number($('ex-amount').value))));
    $('loan-take').addEventListener('click', () => afterAction(actLoan(p)));
    $('loan-repay').addEventListener('click', () => afterAction(actRepay(p)));
    $('insure').addEventListener('click', () => afterAction(actInsure(p)));
    preview();
}

function openCrypto() {
    const p = human();
    if (!p) return;
    const price = game.rates.crypto;
    const lockNote = has(p, 'kryptobro')
        ? '<b style="color:#86efac">Als Krypto-Bro hast du keine Sperrfrist!</b>'
        : `<b style="color:#fca5a5">Nach jedem Krypto-Geschäft darfst du ${CONFIG.cryptoLockTurns} Züge lang kein Geld wechseln (Sperrfrist wie bei einem Termingeschäft).</b>`;
    openModal('₿ BunkerCoin-Börse', `
        <div class="m-section">
            <div style="display:flex;justify-content:space-between;align-items:center">
                <div><div class="muted">1 BunkerCoin =</div><div style="font:800 28px var(--mono);color:#c084fc">${fmt(price)} €</div></div>
                <canvas id="crypto-chart" style="width:200px;height:60px"></canvas>
            </div>
            <p style="margin-top:8px">Extrem volatil! Du besitzt <b>${p.money.crypto} ₿</b> (≈${fmt(toEUR('crypto', p.money.crypto))} €). ${lockNote}</p>
            <div class="m-row"><label>Menge</label><input type="number" id="cr-amount" min="1" value="1"></div>
            <div class="m-preview" id="cr-preview"></div>
            <div class="m-row"><button class="btn btn-primary" id="cr-buy" style="flex:1">Kaufen</button><button class="btn btn-danger" id="cr-sell" style="flex:1" ${p.money.crypto < 1 ? 'disabled' : ''}>Verkaufen</button></div>
        </div>`);
    const cv = $('crypto-chart');
    const dpr = window.devicePixelRatio || 1;
    cv.width = 200 * dpr;
    cv.height = 60 * dpr;
    const g = cv.getContext('2d');
    g.scale(dpr, dpr);
    const data = game.history.crypto.concat([game.rates.crypto]);
    const min = Math.min(...data);
    const max = Math.max(...data);
    g.strokeStyle = '#c084fc';
    g.lineWidth = 2;
    g.lineJoin = 'round';
    g.beginPath();
    data.forEach((v, i) => {
        const x = (i / Math.max(1, data.length - 1)) * 196 + 2;
        const y = 56 - ((v - min) / (max - min || 1)) * 52;
        i ? g.lineTo(x, y) : g.moveTo(x, y);
    });
    g.stroke();
    const preview = () => {
        const n = Number($('cr-amount').value) || 0;
        $('cr-preview').textContent = `${n} ₿ ≈ ${fmt(toEUR('crypto', n))} € (${feeFor(p) ? `+${feeFor(p) * 100}% Gebühr` : 'keine Gebühr'})`;
    };
    $('cr-amount').addEventListener('input', preview);
    preview();
    $('cr-buy').addEventListener('click', () => afterAction(actCrypto(p, 'buy', Number($('cr-amount').value))));
    $('cr-sell').addEventListener('click', () => afterAction(actCrypto(p, 'sell', Number($('cr-amount').value))));
}

function openAttack() {
    const p = human();
    if (!p) return;
    const targets = game.players.filter(o => o.id !== p.id && o.location === p.location);
    let html = targets.map(o => {
        const pact = pactBetween(p, o);
        const res = Object.values(o.resources).reduce((a, b) => a + b, 0);
        return option(charOf(o).icon || '🎯', esc(o.name),
            `Kampfkraft ${combatBonus(o)} · ${res} Ressourcen${o.insurance > 0 ? ' · 🛡️ versichert' : ''}${pact ? ' · <b style="color:#fca5a5">PAKT! Bruch kostet ' + CONFIG.pactPenaltyEUR + ' €</b>' : ''}`,
            `⚔ ${combatBonus(p)} vs ${combatBonus(o)}`, `data-target="${o.id}"`);
    }).join('');
    const b = LOCATIONS[p.location].isBunker ? game.bunkers[p.location] : null;
    if (b && b.owner !== null && b.owner !== p.id) {
        const o = game.players[b.owner];
        html += option('💣', b.completed ? `Bunker von ${esc(o.name)} stürmen` : `Baustelle von ${esc(o.name)} sabotieren`,
            b.completed ? 'Gewinnst du, gehört der Bunker DIR!' : 'Gewinnst du, verliert der Bau 1 Fortschritt.',
            `⚔ ${combatBonus(p)} vs ${bunkerDefense(b)}+🎲`, 'data-raid="1"');
    }
    openModal('⚔️ Angriff', `<p class="muted" style="margin-bottom:10px">Würfel (1–6) + deine Kampfkraft gegen Würfel + Kampfkraft des Gegners. Verlierst du, verlierst du 1 Militär.</p><div class="m-options">${html || '<p>Niemand hier.</p>'}</div>`);
    bindModal('[data-target]', el => { closeModal(); afterAction(actAttack(p, game.players[Number(el.dataset.target)])); });
    bindModal('[data-raid]', () => { closeModal(); afterAction(actRaidBunker(p)); });
}

function openContract() {
    const p = human();
    if (!p) return;
    const others = game.players.filter(o => o.id !== p.id);
    const assetOpts = [
        ...Object.keys(RESOURCES).map(k => `<option value="res:${k}">${RESOURCES[k].icon} ${RESOURCES[k].name}</option>`),
        ...FIAT.map(c => `<option value="cur:${c}">💵 ${CURRENCIES[c].name}</option>`),
    ].join('');
    openModal('📜 Vertrag anbieten', `
        <p class="muted" style="margin-bottom:10px">Verträge kosten keine Aktionspunkte. Der andere Spieler muss zustimmen (Vertragsfreiheit). Pacta sunt servanda – Verträge sind einzuhalten!</p>
        <div class="m-section">
            <div class="m-row"><label>Partner</label><select id="ct-partner">${others.map(o => `<option value="${o.id}">${charOf(o).icon} ${esc(o.name)}${o.isBot ? ' 🤖' : ''}</option>`).join('')}</select></div>
            <div class="m-row"><label>Art</label><select id="ct-type"><option value="trade">Tauschhandel</option><option value="pact">Nichtangriffspakt (3 Runden)</option></select></div>
            <div id="ct-trade">
                <div class="m-row"><label>Ich gebe</label><input type="number" id="ct-give-n" min="1" value="1" style="max-width:90px"><select id="ct-give">${assetOpts}</select></div>
                <div class="m-row"><label>Ich will</label><input type="number" id="ct-get-n" min="1" value="1" style="max-width:90px"><select id="ct-get">${assetOpts}</select></div>
            </div>
            <div id="ct-info" class="m-preview"></div>
            <button class="btn btn-primary full" id="ct-go">Vertrag anbieten</button>
        </div>`);
    const partner = () => game.players[Number($('ct-partner').value)];
    const info = () => {
        const o = partner();
        $('ct-trade').style.display = $('ct-type').value === 'trade' ? '' : 'none';
        const r = Object.entries(o.resources).filter(([, v]) => v > 0).map(([k, v]) => `${v}${RESOURCES[k].icon}`).join(' ');
        $('ct-info').textContent = `${o.name} hat: ${r || 'keine Ressourcen'} · ≈${fmt(fiatEUR(o))} € Bargeld`;
    };
    $('ct-get').value = 'res:tech';
    ['ct-partner', 'ct-type'].forEach(id => $(id).addEventListener('input', info));
    info();
    $('ct-go').addEventListener('click', async () => {
        const parse = (sel, n) => {
            const [kind, key] = $(sel).value.split(':');
            return { kind, key, amount: Math.floor(Number($(n).value)) };
        };
        const offer = $('ct-type').value === 'trade'
            ? { type: 'trade', give: parse('ct-give', 'ct-give-n'), get: parse('ct-get', 'ct-get-n') }
            : { type: 'pact' };
        const target = partner();
        closeModal();
        await actContract(p, target, offer);
        render();
    });
}

function askContract(target, text) {
    return new Promise(resolve => {
        openModal(`📜 Vertragsangebot für ${target.name}`, `
            <p style="margin-bottom:10px;font-weight:700">${charOf(target).icon} ${esc(target.name)}, schau her!</p>
            <p style="line-height:1.6;margin-bottom:16px">${text}</p>
            <div class="m-row"><button class="btn btn-good" id="ask-yes" style="flex:1">Annehmen</button><button class="btn btn-danger" id="ask-no" style="flex:1">Ablehnen</button></div>`);
        closeModal.onClose = () => resolve(false);
        $('ask-yes').addEventListener('click', () => { closeModal.onClose = null; closeModal(); resolve(true); });
        $('ask-no').addEventListener('click', () => { closeModal.onClose = null; closeModal(); resolve(false); });
    });
}

function helpHTML() {
    const req = CONFIG.bunkerRequirements;
    const chars = CHARACTER_IDS.map(id => {
        const c = CHARACTERS[id];
        return `<tr><td>${c.icon} <b>${c.name}</b></td><td>${c.power}<br><span class="muted">${c.story}</span></td></tr>`;
    }).join('');
    return `<div class="help">
        <h4>🎯 Ziel</h4>
        <p>Sitze beim Ausbruch des Atomkriegs in deinem <b>fertigen Bunker</b> – ohne Schulden. Es gibt nur halb so viele Bunker wie Spieler. Wann der Krieg genau ausbricht, weiss niemand; die DEFCON-Anzeige zeigt, wie nah er ist.</p>
        <h4>🔁 Ablauf</h4>
        <p>Jede Runde zieht eine Ereigniskarte (Inflation, Crash, Embargo, Raketeneinschlag …). Dann ist jeder Spieler einmal am Zug und hat <b>${CONFIG.actionsPerTurn} Aktionspunkte (AP)</b>. Zu Beginn jeder Runde erhalten alle ${CONFIG.incomeEUR} € Einkommen in der Währung ihres Standorts. Die Sonne wandert jede Runde weiter – auf der Nachtseite leuchten die Städte.</p>
        <h4>🌍 Kontinente</h4>
        <table><tr><th>Kontinent</th><th>Währung</th><th>Ressource</th><th>Effekt</th></tr>
            <tr><td>Nordamerika</td><td>USD</td><td>⚔️ Militär</td><td>Angriff & Verteidigung</td></tr>
            <tr><td>Südamerika</td><td>Peso</td><td>🌽 Lebensmittel</td><td>Essen = +1 AP (Nachtschicht)</td></tr>
            <tr><td>Europa</td><td>EUR</td><td>⚙️ Technik</td><td>Reisen −30%</td></tr>
            <tr><td>Afrika</td><td>ARA</td><td>⚡ Energie</td><td>Reisen −20%</td></tr>
            <tr><td>überall zufällig</td><td>–</td><td>💎 Rohstoffe</td><td>Joker für jede Bunker-Ressource</td></tr></table>
        <h4>🛖 Bunker bauen</h4>
        <p>Benötigt: ${req.food}× Lebensmittel, ${req.tech}× Technik, ${req.energy}× Energie, ${req.military}× Militär (fehlende können durch 💎 ersetzt werden). Reise zu einem freien Bunker-Standort und baue ${CONFIG.bunkerBuildSteps}× (je 1 AP). Danach: <b>bleib dort!</b></p>
        <h4>🎭 Charaktere</h4>
        <table>${chars}</table>
        <h4>🎮 Aktionen (je 1 AP) – Tasten 1 bis 0</h4>
        <ul>
            <li><b>1 Reisen</b> – oder direkt auf die Weltkugel klicken. Gelb gestrichelte Routen sind nah und billig.</li>
            <li><b>2 Markt</b> – lokale Ressource kaufen (in Lokalwährung, sonst mit Aufschlag in Fremdwährung), verkaufen oder illegal schmuggeln.</li>
            <li><b>3 Arbeiten</b> – ${CONFIG.workEUR} € in Lokalwährung verdienen.</li>
            <li><b>4 Bank</b> – Geld wechseln (${CONFIG.exchangeFee * 100}% Gebühr), Kredit aufnehmen/zurückzahlen, Versicherung.</li>
            <li><b>5 Krypto</b> – BunkerCoin kaufen/verkaufen. Danach ${CONFIG.cryptoLockTurns} Züge Wechselsperre!</li>
            <li><b>6 Essen</b> (0 AP) – 1 Lebensmittel für +1 AP, max. 2× pro Zug.</li>
            <li><b>7 Angriff</b> – Würfel + Militär. Gewinner raubt Ressourcen. Fremde Bunker können sabotiert oder sogar gestürmt werden!</li>
            <li><b>8 Vertrag</b> (0 AP) – Tauschhandel oder Nichtangriffspakt. Vertragsbruch kostet ${CONFIG.pactPenaltyEUR} € Strafe.</li>
            <li><b>9 Bunker bauen</b> · <b>0 Zug beenden</b> · <b>M</b> Ton an/aus · <b>Esc</b> Fenster schliessen</li>
        </ul>
        <p>💡 Der <b>Berater</b> links sagt dir jederzeit, was als Nächstes sinnvoll ist. Das Spiel speichert automatisch – du kannst später über «Weiterspielen» fortfahren.</p>
        <h4>📚 Wirtschaft & Recht im Spiel</h4>
        <ul>
            <li><b>Wechselkurse & Inflation:</b> Kurse schwanken, Preise steigen jede Runde (Teuerung).</li>
            <li><b>Angebot & Nachfrage:</b> Jeder Kauf treibt den Preis hoch. Kartelle, Missernten und Lieferkettenkrisen verknappen das Angebot.</li>
            <li><b>Zins & Zinseszins:</b> Kredite wachsen jede Runde. Zu viele Schulden → Betreibung & Pfändung.</li>
            <li><b>Spekulation:</b> Krypto kann dich reich oder arm machen. Sperrfristen wie bei Termingeschäften.</li>
            <li><b>Opportunitätskosten:</b> Jeder AP kann nur einmal ausgegeben werden – arbeiten, kaufen oder reisen?</li>
            <li><b>Vertragsrecht:</b> Vertragsfreiheit, «pacta sunt servanda», Konventionalstrafe, clausula rebus sic stantibus.</li>
            <li><b>Strafrecht:</b> Schmuggel ist illegal – Busse, Beschlagnahmung und Vorstrafen.</li>
            <li><b>Versicherung:</b> Risiko gegen eine Prämie abgeben.</li>
        </ul>
    </div>`;
}

function openHelp() {
    openModal('❓ Spielanleitung', helpHTML(), true);
}

// ===== OVERLAYS =====

function showRoundBanner(round) {
    return new Promise(resolve => {
        const el = $('round-banner');
        $('rb-num').textContent = round;
        const left = game.doomsdayRound - round;
        $('rb-defcon').textContent = left <= 0 ? '☢ Letzte Runde vor dem Krieg?' : round === 1 ? 'Die Uhr beginnt zu ticken ...' : '';
        el.classList.remove('go');
        void el.offsetWidth;
        el.classList.add('go');
        Sound.play('card');
        const allBots = game.players.every(p => p.isBot);
        setTimeout(resolve, allBots ? 700 : 1300);
    });
}

function showEventCard(card, target) {
    return new Promise(resolve => {
        const el = $('event-card');
        el.className = card.kind;
        $('card-round').textContent = game.round;
        $('card-icon').textContent = card.icon;
        $('card-title').textContent = card.title;
        $('card-text').textContent = card.text(target);
        $('card-lesson').textContent = card.lesson;
        const inner = el.querySelector('.card-inner');
        inner.style.animation = 'none';
        void inner.offsetWidth;
        inner.style.animation = '';
        $('card-overlay').classList.add('active');
        Sound.play('card');
        if (card.kind === 'bad') setTimeout(() => Sound.play('alarm'), 400);
        const allBots = game.players.every(p => p.isBot);
        const done = () => {
            $('card-overlay').classList.remove('active');
            $('card-ok').onclick = null;
            showEventCard.pending = null;
            resolve();
        };
        showEventCard.pending = done;
        $('card-ok').onclick = done;
        if (allBots) setTimeout(done, 3500);
    });
}

function showDice(title, a, b, result, kind) {
    return new Promise(resolve => {
        const side = s => `<div class="dn" style="color:${s.color}">${esc(s.name)}</div>
            <div class="dice-face rolling" style="color:${s.color}">?</div>
            <div class="dbonus">+ ${s.bonus} ${esc(s.label)}</div><div class="dtotal">&nbsp;</div>`;
        $('dice-title').textContent = title;
        $('dice-a').innerHTML = side(a);
        $('dice-b').innerHTML = side(b);
        $('dice-result').textContent = '';
        $('dice-result').style.color = '';
        $('dice-overlay').classList.add('active');
        Sound.play('dice');
        const faces = document.querySelectorAll('#dice-overlay .dice-face');
        const spin = setInterval(() => faces.forEach(f => { f.textContent = randInt(1, 6); }), 70);
        const fast = game.speed === 'fast' && game.players[game.cur].isBot;
        setTimeout(() => {
            clearInterval(spin);
            [a, b].forEach((s, i) => {
                faces[i].classList.remove('rolling');
                faces[i].textContent = s.roll;
                document.querySelectorAll('#dice-overlay .dtotal')[i].textContent = `= ${s.roll + s.bonus}`;
            });
            $('dice-result').textContent = result;
            $('dice-result').style.color = kind === 'win' ? '#4ade80' : kind === 'lose' ? '#f87171' : '#fbbf24';
            Globe.shake(0.2);
            setTimeout(() => {
                $('dice-overlay').classList.remove('active');
                resolve();
            }, fast ? 900 : 1900);
        }, fast ? 600 : 1100);
    });
}

function showHandover(p) {
    return new Promise(resolve => {
        $('handover-name').textContent = `${charOf(p).icon} ${p.name}`;
        $('handover-name').style.color = p.color;
        $('handover').classList.add('active');
        $('handover-ok').onclick = () => {
            $('handover').classList.remove('active');
            showHandover.pending = null;
            Sound.play('click');
            resolve();
        };
        showHandover.pending = $('handover-ok').onclick;
    });
}

// ===== END SCREEN =====

const AWARDS = [
    { icon: '🐺', title: 'Wolf of Wall Street', desc: 'Höchstes Vermögen', val: p => wealthEUR(p), money: true },
    { icon: '⚔️', title: 'Kriegsherr', desc: 'Meiste gewonnene Kämpfe', val: p => p.stats.won },
    { icon: '👷', title: 'Arbeitstier', desc: 'Am häufigsten gearbeitet', val: p => p.stats.worked },
    { icon: '🛒', title: 'Shopaholic', desc: 'Meiste Ressourcen gekauft', val: p => p.stats.bought },
    { icon: '✈️', title: 'Vielflieger', desc: 'Meiste Reisen', val: p => p.stats.travelled },
    { icon: '🕶️', title: 'Pate der Unterwelt', desc: 'Meiste Schmuggelgeschäfte', val: p => p.stats.smuggled },
    { icon: '🎰', title: 'Zocker', desc: 'Meiste Krypto-Geschäfte', val: p => p.stats.crypto },
    { icon: '💳', title: 'Schuldenkönig', desc: 'Meiste Zinsen bezahlt', val: p => p.stats.interest, money: true },
    { icon: '⚖️', title: 'Vertragsbrecher', desc: 'Meiste Vertragsbrüche', val: p => p.stats.breaches },
    { icon: '🏦', title: 'Liebling der Bank', desc: 'Meiste Gebühren bezahlt', val: p => p.stats.fees, money: true },
];

function renderAwards() {
    const cards = AWARDS.map(a => {
        const ranked = game.players.map(p => ({ p, v: a.val(p) })).sort((x, y) => y.v - x.v);
        if (!ranked.length || ranked[0].v <= 0) return '';
        const w = ranked[0];
        return `<div class="award"><div class="aw-icon">${a.icon}</div><div><div class="aw-title">${a.title}</div>
            <div class="aw-who"><span class="dot-inline" style="background:${w.p.color}"></span>${esc(w.p.name)} · ${a.money ? `${fmt(w.v)} €` : w.v}</div>
            <div class="aw-desc">${a.desc}</div></div></div>`;
    }).join('');
    $('end-awards').innerHTML = cards ? `<h3 class="end-h">🏆 Auszeichnungen</h3><div class="awards">${cards}</div>` : '';
}

function niceTicks(min, max, count = 5) {
    const span = max - min || 1;
    const raw = span / count;
    const mag = Math.pow(10, Math.floor(Math.log10(raw)));
    const step = [1, 2, 2.5, 5, 10].map(m => m * mag).find(s => span / s <= count) || mag * 10;
    const lo = Math.floor(min / step) * step;
    const hi = Math.ceil(max / step) * step;
    const ticks = [];
    for (let v = lo; v <= hi + step / 2; v += step) ticks.push(Math.round(v));
    return ticks;
}

function renderWealthChart() {
    const hist = game.wealthHistory;
    const box = $('end-chart');
    if (hist.length < 2) {
        box.innerHTML = '';
        return;
    }
    const players = game.players;
    const W = 640;
    const H = 280;
    const M = { l: 58, r: players.length <= 4 ? 112 : 16, t: 14, b: 30 };
    const pw = W - M.l - M.r;
    const ph = H - M.t - M.b;
    const all = hist.flatMap(h => h.values);
    const ticks = niceTicks(Math.min(0, ...all), Math.max(...all));
    const yMin = ticks[0];
    const yMax = ticks[ticks.length - 1];
    const x = i => M.l + (i / (hist.length - 1)) * pw;
    const y = v => M.t + ph - ((v - yMin) / (yMax - yMin || 1)) * ph;
    const xLabel = (h, i) => (i === hist.length - 1 ? '☢' : `R${h.round}`);
    const every = Math.ceil(hist.length / 10);

    let svg = `<svg viewBox="0 0 ${W} ${H}" class="wealth-svg" role="img" aria-label="Vermögensverlauf aller Spieler pro Runde">`;
    ticks.forEach(t => {
        svg += `<line x1="${M.l}" x2="${M.l + pw}" y1="${y(t)}" y2="${y(t)}" class="${t === 0 ? 'axis-base' : 'grid'}"/>`;
        svg += `<text x="${M.l - 8}" y="${y(t) + 4}" class="tick" text-anchor="end">${fmt(t)} €</text>`;
    });
    hist.forEach((h, i) => {
        if (i % every === 0 || i === hist.length - 1) svg += `<text x="${x(i)}" y="${H - 8}" class="tick" text-anchor="middle">${xLabel(h, i)}</text>`;
    });
    players.forEach((p, pi) => {
        const d = hist.map((h, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(h.values[pi]).toFixed(1)}`).join('');
        svg += `<path d="${d}" fill="none" stroke="${p.color}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>`;
        const last = hist[hist.length - 1].values[pi];
        svg += `<circle cx="${x(hist.length - 1)}" cy="${y(last)}" r="4" fill="${p.color}" stroke="var(--panel-solid)" stroke-width="2"/>`;
    });
    if (players.length <= 4) {
        const labels = players.map((p, pi) => ({ p, v: hist[hist.length - 1].values[pi], y: y(hist[hist.length - 1].values[pi]) }))
            .sort((a, b) => a.y - b.y);
        for (let i = 1; i < labels.length; i++) labels[i].y = Math.max(labels[i].y, labels[i - 1].y + 15);
        labels.forEach(l => {
            const name = l.p.name.length > 13 ? `${l.p.name.slice(0, 12)}…` : l.p.name;
            svg += `<text x="${M.l + pw + 10}" y="${l.y + 4}" class="direct-label">${esc(name)}</text>`;
        });
    }
    svg += `<line id="wc-cross" x1="0" x2="0" y1="${M.t}" y2="${M.t + ph}" class="crosshair" style="display:none"/>`;
    svg += `<rect id="wc-hit" x="${M.l}" y="${M.t}" width="${pw}" height="${ph}" fill="transparent"/>`;
    svg += '</svg>';

    const legend = players.map(p => `<span class="lg-item"><span class="lg-swatch" style="background:${p.color}"></span>${esc(p.name)}</span>`).join('');
    const table = `<table class="wealth-table"><thead><tr><th>Runde</th>${players.map(p => `<th>${esc(p.name)}</th>`).join('')}</tr></thead><tbody>
        ${hist.map((h, i) => `<tr><td>${i === hist.length - 1 ? 'Krieg' : h.round}</td>${h.values.map(v => `<td>${fmt(v)} €</td>`).join('')}</tr>`).join('')}</tbody></table>`;

    box.innerHTML = `<div class="chart-head"><h3 class="end-h">📈 Vermögensverlauf</h3><button class="btn btn-small btn-ghost" id="wc-toggle">Als Tabelle</button></div>
        <div class="legend">${legend}</div>
        <div class="chart-wrap" id="wc-wrap">${svg}<div class="chart-tip" id="wc-tip"></div></div>
        <div id="wc-table" class="hidden">${table}</div>
        <p class="chart-note">Vermögen = Bargeld + Krypto + Wert der Ressourcen − Schulden, jeweils zu Rundenbeginn.</p>`;

    $('wc-toggle').addEventListener('click', () => {
        const showTable = $('wc-table').classList.toggle('hidden') === false;
        $('wc-wrap').classList.toggle('hidden', showTable);
        $('wc-toggle').textContent = showTable ? 'Als Diagramm' : 'Als Tabelle';
    });

    const svgEl = box.querySelector('svg');
    const tip = $('wc-tip');
    const cross = $('wc-cross');
    $('wc-hit').addEventListener('mousemove', e => {
        const rect = svgEl.getBoundingClientRect();
        const sx = ((e.clientX - rect.left) / rect.width) * W;
        const i = Math.max(0, Math.min(hist.length - 1, Math.round(((sx - M.l) / pw) * (hist.length - 1))));
        cross.setAttribute('x1', x(i));
        cross.setAttribute('x2', x(i));
        cross.style.display = '';
        const rows = players.map((p, pi) => ({ p, v: hist[i].values[pi] })).sort((a, b) => b.v - a.v)
            .map(r => `<div class="tip-row"><span class="lg-swatch" style="background:${r.p.color}"></span><span>${esc(r.p.name)}</span><b>${fmt(r.v)} €</b></div>`).join('');
        tip.innerHTML = `<div class="tip-title">${i === hist.length - 1 ? 'Kriegsausbruch' : `Runde ${hist[i].round}`}</div>${rows}`;
        tip.style.display = 'block';
        const px = (x(i) / W) * rect.width;
        tip.style.left = `${px > rect.width / 2 ? px - tip.offsetWidth - 12 : px + 12}px`;
        tip.style.top = '8px';
    });
    $('wc-hit').addEventListener('mouseleave', () => {
        tip.style.display = 'none';
        cross.style.display = 'none';
    });
}

function showEndScreen(fates) {
    const alive = fates.filter(f => f.alive);
    $('end-title').textContent = alive.length ? `${alive.map(f => f.p.name).join(' & ')} überleb${alive.length > 1 ? 'en' : 't'}!` : 'Niemand hat überlebt.';
    $('end-sub').textContent = `Der Atomkrieg brach nach Runde ${game.doomsdayRound} aus. ${alive.length ? 'Die Tür des Bunkers schliesst sich ...' : 'Die Erde gehört jetzt den Kakerlaken.'}`;
    fates.sort((x, y) => (y.alive - x.alive) || (wealthEUR(y.p) - wealthEUR(x.p)));
    $('end-results').innerHTML = fates.map((f, i) => {
        const s = f.p.stats;
        return `<div class="result ${f.alive ? 'alive' : 'dead'}">
            <div class="rank">${i + 1}</div>
            <div class="pc-avatar" style="background:${f.p.color};color:${f.p.color};width:38px;height:38px"><span>${charOf(f.p).icon}</span></div>
            <div class="r-main"><div class="r-name">${esc(f.p.name)}${f.p.isBot ? ' 🤖' : ''} <span class="muted">· ${charOf(f.p).name}</span></div>
                <div class="r-why">${esc(f.why)}</div>
                <div class="r-stats">Vermögen ≈${fmt(wealthEUR(f.p))} € · ${s.bought} gekauft · ${s.worked}× gearbeitet · Zinsen ${fmt(s.interest)} € · Gebühren ${fmt(s.fees)} € · Kämpfe ${s.won}:${s.lost} · Schmuggel ${s.smuggled} (${s.caught} erwischt)</div></div>
            <div class="r-badge">${f.alive ? '🛖' : f.seized ? '🏦' : '☠️'}</div></div>`;
    }).join('');
    renderAwards();
    renderWealthChart();
    $('end-lessons').innerHTML = game.lessons.length
        ? `<h3 class="end-h">📚 Was ihr gelernt habt</h3><ul>${game.lessons.map(l => `<li>${esc(l)}</li>`).join('')}</ul>` : '';
    $('end').classList.add('active');
    Sound.play(alive.length ? 'win' : 'lose');
}

// ===== SETUP =====

const setupState = {
    players: [
        { name: '', isBot: false, char: '' },
        { name: '', isBot: false, char: '' },
        { name: BOT_NAMES[2], isBot: true, char: '' },
        { name: BOT_NAMES[3], isBot: true, char: '' },
    ],
    length: 'normal',
    speed: 'normal',
};

function renderSetup() {
    const charOpts = sel => `<option value="">🎲 Zufall</option>` + CHARACTER_IDS.map(id =>
        `<option value="${id}" ${sel === id ? 'selected' : ''}>${CHARACTERS[id].icon} ${CHARACTERS[id].name}</option>`).join('');
    $('setup-players').innerHTML = setupState.players.map((s, i) => {
        const c = CHARACTERS[s.char];
        return `<div class="setup-player-wrap">
            <div class="setup-player">
                <span class="swatch" style="background:${PLAYER_COLORS[i]};color:${PLAYER_COLORS[i]}"></span>
                <input data-i="${i}" maxlength="14" placeholder="${s.isBot ? BOT_NAMES[i] : `Spieler ${i + 1}`}" value="${esc(s.name)}">
                <select data-char="${i}" class="char-select">${charOpts(s.char)}</select>
                <div class="seg"><button data-type="${i}:human" class="${s.isBot ? '' : 'active'}">👤</button><button data-type="${i}:bot" class="${s.isBot ? 'active' : ''}">🤖</button></div>
            </div>
            <div class="setup-power">${c ? `${c.icon} <b>${c.name}:</b> ${c.power}` : '🎲 Bekommt einen zufälligen Charakter.'}</div>
        </div>`;
    }).join('');
    const n = setupState.players.length;
    const nb = Math.max(1, Math.floor(n / 2));
    $('setup-summary').innerHTML = `<b>${n} Spieler</b> · <b>${nb} Bunker</b> · ${n - nb} werden sterben.<br>👤 = Mensch, 🤖 = KI. Mehrere Menschen spielen abwechselnd am selben Computer.`;
    $('setup-players').querySelectorAll('input').forEach(inp => inp.addEventListener('input', () => {
        setupState.players[Number(inp.dataset.i)].name = inp.value;
    }));
    $('setup-players').querySelectorAll('[data-char]').forEach(sel => sel.addEventListener('change', () => {
        setupState.players[Number(sel.dataset.char)].char = sel.value;
        Sound.play('click');
        renderSetup();
    }));
    $('setup-players').querySelectorAll('[data-type]').forEach(btn => btn.addEventListener('click', () => {
        const [i, type] = btn.dataset.type.split(':');
        const s = setupState.players[Number(i)];
        s.isBot = type === 'bot';
        if (s.isBot && !s.name) s.name = BOT_NAMES[Number(i)];
        if (!s.isBot && BOT_NAMES.includes(s.name)) s.name = '';
        Sound.play('click');
        renderSetup();
    }));
}

function bindSeg(id, key, attr) {
    $(id).querySelectorAll('button').forEach(btn => btn.addEventListener('click', () => {
        setupState[key] = btn.dataset[attr];
        $(id).querySelectorAll('button').forEach(b => b.classList.toggle('active', b === btn));
        Sound.play('click');
    }));
}

function cycleSpeed() {
    if (!game) return;
    const order = Object.keys(AI_SPEEDS);
    game.speed = order[(order.indexOf(game.speed) + 1) % order.length];
    applySpeed();
    toast(`KI-Tempo: ${AI_SPEEDS[game.speed].label}`, 'info');
    render();
}

function initUI() {
    news('Weltuntergangsuhr steht auf 100 Sekunden vor Mitternacht');
    NEWS_FLAVOR.slice(0, 3).forEach(news);

    const saved = loadSave();
    if (saved) {
        $('btn-continue').classList.remove('hidden');
        $('btn-continue').textContent = `▶ Weiterspielen (Runde ${saved.round})`;
        $('btn-to-setup').classList.replace('btn-primary', 'btn-ghost');
        $('btn-continue').addEventListener('click', () => {
            Sound.init();
            resumeGame(saved);
        });
    }

    $('btn-to-setup').addEventListener('click', () => {
        Sound.init();
        Sound.play('click');
        $('intro').classList.remove('active');
        $('setup').classList.add('active');
        renderSetup();
    });
    $('btn-intro-help').addEventListener('click', () => { Sound.init(); openHelp(); });
    $('btn-add-player').addEventListener('click', () => {
        if (setupState.players.length >= 6) return;
        const i = setupState.players.length;
        setupState.players.push({ name: BOT_NAMES[i], isBot: true, char: '' });
        renderSetup();
    });
    $('btn-remove-player').addEventListener('click', () => {
        if (setupState.players.length <= 2) return;
        setupState.players.pop();
        renderSetup();
    });
    bindSeg('seg-length', 'length', 'len');
    bindSeg('seg-speed', 'speed', 'speed');
    $('btn-start').addEventListener('click', () => {
        const setup = setupState.players.map((s, i) => ({
            name: (s.name || '').trim() || (s.isBot ? BOT_NAMES[i] : `Spieler ${i + 1}`),
            isBot: s.isBot,
            char: s.char,
        }));
        clearSave();
        startGame(setup, setupState.length, setupState.speed);
    });

    $('modal-close').addEventListener('click', closeModal);
    $('modal-bg').addEventListener('click', e => { if (e.target === $('modal-bg')) closeModal(); });
    $('btn-help').addEventListener('click', openHelp);
    $('btn-mute').addEventListener('click', () => { Sound.toggleMute(); render(); });
    $('btn-speed').addEventListener('click', cycleSpeed);

    const handlers = {
        travel: openTravel,
        market: openMarket,
        work: () => { const p = human(); if (p) afterAction(actWork(p)); },
        bank: openBank,
        crypto: openCrypto,
        eat: () => { const p = human(); if (p) afterAction(actEat(p)); },
        attack: openAttack,
        contract: openContract,
        build: () => { const p = human(); if (p) afterAction(actBuild(p)); },
        end: () => { if (human()) { Sound.play('click'); endTurn(); } },
    };
    document.querySelectorAll('#actions .act').forEach(btn => btn.addEventListener('click', () => handlers[btn.dataset.act]()));

    document.addEventListener('keydown', e => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.metaKey || e.ctrlKey) return;
        if (e.key === 'Escape') return closeModal();
        if (e.key === 'm' || e.key === 'M') {
            Sound.toggleMute();
            if (game) render();
            return;
        }
        if (e.key === 'Enter') {
            if ($('card-overlay').classList.contains('active') && showEventCard.pending) return showEventCard.pending();
            if ($('handover').classList.contains('active') && showHandover.pending) return showHandover.pending();
        }
        if (!game || game.over || modalOpen()) return;
        const btn = document.querySelector(`#actions .act[data-key="${e.key}"]`);
        if (btn && !btn.disabled) {
            e.preventDefault();
            btn.click();
        }
    });
}
