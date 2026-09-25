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
    studyEUR: 240,
    quizSeconds: 20,
    referendumEvery: 3,
};

// Quiz for the "Weiterbildung" action. `a` is the index of the correct answer.
const QUIZ = [
    { q: 'Was bedeutet Inflation?', o: ['Die Preise steigen allgemein, Geld verliert an Kaufkraft', 'Die Preise sinken allgemein', 'Die Arbeitslosigkeit steigt', 'Der Staat macht Schulden'], a: 0, e: 'Inflation = anhaltender Anstieg des allgemeinen Preisniveaus. Mit dem gleichen Geld kann man weniger kaufen.' },
    { q: 'Das Angebot eines Gutes sinkt, die Nachfrage bleibt gleich. Was passiert mit dem Preis?', o: ['Er sinkt', 'Er steigt', 'Er bleibt gleich', 'Das Gut wird verboten'], a: 1, e: 'Weniger Angebot bei gleicher Nachfrage macht das Gut knapper – der Preis steigt.' },
    { q: 'Du legst 1000 € zu 10% Zins an. Wie viel hast du nach 2 Jahren mit Zinseszins?', o: ['1200 €', '1100 €', '1210 €', '1020 €'], a: 2, e: '1000 × 1.1 = 1100 nach einem Jahr, 1100 × 1.1 = 1210 nach zwei Jahren. Auch die Zinsen werden verzinst.' },
    { q: 'Was sind Opportunitätskosten?', o: ['Die Kosten für Gelegenheitsjobs', 'Der entgangene Nutzen der besten nicht gewählten Alternative', 'Die Steuern auf Gewinne', 'Gebühren beim Geldwechsel'], a: 1, e: 'Wer sich für A entscheidet, verzichtet auf B. Der Nutzen von B sind die Opportunitätskosten – z. B. arbeiten statt einkaufen.' },
    { q: 'Wie viele Unterschriften braucht eine eidgenössische Volksinitiative?', o: ['50 000', '100 000', '10 000', '1 Million'], a: 1, e: '100 000 gültige Unterschriften innert 18 Monaten. Ein fakultatives Referendum braucht 50 000 Unterschriften innert 100 Tagen.' },
    { q: 'Wer bestimmt in der Schweiz die Geldpolitik (z. B. den Leitzins)?', o: ['Der Bundesrat', 'Die UBS', 'Die Schweizerische Nationalbank (SNB)', 'Das Parlament'], a: 2, e: 'Die SNB ist unabhängig. Ihr Hauptziel ist Preisstabilität – eine Teuerung von weniger als 2% pro Jahr.' },
    { q: 'Der Franken wird gegenüber dem Euro stärker (Aufwertung). Was bedeutet das für Schweizer Exporteure?', o: ['Ihre Produkte werden im Ausland teurer', 'Ihre Produkte werden im Ausland billiger', 'Nichts', 'Sie zahlen weniger Steuern'], a: 0, e: 'Ausländische Kunden brauchen mehr Euro für dieselben Franken – Schweizer Exporte werden teurer und schwerer zu verkaufen.' },
    { q: 'Wie kommt nach Obligationenrecht (OR) ein Vertrag zustande?', o: ['Nur mit Unterschrift beim Notar', 'Durch übereinstimmende gegenseitige Willensäusserung', 'Durch Bezahlung', 'Nur schriftlich'], a: 1, e: 'Art. 1 OR: Angebot und Annahme müssen übereinstimmen. Viele Verträge sind sogar mündlich gültig.' },
    { q: 'Was ist eine Konventionalstrafe?', o: ['Eine Busse der Polizei', 'Eine im Vertrag vereinbarte Strafzahlung bei Vertragsverletzung', 'Eine Steuer auf Verträge', 'Eine Gefängnisstrafe'], a: 1, e: 'Die Parteien vereinbaren selbst, was bei Nichterfüllung zu zahlen ist (Art. 160 ff. OR) – wie beim Pakt im Spiel.' },
    { q: 'Ab welchem Alter ist man in der Schweiz volljährig und voll handlungsfähig?', o: ['16', '18', '20', '21'], a: 1, e: 'Mit 18 Jahren ist man volljährig (Art. 14 ZGB) und kann selbständig Verträge abschliessen.' },
    { q: 'Was macht ein Kartell?', o: ['Es vergibt Kredite', 'Unternehmen sprechen Preise oder Mengen ab und schalten so den Wettbewerb aus', 'Es kontrolliert Grenzen', 'Es versichert Firmen'], a: 1, e: 'Harte Kartelle sind nach dem Kartellgesetz verboten. In der Schweiz wacht die Wettbewerbskommission (WEKO) darüber.' },
    { q: 'Bis zu welchem Betrag sind Bankguthaben in der Schweiz durch die Einlagensicherung geschützt?', o: ['10 000 CHF', '50 000 CHF', '100 000 CHF', 'unbegrenzt'], a: 2, e: 'Pro Kunde und Bank sind Guthaben bis 100 000 CHF geschützt, falls die Bank pleitegeht.' },
    { q: 'Was ist ein Zoll?', o: ['Eine Abgabe auf eingeführte (importierte) Waren', 'Eine Masseinheit', 'Eine Art Kredit', 'Eine Versicherung'], a: 0, e: 'Zölle verteuern Importe. Das schützt heimische Produzenten, macht Waren für Konsumenten aber teurer.' },
    { q: 'Was misst das Bruttoinlandprodukt (BIP)?', o: ['Das Vermögen aller Einwohner', 'Den Wert aller in einem Jahr im Inland hergestellten Waren und Dienstleistungen', 'Die Staatsschulden', 'Die Anzahl Unternehmen'], a: 1, e: 'Das BIP ist das wichtigste Mass für die wirtschaftliche Leistung eines Landes.' },
    { q: 'Was passiert bei einer Betreibung, wenn der Schuldner nicht zahlt und keinen Rechtsvorschlag erhebt?', o: ['Nichts', 'Die Schuld verfällt', 'Es kann zur Pfändung seines Vermögens kommen', 'Er muss ins Gefängnis'], a: 2, e: 'Nach dem Zahlungsbefehl hat der Schuldner 10 Tage für einen Rechtsvorschlag. Sonst kann gepfändet werden (SchKG).' },
    { q: 'Was bedeutet «Moral Hazard» bei Versicherungen?', o: ['Versicherte verhalten sich riskanter, weil der Schaden ja gedeckt ist', 'Versicherungen sind unmoralisch', 'Versicherungen dürfen keine Gewinne machen', 'Man muss jede Versicherung abschliessen'], a: 0, e: 'Wer versichert ist, passt oft weniger auf. Deshalb gibt es Selbstbehalte.' },
    { q: 'Welche Aussage über Kryptowährungen wie Bitcoin stimmt?', o: ['Sie werden von der SNB herausgegeben', 'Ihr Wert ist garantiert', 'Sie funktionieren dezentral ohne Zentralbank und schwanken stark', 'Sie sind in der Schweiz verboten'], a: 2, e: 'Kryptowährungen basieren auf einer Blockchain. Es gibt keine Zentralbank, die den Wert stabilisiert – daher die hohe Volatilität.' },
    { q: 'Was ist ein Termingeschäft?', o: ['Ein Geschäft mit Terminkalendern', 'Ein Vertrag, der heute abgeschlossen, aber erst später erfüllt wird', 'Ein Geschäft nur an Werktagen', 'Ein Kredit ohne Zins'], a: 1, e: 'Preis und Menge werden heute festgelegt, Lieferung und Zahlung erfolgen später. Man ist so lange gebunden – wie die Sperrfrist im Spiel.' },
    { q: 'Was bedeutet «Diversifikation» bei Geldanlagen?', o: ['Alles in eine Aktie investieren', 'Das Risiko auf verschiedene Anlagen verteilen', 'Nur Bargeld halten', 'Schulden machen, um zu investieren'], a: 1, e: '«Nicht alle Eier in einen Korb legen»: Fällt eine Anlage, gleichen andere den Verlust aus.' },
    { q: 'Was ist ein Monopol?', o: ['Viele Anbieter, ein Nachfrager', 'Ein einziger Anbieter beherrscht den Markt', 'Ein Brettspiel ohne Regeln', 'Ein staatlicher Kredit'], a: 1, e: 'Ohne Konkurrenz kann ein Monopolist höhere Preise verlangen. Deshalb gibt es Wettbewerbsrecht.' },
    { q: 'Wie hoch ist der normale Mehrwertsteuersatz in der Schweiz (seit 2024)?', o: ['2.6%', '7.7%', '8.1%', '19%'], a: 2, e: 'Seit dem 1. Januar 2024 beträgt der Normalsatz 8.1% (reduzierter Satz 2.6% z. B. für Lebensmittel).' },
    { q: 'Was schützt der Pflichtteil im Erbrecht?', o: ['Nahe Angehörige davor, komplett enterbt zu werden', 'Den Staat vor Steuerausfällen', 'Banken vor Verlusten', 'Mieter vor Kündigungen'], a: 0, e: 'Einen Teil des Erbes kann man seinen Nachkommen (und dem Ehepartner) nicht wegnehmen (ZGB).' },
    { q: 'Was ist Deflation?', o: ['Ein allgemeiner Rückgang der Preise', 'Ein starker Preisanstieg', 'Ein Börsencrash', 'Eine Steuererhöhung'], a: 0, e: 'Klingt gut, ist aber gefährlich: Wer sinkende Preise erwartet, kauft später – die Wirtschaft bremst ab.' },
    { q: 'Warum senkt eine Zentralbank die Leitzinsen?', o: ['Um die Wirtschaft anzukurbeln', 'Um die Inflation zu erhöhen, weil sie das mag', 'Um Banken zu bestrafen', 'Um den Franken zu verbieten'], a: 0, e: 'Tiefe Zinsen machen Kredite billig. Firmen investieren und Menschen konsumieren mehr.' },
    { q: 'Was ist eine Sanktion (Embargo) im Völkerrecht?', o: ['Eine Belohnung für ein Land', 'Ein Verbot, mit einem Staat Handel zu treiben, um Druck auszuüben', 'Ein Freihandelsabkommen', 'Eine Währungsreform'], a: 1, e: 'Sanktionen sollen einen Staat zu einem bestimmten Verhalten bewegen, ohne militärische Gewalt.' },
    { q: 'Schwarzmarkt: Warum sind die Preise dort meist höher?', o: ['Weil die Händler ein Strafrisiko tragen und das Angebot knapp ist', 'Weil dort Mehrwertsteuer anfällt', 'Weil der Staat die Preise festlegt', 'Sie sind immer tiefer'], a: 0, e: 'Das Risiko erwischt zu werden wird «eingepreist» – wie im Spiel beim Schmuggeln.' },
    { q: 'Was versteht man unter dem «Sicherheitsdilemma»?', o: ['Alle rüsten auf, um sicher zu sein – und am Ende fühlt sich niemand sicherer', 'Ein Problem bei Tresoren', 'Ein Streit zwischen Versicherungen', 'Eine Regel im Strassenverkehr'], a: 0, e: 'Aufrüstung des einen wird vom anderen als Bedrohung wahrgenommen – ein Wettrüsten beginnt.' },
    { q: 'Was bedeutet Arbeitsteilung?', o: ['Jeder stellt alles selbst her', 'Menschen oder Regionen spezialisieren sich und tauschen ihre Güter', 'Man teilt sich eine Stelle zu zweit', 'Der Staat verteilt die Arbeit'], a: 1, e: 'Spezialisierung steigert die Produktivität – wie im Spiel, wo jeder Kontinent eine andere Ressource herstellt.' },
];

