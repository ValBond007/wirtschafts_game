// ===== CONFIGURATION =====
const CONFIG = {
    actionsPerTurn: 3,
    startMoney: 500,
    minRounds: 15,
    maxRounds: 25,
    travelCostNear: 80,
    travelCostFar: 160,
    baseResourcePrice: 120,
    bunkerRequirements: { food: 3, tech: 3, energy: 3, military: 2 },
    bunkerBuildTurns: 2,
    cryptoLockTurns: 2,
    exchangeFee: 0.05,
    inflationRange: 0.15,
};

const LOCATIONS = {
    nordamerika: {
        name: 'Nordamerika', currency: 'usd', resource: 'military',
        resourceName: 'Militär', icon: '🇺🇸', color: '#3b82f6',
        x: 160, y: 120
    },
    europa: {
        name: 'Europa', currency: 'eur', resource: 'tech',
        resourceName: 'Technik', icon: '🇪🇺', color: '#f59e0b',
        x: 460, y: 100
    },
    suedamerika: {
        name: 'Südamerika', currency: 'peso', resource: 'food',
        resourceName: 'Lebensmittel', icon: '🇧🇷', color: '#22c55e',
        x: 180, y: 300
    },
    afrika: {
        name: 'Afrika', currency: 'ara', resource: 'energy',
        resourceName: 'Energie', icon: '🇿🇦', color: '#ef4444',
        x: 500, y: 280
    },
    alpen: {
        name: 'Südl. Alpen', isBunker: true, icon: '⛑',
        color: '#8b5cf6', x: 420, y: 200
    },
    neuseeland: {
        name: 'Neuseeland', isBunker: true, icon: '⛑',
        color: '#8b5cf6', x: 620, y: 380
    }
};

const ADJACENCY = {
    nordamerika: ['suedamerika', 'europa'],
    europa: ['nordamerika', 'afrika', 'alpen'],
    suedamerika: ['nordamerika', 'afrika', 'neuseeland'],
    afrika: ['europa', 'suedamerika', 'alpen', 'neuseeland'],
    alpen: ['europa', 'afrika'],
    neuseeland: ['suedamerika', 'afrika']
};

const CURRENCIES = {
    usd: { name: 'USD', baseRate: 0.92 },
    eur: { name: 'EUR', baseRate: 1.0 },
    peso: { name: 'Peso', baseRate: 0.0055 },
    ara: { name: 'ARA', baseRate: 0.053 },
    crypto: { name: 'Crypto', baseRate: 2.5 }
};

const PLAYER_COLORS = ['#3b82f6', '#ef4444', '#22c55e', '#f59e0b'];
const START_LOCATIONS = ['nordamerika', 'europa', 'suedamerika', 'afrika'];

// ===== GAME STATE =====
let game = null;

function createGameState(playerCount, playerNames) {
    const doomsday = CONFIG.minRounds + Math.floor(Math.random() * (CONFIG.maxRounds - CONFIG.minRounds + 1));
    const bunkerCount = Math.floor(playerCount / 2);

    const players = [];
    const shuffledStarts = [...START_LOCATIONS].sort(() => Math.random() - 0.5);

    for (let i = 0; i < playerCount; i++) {
        const startLoc = shuffledStarts[i];
        const startCurrency = LOCATIONS[startLoc].currency;
        const money = { usd: 0, eur: 0, peso: 0, ara: 0, crypto: 0 };
        money[startCurrency] = CONFIG.startMoney;

        players.push({
            id: i,
            name: playerNames[i] || `Spieler ${i + 1}`,
            location: startLoc,
            money: money,
            resources: { military: 0, food: 0, tech: 0, energy: 0 },
            bunkerLocation: null,
            bunkerProgress: 0,
            cryptoLocked: false,
            cryptoLockTurns: 0,
            actionPoints: CONFIG.actionsPerTurn,
            color: PLAYER_COLORS[i]
        });
    }

    const exchangeRates = {};
    for (const [key, val] of Object.entries(CURRENCIES)) {
        exchangeRates[key] = val.baseRate;
    }

    const resourcePrices = {};
    for (const [key, loc] of Object.entries(LOCATIONS)) {
        if (!loc.isBunker) {
            resourcePrices[key] = CONFIG.baseResourcePrice;
        }
    }

    const availableBunkers = ['alpen'];
    if (bunkerCount >= 2) availableBunkers.push('neuseeland');

    return {
        players,
        currentPlayerIndex: 0,
        round: 1,
        doomsdayRound: doomsday,
        phase: 'playing',
        exchangeRates,
        resourcePrices,
        bunkers: {
            alpen: { available: availableBunkers.includes('alpen'), owner: null, completed: false },
            neuseeland: { available: availableBunkers.includes('neuseeland'), owner: null, completed: false }
        },
        events: []
    };
}

// ===== SCREEN MANAGEMENT =====

function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

function showSetup() {
    showScreen('setup-screen');
}

