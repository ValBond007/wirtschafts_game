const $ = id => document.getElementById(id);

function fmt(n) {
    return Math.floor(n).toLocaleString('de-CH');
}

function esc(s) {
    return String(s).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
}

function curTag(c) {
    const dark = ['usd', 'ara', 'crypto'].includes(c);
    return `<span class="cur" style="background:${CURRENCIES[c].color};color:${dark ? '#fff' : '#111'}">${CURRENCIES[c].name === 'BunkerCoin' ? '₿' : CURRENCIES[c].name}</span>`;
}

// ===== FEEDBACK =====

function toast(text, type = '') {
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.textContent = text;
    $('toasts').appendChild(el);
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
    $('tb-player').innerHTML = `<span class="dot" style="background:${p.color};color:${p.color}"></span><span style="color:${p.color}">${esc(p.name)}</span>${p.isBot ? ' 🤖' : ''}`;
    const total = Math.max(p.ap, CONFIG.actionsPerTurn);
    let pips = '';
    for (let i = 0; i < total; i++) pips += `<div class="pip ${i < p.ap ? '' : 'used'}"></div>`;
    $('tb-ap').innerHTML = pips;
    $('btn-mute').textContent = Sound.isMuted() ? '🔇' : '🔊';
}

function renderPlayerCard(p) {
    const loc = LOCATIONS[p.location];
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
    if (p.resources.tech > 0 || p.resources.energy > 0) {
        const pct = Math.round((1 - (p.resources.tech > 0 ? 0.7 : 1) * (p.resources.energy > 0 ? 0.8 : 1)) * 100);
        chips.push(`<span class="chip info">✈️ Reisen −${pct}%</span>`);
    }

    const money = ['usd', 'eur', 'peso', 'ara', 'crypto'].map(c =>
        `<div class="money ${p.money[c] <= 0 ? 'zero' : ''}">${curTag(c)}<span>${fmt(p.money[c])}</span></div>`).join('');

    const req = CONFIG.bunkerRequirements;
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
        bunker = `<div class="bunker-progress">🛖 <b>Bunker ${LOCATIONS[own].name}</b> – ${b.completed ? '<span style="color:#86efac">FERTIG</span>' : `${b.progress}/${CONFIG.bunkerBuildSteps}`}
            <div class="bar"><div style="width:${(b.progress / CONFIG.bunkerBuildSteps) * 100}%"></div></div>
            ${b.completed && p.location !== own ? '<div style="color:#fca5a5;margin-top:6px">⚠ Du bist nicht im Bunker!</div>' : ''}
            ${p.debt > 0 ? '<div style="color:#fca5a5;margin-top:6px">⚠ Mit Schulden pfändet die Bank deinen Bunker!</div>' : ''}</div>`;
    } else {
        const { missingAfterWild } = bunkerNeeds(p);
        bunker = `<div class="bunker-progress">${missingAfterWild === 0
            ? '✅ Genug Ressourcen! Reise zu einem freien Bunker und baue ihn.'
            : `Noch <b>${missingAfterWild}</b> Ressourcen bis zum Bunker (💎 = Joker).`}</div>`;
    }

    $('player-card').innerHTML = `
        <div class="pc-head">
            <div class="pc-avatar" style="background:${p.color};color:${p.color}"><span style="color:#fff">${esc(p.name[0])}</span></div>
            <div><div class="pc-name">${esc(p.name)}</div><div class="pc-loc">📍 ${loc.name}${loc.isBunker ? '' : ` · ${CURRENCIES[loc.currency].name}`}</div></div>
        </div>
        <div class="chips">${chips.join('')}</div>
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
    g.beginPath();
    data.forEach((v, i) => {
        const x = data.length === 1 ? w / 2 : (i / (data.length - 1)) * (w - 2) + 1;
        const y = h - 2 - ((v - min) / span) * (h - 4);
        i ? g.lineTo(x, y) : g.moveTo(x, y);
    });
    g.stroke();
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

    $('prices').innerHTML = CONTINENT_IDS.map(id => {
        const loc = LOCATIONS[id];
        const r = RESOURCES[loc.resource];
        const emb = game.roundMods.embargo === id;
        return `<div class="price-row ${emb ? 'embargo' : ''}" title="${emb ? 'Embargo!' : ''}">
            <span>${r.icon}</span><span>${r.name} <span class="muted">(${loc.name})</span></span>
            <span class="pv">${fmt(priceLocal(id))} ${CURRENCIES[loc.currency].name} <small>≈${fmt(unitPriceEUR(id))}€</small></span></div>`;
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
                st = `<span class="st" style="color:${o.color}">${esc(o.name)} ${b.completed ? '✔' : `${b.progress}/${CONFIG.bunkerBuildSteps}`}</span>`;
            }
        }
        return `<div class="bl-row">🛖 ${LOCATIONS[id].name}${st}</div>`;
    }).join('');

    $('player-list').innerHTML = game.players.map(p => {
        const resCount = Object.values(p.resources).reduce((a, b) => a + b, 0);
        return `<div class="pl-row ${p.id === game.cur ? 'active' : ''}">
            <span class="dot" style="background:${p.color}"></span>
            <span>${esc(p.name)}${p.isBot ? ' 🤖' : ''}</span>
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
        eat: p.resources.food < 1 || p.foodBoosts >= CONFIG.maxFoodBoostsPerTurn,
        attack: noAP || p.resources.military < 1 || p.attackedThisTurn || game.roundMods.noAttacks || (!others.length && !raidable),
        contract: game.players.length < 2,
        build: noAP || !loc.isBunker || !b.available || b.completed || (b.owner !== null && b.owner !== p.id),
        end: false,
    };
    document.querySelectorAll('#actions .act').forEach(btn => {
        btn.disabled = locked || state[btn.dataset.act];
    });
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
        if (loc.isBunker) {
            const b = game.bunkers[locId];
            html += b.owner === null ? 'Bunker: <b style="color:#c084fc">frei</b>' :
                `Bunker von <b style="color:${game.players[b.owner].color}">${esc(game.players[b.owner].name)}</b> ${b.completed ? '✔ fertig' : `(${b.progress}/${CONFIG.bunkerBuildSteps})`}`;
        } else {
            html += `Währung: <b>${CURRENCIES[loc.currency].name}</b><br>Ressource: ${RESOURCES[loc.resource].icon} <b>${RESOURCES[loc.resource].name}</b> – ${fmt(priceLocal(locId))} ${CURRENCIES[loc.currency].name}`;
            if (game.roundMods.embargo === locId) html += '<br><b style="color:#f87171">🚫 Embargo!</b>';
            const cr = game.crates.filter(c => c.loc === locId).length;
            if (cr) html += `<br>💎 ${cr} Rohstoff-Fund${cr > 1 ? 'e' : ''}!`;
        }
        const here = game.players.filter(p => p.location === locId);
        if (here.length) html += `<br>👥 ${here.map(p => `<span style="color:${p.color}">${esc(p.name)}</span>`).join(', ')}`;
        const p = cp();
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
        const sub = loc.isBunker ? (locked ? 'gesperrt' : 'Bunker-Standort') : `${CURRENCIES[loc.currency].name} · ${RESOURCES[loc.resource].name}`;
        return option(loc.isBunker ? '🛖' : '🌍', loc.name, `${near ? 'Nahe' : 'Weit'} · ${sub}`, `≈${cost} €`, `data-to="${id}"`, locked || fiatEUR(p) < cost);
    }).join('');
    openModal('✈️ Wohin reisen?', `<p class="muted" style="margin-bottom:10px">Tipp: Du kannst auch direkt auf die Weltkugel klicken. Technik (−30%) und Energie (−20%) machen Reisen billiger.</p><div class="m-options">${html}</div>`);
    bindModal('[data-to]', el => { closeModal(); actTravel(p, el.dataset.to); });
}

