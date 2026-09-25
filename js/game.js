let game = null;

const sleep = ms => new Promise(r => setTimeout(r, ms));
const cp = () => game.players[game.cur];
const shuffle = arr => arr.map(v => [Math.random(), v]).sort((a, b) => a[0] - b[0]).map(x => x[1]);

// ===== MONEY HELPERS =====

function toEUR(c, amount) {
    return amount * game.rates[c];
}

function fromEUR(c, eur) {
    return eur / game.rates[c];
}

function localCurrency(p) {
    const loc = LOCATIONS[p.location];
    return loc.isBunker ? LOCATIONS[p.home].currency : loc.currency;
}

function payLocal(g, p, eur) {
    const c = localCurrency(p);
    const amount = Math.round(eur / g.rates[c]);
    p.money[c] += amount;
    return { c, amount };
}

function netWorthCash(g, p) {
    return FIAT.reduce((s, c) => s + p.money[c] * g.rates[c], 0);
}

function fiatEUR(p) {
    return netWorthCash(game, p);
}

function wealthEUR(p) {
    const res = Object.entries(p.resources).reduce((s, [k, v]) => s + v * RESOURCES[k].baseEUR, 0);
    return fiatEUR(p) + toEUR('crypto', p.money.crypto) + res - p.debt;
}

// Pays an EUR-denominated amount, spending the preferred currency first, then the largest holdings.
function payEUR(p, eur, preferred) {
    if (fiatEUR(p) + 0.01 < eur) return null;
    const order = [preferred, ...FIAT.filter(c => c !== preferred).sort((a, b) => toEUR(b, p.money[b]) - toEUR(a, p.money[a]))]
        .filter(Boolean);
    let remaining = eur;
    const parts = [];
    for (const c of order) {
        if (remaining <= 0.001) break;
        const available = toEUR(c, p.money[c]);
        if (available <= 0) continue;
        const takeEUR = Math.min(available, remaining);
        const amount = Math.min(p.money[c], Math.ceil(fromEUR(c, takeEUR)));
        p.money[c] -= amount;
        remaining -= takeEUR;
        parts.push(`${fmt(amount)} ${CURRENCIES[c].name}`);
    }
    return parts.join(' + ');
}

function unitPriceEUR(locId, n = 0) {
    const res = LOCATIONS[locId].resource;
    return RESOURCES[res].baseEUR * game.priceIndex[locId] * Math.pow(1 + CONFIG.demandPriceBump, n);
}

function priceLocal(locId, n = 0) {
    return Math.ceil(fromEUR(LOCATIONS[locId].currency, unitPriceEUR(locId, n)));
}

// Local currency first; any shortfall is paid in foreign currency with a surcharge.
function purchaseQuote(p, locId, qty) {
    const c = LOCATIONS[locId].currency;
    let totalLocal = 0;
    for (let i = 0; i < qty; i++) totalLocal += priceLocal(locId, i);
    const fromLocal = Math.min(p.money[c], totalLocal);
    const shortEUR = toEUR(c, totalLocal - fromLocal);
    const markup = game.roundMods.freeTrade ? 1 : CONFIG.foreignMarkup;
    const foreignEUR = shortEUR * markup;
    const otherEUR = FIAT.filter(x => x !== c).reduce((s, x) => s + toEUR(x, p.money[x]), 0);
    return { c, totalLocal, fromLocal, foreignEUR, affordable: otherEUR + 0.01 >= foreignEUR, usesForeign: foreignEUR > 0 };
}

function travelCostEUR(p, to) {
    const near = ADJACENCY[p.location].includes(to);
    let cost = near ? CONFIG.travelNearEUR : CONFIG.travelFarEUR;
    cost *= game.roundMods.travelMult || 1;
    if (p.resources.tech > 0) cost *= 0.7;
    if (p.resources.energy > 0) cost *= 0.8;
    return Math.round(cost);
}

function bunkerNeeds(p) {
    const need = {};
    let missing = 0;
    for (const [k, v] of Object.entries(CONFIG.bunkerRequirements)) {
        need[k] = Math.max(0, v - p.resources[k]);
        missing += need[k];
    }
    const wild = Math.min(p.resources.rare, missing);
    return { need, missing, missingAfterWild: missing - wild };
}

function pactBetween(a, b) {
    return game.pacts.find(x => ((x.a === a.id && x.b === b.id) || (x.a === b.id && x.b === a.id)) && x.until >= game.round);
}

function ownedBunker(p) {
    return BUNKER_ORDER.find(id => game.bunkers[id].owner === p.id) || null;
}

// ===== SETUP =====