let setupPlayerCount = 2;

function setPlayerCount(n) {
    setupPlayerCount = n;
    document.querySelectorAll('.btn-count').forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');

    const container = document.getElementById('player-names');
    container.innerHTML = '<label>Spielernamen:</label>';
    for (let i = 0; i < n; i++) {
        const input = document.createElement('input');
        input.type = 'text';
        input.id = `name-${i}`;
        input.placeholder = `Spieler ${i + 1}`;
        input.maxLength = 15;
        container.appendChild(input);
    }
}

function startGame() {
    const names = [];
    for (let i = 0; i < setupPlayerCount; i++) {
        const input = document.getElementById(`name-${i}`);
        names.push(input.value.trim() || `Spieler ${i + 1}`);
    }

    game = createGameState(setupPlayerCount, names);
    showScreen('game-screen');
    addEvent(`Spiel gestartet! ${game.players.length} Spieler, ${game.bunkers.alpen.available && game.bunkers.neuseeland.available ? 2 : 1} Bunker verfügbar.`, 'important');
    addEvent(`Der Atomkrieg droht... sammelt Ressourcen und sichert euch einen Bunkerplatz!`, 'danger');
    renderAll();
}

// ===== CURRENT PLAYER HELPERS =====

function currentPlayer() {
    return game.players[game.currentPlayerIndex];
}

function useAction() {
    currentPlayer().actionPoints--;
    renderAll();
}

function canAct() {
    return currentPlayer().actionPoints > 0;
}

// ===== TRAVEL =====

function openTravelModal() {
    if (!canAct()) return;

    const player = currentPlayer();
    const adjacent = ADJACENCY[player.location] || [];
    let html = '';

    for (const [locId, loc] of Object.entries(LOCATIONS)) {
        if (locId === player.location) continue;
        if (loc.isBunker && !game.bunkers[locId].available) continue;

        const isNear = adjacent.includes(locId);
        const cost = isNear ? CONFIG.travelCostNear : CONFIG.travelCostFar;

        const playerCurrencies = Object.entries(player.money).filter(([c, amt]) => c !== 'crypto' && amt > 0);
        const canAfford = playerCurrencies.some(([c, amt]) => {
            const costInCurrency = convertCurrency(cost, 'eur', c);
            return amt >= costInCurrency;
        });

        html += `<button class="modal-option" ${canAfford ? '' : 'disabled'} onclick="travel('${locId}')">
            <span class="option-title">${loc.icon || '⛑'} ${loc.name}</span>
            <span class="option-desc">${isNear ? 'Nahe' : 'Weit'} — Kosten: ~${cost} EUR ${!canAfford ? '(nicht genug Geld)' : ''}</span>
        </button>`;
    }

    showModal('Wohin reisen?', html);
}

function travel(destination) {
    const player = currentPlayer();
    const adjacent = ADJACENCY[player.location] || [];
    const isNear = adjacent.includes(destination);
    const costEUR = isNear ? CONFIG.travelCostNear : CONFIG.travelCostFar;

    const hasTech = player.resources.tech > 0;
    const actualCostEUR = hasTech ? Math.floor(costEUR * 0.7) : costEUR;

    const payableCurrencies = Object.entries(player.money)
        .filter(([c, amt]) => c !== 'crypto' && amt > 0)
        .map(([c, amt]) => {
            const costInC = convertCurrency(actualCostEUR, 'eur', c);
            return { currency: c, cost: costInC, canAfford: amt >= costInC };
        })
        .filter(x => x.canAfford);

    if (payableCurrencies.length === 0) {
        addEvent(`${player.name} kann sich die Reise nicht leisten!`, 'danger');
        closeModal();
        return;
    }

    const pay = payableCurrencies[0];
    player.money[pay.currency] -= Math.ceil(pay.cost);
    player.location = destination;

    const loc = LOCATIONS[destination];
    addEvent(`${player.name} reist nach ${loc.name} (${Math.ceil(pay.cost)} ${CURRENCIES[pay.currency].name})${hasTech ? ' [Technik-Bonus: -30%]' : ''}`);
    useAction();
    closeModal();
}

// ===== BUY RESOURCE =====

