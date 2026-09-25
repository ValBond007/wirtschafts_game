# ☢ BUNKER – Überleben im Wirtschaftskrieg

Ein 3D-Strategiespiel für 2–6 Spieler (Menschen und/oder KI) für das Ergänzungsfach Wirtschaft & Recht.

## Starten

1. Ordner herunterladen (auf GitHub: grüner Button **Code → Download ZIP**, danach entpacken).
2. `index.html` doppelklicken. Das Spiel öffnet sich im Browser (Safari, Chrome, Firefox, Edge).

Das Spiel braucht keine Installation und kein Internet. Ton einschalten lohnt sich.

## Ziel

Ein Atomkrieg steht bevor. Wann er genau ausbricht, weiss niemand. Die DEFCON-Anzeige zeigt nur, wie nah er ist.
Wer beim Kriegsausbruch **in seinem fertigen Bunker sitzt und keine Schulden hat**, überlebt.
Es gibt nur halb so viele Bunker wie Spieler.

## Spielablauf

- Jede Runde beginnt mit einer **Ereigniskarte** (z. B. Hyperinflation, Börsencrash, Embargo, Zinserhöhung).
- Alle erhalten ein kleines Einkommen in der Währung ihres Standorts.
- Jeder Spieler hat pro Zug **3 Aktionspunkte**.

| Kontinent   | Währung | Ressource       | Effekt                           |
|-------------|---------|-----------------|----------------------------------|
| Nordamerika | USD     | ⚔️ Militär      | Angreifen und verteidigen        |
| Südamerika  | Peso    | 🌽 Lebensmittel | Essen = +1 Aktionspunkt          |
| Europa      | EUR     | ⚙️ Technik      | Reisen 30% günstiger             |
| Afrika      | ARA     | ⚡ Energie      | Reisen 20% günstiger             |
| zufällig    | –       | 💎 Rohstoffe    | Joker für jede Bunker-Ressource  |

**Bunker:** 3 Lebensmittel, 2 Technik, 3 Energie und 2 Militär sammeln. Dann zu einem freien Bunker-Standort reisen (Südl. Alpen, Neuseeland, Spitzbergen) und 3× bauen. Danach im Bunker bleiben!

**Aktionen:** Reisen (auf die Weltkugel klicken) · Markt (kaufen, verkaufen, Schwarzmarkt) · Arbeiten · Bank (Geld wechseln, Kredit, Versicherung) · Krypto · Angriff · Essen · Vertrag · Bunker bauen.

Die ausführliche Anleitung gibt es im Spiel über den ❓-Knopf.

## Zusammenfassung: Wirtschaft & Recht im Spiel

Die Spieler handeln wie *homo oeconomicus* unter Zeitdruck und Knappheit. Es gibt nur wenige Bunker, und jeder Aktionspunkt kann nur einmal ausgegeben werden.
Jede Entscheidung hat deshalb **Opportunitätskosten**: Wer arbeitet, kauft in dieser Zeit nichts ein.

Jeder Kontinent hat eine eigene **Währung**. Die **Wechselkurse** schwanken jede Runde. Wer in fremder Währung bezahlt, zahlt einen Aufschlag, und die Bank verlangt eine Wechselgebühr.
Die allgemeine **Teuerung (Inflation)** lässt die Preise jede Runde steigen. Ereigniskarten wie «Hyperinflation» oder «Helikoptergeld» zeigen, was passiert, wenn die Geldmenge wächst.
Jeder Kauf treibt den Preis nach oben (**Angebot und Nachfrage**). Knappheit («Missernte») und Überangebot verändern die Preise ebenfalls.

**Kredite** helfen kurzfristig, wachsen aber mit **Zins und Zinseszins**. Wer zu viele Schulden hat, wird **betrieben**, und die Bank **pfändet** Ressourcen.
Wer bei Kriegsausbruch noch Schulden hat, verliert sogar seinen Bunker. Die Kryptowährung *BunkerCoin* ist hochspekulativ. Nach jedem Geschäft gilt eine **Sperrfrist** wie bei einem Termingeschäft.

Rechtliche Themen: Spieler schliessen **Verträge** ab (Tauschhandel, Nichtangriffspakt). Dabei gelten **Vertragsfreiheit** und *pacta sunt servanda*. Wer einen Vertrag bricht, zahlt eine **Konventionalstrafe**.
**Schmuggel** auf dem Schwarzmarkt ist illegal. Wer erwischt wird, bekommt eine Busse, die Ware wird beschlagnahmt und es gibt einen Eintrag ins Strafregister.
Eine **Versicherung** überträgt das Risiko eines Raubs gegen eine Prämie. **Sanktionen/Embargos** und **UNO-Resolutionen** zeigen, wie das Völkerrecht in den Handel eingreift.

## Technik

HTML, CSS und JavaScript mit [Three.js](https://threejs.org) (liegt lokal in `lib/`, MIT-Lizenz) für die 3D-Weltkugel.
Soundeffekte werden direkt im Browser erzeugt (Web Audio API).

- `js/data.js` – Konfiguration, Orte, Währungen, Ereigniskarten
- `js/game.js` – Spielregeln und Ablauf
- `js/bots.js` – KI-Gegner
- `js/globe.js` – 3D-Weltkugel und Animationen
- `js/ui.js` – Benutzeroberfläche
- `js/audio.js` – Soundeffekte