function newGame(setup, length) {
    const range = { short: [8, 11], normal: [12, 16], long: [17, 22] }[length] || [12, 16];
    const rates = {};
    const history = {};
    for (const [c, v] of Object.entries(CURRENCIES)) {
        rates[c] = v.baseRate;
        history[c] = [v.baseRate];
    }
    const starts = shuffle([...CONTINENT_IDS]);
    const bunkerCount = Math.max(1, Math.floor(setup.length / 2));
    const bunkers = {};
    BUNKER_ORDER.forEach((id, i) => {
        bunkers[id] = { available: i < bunkerCount, owner: null, progress: 0, completed: false };
    });

    game = {
        round: 0,
        cur: 0,
        doomsdayRound: randInt(range[0], range[1]),
        rates,
        history,
        priceIndex: Object.fromEntries(CONTINENT_IDS.map(id => [id, 1])),
        cpi: 1,
        interest: CONFIG.loanInterest,
        roundMods: {},
        bunkers,
        crates: [],
        crateSeq: 0,
        pacts: [],
        lessons: [],
        recentCards: [],
        defcon: 5,
        busy: false,
        over: false,
        players: [],
    };

    game.players = setup.map((s, i) => {
        const loc = starts[i % starts.length];
        const c = LOCATIONS[loc].currency;
        const money = { usd: 0, eur: 0, peso: 0, ara: 0, crypto: 0 };
        money[c] = Math.round(CONFIG.startMoneyEUR / rates[c]);
        return {
            id: i,
            name: s.name,
            isBot: s.isBot,
            color: PLAYER_COLORS[i],
            location: loc,
            home: loc,
            money,
            resources: { military: 0, food: 0, tech: 0, energy: 0, rare: 0 },
            ap: CONFIG.actionsPerTurn,
            foodBoosts: 0,
            cryptoLock: 0,
            debt: 0,
            insurance: 0,
            record: 0,
            attackedThisTurn: false,
            stats: { fees: 0, interest: 0, bought: 0, stolen: 0, won: 0, lost: 0, worked: 0, smuggled: 0, caught: 0 },
        };
    });
}

async function startGame(setup, length) {
    newGame(setup, length);
    Sound.init();
    Sound.startDrone();
    Globe.setIdleSpin(false);
    Globe.setPlayers(game.players);
    Globe.setAvailability(BUNKER_ORDER.filter(id => game.bunkers[id].available));
    refreshBunkers();
    const nb = BUNKER_ORDER.filter(id => game.bunkers[id].available).length;
    log(`${game.players.length} Spieler kämpfen um ${nb} ${nb > 1 ? 'Bunkerplätze' : 'Bunkerplatz'}.`, 'info');
    news(`EILMELDUNG: Nur ${nb} Bunker für ${game.players.length} Menschen verfügbar!`);
    NEWS_FLAVOR.slice().sort(() => Math.random() - 0.5).slice(0, 4).forEach(news);
    for (let i = 0; i < 2; i++) spawnCrate(game);
    showHUD();
    await startRound();
}

// ===== ROUND / TURN FLOW =====

async function startRound() {
    game.round++;
    if (game.round > game.doomsdayRound) return endGame();

    game.roundMods = {};
    log(`RUNDE ${game.round}`, 'round');

    if (game.round > 1) {
        updateEconomy();
        applyInterestAndIncome();
        if (Math.random() < 0.4) spawnCrate(game);
        const card = drawCard();
        const target = card.pick ? card.pick(game) : null;
        const extra = card.apply(game, target);
        if (extra) log(extra, 'info');
        if (!game.lessons.includes(card.lesson)) game.lessons.push(card.lesson);
        log(`${card.icon} ${card.title}`, card.kind === 'good' ? 'good' : 'bad');
        news(`${card.title.toUpperCase()}: ${card.text(target)}`);
        render();
        await showEventCard(card, target);
    }
    pushHistory();
    updateDefcon();

    const ap = Math.max(1, CONFIG.actionsPerTurn + (game.roundMods.apDelta || 0));
    game.players.forEach(p => { p.ap = ap; });
    game.cur = 0;
    await startTurn();
}

async function startTurn() {
    const p = cp();
    p.foodBoosts = 0;
    p.attackedThisTurn = false;
    if (p.cryptoLock > 0) p.cryptoLock--;
    if (p.insurance > 0) p.insurance--;

    Globe.setActivePawn(p.id);
    Globe.focus(p.location);
    render();

    if (p.isBot) {
        game.busy = true;
        render();
        await sleep(600);
        await collectCrates(p);
        await runBot(p);
        game.busy = false;
        if (!game.over) endTurn();
        return;
    }

    if (game.players.filter(x => !x.isBot).length > 1) await showHandover(p);
    await collectCrates(p);
    render();
}

function endTurn() {
    if (game.over) return;
    closeModal();
    hideTooltip();
    game.cur++;
    if (game.cur >= game.players.length) {
        game.cur = 0;
        startRound();
    } else {
        startTurn();
    }
}

function updateEconomy() {
    game.cpi *= 1.03;
    for (const c of ['usd', 'peso', 'ara']) {
        const before = game.rates[c];
        const base = CURRENCIES[c].baseRate;
        let r = before * (1 + (Math.random() - 0.5) * 0.24);
        r += (base - r) * 0.08;
        game.rates[c] = Math.max(base * 0.35, Math.min(base * 2.5, r));
        const pct = (game.rates[c] / before - 1) * 100;
        if (Math.abs(pct) > 7) log(`${CURRENCIES[c].name} ${pct > 0 ? '▲' : '▼'} ${Math.abs(pct).toFixed(0)}%`, pct > 0 ? 'good' : 'bad');
    }
    const before = game.rates.crypto;
    game.rates.crypto = Math.max(15, Math.min(4000, before * (1 + (Math.random() - 0.48) * 0.7)));
    const move = (game.rates.crypto / before - 1) * 100;
    if (Math.abs(move) > 15) {
        const sign = move > 0 ? '+' : '';
        log(`BunkerCoin ${move > 0 ? '🚀' : '💥'} ${sign}${move.toFixed(0)}%`, move > 0 ? 'good' : 'bad');
        news(`BunkerCoin ${move > 0 ? 'explodiert' : 'crasht'}: ${sign}${move.toFixed(0)}%`);
    }
    for (const id of CONTINENT_IDS) {
        let idx = game.priceIndex[id];
        idx += (game.cpi - idx) * 0.2;
        idx *= 1 + (Math.random() - 0.5) * 0.2;
        game.priceIndex[id] = Math.max(0.3, Math.min(4, idx));
    }
}