function buyResource() {
    if (!canAct()) return;

    const player = currentPlayer();
    const loc = LOCATIONS[player.location];

    if (loc.isBunker) {
        addEvent('An Bunkerstandorten gibt es keine Ressourcen zu kaufen.', 'danger');
        return;
    }

    const localCurrency = loc.currency;
    const price = game.resourcePrices[player.location];
    const resourceKey = loc.resource;

    if (player.money[localCurrency] < price) {
        const foreignOption = Object.entries(player.money)
            .filter(([c, amt]) => c !== localCurrency && c !== 'crypto')
            .find(([c, amt]) => {
                const foreignPrice = convertCurrency(price, localCurrency, c);
                return amt >= foreignPrice * 1.3;
            });

        if (foreignOption) {
            const [c, amt] = foreignOption;
            const foreignPrice = Math.ceil(convertCurrency(price, localCurrency, c) * 1.3);
            if (confirm(`Nicht genug ${CURRENCIES[localCurrency].name}. Mit Fremdwährung kaufen?\n${foreignPrice} ${CURRENCIES[c].name} (30% Aufschlag)`)) {
                player.money[c] -= foreignPrice;
                player.resources[resourceKey]++;
                addEvent(`${player.name} kauft ${loc.resourceName} mit Fremdwährung (${foreignPrice} ${CURRENCIES[c].name})`, 'important');
                useAction();
                return;
            }
        } else {
            addEvent(`Nicht genug ${CURRENCIES[localCurrency].name}! (Preis: ${price})`, 'danger');
        }
        return;
    }

    player.money[localCurrency] -= price;
    player.resources[resourceKey]++;
    addEvent(`${player.name} kauft ${loc.resourceName} in ${loc.name} für ${price} ${CURRENCIES[localCurrency].name}`);
    useAction();
}

// ===== CURRENCY EXCHANGE =====

function convertCurrency(amount, from, to) {
    const fromRate = game.exchangeRates[from];
    const toRate = game.exchangeRates[to];
    return (amount * fromRate) / toRate;
}

function openExchangeModal() {
    if (!canAct()) return;

    const player = currentPlayer();
    const currencyNames = { usd: 'USD', eur: 'EUR', peso: 'Peso', ara: 'ARA' };

    let fromOptions = '';
    let toOptions = '';
    for (const [c, name] of Object.entries(currencyNames)) {
        fromOptions += `<option value="${c}">${name} (${Math.floor(player.money[c])})</option>`;
        toOptions += `<option value="${c}">${name}</option>`;
    }

    const html = `
        <div class="modal-input-row">
            <label>Von:</label>
            <select id="exchange-from">${fromOptions}</select>
        </div>
        <div class="modal-input-row">
            <label>Nach:</label>
            <select id="exchange-to">${toOptions}</select>
        </div>
        <div class="modal-input-row">
            <label>Betrag:</label>
            <input type="number" id="exchange-amount" min="1" placeholder="Betrag">
        </div>
        <p style="font-size:0.8rem;color:var(--text-dim);margin-top:8px;">Gebühr: ${CONFIG.exchangeFee * 100}% pro Tausch</p>
        <div class="modal-btn-row">
            <button class="btn btn-secondary" onclick="closeModal()">Abbrechen</button>
            <button class="btn btn-primary" onclick="executeExchange()">Tauschen</button>
        </div>
    `;
    showModal('Geld wechseln', html);
}

function executeExchange() {
    const from = document.getElementById('exchange-from').value;
    const to = document.getElementById('exchange-to').value;
    const amount = parseInt(document.getElementById('exchange-amount').value);
    const player = currentPlayer();

    if (from === to) {
        alert('Bitte verschiedene Währungen auswählen.');
        return;
    }
    if (!amount || amount <= 0) {
        alert('Bitte einen gültigen Betrag eingeben.');
        return;
    }
    if (player.money[from] < amount) {
        alert(`Nicht genug ${CURRENCIES[from].name}!`);
        return;
    }

    const converted = convertCurrency(amount, from, to);
    const fee = converted * CONFIG.exchangeFee;
    const received = Math.floor(converted - fee);

    player.money[from] -= amount;
    player.money[to] += received;

    addEvent(`${player.name} tauscht ${amount} ${CURRENCIES[from].name} → ${received} ${CURRENCIES[to].name} (Gebühr: ${Math.ceil(fee)} ${CURRENCIES[to].name})`);
    useAction();
    closeModal();
}

// ===== CRYPTO =====

function openCryptoModal() {
    if (!canAct()) return;

    const player = currentPlayer();

    if (player.cryptoLocked) {
        addEvent(`Krypto gesperrt! Noch ${player.cryptoLockTurns} Runden warten.`, 'danger');
        return;
    }

    const cryptoPrice = Math.floor(convertCurrency(1, 'crypto', 'eur'));

    const html = `
        <p style="margin-bottom:12px;">Kryptopreis: <strong>1 Crypto = ${cryptoPrice} EUR</strong></p>
        <p style="font-size:0.8rem;color:var(--text-dim);margin-bottom:16px;">Achtung: Nach Krypto-Kauf/Verkauf sind alle Wechselgeschäfte für ${CONFIG.cryptoLockTurns} Runden gesperrt!</p>
        <div class="modal-input-row">
            <label>Aktion:</label>
            <select id="crypto-action">
                <option value="buy">Kaufen</option>
                <option value="sell">Verkaufen</option>
            </select>
        </div>
        <div class="modal-input-row">
            <label>Menge:</label>
            <input type="number" id="crypto-amount" min="1" value="1" placeholder="Menge">
        </div>
        <div class="modal-btn-row">
            <button class="btn btn-secondary" onclick="closeModal()">Abbrechen</button>
            <button class="btn btn-primary" onclick="executeCrypto()">Bestätigen</button>
        </div>
    `;
    showModal('Kryptowährung', html);
}