// Direct-democracy proposals. `botVote` models self-interest; `apply` runs if accepted.
const PROPOSALS = [
    {
        id: 'wealthtax', icon: '💰', title: 'Initiative «Reiche sollen zahlen»',
        text: 'Wer mehr als 1500 € Bargeld besitzt, gibt 20% davon ab. Der Ertrag wird gleichmässig an alle verteilt.',
        pro: 'Alle bekommen eine faire Chance auf einen Bunkerplatz.',
        contra: 'Wer fleissig war, wird bestraft.',
        lesson: 'Umverteilung: Wer profitiert, stimmt meist dafür. Eigeninteresse prägt Abstimmungen (Public Choice).',
        botVote: (g, p) => fiatEUR(p) < 1500,
        apply: g => {
            let pot = 0;
            g.players.forEach(p => {
                if (fiatEUR(p) <= 1500) return;
                for (const c of FIAT) {
                    const take = Math.floor(p.money[c] * 0.2);
                    p.money[c] -= take;
                    pot += toEUR(c, take);
                }
            });
            const share = Math.floor(pot / g.players.length);
            g.players.forEach(p => { p.money.eur += share; });
            return `Umverteilt: ${fmt(pot)} € – jeder erhält ${fmt(share)} €.`;
        },
    },
    {
        id: 'basicincome', icon: '🎁', title: 'Bedingungsloses Grundeinkommen',
        text: 'Ab sofort erhalten alle das doppelte Einkommen pro Runde. Finanziert wird es mit frisch gedrucktem Geld: Alle Preise steigen sofort um 12%.',
        pro: 'Mehr Geld für alle, ohne Bedingungen.',
        contra: 'Mehr Geld ohne mehr Güter führt zu Inflation.',
        lesson: 'Wird Geld gedruckt, ohne dass mehr produziert wird, steigen die Preise. Das zusätzliche Einkommen ist weniger wert.',
        botVote: (g, p) => fiatEUR(p) < 900,
        apply: g => {
            g.laws.basicIncome = true;
            for (const id of CONTINENT_IDS) g.priceIndex[id] *= 1.12;
            g.cpi *= 1.12;
        },
    },
    {
        id: 'cryptoban', icon: '🚫', title: 'Kryptoverbot',
        text: 'BunkerCoin wird verboten. Alle Coins werden zum halben Kurs in EUR umgetauscht, Krypto-Handel ist danach nicht mehr möglich.',
        pro: 'Schützt vor Spekulation und Betrug.',
        contra: 'Enteignet die Krypto-Besitzer.',
        lesson: 'Regulierung kann Anleger schützen, greift aber auch in die Eigentumsfreiheit ein.',
        botVote: (g, p) => p.money.crypto === 0,
        apply: g => {
            g.laws.cryptoBan = true;
            g.players.forEach(p => {
                p.money.eur += Math.floor(toEUR('crypto', p.money.crypto) * 0.5);
                p.money.crypto = 0;
            });
        },
    },
    {
        id: 'armsban', icon: '🕊️', title: 'Initiative «Stopp den Waffenexporten»',
        text: 'Militärgüter dürfen nicht mehr frei gehandelt werden. Militär wird sofort 60% teurer.',
        pro: 'Weniger Waffen, weniger Überfälle.',
        contra: 'Wer schon Militär hat, ist im Vorteil.',
        lesson: 'Gesetze können Märkte gezielt einschränken. Das verändert Preise und Machtverhältnisse.',
        botVote: (g, p) => p.resources.military < 2,
        apply: g => { g.priceIndex.nordamerika *= 1.6; },
    },
    {
        id: 'shelter', icon: '🛖', title: 'Schutzraumpflicht',
        text: 'Der Staat subventioniert Bunker: Ab sofort braucht jeder Bunker 1 Energie weniger. Finanziert durch eine Steuer von 100 € pro Person.',
        pro: 'Schutz für die ganze Bevölkerung.',
        contra: 'Alle zahlen, auch wer schon einen Bunker hat.',
        lesson: 'Die Schweiz kennt tatsächlich eine Schutzraumpflicht: Für fast alle Einwohner gibt es einen Schutzplatz.',
        botVote: (g, p) => !ownedBunker(p),
        apply: g => {
            g.laws.shelter = true;
            g.players.forEach(p => { payEUR(p, Math.min(100, fiatEUR(p)), localCurrency(p)); });
        },
    },
    {
        id: 'ratecap', icon: '🧢', title: 'Zinsdeckel-Initiative',
        text: 'Kredite dürfen höchstens 6% Zins pro Runde kosten. Dafür vergeben die Banken nur noch maximal 400 € Kredit pro Person.',
        pro: 'Schützt Schuldner vor Wucherzinsen.',
        contra: 'Weniger Kredite für alle (Kreditklemme).',
        lesson: 'Ein Höchstzins schützt Schuldner, führt aber oft dazu, dass Banken weniger Kredite vergeben.',
        botVote: (g, p) => p.debt > 0 || fiatEUR(p) < 500,
        apply: g => { g.laws.rateCap = true; },
    },
    {
        id: 'freetrade', icon: '🌍', title: 'Freihandelsabkommen',
        text: 'Kaufen mit Fremdwährung kostet nur noch 10% Aufschlag, Geldwechsel nur 1% Gebühr. Aber: Die Löhne sinken um 15% (mehr Konkurrenz).',
        pro: 'Billigerer Handel über Grenzen.',
        contra: 'Druck auf die Löhne.',
        lesson: 'Freihandel senkt Kosten für Konsumenten, setzt aber Arbeitnehmende einem stärkeren Wettbewerb aus.',
        botVote: (g, p) => p.stats.travelled >= 3,
        apply: g => { g.laws.freeTrade = true; },
    },
    {
        id: 'minwage', icon: '💶', title: 'Mindestlohn-Initiative',
        text: 'Arbeiten bringt ab sofort 40% mehr. Die Firmen geben die Kosten weiter: Alle Preise steigen um 8%.',
        pro: 'Von Arbeit muss man leben können.',
        contra: 'Höhere Löhne führen zu höheren Preisen.',
        lesson: 'Höhere Lohnkosten werden oft über die Preise an die Konsumenten weitergegeben (Lohn-Preis-Spirale).',
        botVote: (g, p) => p.stats.worked >= 3,
        apply: g => {
            g.laws.minWage = true;
            for (const id of CONTINENT_IDS) g.priceIndex[id] *= 1.08;
            g.cpi *= 1.08;
        },
    },
];