function applyInterestAndIncome() {
    for (const p of game.players) {
        if (p.debt > 0) {
            const add = p.debt * game.interest;
            p.debt += add;
            p.stats.interest += add;
            if (p.debt >= CONFIG.seizureDebtEUR) seize(p);
        }
        payLocal(game, p, CONFIG.incomeEUR);
    }
    log(`Alle erhalten ${CONFIG.incomeEUR} EUR Einkommen (in lokaler Währung).`);
}

function seize(p) {
    const owned = Object.keys(p.resources).filter(k => p.resources[k] > 0)
        .sort((a, b) => RESOURCES[b].baseEUR - RESOURCES[a].baseEUR);
    if (!owned.length) {
        log(`🏦 Betreibung gegen ${p.name}: nichts zu pfänden!`, 'bad');
        return;
    }
    const k = owned[0];
    p.resources[k]--;
    p.debt = Math.max(0, p.debt - RESOURCES[k].baseEUR);
    log(`🏦 PFÄNDUNG! Die Bank nimmt ${p.name} 1 ${RESOURCES[k].name} weg (Schulden zu hoch).`, 'bad');
    news(`Betreibungsamt pfändet ${RESOURCES[k].name} bei ${p.name}`);
}

function pushHistory() {
    for (const c of Object.keys(CURRENCIES)) {
        game.history[c].push(game.rates[c]);
        if (game.history[c].length > 24) game.history[c].shift();
    }
}

function drawCard() {
    const pool = EVENT_CARDS.filter(c => !game.recentCards.includes(c.title));
    const card = rand(pool);
    game.recentCards.push(card.title);
    if (game.recentCards.length > 5) game.recentCards.shift();
    return card;
}

function updateDefcon() {
    const frac = game.round / game.doomsdayRound;
    const level = game.round >= game.doomsdayRound ? 1 : frac >= 0.78 ? 2 : frac >= 0.55 ? 3 : frac >= 0.3 ? 4 : 5;
    const dropped = level < game.defcon;
    game.defcon = level;
    const threat = (5 - level) / 4;
    Globe.setThreat(threat);
    Sound.setTension(threat);
    document.body.classList.toggle('threat-2', level === 2 || level === 3);
    document.body.classList.toggle('threat-3', level === 1);
    if (dropped) {
        Sound.play('siren');
        flash('red');
        Globe.shake(0.25);
        const msgs = {
            4: 'DEFCON 4: Geheimdienste melden erhöhte Aktivität.',
            3: 'DEFCON 3: Luftwaffe in Alarmbereitschaft!',
            2: 'DEFCON 2: Raketen werden betankt! Nächster Schritt: Krieg.',
            1: 'DEFCON 1: ANGRIFF STEHT UNMITTELBAR BEVOR! Letzte Runde!',
        };
        log(msgs[level], 'bad');
        news(msgs[level]);
        toast(msgs[level], 'bad');
        if (level <= 2) {
            const from = rand(CONTINENT_IDS);
            Globe.missileBetween(from, rand(CONTINENT_IDS.filter(x => x !== from)), '#ff3b3b');
        }
    }
    render();
}

// ===== CRATES =====

function spawnCrate(g) {
    const crate = { id: ++g.crateSeq, loc: rand(CONTINENT_IDS), dLat: (Math.random() - 0.5) * 10, dLon: (Math.random() - 0.5) * 16 };
    g.crates.push(crate);
    Globe.addCrate(crate);
    log(`💎 Rohstoff-Fund in ${LOCATIONS[crate.loc].name}! Wer zuerst dort ist, bekommt ihn.`, 'info');
}

async function collectCrates(p) {
    const here = game.crates.filter(c => c.loc === p.location);
    if (!here.length) return;
    game.crates = game.crates.filter(c => c.loc !== p.location);
    for (const c of here) {
        p.resources.rare++;
        Globe.removeCrate(c.id, p.color);
    }
    Sound.play('pickup');
    toast(`${p.name}: +${here.length} 💎 Rohstoff${here.length > 1 ? 'e' : ''}!`, 'good');
    log(`${p.name} sammelt ${here.length} Rohstoff-Fund${here.length > 1 ? 'e' : ''} ein (Joker für den Bunker).`, 'good');
    render();
    await sleep(400);
}

// ===== ACTIONS =====
// Every action returns true on success. `fail` shows feedback only for humans.

function fail(p, msg) {
    if (!p.isBot) {
        toast(msg, 'bad');
        Sound.play('error');
    }
    return false;
}

function spend(p, n = 1) {
    p.ap -= n;
    render();
}

function canAct(p, cost = 1) {
    if (game.over) return false;
    if (p.ap < cost) return fail(p, 'Keine Aktionspunkte mehr!');
    return true;
}