function executeCrypto() {
    const action = document.getElementById('crypto-action').value;
    const amount = parseInt(document.getElementById('crypto-amount').value);
    const player = currentPlayer();

    if (!amount || amount <= 0) {
        alert('Bitte eine gültige Menge eingeben.');
        return;
    }

    if (action === 'buy') {
        const costEUR = Math.ceil(convertCurrency(amount, 'crypto', 'eur'));
        if (player.money.eur < costEUR) {
            alert(`Nicht genug EUR! Kosten: ${costEUR} EUR`);
            return;
        }
        player.money.eur -= costEUR;
        player.money.crypto += amount;
        player.cryptoLocked = true;
        player.cryptoLockTurns = CONFIG.cryptoLockTurns;
        addEvent(`${player.name} kauft ${amount} Crypto für ${costEUR} EUR (Sperre: ${CONFIG.cryptoLockTurns} Runden)`, 'important');
    } else {
        if (player.money.crypto < amount) {
            alert('Nicht genug Crypto!');
            return;
        }
        const receivedEUR = Math.floor(convertCurrency(amount, 'crypto', 'eur'));
        player.money.crypto -= amount;
        player.money.eur += receivedEUR;
        player.cryptoLocked = true;
        player.cryptoLockTurns = CONFIG.cryptoLockTurns;
        addEvent(`${player.name} verkauft ${amount} Crypto für ${receivedEUR} EUR (Sperre: ${CONFIG.cryptoLockTurns} Runden)`, 'important');
    }

    useAction();
    closeModal();
}

// ===== COMBAT =====

function openAttackModal() {
    if (!canAct()) return;

    const player = currentPlayer();

    if (player.resources.military <= 0) {
        addEvent('Du brauchst Militär-Ressourcen zum Angreifen!', 'danger');
        return;
    }

    const targets = game.players.filter(p =>
        p.id !== player.id && p.location === player.location
    );

    if (targets.length === 0) {
        addEvent('Keine anderen Spieler an diesem Standort.', 'danger');
        return;
    }

    let html = '<p style="margin-bottom:12px;">Wen angreifen?</p>';
    for (const target of targets) {
        html += `<button class="modal-option" onclick="executeAttack(${target.id})">
            <span class="option-title">${target.name}</span>
            <span class="option-desc">Militär: ${target.resources.military} | Ressourcen: ${Object.values(target.resources).reduce((a, b) => a + b, 0)}</span>
        </button>`;
    }

    showModal('Angriff', html);
}

function executeAttack(targetId) {
    closeModal();

    const attacker = currentPlayer();
    const defender = game.players[targetId];

    const attackRoll = Math.floor(Math.random() * 6) + 1 + attacker.resources.military;
    const defendRoll = Math.floor(Math.random() * 6) + 1 + defender.resources.military;

    showDiceRoll(attacker, defender, attackRoll, defendRoll, () => {
        if (attackRoll > defendRoll) {
            const stealable = Object.entries(defender.resources).filter(([k, v]) => v > 0);
            if (stealable.length > 0) {
                const [resKey] = stealable[Math.floor(Math.random() * stealable.length)];
                defender.resources[resKey]--;
                attacker.resources[resKey]++;
                addEvent(`${attacker.name} besiegt ${defender.name} und stiehlt 1 ${getResourceName(resKey)}!`, 'success');
            } else {
                const stolenCurrency = Object.entries(defender.money).find(([c, a]) => a >= 50);
                if (stolenCurrency) {
                    const [c] = stolenCurrency;
                    const stolen = Math.min(Math.floor(defender.money[c] * 0.3), defender.money[c]);
                    defender.money[c] -= stolen;
                    attacker.money[c] += stolen;
                    addEvent(`${attacker.name} besiegt ${defender.name} und stiehlt ${stolen} ${CURRENCIES[c].name}!`, 'success');
                } else {
                    addEvent(`${attacker.name} besiegt ${defender.name}, aber es gibt nichts zu stehlen.`);
                }
            }
        } else if (attackRoll < defendRoll) {
            attacker.resources.military = Math.max(0, attacker.resources.military - 1);
            addEvent(`${defender.name} wehrt den Angriff ab! ${attacker.name} verliert 1 Militär.`, 'danger');
        } else {
            addEvent(`Unentschieden! Beide Seiten ziehen sich zurück.`);
        }
        useAction();
    });
}

function getResourceName(key) {
    const names = { military: 'Militär', food: 'Lebensmittel', tech: 'Technik', energy: 'Energie' };
    return names[key] || key;
}

