const CONFIG = {
    actionsPerTurn: 3,
    startMoneyEUR: 700,
    incomeEUR: 120,
    workEUR: 170,
    minRounds: 12,
    maxRounds: 18,
    travelNearEUR: 70,
    travelFarEUR: 150,
    bunkerRequirements: { food: 3, tech: 2, energy: 3, military: 2 },
    bunkerBuildSteps: 3,
    cryptoLockTurns: 2,
    exchangeFee: 0.03,
    loanAmountEUR: 400,
    loanInterest: 0.12,
    seizureDebtEUR: 1600,
    insuranceEUR: 110,
    insuranceTurns: 3,
    blackMarketMarkup: 2.0,
    blackMarketCatchChance: 0.3,
    pactPenaltyEUR: 300,
    demandPriceBump: 0.07,
    foreignMarkup: 1.3,
    maxFoodBoostsPerTurn: 2,
    botDelay: 750,
};

const RESOURCES = {
    military: { name: 'Militär', icon: '⚔️', baseEUR: 170, color: '#60a5fa' },
    food:     { name: 'Lebensmittel', icon: '🌽', baseEUR: 85, color: '#4ade80' },
    tech:     { name: 'Technik', icon: '⚙️', baseEUR: 145, color: '#fbbf24' },
    energy:   { name: 'Energie', icon: '⚡', baseEUR: 105, color: '#f87171' },
    rare:     { name: 'Rohstoffe', icon: '💎', baseEUR: 220, color: '#e879f9' },
};

const CURRENCIES = {
    usd:    { name: 'USD', symbol: '$', baseRate: 0.92, color: '#3b82f6' },
    eur:    { name: 'EUR', symbol: '€', baseRate: 1.0, color: '#f59e0b' },
    peso:   { name: 'Peso', symbol: '₱', baseRate: 0.055, color: '#22c55e' },
    ara:    { name: 'ARA', symbol: 'R', baseRate: 0.053, color: '#ef4444' },
    crypto: { name: 'BunkerCoin', symbol: '₿', baseRate: 250, color: '#a855f7' },
};

const FIAT = ['usd', 'eur', 'peso', 'ara'];

const LOCATIONS = {
    nordamerika: { name: 'Nordamerika', lat: 40, lon: -100, currency: 'usd', resource: 'military', color: '#3b82f6' },
    suedamerika: { name: 'Südamerika', lat: -14, lon: -58, currency: 'peso', resource: 'food', color: '#22c55e' },
    europa:      { name: 'Europa', lat: 51, lon: 14, currency: 'eur', resource: 'tech', color: '#f59e0b' },
    afrika:      { name: 'Afrika', lat: 4, lon: 21, currency: 'ara', resource: 'energy', color: '#ef4444' },
    alpen:       { name: 'Südl. Alpen', lat: 45.5, lon: 8.5, isBunker: true, color: '#a855f7' },
    neuseeland:  { name: 'Neuseeland', lat: -43, lon: 171, isBunker: true, color: '#a855f7' },
    spitzbergen: { name: 'Spitzbergen', lat: 78, lon: 16, isBunker: true, color: '#a855f7' },
};

const CONTINENT_IDS = ['nordamerika', 'suedamerika', 'europa', 'afrika'];
const BUNKER_ORDER = ['alpen', 'neuseeland', 'spitzbergen'];

const ADJACENCY = {
    nordamerika: ['suedamerika', 'europa', 'spitzbergen'],
    suedamerika: ['nordamerika', 'afrika', 'neuseeland'],
    europa:      ['nordamerika', 'afrika', 'alpen', 'spitzbergen'],
    afrika:      ['europa', 'suedamerika', 'alpen', 'neuseeland'],
    alpen:       ['europa', 'afrika'],
    neuseeland:  ['suedamerika', 'afrika'],
    spitzbergen: ['europa', 'nordamerika'],
};

const PLAYER_COLORS = ['#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#ec4899', '#06b6d4'];
const BOT_NAMES = ['Gordon Gekko', 'Dagobert', 'Elon Mosk', 'Frau Lagarde', 'Warren B.', 'Satoshi'];