async function actTravel(p, to) {
    if (!canAct(p)) return false;
    if (to === p.location) return false;
    if (LOCATIONS[to].isBunker && !game.bunkers[to].available) return fail(p, 'Dieser Bunker ist gesperrt.');
    const cost = travelCostEUR(p, to);
    const paid = payEUR(p, cost, localCurrency(p));
    if (!paid) return fail(p, `Reise kostet ${cost} EUR – zu wenig Geld!`);

    const from = p.location;
    p.location = to;
    spend(p);
    log(`✈️ ${p.name}: ${LOCATIONS[from].name} → ${LOCATIONS[to].name} (${paid})`);
    game.busy = true;
    render();
    await Globe.travel(p, from, to, game.players);
    game.busy = p.isBot;
    await collectCrates(p);
    render();
    return true;
}

function actBuy(p, qty) {
    if (!canAct(p)) return false;
    const loc = LOCATIONS[p.location];
    if (loc.isBunker) return fail(p, 'Hier gibt es keinen Markt.');
    if (game.roundMods.embargo === p.location) return fail(p, `Embargo! In ${loc.name} darf diese Runde niemand handeln.`);
    const q = purchaseQuote(p, p.location, qty);
    if (!q.affordable) return fail(p, 'Nicht genug Geld!');

    p.money[q.c] -= q.fromLocal;
    let paid = q.fromLocal > 0 ? `${fmt(q.fromLocal)} ${CURRENCIES[q.c].name}` : '';
    if (q.usesForeign) {
        const other = payEUR(p, q.foreignEUR, FIAT.find(x => x !== q.c && p.money[x] > 0));
        paid += (paid ? ' + ' : '') + other + (game.roundMods.freeTrade ? '' : ' (Fremdwährung +30%)');
        p.stats.fees += q.foreignEUR - q.foreignEUR / (game.roundMods.freeTrade ? 1 : CONFIG.foreignMarkup);
    }
    p.resources[loc.resource] += qty;
    p.stats.bought += qty;
    game.priceIndex[p.location] *= Math.pow(1 + CONFIG.demandPriceBump, qty);
    spend(p);
    Sound.play('cash');
    const r = RESOURCES[loc.resource];
    toast(`+${qty} ${r.icon} ${r.name}`, 'good');
    log(`🛒 ${p.name} kauft ${qty}× ${r.name} für ${paid}. Preis steigt (Nachfrage)!`);
    return true;
}

function actSell(p, res) {
    if (!canAct(p)) return false;
    const loc = LOCATIONS[p.location];
    if (loc.isBunker) return fail(p, 'Hier gibt es keinen Markt.');
    if (p.resources[res] < 1) return fail(p, 'Davon hast du nichts.');
    const source = CONTINENT_IDS.find(id => LOCATIONS[id].resource === res);
    const eur = RESOURCES[res].baseEUR * (source ? game.priceIndex[source] : game.cpi) * 0.65;
    p.resources[res]--;
    const { c, amount } = payLocal(game, p, eur);
    spend(p);
    Sound.play('coin');
    toast(`+${fmt(amount)} ${CURRENCIES[c].name}`, 'good');
    log(`💱 ${p.name} verkauft 1 ${RESOURCES[res].name} für ${fmt(amount)} ${CURRENCIES[c].name}.`);
    return true;
}

async function actSmuggle(p, res) {
    if (!canAct(p)) return false;
    const loc = LOCATIONS[p.location];
    if (loc.isBunker) return fail(p, 'Hier gibt es keinen Schwarzmarkt.');
    const source = CONTINENT_IDS.find(id => LOCATIONS[id].resource === res);
    const eur = unitPriceEUR(source) * CONFIG.blackMarketMarkup;
    const paid = payEUR(p, eur, localCurrency(p));
    if (!paid) return fail(p, 'Nicht genug Geld für den Schwarzmarkt!');
    spend(p);
    p.stats.smuggled++;
    const chance = CONFIG.blackMarketCatchChance + p.record * 0.1;
    if (Math.random() < chance) {
        p.record++;
        p.stats.caught++;
        const fineEUR = 150 + p.record * 50;
        const fine = payEUR(p, Math.min(fineEUR, fiatEUR(p)), localCurrency(p)) || '0';
        p.ap = 0;
        Sound.play('police');
        flash('red');
        toast('🚨 ERWISCHT! Ware beschlagnahmt, Busse + Verhör!', 'bad');
        log(`🚨 ${p.name} wird beim Schmuggel erwischt! Ware beschlagnahmt, Busse ${fine}, Vorstrafe #${p.record}. Zug beendet.`, 'bad');
        news(`Polizei hebt Schmugglerring aus – ${p.name} verhaftet`);
        render();
        return true;
    }
    p.resources[res]++;
    Sound.play('cash');
    toast(`🕶️ +1 ${RESOURCES[res].icon} ${RESOURCES[res].name} (Schwarzmarkt)`, 'good');
    log(`🕶️ ${p.name} kauft 1 ${RESOURCES[res].name} auf dem Schwarzmarkt (${paid}).`);
    return true;
}