function openMarket() {
    const p = human();
    if (!p) return;
    const loc = LOCATIONS[p.location];
    const r = RESOURCES[loc.resource];
    const emb = game.roundMods.embargo === p.location;
    let buy = '';
    for (let q = 1; q <= 3; q++) {
        const quote = purchaseQuote(p, p.location, q);
        const price = quote.usesForeign
            ? `${fmt(quote.fromLocal)} ${CURRENCIES[quote.c].name} + ≈${fmt(quote.foreignEUR)} € fremd`
            : `${fmt(quote.totalLocal)} ${CURRENCIES[quote.c].name}`;
        buy += option(r.icon, `${q}× ${r.name}`, quote.usesForeign ? `Mit Fremdwährung (+${game.roundMods.freeTrade ? 0 : 30}% Aufschlag)` : 'In Lokalwährung', price, `data-buy="${q}"`, emb || !quote.affordable);
    }
    const sell = Object.keys(RESOURCES).filter(k => p.resources[k] > 0).map(k => {
        const source = CONTINENT_IDS.find(id => LOCATIONS[id].resource === k);
        const eur = RESOURCES[k].baseEUR * (source ? game.priceIndex[source] : game.cpi) * 0.65;
        return option(RESOURCES[k].icon, `1× ${RESOURCES[k].name} verkaufen`, `Du hast ${p.resources[k]}`, `≈${fmt(eur)} €`, `data-sell="${k}"`);
    }).join('') || '<p>Du hast nichts zu verkaufen.</p>';
    const chance = Math.round((CONFIG.blackMarketCatchChance + p.record * 0.1) * 100);
    const black = CONTINENT_IDS.filter(id => id !== p.location).map(id => {
        const k = LOCATIONS[id].resource;
        const eur = unitPriceEUR(id) * CONFIG.blackMarketMarkup;
        return option('🕶️', `1× ${RESOURCES[k].name} schmuggeln`, `${chance}% Risiko erwischt zu werden`, `≈${fmt(eur)} €`, `data-smuggle="${k}"`, fiatEUR(p) < eur);
    }).join('');

    openModal(`🛒 Markt ${loc.name}`, `
        <div class="m-section"><h4>Kaufen ${emb ? '<span style="color:#f87171">– EMBARGO!</span>' : ''}</h4>
            <p>Jeder Kauf erhöht den Preis um ${Math.round(CONFIG.demandPriceBump * 100)}% (Nachfrage steigt → Preis steigt).</p>
            <div class="m-options">${buy}</div></div>
        <div class="m-section"><h4>Verkaufen</h4><p>Händler zahlen 65% des Marktwerts – in Lokalwährung.</p><div class="m-options">${sell}</div></div>
        <div class="m-section"><h4>🕶️ Schwarzmarkt (illegal!)</h4><p>Ware aus anderen Kontinenten – doppelter Preis. Wirst du erwischt: Ware weg, Busse, Vorstrafe und dein Zug ist vorbei.</p><div class="m-options">${black}</div></div>`, true);
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
    openModal('🏦 Bank', `
        <div class="m-section"><h4>Geld wechseln</h4>
            ${blocked ? `<p style="color:#fca5a5">${blocked}</p>` : `<p>Gebühr ${game.roundMods.freeTrade ? '0% (Freihandel!)' : `${CONFIG.exchangeFee * 100}%`}. Kurse schwanken jede Runde – wechsle, wenn der Kurs gut ist!</p>`}
            <div class="m-row"><label>Von</label><select id="ex-from">${opts}</select></div>
            <div class="m-row"><label>Nach</label><select id="ex-to">${opts}</select></div>
            <div class="m-row"><label>Betrag</label><input type="number" id="ex-amount" min="1"><button class="btn btn-small" id="ex-max">Alles</button></div>
            <div class="m-preview" id="ex-preview"></div>
            <button class="btn btn-primary full" id="ex-go" ${blocked ? 'disabled' : ''}>Wechseln (1 AP)</button></div>
        <div class="m-section"><h4>💳 Kredit</h4>
            <p>Leihe dir ${CONFIG.loanAmountEUR} € (in Lokalwährung). Zins: <b>${Math.round(game.interest * 100)}% pro Runde</b> (Zinseszins!). Ab ${CONFIG.seizureDebtEUR} € Schulden pfändet die Bank jede Runde Ressourcen. <b style="color:#fca5a5">Wer bei Kriegsausbruch Schulden hat, verliert den Bunker!</b></p>
            <p>Aktuelle Schulden: <b>${fmt(p.debt)} €</b></p>
            <div class="m-row"><button class="btn btn-ghost" id="loan-take" style="flex:1">Kredit aufnehmen</button><button class="btn btn-good" id="loan-repay" style="flex:1" ${p.debt <= 0 ? 'disabled' : ''}>Zurückzahlen</button></div></div>
        <div class="m-section"><h4>🛡️ Versicherung gegen Raub</h4>
            <p>Prämie ${CONFIG.insuranceEUR} €. Für ${CONFIG.insuranceTurns} Züge ersetzt die Versicherung alles, was dir bei einem Angriff gestohlen wird.</p>
            <button class="btn btn-ghost full" id="insure" ${p.insurance > 0 ? 'disabled' : ''}>${p.insurance > 0 ? 'Bereits versichert' : 'Versichern (1 AP)'}</button></div>`);
    $('ex-from').value = from;
    $('ex-to').value = local === from ? 'eur' : local;
    const preview = () => {
        const f = $('ex-from').value;
        const t = $('ex-to').value;
        const a = Number($('ex-amount').value);
        if (f === t) return ($('ex-preview').textContent = 'Wähle zwei verschiedene Währungen.');
        if (!(a > 0)) return ($('ex-preview').textContent = `1 ${CURRENCIES[f].name} = ${(toEUR(f, 1) / game.rates[t]).toFixed(4)} ${CURRENCIES[t].name}`);
        const q = exchangeQuote(f, t, a);
        $('ex-preview').textContent = `→ ${fmt(q.received)} ${CURRENCIES[t].name}${a > p.money[f] ? '  (zu wenig!)' : ''}`;
    };
    ['ex-from', 'ex-to', 'ex-amount'].forEach(id => $(id).addEventListener('input', preview));
    $('ex-max').addEventListener('click', () => { $('ex-amount').value = Math.floor(p.money[$('ex-from').value]); preview(); });
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
    openModal('₿ BunkerCoin-Börse', `
        <div class="m-section">
            <div style="display:flex;justify-content:space-between;align-items:center">
                <div><div class="muted">1 BunkerCoin =</div><div style="font:800 28px var(--mono);color:#c084fc">${fmt(price)} €</div></div>
                <canvas id="crypto-chart" style="width:200px;height:60px"></canvas>
            </div>
            <p style="margin-top:8px">Extrem volatil! Du besitzt <b>${p.money.crypto} ₿</b> (≈${fmt(toEUR('crypto', p.money.crypto))} €).
            <b style="color:#fca5a5">Nach jedem Krypto-Geschäft darfst du ${CONFIG.cryptoLockTurns} Züge lang kein Geld wechseln (Sperrfrist wie bei einem Termingeschäft).</b></p>
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
    g.beginPath();
    data.forEach((v, i) => {
        const x = (i / Math.max(1, data.length - 1)) * 196 + 2;
        const y = 56 - ((v - min) / (max - min || 1)) * 52;
        i ? g.lineTo(x, y) : g.moveTo(x, y);
    });
    g.stroke();
    const preview = () => {
        const n = Number($('cr-amount').value) || 0;
        $('cr-preview').textContent = `${n} ₿ ≈ ${fmt(toEUR('crypto', n))} € (+${CONFIG.exchangeFee * 100}% Gebühr)`;
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
        return option('🎯', `<span style="color:${o.color}">${esc(o.name)}</span>`,
            `Militär ${o.resources.military} · ${res} Ressourcen${o.insurance > 0 ? ' · 🛡️ versichert' : ''}${pact ? ' · <b style="color:#fca5a5">PAKT! Bruch kostet ' + CONFIG.pactPenaltyEUR + ' €</b>' : ''}`,
            `⚔ ${p.resources.military} vs ${o.resources.military}`, `data-target="${o.id}"`);
    }).join('');
    const b = LOCATIONS[p.location].isBunker ? game.bunkers[p.location] : null;
    if (b && b.owner !== null && b.owner !== p.id) {
        const o = game.players[b.owner];
        html += option('💣', b.completed ? `Bunker von ${esc(o.name)} stürmen` : `Baustelle von ${esc(o.name)} sabotieren`,
            b.completed ? 'Gewinnst du, gehört der Bunker DIR!' : 'Gewinnst du, verliert der Bau 1 Fortschritt.',
            `⚔ ${p.resources.military} vs ${(b.completed ? 3 : 1) + (o.location === p.location ? o.resources.military : 0)}+🎲`, 'data-raid="1"');
    }
    openModal('⚔️ Angriff', `<p class="muted" style="margin-bottom:10px">Würfel (1–6) + dein Militär gegen Würfel + Militär des Gegners. Verlierst du, verlierst du 1 Militär.</p><div class="m-options">${html || '<p>Niemand hier.</p>'}</div>`);
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
            <div class="m-row"><label>Partner</label><select id="ct-partner">${others.map(o => `<option value="${o.id}">${esc(o.name)}${o.isBot ? ' 🤖' : ''}</option>`).join('')}</select></div>
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
            <p style="margin-bottom:10px;color:${target.color};font-weight:700">${esc(target.name)}, schau her!</p>
            <p style="line-height:1.6;margin-bottom:16px">${text}</p>
            <div class="m-row"><button class="btn btn-good" id="ask-yes" style="flex:1">Annehmen</button><button class="btn btn-danger" id="ask-no" style="flex:1">Ablehnen</button></div>`);
        closeModal.onClose = () => resolve(false);
        $('ask-yes').addEventListener('click', () => { closeModal.onClose = null; closeModal(); resolve(true); });
        $('ask-no').addEventListener('click', () => { closeModal.onClose = null; closeModal(); resolve(false); });
    });
}