// Coarse [lon, lat] outlines, only used to paint the dotted globe.
const LAND_SHAPES = [
    { id: 'nordamerika', pts: [[-168,65],[-150,71],[-125,70],[-95,72],[-80,74],[-62,62],[-55,52],[-66,44],[-76,35],[-81,25],[-90,29],[-97,26],[-97,18],[-88,15],[-78,8],[-83,8],[-92,14],[-105,20],[-117,32],[-124,40],[-125,49],[-135,58],[-150,60],[-165,55]] },
    { id: 'nordamerika', pts: [[-55,60],[-42,60],[-20,70],[-18,81],[-60,83],[-73,78],[-60,70]] },
    { id: 'suedamerika', pts: [[-78,8],[-60,11],[-50,1],[-35,-6],[-40,-22],[-48,-28],[-58,-38],[-66,-55],[-73,-50],[-73,-40],[-71,-18],[-81,-5],[-80,2]] },
    { id: 'europa', pts: [[-10,36],[-9,43],[-2,44],[-4,48],[1,50],[5,54],[8,57],[5,62],[15,69],[28,71],[42,68],[46,55],[41,45],[28,41],[26,38],[21,39],[16,38],[12,44],[3,42],[-2,36]] },
    { id: 'europa', pts: [[-6,50],[2,51],[-2,58],[-6,57]] },
    { id: 'europa', pts: [[-24,64],[-14,64],[-14,66],[-22,66]] },
    { id: 'afrika', pts: [[-17,21],[-10,30],[-5,36],[10,37],[20,32],[32,31],[35,28],[43,12],[51,12],[42,-2],[40,-15],[35,-25],[20,-35],[18,-30],[12,-17],[13,-5],[9,4],[-8,4],[-17,14]] },
    { id: 'afrika', pts: [[44,-13],[50,-15],[47,-25],[43,-22]] },
    { id: 'asien', pts: [[46,55],[42,68],[70,73],[100,78],[140,72],[179,68],[170,60],[140,55],[135,43],[122,40],[121,30],[110,20],[108,10],[100,2],[98,15],[92,22],[80,8],[72,20],[57,25],[50,30],[43,12],[35,28],[35,36],[28,41],[41,45]] },
    { id: 'asien', pts: [[130,31],[141,35],[142,45],[137,38]] },
    { id: 'asien', pts: [[95,5],[106,-6],[120,-9],[118,0],[108,2]] },
    { id: 'ozeanien', pts: [[114,-22],[122,-18],[130,-12],[137,-12],[142,-11],[146,-19],[153,-26],[150,-37],[140,-38],[132,-32],[115,-35]] },
    { id: 'ozeanien', pts: [[166,-46],[174,-41],[178,-38],[173,-35],[172,-41]] },
];

const LAND_COLORS = {
    nordamerika: '#3b82f6', suedamerika: '#22c55e', europa: '#f59e0b',
    afrika: '#ef4444', asien: '#4b5563', ozeanien: '#6b7280', antarktis: '#94a3b8',
};