function actWork(p) {
    if (!canAct(p)) return false;
    const loc = LOCATIONS[p.location];
    if (loc.isBunker) return fail(p, 'Im Bunker gibt es keine Arbeit.');
    const mult = game.roundMods.doubleWage === p.location ? 2 : 1;
    const { c, amount } = payLocal(game, p, CONFIG.workEUR * mult);
    p.stats.worked++;
    spend(p);
    Sound.play('coin');
    toast(`👷 +${fmt(amount)} ${CURRENCIES[c].name}`, 'good');
    log(`👷 ${p.name} arbeitet in ${loc.name} und verdient ${fmt(amount)} ${CURRENCIES[c].name}.`);
    return true;
}

function bankBlocked(p, exchange = false) {
    if (game.roundMods.bankClosed) return 'Cyberangriff: Banken sind diese Runde geschlossen!';
    if (exchange && p.cryptoLock > 0) return 'Krypto-Sperrfrist aktiv: Geldwechsel erst in einem späteren Zug wieder möglich.';
    return null;
}

function exchangeQuote(from, to, amount) {
    const fee = game.roundMods.freeTrade ? 0 : CONFIG.exchangeFee;
    const gross = fromEUR(to, toEUR(from, amount));
    return { received: Math.floor(gross * (1 - fee)), feeEUR: toEUR(from, amount) * fee };
}

function actExchange(p, from, to, amount) {
    if (!canAct(p)) return false;
    const blocked = bankBlocked(p, true);
    if (blocked) return fail(p, blocked);
    amount = Math.floor(amount);
    if (from === to || !(amount > 0)) return fail(p, 'Ungültiger Tausch.');
    if (p.money[from] < amount) return fail(p, `Nicht genug ${CURRENCIES[from].name}.`);
    const q = exchangeQuote(from, to, amount);
    p.money[from] -= amount;
    p.money[to] += q.received;
    p.stats.fees += q.feeEUR;
    spend(p);
    Sound.play('coin');
    toast(`🏦 ${fmt(amount)} ${CURRENCIES[from].name} → ${fmt(q.received)} ${CURRENCIES[to].name}`, 'info');
    log(`🏦 ${p.name} wechselt ${fmt(amount)} ${CURRENCIES[from].name} in ${fmt(q.received)} ${CURRENCIES[to].name}.`);
    return true;
}

function actLoan(p) {
    if (!canAct(p)) return false;
    const blocked = bankBlocked(p);
    if (blocked) return fail(p, blocked);
    if (p.debt + CONFIG.loanAmountEUR > CONFIG.seizureDebtEUR) return fail(p, 'Die Bank gibt dir keinen Kredit mehr (Kreditlimit).');
    const { c, amount } = payLocal(game, p, CONFIG.loanAmountEUR);
    p.debt += CONFIG.loanAmountEUR;
    spend(p);
    Sound.play('cash');
    toast(`💳 Kredit: +${fmt(amount)} ${CURRENCIES[c].name}`, 'info');
    log(`💳 ${p.name} nimmt einen Kredit über ${CONFIG.loanAmountEUR} EUR auf (${Math.round(game.interest * 100)}% Zins pro Runde).`, 'info');
    return true;
}

function actRepay(p) {
    if (!canAct(p)) return false;
    const blocked = bankBlocked(p);
    if (blocked) return fail(p, blocked);
    if (p.debt <= 0) return fail(p, 'Du hast keine Schulden.');
    const amount = Math.min(p.debt, fiatEUR(p));
    if (amount < 1) return fail(p, 'Kein Geld zum Zurückzahlen.');
    const paid = payEUR(p, amount, localCurrency(p));
    p.debt = Math.max(0, p.debt - amount);
    if (p.debt < 1) p.debt = 0;
    spend(p);
    Sound.play('coin');
    toast(p.debt === 0 ? '✅ Schuldenfrei!' : `Noch ${fmt(p.debt)} EUR Schulden`, 'good');
    log(`💳 ${p.name} zahlt ${paid} zurück. ${p.debt === 0 ? 'Schuldenfrei!' : `Restschuld: ${fmt(p.debt)} EUR`}`);
    return true;
}

function actInsure(p) {
    if (!canAct(p)) return false;
    const blocked = bankBlocked(p);
    if (blocked) return fail(p, blocked);
    const paid = payEUR(p, CONFIG.insuranceEUR, localCurrency(p));
    if (!paid) return fail(p, 'Zu wenig Geld für die Prämie.');
    p.insurance = CONFIG.insuranceTurns + 1;
    p.stats.fees += CONFIG.insuranceEUR;
    spend(p);
    Sound.play('coin');
    toast('🛡️ Versichert gegen Raub!', 'good');
    log(`🛡️ ${p.name} schliesst eine Versicherung ab (${paid}).`);
    return true;
}