function showDiceRoll(attacker, defender, attackRoll, defendRoll, callback) {
    const overlay = document.getElementById('dice-overlay');
    const content = document.getElementById('dice-content');

    const aBase = attackRoll - attacker.resources.military;
    const dBase = defendRoll - defender.resources.military;

    let resultClass = attackRoll > defendRoll ? 'win' : (attackRoll < defendRoll ? 'lose' : '');
    let resultText = attackRoll > defendRoll ? `${attacker.name} gewinnt!` :
                     (attackRoll < defendRoll ? `${defender.name} wehrt ab!` : 'Unentschieden!');

    content.innerHTML = `
        <div class="dice-label">${attacker.name} vs ${defender.name}</div>
        <div class="dice-result">&#9876;</div>
        <div style="display:flex;justify-content:center;gap:40px;margin:16px 0;">
            <div>
                <div style="color:${attacker.color};font-weight:700;">${attacker.name}</div>
                <div style="font-size:2rem;">${aBase}</div>
                <div style="font-size:0.8rem;color:var(--text-dim);">+ ${attacker.resources.military} Militär = <strong>${attackRoll}</strong></div>
            </div>
            <div>
                <div style="color:${defender.color};font-weight:700;">${defender.name}</div>
                <div style="font-size:2rem;">${dBase}</div>
                <div style="font-size:0.8rem;color:var(--text-dim);">+ ${defender.resources.military} Militär = <strong>${defendRoll}</strong></div>
            </div>
        </div>
        <div class="dice-winner ${resultClass}">${resultText}</div>
    `;

    overlay.classList.add('active');

    setTimeout(() => {
        overlay.classList.remove('active');
        callback();
    }, 2500);
}

// ===== BUNKER =====

function buildBunker() {
    if (!canAct()) return;

    const player = currentPlayer();
    const loc = LOCATIONS[player.location];

    if (!loc.isBunker) {
        addEvent('Bunker können nur an Bunkerstandorten gebaut werden!', 'danger');
        return;
    }

    const bunker = game.bunkers[player.location];

    if (!bunker.available) {
        addEvent('Dieser Bunkerstandort ist nicht verfügbar.', 'danger');
        return;
    }

    if (bunker.completed && bunker.owner !== player.id) {
        addEvent(`Dieser Bunker gehört bereits ${game.players[bunker.owner].name}!`, 'danger');
        return;
    }

    if (bunker.completed && bunker.owner === player.id) {
        addEvent('Dein Bunker ist schon fertig gebaut!', 'success');
        return;
    }

    if (bunker.owner !== null && bunker.owner !== player.id) {
        addEvent(`${game.players[bunker.owner].name} baut schon an diesem Bunker!`, 'danger');
        return;
    }

    if (player.bunkerLocation !== null && player.bunkerLocation !== player.location) {
        addEvent('Du baust bereits an einem anderen Bunker!', 'danger');
        return;
    }

    const req = CONFIG.bunkerRequirements;
    if (player.bunkerProgress === 0) {
        const missing = [];
        if (player.resources.food < req.food) missing.push(`${req.food - player.resources.food} Lebensmittel`);
        if (player.resources.tech < req.tech) missing.push(`${req.tech - player.resources.tech} Technik`);
        if (player.resources.energy < req.energy) missing.push(`${req.energy - player.resources.energy} Energie`);
        if (player.resources.military < req.military) missing.push(`${req.military - player.resources.military} Militär`);

        if (missing.length > 0) {
            addEvent(`Nicht genug Ressourcen! Es fehlen: ${missing.join(', ')}`, 'danger');
            return;
        }

        player.resources.food -= req.food;
        player.resources.tech -= req.tech;
        player.resources.energy -= req.energy;
        player.resources.military -= req.military;
        player.bunkerLocation = player.location;
        player.bunkerProgress = 1;
        bunker.owner = player.id;

        addEvent(`${player.name} beginnt den Bunkerbau in ${loc.name}! (1/${CONFIG.bunkerBuildTurns} Runden)`, 'important');
    } else {
        player.bunkerProgress++;
        if (player.bunkerProgress >= CONFIG.bunkerBuildTurns) {
            bunker.completed = true;
            addEvent(`${player.name} hat den Bunker in ${loc.name} fertiggestellt!`, 'success');
        } else {
            addEvent(`${player.name} arbeitet am Bunker (${player.bunkerProgress}/${CONFIG.bunkerBuildTurns})`, 'important');
        }
    }

    useAction();
}

// ===== END TURN / ROUND =====

function endTurn() {
    const player = currentPlayer();
    player.actionPoints = 0;

    game.currentPlayerIndex++;

    if (game.currentPlayerIndex >= game.players.length) {
        advanceRound();
    } else {
        game.players[game.currentPlayerIndex].actionPoints = CONFIG.actionsPerTurn;

        if (game.players[game.currentPlayerIndex].cryptoLocked) {
            game.players[game.currentPlayerIndex].cryptoLockTurns--;
            if (game.players[game.currentPlayerIndex].cryptoLockTurns <= 0) {
                game.players[game.currentPlayerIndex].cryptoLocked = false;
                addEvent(`${game.players[game.currentPlayerIndex].name}: Krypto-Sperre aufgehoben.`);
            }
        }

        addEvent(`--- ${currentPlayer().name} ist am Zug ---`, 'important');
    }

    renderAll();
}