function helpHTML() {
    const req = CONFIG.bunkerRequirements;
    return `<div class="help">
        <h4>🎯 Ziel</h4>
        <p>Sitze beim Ausbruch des Atomkriegs in deinem <b>fertigen Bunker</b> – ohne Schulden. Es gibt nur halb so viele Bunker wie Spieler. Wann der Krieg genau ausbricht, weiss niemand; die DEFCON-Anzeige zeigt, wie nah er ist.</p>
        <h4>🔁 Ablauf</h4>
        <p>Jede Runde zieht eine Ereigniskarte (Inflation, Crash, Embargo …). Dann ist jeder Spieler einmal am Zug und hat <b>${CONFIG.actionsPerTurn} Aktionspunkte (AP)</b>. Zu Beginn jeder Runde erhalten alle ${CONFIG.incomeEUR} € Einkommen in der Währung ihres Standorts.</p>
        <h4>🌍 Kontinente</h4>
        <table><tr><th>Kontinent</th><th>Währung</th><th>Ressource</th><th>Effekt</th></tr>
            <tr><td>Nordamerika</td><td>USD</td><td>⚔️ Militär</td><td>Angriff & Verteidigung</td></tr>
            <tr><td>Südamerika</td><td>Peso</td><td>🌽 Lebensmittel</td><td>Essen = +1 AP (Nachtschicht)</td></tr>
            <tr><td>Europa</td><td>EUR</td><td>⚙️ Technik</td><td>Reisen −30%</td></tr>
            <tr><td>Afrika</td><td>ARA</td><td>⚡ Energie</td><td>Reisen −20%</td></tr>
            <tr><td>überall zufällig</td><td>–</td><td>💎 Rohstoffe</td><td>Joker für jede Bunker-Ressource</td></tr></table>
        <h4>🛖 Bunker bauen</h4>
        <p>Benötigt: ${req.food}× Lebensmittel, ${req.tech}× Technik, ${req.energy}× Energie, ${req.military}× Militär (fehlende können durch 💎 ersetzt werden). Reise zu einem freien Bunker-Standort und baue ${CONFIG.bunkerBuildSteps}× (je 1 AP). Danach: <b>bleib dort!</b></p>
        <h4>🎮 Aktionen (je 1 AP)</h4>
        <ul>
            <li><b>Reisen</b> – auf die Weltkugel klicken. Nahe Ziele (gestrichelte Nachbarn) sind billiger.</li>
            <li><b>Markt</b> – lokale Ressource kaufen (in Lokalwährung, sonst +30% mit Fremdwährung), verkaufen oder illegal schmuggeln.</li>
            <li><b>Arbeiten</b> – ${CONFIG.workEUR} € in Lokalwährung verdienen.</li>
            <li><b>Bank</b> – Geld wechseln (${CONFIG.exchangeFee * 100}% Gebühr), Kredit aufnehmen/zurückzahlen, Versicherung.</li>
            <li><b>Krypto</b> – BunkerCoin kaufen/verkaufen. Danach ${CONFIG.cryptoLockTurns} Züge Wechselsperre!</li>
            <li><b>Angriff</b> – Würfel + Militär. Gewinner raubt Ressourcen. Fremde Bunker können sabotiert oder sogar gestürmt werden!</li>
            <li><b>Essen</b> (0 AP) – 1 Lebensmittel für +1 AP, max. 2× pro Zug.</li>
            <li><b>Vertrag</b> (0 AP) – Tauschhandel oder Nichtangriffspakt mit anderen Spielern. Vertragsbruch kostet ${CONFIG.pactPenaltyEUR} € Strafe.</li>
        </ul>
        <h4>📚 Wirtschaft & Recht im Spiel</h4>
        <ul>
            <li><b>Wechselkurse & Inflation:</b> Kurse schwanken, Preise steigen jede Runde (Teuerung).</li>
            <li><b>Angebot & Nachfrage:</b> Jeder Kauf treibt den Preis hoch.</li>
            <li><b>Zins & Zinseszins:</b> Kredite wachsen jede Runde. Zu viele Schulden → Betreibung & Pfändung.</li>
            <li><b>Spekulation:</b> Krypto kann dich reich oder arm machen. Sperrfristen wie bei Termingeschäften.</li>
            <li><b>Opportunitätskosten:</b> Jeder AP kann nur einmal ausgegeben werden – arbeiten, kaufen oder reisen?</li>
            <li><b>Vertragsrecht:</b> Vertragsfreiheit, «pacta sunt servanda», Konventionalstrafe.</li>
            <li><b>Strafrecht:</b> Schmuggel ist illegal – Busse, Beschlagnahmung und Vorstrafen.</li>
            <li><b>Versicherung:</b> Risiko gegen eine Prämie abgeben.</li>
        </ul>
    </div>`;
}