function actCrypto(p, mode, coins) {
    if (!canAct(p)) return false;
    const blocked = bankBlocked(p);
    if (blocked) return fail(p, blocked);
    coins = Math.floor(coins);
    if (!(coins > 0)) return fail(p, 'Ungültige Menge.');
    const eur = toEUR('crypto', coins);
    if (mode === 'buy') {
        const paid = payEUR(p, eur * (1 + CONFIG.exchangeFee), 'eur');
        if (!paid) return fail(p, 'Nicht genug Geld!');
        p.money.crypto += coins;
        p.stats.fees += eur * CONFIG.exchangeFee;
        log(`₿ ${p.name} kauft ${coins} BunkerCoin für ${paid}. Sperrfrist ${CONFIG.cryptoLockTurns} Züge!`, 'info');
        toast(`₿ +${coins} BunkerCoin`, 'info');
    } else {
        if (p.money.crypto < coins) return fail(p, 'So viele Coins hast du nicht.');
        p.money.crypto -= coins;
        const got = Math.floor(fromEUR('eur', eur * (1 - CONFIG.exchangeFee)));
        p.money.eur += got;
        log(`₿ ${p.name} verkauft ${coins} BunkerCoin für ${fmt(got)} EUR. Sperrfrist ${CONFIG.cryptoLockTurns} Züge!`, 'info');
        toast(`₿ → +${fmt(got)} EUR`, 'good');
    }
    p.cryptoLock = CONFIG.cryptoLockTurns + 1;
    spend(p);
    Sound.play('cash');
    return true;
}

function actEat(p) {
    if (game.over) return false;
    if (p.resources.food < 1) return fail(p, 'Keine Lebensmittel!');
    if (p.foodBoosts >= CONFIG.maxFoodBoostsPerTurn) return fail(p, 'Du bist satt (max. 2× pro Zug).');
    p.resources.food--;
    p.foodBoosts++;
    p.ap++;
    Sound.play('pickup');
    toast('🌽 Nachtschicht! +1 Aktionspunkt', 'good');
    log(`🌽 ${p.name} isst 1 Lebensmittel und schiebt eine Nachtschicht (+1 AP).`);
    render();
    return true;
}

async function breachPact(p, target) {
    const pact = pactBetween(p, target);
    if (!pact) return;
    game.pacts = game.pacts.filter(x => x !== pact);
    const eur = Math.min(CONFIG.pactPenaltyEUR, fiatEUR(p));
    if (eur > 0) payEUR(p, eur, localCurrency(p));
    target.money.eur += Math.floor(eur);
    p.record++;
    Sound.play('police');
    log(`⚖️ VERTRAGSBRUCH! ${p.name} bricht den Nichtangriffspakt und zahlt ${fmt(eur)} EUR Konventionalstrafe an ${target.name}.`, 'bad');
    news(`Skandal: ${p.name} bricht Nichtangriffspakt mit ${target.name}!`);
    toast('⚖️ Vertragsbruch! Konventionalstrafe fällig.', 'bad');
}

function attackAllowed(p) {
    if (game.roundMods.noAttacks) return fail(p, 'UNO-Waffenruhe: Diese Runde keine Angriffe!');
    if (p.resources.military < 1) return fail(p, 'Du brauchst mindestens 1 Militär zum Angreifen.');
    if (p.attackedThisTurn) return fail(p, 'Nur ein Angriff pro Zug.');
    return true;
}

async function actAttack(p, target) {
    if (!canAct(p) || !attackAllowed(p)) return false;
    if (target.location !== p.location) return fail(p, 'Ziel ist nicht hier.');
    await breachPact(p, target);
    spend(p);
    p.attackedThisTurn = true;
    game.busy = true;

    const inOwnBunker = ownedBunker(target) === target.location && game.bunkers[target.location].completed;
    const a = randInt(1, 6);
    const d = randInt(1, 6);
    const aBonus = p.resources.military;
    const dBonus = target.resources.military + (inOwnBunker ? 2 : 0);
    const win = a + aBonus > d + dBonus;
    const tie = a + aBonus === d + dBonus;

    Globe.explosion(p.location, false);
    await showDice(`${p.name} greift ${target.name} an!`,
        { name: p.name, color: p.color, roll: a, bonus: aBonus, label: 'Militär' },
        { name: target.name, color: target.color, roll: d, bonus: dBonus, label: inOwnBunker ? 'Militär +2 Bunker' : 'Militär' },
        win ? `${p.name} gewinnt!` : tie ? 'Patt – beide ziehen sich zurück' : `${target.name} wehrt ab!`, win ? 'win' : tie ? '' : 'lose');

    if (win) {
        p.stats.won++;
        const loot = Object.keys(target.resources).filter(k => target.resources[k] > 0);
        const n = a + aBonus - (d + dBonus) >= 4 ? 2 : 1;
        const taken = [];
        for (let i = 0; i < n && loot.length; i++) {
            const k = rand(loot.filter(x => target.resources[x] > 0));
            if (!k) break;
            target.resources[k]--;
            p.resources[k]++;
            taken.push(RESOURCES[k].name);
            if (target.insurance > 0) {
                target.resources[k]++;
                log(`🛡️ Versicherung ersetzt ${target.name} 1 ${RESOURCES[k].name}.`, 'good');
            }
        }
        if (taken.length) {
            p.stats.stolen += taken.length;
            log(`⚔️ ${p.name} besiegt ${target.name} und erbeutet ${taken.join(' + ')}!`, 'good');
        } else {
            const c = FIAT.slice().sort((x, y) => toEUR(y, target.money[y]) - toEUR(x, target.money[x]))[0];
            const amount = Math.floor(target.money[c] * 0.3);
            target.money[c] -= amount;
            p.money[c] += amount;
            log(`⚔️ ${p.name} besiegt ${target.name} und plündert ${fmt(amount)} ${CURRENCIES[c].name}!`, 'good');
        }
        Sound.play('win');
    } else if (!tie) {
        p.stats.lost++;
        p.resources.military = Math.max(0, p.resources.military - 1);
        log(`🛡️ ${target.name} wehrt ${p.name} ab! ${p.name} verliert 1 Militär.`, 'bad');
        Sound.play('lose');
    } else {
        log(`⚔️ Patt zwischen ${p.name} und ${target.name}.`);
    }
    game.busy = p.isBot;
    render();
    return true;
}