function advanceRound() {
    game.round++;

    if (game.round > game.doomsdayRound) {
        endGame();
        return;
    }

    game.currentPlayerIndex = 0;
    game.players[0].actionPoints = CONFIG.actionsPerTurn;

    updateEconomy();
    triggerRandomEvent();

    if (game.players[0].cryptoLocked) {
        game.players[0].cryptoLockTurns--;
        if (game.players[0].cryptoLockTurns <= 0) {
            game.players[0].cryptoLocked = false;
            addEvent(`${game.players[0].name}: Krypto-Sperre aufgehoben.`);
        }
    }

    addEvent(`═══ Runde ${game.round} ═══`, 'important');

    if (game.round >= game.doomsdayRound - 3) {
        addEvent('⚠ Die Spannungen eskalieren! Der Krieg steht kurz bevor!', 'danger');
    }

    addEvent(`--- ${currentPlayer().name} ist am Zug ---`, 'important');
    renderAll();
}

function updateEconomy() {
    for (const currency of ['usd', 'peso', 'ara']) {
        const inflation = (Math.random() - 0.5) * 2 * CONFIG.inflationRange;
        game.exchangeRates[currency] *= (1 + inflation);
        game.exchangeRates[currency] = Math.max(0.001, game.exchangeRates[currency]);

        const dir = inflation > 0 ? '↑' : '↓';
        const pct = Math.abs(inflation * 100).toFixed(1);
        if (Math.abs(inflation) > 0.05) {
            addEvent(`${CURRENCIES[currency].name} ${dir} ${pct}%`);
        }
    }

    const cryptoSwing = (Math.random() - 0.5) * 0.6;
    game.exchangeRates.crypto *= (1 + cryptoSwing);
    game.exchangeRates.crypto = Math.max(0.5, game.exchangeRates.crypto);
    if (Math.abs(cryptoSwing) > 0.1) {
        const dir = cryptoSwing > 0 ? '↑' : '↓';
        addEvent(`Crypto ${dir} ${Math.abs(cryptoSwing * 100).toFixed(0)}%!`, cryptoSwing > 0.2 ? 'success' : (cryptoSwing < -0.2 ? 'danger' : ''));
    }

    for (const locId of Object.keys(game.resourcePrices)) {
        const change = (Math.random() - 0.5) * 0.2;
        game.resourcePrices[locId] = Math.max(50, Math.floor(game.resourcePrices[locId] * (1 + change)));
    }
}

function triggerRandomEvent() {
    const roll = Math.random();
    if (roll < 0.15) {
        const locIds = Object.keys(game.resourcePrices);
        const targetLoc = locIds[Math.floor(Math.random() * locIds.length)];
        game.resourcePrices[targetLoc] = Math.floor(game.resourcePrices[targetLoc] * 0.5);
        addEvent(`Überangebot in ${LOCATIONS[targetLoc].name}: ${LOCATIONS[targetLoc].resourceName} zum halben Preis!`, 'success');
    } else if (roll < 0.25) {
        const locIds = Object.keys(game.resourcePrices);
        const targetLoc = locIds[Math.floor(Math.random() * locIds.length)];
        game.resourcePrices[targetLoc] = Math.floor(game.resourcePrices[targetLoc] * 1.8);
        addEvent(`Knappheit in ${LOCATIONS[targetLoc].name}: ${LOCATIONS[targetLoc].resourceName} wird teurer!`, 'danger');
    } else if (roll < 0.30) {
        const lucky = game.players[Math.floor(Math.random() * game.players.length)];
        const bonus = 100 + Math.floor(Math.random() * 200);
        const loc = LOCATIONS[lucky.location];
        if (loc && !loc.isBunker) {
            lucky.money[loc.currency] += bonus;
            addEvent(`${lucky.name} findet ${bonus} ${CURRENCIES[loc.currency].name} in ${loc.name}!`, 'success');
        }
    }
}

// ===== GAME END =====