function openHelp() {
    openModal('❓ Spielanleitung', helpHTML(), true);
}

// ===== OVERLAYS =====

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
            resolve();
        };
        $('card-ok').onclick = done;
        if (allBots) setTimeout(done, 3500);
    });
}

function showDice(title, a, b, result, kind) {
    return new Promise(resolve => {
        const side = s => `<div class="dn" style="color:${s.color}">${esc(s.name)}</div>
            <div class="dice-face rolling" style="color:${s.color}">?</div>
            <div class="dbonus">+ ${s.bonus} ${s.label}</div><div class="dtotal">&nbsp;</div>`;
        $('dice-title').textContent = title;
        $('dice-a').innerHTML = side(a);
        $('dice-b').innerHTML = side(b);
        $('dice-result').textContent = '';
        $('dice-result').style.color = '';
        $('dice-overlay').classList.add('active');
        Sound.play('dice');
        const faces = document.querySelectorAll('#dice-overlay .dice-face');
        const spin = setInterval(() => faces.forEach(f => { f.textContent = randInt(1, 6); }), 70);
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
            }, 1900);
        }, 1100);
    });
}

function showHandover(p) {
    return new Promise(resolve => {
        $('handover-name').textContent = p.name;
        $('handover-name').style.color = p.color;
        $('handover').classList.add('active');
        $('handover-ok').onclick = () => {
            $('handover').classList.remove('active');
            Sound.play('click');
            resolve();
        };
    });
}