async function actRaidBunker(p) {
    if (!canAct(p) || !attackAllowed(p)) return false;
    const id = p.location;
    const b = game.bunkers[id];
    if (!LOCATIONS[id].isBunker || b.owner === null || b.owner === p.id) return fail(p, 'Hier gibt es keinen fremden Bunker.');
    const mine = ownedBunker(p);
    if (b.completed && mine) return fail(p, 'Du hast schon einen Bunker – eine Übernahme ist nicht erlaubt.');
    const owner = game.players[b.owner];
    await breachPact(p, owner);
    spend(p);
    p.attackedThisTurn = true;
    game.busy = true;

    const present = owner.location === id;
    const a = randInt(1, 6);
    const d = randInt(1, 6);
    const aBonus = p.resources.military;
    const dBonus = (b.completed ? 3 : 1) + (present ? owner.resources.military : 0);
    const win = a + aBonus > d + dBonus;
    const title = b.completed ? `${p.name} stürmt den Bunker von ${owner.name}!` : `${p.name} sabotiert die Baustelle von ${owner.name}!`;

    Globe.explosion(id, false);
    await showDice(title,
        { name: p.name, color: p.color, roll: a, bonus: aBonus, label: 'Militär' },
        { name: `Bunker ${owner.name}`, color: owner.color, roll: d, bonus: dBonus, label: present ? 'Mauern + Besitzer-Militär' : 'Bunkermauern' },
        win ? (b.completed ? 'BUNKER ÜBERNOMMEN!' : 'SABOTAGE GELUNGEN!') : 'Angriff abgewehrt!', win ? 'win' : 'lose');

    if (win) {
        if (b.completed) {
            b.owner = p.id;
            if (present) {
                owner.location = rand(ADJACENCY[id]);
                Globe.layoutPawns(game.players);
            }
            log(`🏴 ${p.name} übernimmt den Bunker in ${LOCATIONS[id].name}! ${owner.name} ist obdachlos.`, 'bad');
            news(`Bunker-Putsch in ${LOCATIONS[id].name}: ${p.name} vertreibt ${owner.name}!`);
        } else {
            b.progress--;
            if (b.progress <= 0) {
                b.owner = null;
                b.progress = 0;
                log(`💣 ${p.name} zerstört die Baustelle von ${owner.name} komplett! Der Bunker ist wieder frei.`, 'bad');
            } else {
                log(`💣 ${p.name} sabotiert den Bunkerbau von ${owner.name} (Fortschritt −1).`, 'bad');
            }
        }
        p.stats.won++;
        Sound.play('win');
        Globe.explosion(id, true);
    } else {
        p.resources.military = Math.max(0, p.resources.military - 1);
        p.stats.lost++;
        log(`🛡️ Der Bunker von ${owner.name} hält stand. ${p.name} verliert 1 Militär.`, 'bad');
        Sound.play('lose');
    }
    refreshBunkers();
    game.busy = p.isBot;
    render();
    return true;
}

async function actBuild(p) {
    if (!canAct(p)) return false;
    const id = p.location;
    const loc = LOCATIONS[id];
    if (!loc.isBunker) return fail(p, 'Bunker kann man nur an Bunker-Standorten bauen.');
    const b = game.bunkers[id];
    if (!b.available) return fail(p, 'Dieser Standort ist gesperrt.');
    if (b.owner !== null && b.owner !== p.id) return fail(p, `Dieser Bunker gehört ${game.players[b.owner].name}. Nur ein Angriff hilft...`);
    if (b.completed) return fail(p, 'Dein Bunker ist fertig! Bleib hier und warte.');
    const mine = ownedBunker(p);
    if (mine && mine !== id) return fail(p, `Du baust schon in ${LOCATIONS[mine].name}.`);

    if (b.owner === null) {
        const { need, missingAfterWild } = bunkerNeeds(p);
        if (missingAfterWild > 0) {
            const txt = Object.entries(need).filter(([, v]) => v > 0).map(([k, v]) => `${v} ${RESOURCES[k].name}`).join(', ');
            return fail(p, `Es fehlen: ${txt} (Rohstoffe zählen als Joker)`);
        }
        for (const [k, v] of Object.entries(CONFIG.bunkerRequirements)) {
            const fromOwn = Math.min(v, p.resources[k]);
            p.resources[k] -= fromOwn;
            p.resources.rare -= v - fromOwn;
        }
        b.owner = p.id;
        b.progress = 0;
        log(`🛖 ${p.name} beginnt mit dem Bau des Bunkers in ${loc.name}!`, 'info');
        news(`${p.name} gräbt in ${loc.name} – Nachbarn beunruhigt`);
    }

    b.progress++;
    spend(p);
    Sound.play('build');
    Globe.ring(id, p.color, 1);
    if (b.progress >= CONFIG.bunkerBuildSteps) {
        b.completed = true;
        Sound.play('win');
        flash();
        toast(`🛖 ${p.name}: BUNKER FERTIG!`, 'good');
        log(`✅ ${p.name} hat den Bunker in ${loc.name} fertiggestellt! Jetzt nur noch hier bleiben...`, 'good');
        news(`${p.name} vollendet Bunker in ${loc.name}!`);
    } else {
        toast(`🛖 Baufortschritt ${b.progress}/${CONFIG.bunkerBuildSteps}`, 'info');
        log(`🛖 ${p.name} baut weiter (${b.progress}/${CONFIG.bunkerBuildSteps}).`);
    }
    refreshBunkers();
    render();
    return true;
}