function endGame() {
    game.phase = 'ended';
    showScreen('end-screen');

    const endIcon = document.getElementById('end-icon');
    const endTitle = document.getElementById('end-title');
    const endResults = document.getElementById('end-results');

    endIcon.textContent = '☢';
    endTitle.innerHTML = 'Der Atomkrieg ist ausgebrochen!';

    let html = '';
    const survivors = [];

    for (const player of game.players) {
        let survived = false;
        let bunkerName = '';

        for (const [bunkerId, bunker] of Object.entries(game.bunkers)) {
            if (bunker.completed && bunker.owner === player.id && player.location === bunkerId) {
                survived = true;
                bunkerName = LOCATIONS[bunkerId].name;
            }
        }

        if (survived) {
            survivors.push(player);
            html += `<div class="end-player survived">
                <div class="end-player-marker" style="background:${player.color}">${player.name[0]}</div>
                <div class="end-player-info">
                    <div class="end-player-name">${player.name}</div>
                    <div class="end-player-status">Überlebt im Bunker (${bunkerName})</div>
                </div>
                <div class="end-badge">&#9989;</div>
            </div>`;
        } else {
            let reason = 'Kein Bunker gebaut';
            for (const [bunkerId, bunker] of Object.entries(game.bunkers)) {
                if (bunker.completed && bunker.owner === player.id) {
                    if (player.location !== bunkerId) {
                        reason = `Bunker in ${LOCATIONS[bunkerId].name}, aber nicht dort!`;
                    }
                }
            }
            if (player.bunkerProgress > 0 && !Object.values(game.bunkers).some(b => b.completed && b.owner === player.id)) {
                reason = 'Bunker nicht rechtzeitig fertig';
            }
            html += `<div class="end-player died">
                <div class="end-player-marker" style="background:${player.color}">${player.name[0]}</div>
                <div class="end-player-info">
                    <div class="end-player-name">${player.name}</div>
                    <div class="end-player-status">${reason}</div>
                </div>
                <div class="end-badge">&#10060;</div>
            </div>`;
        }
    }

    if (survivors.length === 0) {
        endTitle.innerHTML += '<br><span style="font-size:1rem;color:var(--text-dim);">Niemand hat überlebt...</span>';
    } else {
        endTitle.innerHTML += `<br><span style="font-size:1.2rem;color:var(--success);">${survivors.map(p => p.name).join(' & ')} ha${survivors.length > 1 ? 'ben' : 't'} überlebt!</span>`;
    }

    endResults.innerHTML = html;
}

// ===== EVENTS =====

function addEvent(text, type = '') {
    game.events.push({ text, type, round: game.round });

    const log = document.getElementById('event-log-content');
    const entry = document.createElement('div');
    entry.className = `event-entry ${type}`;
    entry.textContent = `> ${text}`;
    log.appendChild(entry);
    log.parentElement.scrollTop = log.parentElement.scrollHeight;
}

// ===== MODAL =====

function showModal(title, bodyHTML) {
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-body').innerHTML = bodyHTML;
    document.getElementById('modal-overlay').classList.add('active');
}

function closeModal() {
    document.getElementById('modal-overlay').classList.remove('active');
}

// ===== RENDERING =====

function renderAll() {
    if (!game || game.phase !== 'playing') return;

    const player = currentPlayer();

    document.getElementById('round-display').textContent = game.round;
    document.getElementById('current-player-display').textContent = player.name;
    document.getElementById('current-player-display').style.color = player.color;
    document.getElementById('ap-display').textContent = `${player.actionPoints} AP`;

    const progress = Math.min(100, (game.round / game.doomsdayRound) * 100);
    document.getElementById('doomsday-fill').style.width = `${progress}%`;
    if (progress > 80) {
        document.getElementById('doomsday-text').textContent = '⚠ KRITISCH';
        document.getElementById('doomsday-text').style.color = '#ef4444';
    } else if (progress > 60) {
        document.getElementById('doomsday-text').textContent = 'Bedrohungslevel: HOCH';
        document.getElementById('doomsday-text').style.color = '#f59e0b';
    } else {
        document.getElementById('doomsday-text').textContent = 'Bedrohungslevel';
        document.getElementById('doomsday-text').style.color = '';
    }

    renderPlayerInfo(player);
    renderMap(player);
    renderRates();
    renderPrices();
    renderActions(player);
    renderPlayerMarkers();
    renderBunkerStatus();
    renderPlayerTabs();
}

function renderPlayerInfo(player) {
    document.getElementById('player-info-name').textContent = player.name;
    document.getElementById('player-info-name').style.color = player.color;

    const locName = LOCATIONS[player.location].name;
    document.getElementById('player-location').textContent = locName;

    document.getElementById('money-usd').textContent = Math.floor(player.money.usd);
    document.getElementById('money-eur').textContent = Math.floor(player.money.eur);
    document.getElementById('money-peso').textContent = Math.floor(player.money.peso);
    document.getElementById('money-ara').textContent = Math.floor(player.money.ara);
    document.getElementById('money-crypto').textContent = Math.floor(player.money.crypto);

    document.getElementById('res-military').textContent = player.resources.military;
    document.getElementById('res-food').textContent = player.resources.food;
    document.getElementById('res-tech').textContent = player.resources.tech;
    document.getElementById('res-energy').textContent = player.resources.energy;

    const bunkerSection = document.getElementById('bunker-progress-section');
    if (player.bunkerProgress > 0) {
        bunkerSection.style.display = 'block';
        const pct = (player.bunkerProgress / CONFIG.bunkerBuildTurns) * 100;
        document.getElementById('bunker-progress-fill').style.width = `${pct}%`;
        const complete = player.bunkerProgress >= CONFIG.bunkerBuildTurns;
        document.getElementById('bunker-progress-text').textContent = complete
            ? `Bunker fertig! (${LOCATIONS[player.bunkerLocation].name})`
            : `${player.bunkerProgress}/${CONFIG.bunkerBuildTurns} Runden (${LOCATIONS[player.bunkerLocation].name})`;
    } else {
        bunkerSection.style.display = 'none';
    }
}