const LAW_LABELS = {
    basicIncome: '🎁 Grundeinkommen',
    cryptoBan: '🚫 Kryptoverbot',
    shelter: '🛖 Schutzraumpflicht',
    rateCap: '🧢 Zinsdeckel',
    freeTrade: '🌍 Freihandel',
    minWage: '💶 Mindestlohn',
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

// Colorblind-validated categorical order (dark surface); order matters for adjacent-pair separation.
const PLAYER_COLORS = ['#3987e5', '#d95926', '#199e70', '#c98500', '#d55181', '#008300'];
const BOT_NAMES = ['Gordon Gekko', 'Dagobert', 'Elon Mosk', 'Frau Lagarde', 'Warren B.', 'Satoshi'];

const CHARACTERS = {
    bankerin: {
        name: 'Die Bankerin', icon: '💼',
        power: 'Keine Wechselgebühren. Zahlt nur den halben Kreditzins.',
        story: 'Hat 2008 überlebt. Das hier schafft sie auch.',
    },
    general: {
        name: 'Der General', icon: '🎖️',
        power: '+1 auf jeden Kampfwurf. Startet mit 1 Militär.',
        story: 'Hat den roten Knopf schon einmal gesehen. Von nahem.',
    },
    ingenieurin: {
        name: 'Die Ingenieurin', icon: '🛠️',
        power: 'Bunker braucht 1 Technik weniger und nur 2 Bauschritte.',
        story: 'Baut Bunker schneller als IKEA-Regale.',
    },
    bauer: {
        name: 'Der Bauer', icon: '🧑‍🌾',
        power: 'Startet mit 2 Lebensmitteln. Darf 3× pro Zug essen.',
        story: 'Hat genug Kartoffeln für drei Weltuntergänge.',
    },
    kryptobro: {
        name: 'Der Krypto-Bro', icon: '🚀',
        power: 'Keine Sperrfrist nach Krypto-Geschäften. Startet mit 2 BunkerCoin.',
        story: 'HODL. Auch während der Apokalypse.',
    },
    schmugglerin: {
        name: 'Die Schmugglerin', icon: '🦹',
        power: 'Schwarzmarkt nur 1.5× Preis und nur 10% Risiko.',
        story: 'Kennt jeden Grenzbeamten beim Vornamen.',
    },
    diplomat: {
        name: 'Der Diplomat', icon: '🎩',
        power: 'Ignoriert Embargos und Grenzschliessungen. Reisen 15% günstiger.',
        story: 'Diplomatenpass öffnet jede Tür. Fast jede.',
    },
    oekonomin: {
        name: 'Die Ökonomin', icon: '📊',
        power: 'Sieht die nächste Ereigniskarte voraus. +50% Einkommen.',
        story: 'Hat die Krise vorausgesagt. Niemand hat zugehört.',
    },
};
const CHARACTER_IDS = Object.keys(CHARACTERS);

const AI_SPEEDS = {
    slow: { label: 'Langsam', delay: 1200, travel: 1.3 },
    normal: { label: 'Normal', delay: 700, travel: 1 },
    fast: { label: 'Schnell', delay: 200, travel: 0.55 },
};

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
    {
        title: 'Stellvertreterkrieg', icon: '🎯', kind: 'bad',
        text: c => `Eine Rakete schlägt in ${LOCATIONS[c].name} ein! Alle Spieler dort verlieren 1 zufällige Ressource (ausser sie sind versichert). Die Preise dort steigen um 30%.`,
        lesson: 'Kriege zerstören Kapital und Infrastruktur. Das verknappt Güter und treibt die Preise.',
        pick: g => rand(CONTINENT_IDS),
        apply: (g, c) => {
            g.priceIndex[c] *= 1.3;
            g.players.filter(p => p.location === c).forEach(p => {
                const owned = Object.keys(p.resources).filter(k => p.resources[k] > 0);
                if (!owned.length || p.insurance > 0) return;
                p.resources[rand(owned)]--;
            });
        },
        fx: (g, c) => Globe.missileBetween(rand(CONTINENT_IDS.filter(x => x !== c)), c, '#ff3b3b'),
    },
    {
        title: 'Bank-Run', icon: '🏚️', kind: 'bad',
        text: c => `Gerüchte über eine Pleite der Zentralbank von ${LOCATIONS[c].name}! Alle verlieren 25% ihrer ${CURRENCIES[LOCATIONS[c].currency].name}-Ersparnisse.`,
        lesson: 'Heben alle gleichzeitig ihr Geld ab, kann jede Bank zahlungsunfähig werden. In der Schweiz schützt die Einlagensicherung Guthaben bis 100 000 CHF.',
        pick: g => rand(CONTINENT_IDS),
        apply: (g, c) => {
            const cur = LOCATIONS[c].currency;
            g.players.forEach(p => { p.money[cur] = Math.floor(p.money[cur] * 0.75); });
        },
    },
    {
        title: 'Lieferkettenkrise', icon: '🚢', kind: 'bad',
        text: () => 'Ein Frachter blockiert den Suezkanal. Alle Ressourcen werden 25% teurer.',
        lesson: 'Globale Lieferketten sind effizient, aber anfällig: Ein einziger Engpass verteuert weltweit alles.',
        apply: g => { for (const id of CONTINENT_IDS) g.priceIndex[id] *= 1.25; },
    },
    {
        title: 'Mindestlohn', icon: '💶', kind: 'good',
        text: () => 'Das Parlament führt einen Mindestlohn ein. Arbeiten bringt diese Runde 50% mehr.',
        lesson: 'Ein Mindestlohn ist eine gesetzliche Lohnuntergrenze. Er schützt Arbeitnehmende, erhöht aber die Kosten der Arbeitgeber.',
        apply: g => { g.roundMods.wageMult = 1.5; },
    },
    {
        title: 'Erbschaft', icon: '📜', kind: 'good',
        text: id => `Eine reiche Tante von ${game.players[id].name} ist verstorben. ${game.players[id].name} erbt 400 EUR!`,
        lesson: 'Das Erbrecht (ZGB) regelt, wer das Vermögen einer verstorbenen Person erhält. Pflichtteile schützen nahe Verwandte.',
        pick: g => rand(g.players).id,
        apply: (g, id) => { g.players[id].money.eur += 400; },
    },
    {
        title: 'Energie-Kartell', icon: '🛢️', kind: 'bad',
        text: () => 'Die Energieproduzenten sprechen heimlich ihre Preise ab. Energie kostet fast das Doppelte!',
        lesson: 'Preisabsprachen (Kartelle) schalten den Wettbewerb aus und sind laut Kartellgesetz verboten.',
        apply: g => { g.priceIndex.afrika *= 1.9; },
    },
    {
        title: 'Spionage-Skandal', icon: '🕵️', kind: 'mixed',
        text: () => 'Abhörprotokolle tauchen auf! Das Vertrauen ist zerstört – alle Nichtangriffspakte werden aufgelöst.',
        lesson: 'Ändern sich die Umstände grundlegend, kann ein Vertrag angepasst oder aufgelöst werden (clausula rebus sic stantibus).',
        apply: g => { g.pacts = []; },
    },
    {
        title: 'Zollkrieg', icon: '🧱', kind: 'bad',
        text: () => 'Alle Länder erheben Strafzölle. Wer diese Runde mit Fremdwährung einkauft, zahlt 60% Aufschlag statt 30%.',
        lesson: 'Zölle verteuern importierte Güter. Sie schützen die heimische Wirtschaft, schaden aber Konsumenten und dem Handel.',
        apply: g => { g.roundMods.foreignMarkup = 1.6; },
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
