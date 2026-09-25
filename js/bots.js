function botSourceOf(res) {
    return CONTINENT_IDS.find(id => LOCATIONS[id].resource === res);
}

function botNeededResources(p) {
    const { need } = bunkerNeeds(p);
    let wild = p.resources.rare;
    const out = {};
    for (const [k, v] of Object.entries(need)) {
        const covered = Math.min(wild, v);
        wild -= covered;
        if (v - covered > 0) out[k] = v - covered;
    }
    return out;
}

function botFreeBunker(p) {
    const free = BUNKER_ORDER.filter(id => game.bunkers[id].available && game.bunkers[id].owner === null);
    if (!free.length) return null;
    return free.sort((a, b) => travelCostEUR(p, a) - travelCostEUR(p, b))[0];
}

function botRaidTarget(p) {
    return BUNKER_ORDER.filter(id => {
        const b = game.bunkers[id];
        if (!b.available || b.owner === null || b.owner === p.id) return false;
        const o = game.players[b.owner];
        const defense = (b.completed ? 3 : 1) + (o.location === id ? o.resources.military : 0);
        return p.resources.military >= defense;
    })[0] || null;
}

async function botGoTo(p, dest) {
    if (p.location === dest) return false;
    const cost = travelCostEUR(p, dest);
    if (fiatEUR(p) < cost) return false;
    return actTravel(p, dest);
}

function botMoneyMove(p) {
    const loc = LOCATIONS[p.location];
    if (!loc.isBunker && actWork(p)) return true;
    if (p.debt === 0 && !game.roundMods.bankClosed && actLoan(p)) return true;
    return false;
}

async function botStep(p) {
    const loc = LOCATIONS[p.location];
    const own = ownedBunker(p);

    // Opportunistic robbery: only against clearly weaker, non-pact players.
    if (game.round >= 3 && !p.attackedThisTurn && !game.roundMods.noAttacks && p.resources.military >= 2) {
        const victim = game.players.find(o => o.id !== p.id && o.location === p.location && !pactBetween(p, o)
            && o.resources.military + 2 <= p.resources.military
            && Object.values(o.resources).some(v => v > 0));
        if (victim) return actAttack(p, victim);
    }

    if (own) {
        const b = game.bunkers[own];
        if (p.location !== own) return botGoTo(p, own);
        if (!b.completed) return actBuild(p);
        if (p.debt > 0 && fiatEUR(p) > 1) return actRepay(p);
        return false;
    }

    if (p.debt > 0 && fiatEUR(p) > p.debt + 350) return actRepay(p);

    const needed = botNeededResources(p);
    const neededKeys = Object.keys(needed);

    if (!neededKeys.length) {
        const free = botFreeBunker(p);
        if (free) {
            if (p.location === free) return actBuild(p);
            if (await botGoTo(p, free)) return true;
            return botMoneyMove(p);
        }
        const raid = botRaidTarget(p);
        if (raid && !game.roundMods.noAttacks) {
            if (p.location === raid) return p.attackedThisTurn ? false : actRaidBunker(p);
            return botGoTo(p, raid);
        }
        if (p.location !== 'nordamerika') return botGoTo(p, 'nordamerika');
        if (actBuy(p, 1)) return true;
        return botMoneyMove(p);
    }

    if (p.resources.food > (CONFIG.bunkerRequirements.food) && p.foodBoosts < 1 && p.ap <= 1) {
        return actEat(p);
    }

    if (!loc.isBunker && !game.roundMods.bankClosed) {
        const cheap = game.rates.crypto < CURRENCIES.crypto.baseRate * 0.85;
        const rich = game.rates.crypto > CURRENCIES.crypto.baseRate * 1.3;
        if (p.money.crypto > 0 && rich) return actCrypto(p, 'sell', p.money.crypto);
        if (cheap && fiatEUR(p) > 900 && Math.random() < 0.2) return actCrypto(p, 'buy', 1);
    }

    if (!loc.isBunker && neededKeys.length === 1 && needed[neededKeys[0]] === 1 && !p.record && Math.random() < 0.35) {
        const source = botSourceOf(neededKeys[0]);
        if (source !== p.location && fiatEUR(p) > unitPriceEUR(source) * CONFIG.blackMarketMarkup * 1.5) {
            return actSmuggle(p, neededKeys[0]);
        }
    }

    if (!loc.isBunker && needed[loc.resource] && game.roundMods.embargo !== p.location) {
        const want = Math.min(3, needed[loc.resource]);
        for (let q = want; q >= 1; q--) {
            const quote = purchaseQuote(p, p.location, q);
            if (quote.affordable && !quote.usesForeign) return actBuy(p, q);
        }
        const one = purchaseQuote(p, p.location, 1);
        if (!bankBlocked(p, true)) {
            const localNeed = one.totalLocal * Math.min(3, needed[loc.resource]) * 1.1;
            const donor = FIAT.filter(c => c !== one.c).sort((a, b) => toEUR(b, p.money[b]) - toEUR(a, p.money[a]))[0];
            const donorAmount = Math.min(p.money[donor], Math.ceil(fromEUR(donor, toEUR(one.c, localNeed)) * 1.05));
            if (donorAmount > 0 && toEUR(donor, donorAmount) >= toEUR(one.c, one.totalLocal) * 0.8) {
                return actExchange(p, donor, one.c, donorAmount);
            }
        }
        if (one.affordable) return actBuy(p, 1);
        return botMoneyMove(p);
    }

    const crate = game.crates.find(c => ADJACENCY[p.location].includes(c.loc));
    const targets = neededKeys.map(botSourceOf)
        .filter(id => id && game.roundMods.embargo !== id)
        .sort((a, b) => {
            const score = id => needed[LOCATIONS[id].resource] * 60 - travelCostEUR(p, id) + (game.crates.some(c => c.loc === id) ? 120 : 0);
            return score(b) - score(a);
        });
    const dest = targets[0] || (crate && crate.loc);
    if (dest && await botGoTo(p, dest)) return true;
    return botMoneyMove(p);
}

async function runBot(p) {
    let guard = 0;
    while (p.ap > 0 && !game.over && guard++ < 10) {
        let acted = false;
        try {
            acted = await botStep(p);
        } catch (err) {
            console.error('Bot error', err);
        }
        render();
        if (!acted) break;
        await sleep(CONFIG.botDelay);
    }
    await sleep(300);
}

function botAcceptsContract(bot, proposer, offer) {
    if (offer.type === 'pact') {
        return bot.resources.military <= proposer.resources.military || Math.random() < 0.4;
    }
    const value = x => x.kind === 'res' ? RESOURCES[x.key].baseEUR * x.amount : toEUR(x.key, x.amount);
    const needed = botNeededResources(bot);
    let gain = value(offer.give);
    let loss = value(offer.get);
    if (offer.give.kind === 'res' && needed[offer.give.key]) gain *= 1.4;
    if (offer.get.kind === 'res' && needed[offer.get.key]) loss *= 1.6;
    return gain >= loss * 1.1;
}