function renderMap(player) {
    document.querySelectorAll('.map-node').forEach(node => {
        node.classList.remove('current-location', 'travel-target');
        const locId = node.dataset.loc;
        if (locId === player.location) {
            node.classList.add('current-location');
        }
        if (canAct() && ADJACENCY[player.location]?.includes(locId)) {
            node.classList.add('travel-target');
        }
    });
}

function renderPlayerMarkers() {
    const container = document.getElementById('player-markers');
    container.innerHTML = '';

    const locationGroups = {};
    for (const p of game.players) {
        if (!locationGroups[p.location]) locationGroups[p.location] = [];
        locationGroups[p.location].push(p);
    }

    for (const [locId, players] of Object.entries(locationGroups)) {
        const loc = LOCATIONS[locId];
        const baseX = loc.x + 40;
        const baseY = loc.y - 10;

        players.forEach((p, i) => {
            const marker = document.createElement('div');
            marker.className = 'player-marker';
            marker.style.backgroundColor = p.color;
            marker.style.left = `${baseX + i * 20}px`;
            marker.style.top = `${baseY}px`;
            marker.textContent = p.name[0];
            marker.title = p.name;
            container.appendChild(marker);
        });
    }
}

function renderBunkerStatus() {
    for (const bunkerId of ['alpen', 'neuseeland']) {
        const statusEl = document.getElementById(`${bunkerId}-status`);
        const bunker = game.bunkers[bunkerId];
        if (!bunker.available) {
            statusEl.textContent = 'Nicht verfügbar';
            statusEl.style.color = '#666';
        } else if (bunker.completed) {
            statusEl.textContent = `${game.players[bunker.owner].name}`;
            statusEl.style.color = '#22c55e';
        } else if (bunker.owner !== null) {
            statusEl.textContent = `Im Bau (${game.players[bunker.owner].name})`;
            statusEl.style.color = '#f59e0b';
        } else {
            statusEl.textContent = 'Frei';
            statusEl.style.color = '#8b5cf6';
        }
    }
}

function renderRates() {
    document.getElementById('rate-usd').textContent = game.exchangeRates.usd.toFixed(2);
    document.getElementById('rate-peso').textContent = (game.exchangeRates.peso * 100).toFixed(2);
    document.getElementById('rate-ara').textContent = (game.exchangeRates.ara * 100).toFixed(2);
    document.getElementById('rate-crypto').textContent = game.exchangeRates.crypto.toFixed(2);
}

function renderPrices() {
    const container = document.getElementById('prices-list');
    let html = '';
    for (const [locId, price] of Object.entries(game.resourcePrices)) {
        const loc = LOCATIONS[locId];
        html += `<div class="rate-item">
            <span>${loc.resourceName}</span>
            <span>${price}</span>
            <span>${CURRENCIES[loc.currency].name}</span>
        </div>`;
    }
    container.innerHTML = html;
}

function renderActions(player) {
    const loc = LOCATIONS[player.location];
    const hasAP = canAct();

    document.getElementById('btn-travel').disabled = !hasAP;
    document.getElementById('btn-buy').disabled = !hasAP || loc.isBunker;
    document.getElementById('btn-exchange').disabled = !hasAP || player.cryptoLocked;
    document.getElementById('btn-crypto').disabled = !hasAP || player.cryptoLocked;
    document.getElementById('btn-attack').disabled = !hasAP || player.resources.military <= 0 ||
        !game.players.some(p => p.id !== player.id && p.location === player.location);
    document.getElementById('btn-bunker').disabled = !hasAP || !loc.isBunker;
}

function renderPlayerTabs() {
    let existingBar = document.querySelector('.all-players-bar');
    if (!existingBar) {
        existingBar = document.createElement('div');
        existingBar.className = 'all-players-bar';
        const header = document.getElementById('game-header');
        header.parentNode.insertBefore(existingBar, header.nextSibling);
    }

    let html = '';
    for (const p of game.players) {
        const isActive = p.id === game.currentPlayerIndex;
        html += `<div class="player-tab ${isActive ? 'active-player' : ''}">
            <div class="player-tab-dot" style="background:${p.color}"></div>
            <span>${p.name}</span>
            <span class="player-tab-loc">${LOCATIONS[p.location].name}</span>
        </div>`;
    }
    existingBar.innerHTML = html;
}

function handleMapClick(locId) {
    if (!canAct()) return;

    const player = currentPlayer();
    if (locId === player.location) return;

    const loc = LOCATIONS[locId];
    if (loc.isBunker && !game.bunkers[locId].available) return;

    travel(locId);
}