function showEndScreen(fates) {
    const alive = fates.filter(f => f.alive);
    $('end-title').textContent = alive.length ? `${alive.map(f => f.p.name).join(' & ')} überleb${alive.length > 1 ? 'en' : 't'}!` : 'Niemand hat überlebt.';
    $('end-sub').textContent = `Der Atomkrieg brach in Runde ${game.doomsdayRound} aus. ${alive.length ? 'Die Tür des Bunkers schliesst sich...' : 'Die Erde gehört jetzt den Kakerlaken.'}`;
    fates.sort((x, y) => (y.alive - x.alive) || (wealthEUR(y.p) - wealthEUR(x.p)));
    $('end-results').innerHTML = fates.map((f, i) => {
        const s = f.p.stats;
        return `<div class="result ${f.alive ? 'alive' : 'dead'}">
            <div class="rank">${i + 1}</div>
            <div class="pc-avatar" style="background:${f.p.color};color:${f.p.color};width:34px;height:34px"><span style="color:#fff">${esc(f.p.name[0])}</span></div>
            <div class="r-main"><div class="r-name" style="color:${f.p.color}">${esc(f.p.name)}${f.p.isBot ? ' 🤖' : ''}</div>
                <div class="r-why">${esc(f.why)}</div>
                <div class="r-stats">Vermögen ≈${fmt(wealthEUR(f.p))} € · ${s.bought} gekauft · ${s.worked}× gearbeitet · Zinsen ${fmt(s.interest)} € · Gebühren ${fmt(s.fees)} € · Kämpfe ${s.won}:${s.lost} · Schmuggel ${s.smuggled} (${s.caught} erwischt)</div></div>
            <div class="r-badge">${f.alive ? '🛖' : f.seized ? '🏦' : '☠️'}</div></div>`;
    }).join('');
    $('end-lessons').innerHTML = game.lessons.length
        ? `<h3>📚 Was ihr gelernt habt</h3><ul>${game.lessons.map(l => `<li>${esc(l)}</li>`).join('')}</ul>` : '';
    $('end').classList.add('active');
    Sound.play(alive.length ? 'win' : 'lose');
}