// Event cards. `apply(game)` mutates state and returns an optional extra log line.
const EVENT_CARDS = [
    {
        title: 'Hyperinflation!', icon: '🔥', kind: 'bad',
        text: c => `Die Zentralbank von ${LOCATIONS[c].name} druckt Geld wie verrückt. ${CURRENCIES[LOCATIONS[c].currency].name} verliert 35% an Wert, die Preise dort steigen um 40%.`,
        lesson: 'Mehr Geld bei gleicher Gütermenge = jede Geldeinheit ist weniger wert (Inflation).',
        pick: g => rand(CONTINENT_IDS),
        apply: (g, c) => { g.rates[LOCATIONS[c].currency] *= 0.65; g.priceIndex[c] *= 1.4; },
    },
    {
        title: 'Börsencrash', icon: '📉', kind: 'bad',
        text: () => 'Panik an den Märkten! BunkerCoin stürzt um 55% ab.',
        lesson: 'Spekulative Anlagen können in kurzer Zeit massiv an Wert verlieren (Volatilität).',
        apply: g => { g.rates.crypto *= 0.45; },
    },
    {
        title: 'Krypto-Hype: To the Moon!', icon: '🚀', kind: 'good',
        text: () => 'Ein Influencer twittert über BunkerCoin. Der Kurs steigt um 90%!',
        lesson: 'Preise entstehen durch Angebot und Nachfrage — auch durch Erwartungen und Herdenverhalten.',
        apply: g => { g.rates.crypto *= 1.9; },
    },
    {
        title: 'Handelsembargo', icon: '🚫', kind: 'bad',
        text: c => `Internationale Sanktionen gegen ${LOCATIONS[c].name}! Diese Runde kann dort niemand einkaufen.`,
        lesson: 'Sanktionen sind rechtliche Instrumente, die Handel verbieten, um politischen Druck auszuüben.',
        pick: g => rand(CONTINENT_IDS),
        apply: (g, c) => { g.roundMods.embargo = c; },
    },
    {
        title: 'Missernte', icon: '🥀', kind: 'bad',
        text: () => 'Dürre in Südamerika. Lebensmittel werden 60% teurer.',
        lesson: 'Sinkt das Angebot bei gleicher Nachfrage, steigt der Preis.',
        apply: g => { g.priceIndex.suedamerika *= 1.6; },
    },
    {
        title: 'Energiekrise', icon: '🛢️', kind: 'bad',
        text: () => 'Pipelines sind blockiert! Energie +60%, alle Reisen kosten diese Runde das Doppelte.',
        lesson: 'Energiepreise wirken sich auf fast alle anderen Kosten aus (z. B. Transport).',
        apply: g => { g.priceIndex.afrika *= 1.6; g.roundMods.travelMult = 2; },
    },
    {
        title: 'Tech-Durchbruch', icon: '💡', kind: 'good',
        text: () => 'Neue Fabriken in Europa! Technik wird 40% günstiger.',
        lesson: 'Technischer Fortschritt senkt Produktionskosten und damit Preise.',
        apply: g => { g.priceIndex.europa *= 0.6; },
    },
    {
        title: 'Zinserhöhung', icon: '🏦', kind: 'bad',
        text: () => 'Die Zentralbanken erhöhen die Leitzinsen. Kredite kosten ab jetzt 20% pro Runde!',
        lesson: 'Höhere Zinsen machen Kredite teurer und bremsen die Wirtschaft (und die Inflation).',
        apply: g => { g.interest = 0.2; },
    },
    {
        title: 'Zinssenkung', icon: '📉', kind: 'good',
        text: () => 'Die Zentralbanken senken die Zinsen. Kredite kosten nur noch 6% pro Runde.',
        lesson: 'Tiefe Zinsen machen Schulden billiger und sollen Konsum und Investitionen ankurbeln.',
        apply: g => { g.interest = 0.06; },
    },
    {
        title: 'Wirtschaftsboom', icon: '📈', kind: 'good',
        text: () => 'Die Wirtschaft brummt! Alle erhalten einen Bonus von 180 EUR (in ihrer lokalen Währung).',
        lesson: 'In einem Aufschwung (Konjunktur) steigen Einkommen und Gewinne.',
        apply: g => { g.players.forEach(p => payLocal(g, p, 180)); },
    },
    {
        title: 'Vermögenssteuer', icon: '🧾', kind: 'bad',
        text: () => 'Der Staat braucht Geld für die Verteidigung. Wer mehr als 1500 EUR besitzt, zahlt 20% Steuern.',
        lesson: 'Steuern finanzieren staatliche Aufgaben. Eine Vermögenssteuer trifft vor allem Reiche.',
        apply: g => {
            g.players.forEach(p => {
                if (netWorthCash(g, p) > 1500) for (const c of FIAT) p.money[c] = Math.floor(p.money[c] * 0.8);
            });
        },
    },
    {
        title: 'Grenzschliessung', icon: '🛂', kind: 'bad',
        text: () => 'Alle Grenzen werden verschärft kontrolliert. Reisen kostet diese Runde das Dreifache.',
        lesson: 'Handelshemmnisse (Zölle, Grenzkontrollen) erhöhen Transaktionskosten.',
        apply: g => { g.roundMods.travelMult = 3; },
    },
    {
        title: 'UNO-Waffenruhe', icon: '🕊️', kind: 'good',
        text: () => 'Der Sicherheitsrat beschliesst eine Waffenruhe. Diese Runde sind keine Angriffe erlaubt.',
        lesson: 'Völkerrecht: Resolutionen des UNO-Sicherheitsrats sind für alle Mitgliedstaaten verbindlich.',
        apply: g => { g.roundMods.noAttacks = true; },
    },
    {
        title: 'Wettrüsten', icon: '☢️', kind: 'bad',
        text: () => 'Die Grossmächte rüsten auf! Militär wird 35% billiger — aber der Krieg rückt näher.',
        lesson: 'Sicherheitsdilemma: Wenn alle aufrüsten, fühlt sich niemand sicherer.',
        apply: g => { g.priceIndex.nordamerika *= 0.65; g.doomsdayRound = Math.max(g.round + 1, g.doomsdayRound - 1); },
    },
    {
        title: 'Friedensgespräche', icon: '🤝', kind: 'good',
        text: () => 'Diplomaten verhandeln in Genf. Der Weltuntergang wird etwas verschoben...',
        lesson: 'Verhandlungen und Verträge können Konflikte entschärfen.',
        apply: g => { g.doomsdayRound += 1; },
    },
    {
        title: 'Cyberangriff auf Banken', icon: '💻', kind: 'bad',
        text: () => 'Hacker legen das Bankensystem lahm. Diese Runde sind alle Bankgeschäfte gesperrt.',
        lesson: 'Das Finanzsystem ist kritische Infrastruktur — fällt es aus, steht die Wirtschaft still.',
        apply: g => { g.roundMods.bankClosed = true; },
    },
    {
        title: 'Rohstoff-Rausch', icon: '💎', kind: 'good',
        text: () => 'Geologen entdecken neue Vorkommen! Drei Rohstoff-Funde erscheinen auf der Karte.',
        lesson: 'Rohstoffe sind knapp. Wer zuerst kommt, sichert sich das Eigentum (Aneignung).',
        apply: g => { for (let i = 0; i < 3; i++) spawnCrate(g); },
    },
    {
        title: 'Pandemie', icon: '🦠', kind: 'bad',
        text: () => 'Ein Virus breitet sich aus. Alle haben diese Runde 1 Aktionspunkt weniger.',
        lesson: 'Gesundheitskrisen senken die Produktivität einer ganzen Volkswirtschaft.',
        apply: g => { g.roundMods.apDelta = -1; },
    },
    {
        title: 'Helikoptergeld', icon: '🚁', kind: 'mixed',
        text: () => 'Die US-Notenbank verteilt Geld aus Helikoptern: Alle erhalten 300 USD — aber der Dollar verliert 25%.',
        lesson: 'Geldmenge ↑ ohne mehr Güter → Inflation. Das Geschenk ist weniger wert, als es scheint.',
        apply: g => { g.players.forEach(p => { p.money.usd += 300; }); g.rates.usd *= 0.75; },
    },
    {
        title: 'Schuldenerlass', icon: '✂️', kind: 'good',
        text: () => 'Internationaler Schuldenschnitt! Alle Kredite werden um 50% reduziert.',
        lesson: 'Bei einem Schuldenschnitt verzichten Gläubiger auf einen Teil ihrer Forderungen.',
        apply: g => { g.players.forEach(p => { p.debt = Math.floor(p.debt * 0.5); }); },
    },
    {
        title: 'Streik in Afrika', icon: '✊', kind: 'bad',
        text: () => 'Die Energiearbeiter streiken für höhere Löhne. Energie +50%, dafür bringt Arbeiten in Afrika doppelten Lohn.',
        lesson: 'Gewerkschaften verhandeln kollektiv über Löhne (Arbeitsrecht, Streikrecht).',
        apply: g => { g.priceIndex.afrika *= 1.5; g.roundMods.doubleWage = 'afrika'; },
    },
    {
        title: 'Marktöffnung', icon: '🌍', kind: 'good',
        text: () => 'Freihandelsabkommen! Diese Runde gibt es keinen Aufschlag beim Kauf mit Fremdwährung und keine Wechselgebühren.',
        lesson: 'Freihandel senkt Transaktionskosten und fördert den Austausch von Gütern.',
        apply: g => { g.roundMods.freeTrade = true; },
    },
];

const NEWS_FLAVOR = [
    'Experten: "Bunker sind das neue Betongold"',
    'Immobilienpreise für Kellerräume explodieren',
    'Umfrage: 87% würden für einen Bunkerplatz ihre Grossmutter verkaufen',
    'Dosenravioli-Aktie auf Allzeithoch',
    'Zentralbank-Chef: "Alles unter Kontrolle" (schwitzt stark)',
    'Neuer Trend: Survival-Influencer zeigen ihre Vorratskammern',
    'Wetter: Morgen sonnig, mit Chance auf Atompilze',
    'Versicherungen streichen "Weltuntergang" aus den Policen',
    'BunkerCoin-Gründer seit Tagen nicht erreichbar',
    'Schweiz meldet: Bunkerplätze für alle — ausser für euch',
    'Ökonomen uneinig, ob Apokalypse gut für das BIP ist',
    'Rekordnachfrage nach Jodtabletten',
];

function rand(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function randInt(min, max) {
    return min + Math.floor(Math.random() * (max - min + 1));
}