function describeAsset(x) {
    if (x.kind === 'res') return `${x.amount}× ${RESOURCES[x.key].icon} ${RESOURCES[x.key].name}`;
    return `${fmt(x.amount)} ${CURRENCIES[x.key].name}`;
}

function holds(p, x) {
    return x.kind === 'res' ? p.resources[x.key] >= x.amount : p.money[x.key] >= x.amount;
}

function transfer(from, to, x) {
    const bag = x.kind === 'res' ? 'resources' : 'money';
    from[bag][x.key] -= x.amount;
    to[bag][x.key] += x.amount;
}

async function actContract(p, target, offer) {
    if (game.over) return false;
    if (offer.type === 'trade') {
        if (!(offer.give.amount > 0) || !(offer.get.amount > 0)) return fail(p, 'Bitte Mengen angeben.');
        if (!holds(p, offer.give)) return fail(p, 'Du besitzt nicht, was du anbietest.');
        if (!holds(target, offer.get)) return fail(p, `${target.name} besitzt das nicht.`);
    } else if (pactBetween(p, target)) {
        return fail(p, 'Ihr habt bereits einen Pakt.');
    }

    const text = offer.type === 'trade'
        ? `${p.name} gibt dir <b>${describeAsset(offer.give)}</b> und will dafür <b>${describeAsset(offer.get)}</b>.`
        : `${p.name} bietet einen <b>Nichtangriffspakt</b> für 3 Runden an. Wer ihn bricht, zahlt ${CONFIG.pactPenaltyEUR} EUR Konventionalstrafe.`;

    const accepted = target.isBot ? botAcceptsContract(target, p, offer) : await askContract(target, text);
    if (!accepted) {
        toast(`${target.name} lehnt ab.`, 'bad');
        log(`📜 ${target.name} lehnt den Vertrag von ${p.name} ab.`);
        return false;
    }
    if (offer.type === 'trade') {
        transfer(p, target, offer.give);
        transfer(target, p, offer.get);
        log(`📜 Vertrag: ${p.name} ⇄ ${target.name}: ${describeAsset(offer.give)} gegen ${describeAsset(offer.get)}.`, 'good');
    } else {
        game.pacts.push({ a: p.id, b: target.id, until: game.round + 3 });
        log(`🤝 ${p.name} und ${target.name} schliessen einen Nichtangriffspakt (bis Runde ${game.round + 3}).`, 'good');
        news(`${p.name} und ${target.name} unterzeichnen Nichtangriffspakt`);
    }
    Sound.play('win');
    toast('📜 Vertrag angenommen!', 'good');
    render();
    return true;
}

function refreshBunkers() {
    for (const id of BUNKER_ORDER) {
        const b = game.bunkers[id];
        if (!b.available) continue;
        if (b.owner === null) Globe.setBunkerState(id, 'free', null, 'Frei');
        else {
            const o = game.players[b.owner];
            Globe.setBunkerState(id, b.completed ? 'done' : 'building', o.color,
                b.completed ? `✔ ${o.name}` : `${o.name} ${b.progress}/${CONFIG.bunkerBuildSteps}`);
        }
    }
}

// ===== END =====

function fateOf(p) {
    const id = ownedBunker(p);
    if (!id) return { alive: false, why: 'Hatte keinen Bunker.' };
    const b = game.bunkers[id];
    if (!b.completed) return { alive: false, why: `Bunker in ${LOCATIONS[id].name} war nicht fertig.` };
    if (p.location !== id) return { alive: false, why: `Bunker fertig – aber ${p.name} war in ${LOCATIONS[p.location].name}!` };
    if (p.debt > 0) return { alive: false, why: `Die Bank hat den Bunker gepfändet (${fmt(p.debt)} EUR Schulden).`, seized: true };
    return { alive: true, why: `Überlebt im Bunker ${LOCATIONS[id].name}.`, bunker: id };
}

async function endGame() {
    game.over = true;
    game.busy = true;
    closeModal();
    hideTooltip();
    const fates = game.players.map(p => ({ p, ...fateOf(p) }));
    const protectedIds = fates.filter(f => f.alive).map(f => f.bunker);

    Sound.play('siren');
    Globe.setThreat(1);
    $('nuke-alert').classList.add('active');
    await sleep(2600);
    $('nuke-alert').classList.remove('active');
    document.body.classList.add('apocalypse');
    Sound.stopDrone();
    await Globe.apocalypse(protectedIds);
    await sleep(800);
    Sound.play('explosion', true);
    $('flash').className = 'white-out';
    await sleep(1400);
    showEndScreen(fates);
}

// ===== BOOT =====

window.addEventListener('DOMContentLoaded', () => {
    Globe.init($('globe'), { onClick: onGlobeClick, onHover: onGlobeHover });
    initUI();
});