// ===== SETUP =====

const setupState = {
    players: [
        { name: '', isBot: false },
        { name: '', isBot: false },
        { name: BOT_NAMES[2], isBot: true },
        { name: BOT_NAMES[3], isBot: true },
    ],
    length: 'normal',
};

function renderSetup() {
    $('setup-players').innerHTML = setupState.players.map((s, i) => `
        <div class="setup-player">
            <span class="swatch" style="background:${PLAYER_COLORS[i]};color:${PLAYER_COLORS[i]}"></span>
            <input data-i="${i}" maxlength="14" placeholder="${s.isBot ? BOT_NAMES[i] : `Spieler ${i + 1}`}" value="${esc(s.name)}">
            <div class="seg"><button data-type="${i}:human" class="${s.isBot ? '' : 'active'}">👤 Mensch</button><button data-type="${i}:bot" class="${s.isBot ? 'active' : ''}">🤖 KI</button></div>
        </div>`).join('');
    const n = setupState.players.length;
    const nb = Math.max(1, Math.floor(n / 2));
    $('setup-summary').innerHTML = `<b>${n} Spieler</b> · <b>${nb} Bunker</b> · ${n - nb} werden sterben.<br>KI-Spieler spielen automatisch. Mehrere Menschen spielen abwechselnd am selben Computer.`;
    $('setup-players').querySelectorAll('input').forEach(inp => inp.addEventListener('input', () => {
        setupState.players[Number(inp.dataset.i)].name = inp.value;
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

function initUI() {
    news('Weltuntergangsuhr steht auf 100 Sekunden vor Mitternacht');
    NEWS_FLAVOR.slice(0, 3).forEach(news);

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
        setupState.players.push({ name: BOT_NAMES[i], isBot: true });
        renderSetup();
    });
    $('btn-remove-player').addEventListener('click', () => {
        if (setupState.players.length <= 2) return;
        setupState.players.pop();
        renderSetup();
    });
    $('seg-length').querySelectorAll('button').forEach(btn => btn.addEventListener('click', () => {
        setupState.length = btn.dataset.len;
        $('seg-length').querySelectorAll('button').forEach(b => b.classList.toggle('active', b === btn));
    }));
    $('btn-start').addEventListener('click', () => {
        const setup = setupState.players.map((s, i) => ({
            name: (s.name || '').trim() || (s.isBot ? BOT_NAMES[i] : `Spieler ${i + 1}`),
            isBot: s.isBot,
        }));
        startGame(setup, setupState.length);
    });

    $('modal-close').addEventListener('click', closeModal);
    $('modal-bg').addEventListener('click', e => { if (e.target === $('modal-bg')) closeModal(); });
    $('btn-help').addEventListener('click', openHelp);
    $('btn-mute').addEventListener('click', () => { Sound.toggleMute(); render(); });

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
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
        if (e.key === 'Escape') closeModal();
        if (e.key === 'm' || e.key === 'M') { Sound.toggleMute(); render(); }
    });
}
