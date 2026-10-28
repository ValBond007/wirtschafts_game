# Design Thinking – BUNKER

Dieses Dokument zeigt, wie das Spiel **BUNKER – Überleben im Wirtschaftskrieg** mit Design Thinking entwickelt wurde. Es folgt den sieben Schritten aus dem Auftrag:

**STRATEGY → RESEARCH → SYNTHESIZE → IDEATE → PROTOTYPE & EVALUATE → BUILD**

Der Prozess ist nicht linear. Erkenntnisse aus Tests haben uns immer wieder zu früheren Phasen zurückgeführt (siehe Phase 5). Ein Beispiel: Die Befragung (Research) hat unsere Insights verändert (Synthesize) und zu neuen Regeln geführt (Ideate → Prototyp 6).

> **Legende**
> ✅ = erledigt und beschrieben
> ✍️ = muss mit **euren echten Daten** ergänzt werden (Interviews, Beobachtungen, Testrunden). Bitte nichts erfinden – genau diese Daten machen Design Thinking aus.

| Phase | Stand |
|---|---|
| 1 Strategy | ✅ ausgefüllt (bitte prüfen und anpassen) |
| 2 Research | ✅ Befragung durchgeführt (4 Kernaussagen) · ✍️ Anzahl Befragte und Beobachtungen ergänzen |
| 3 Synthesize | ✅ Empathy Map, Affinity Diagram, Insights und HMW-Fragen aus der Befragung |
| 4 Ideate | ✅ Ideen mit 6 Methoden gesammelt, geclustert, 3 Konzepte skizziert und bewertet · ✍️ eigene Ideen, 6-3-5 und Bewertung im Team ergänzen |
| 5 Prototype & Evaluate | ✅ 7 Prototypen + automatisierte Tests · ✍️ Testrunden mit Menschen |
| 6 Build | ✅ fertiges Spiel |

Im Spiel selbst gibt es dazu:
- **🛠️ Making-of** (Startbildschirm): zeigt den Prozess – gut für die Präsentation.
- **📝 Feedback geben** (Endbildschirm): Formular für Testpersonen.
- **📊 Testauswertung** (Startbildschirm): Durchschnittswerte, häufigste Fehlermeldungen, alle Antworten, Export nach Excel.

---

## Phase 1 – STRATEGY: Die strategische Ausgangslage klären ✅

### 1.1 Zielgruppe definieren

- **Wer soll das Spiel spielen?**
  Primär unsere Mitschüler:innen im Ergänzungsfach Wirtschaft & Recht (ca. 16–19 Jahre). Sie kennen die Begriffe aus dem Unterricht, haben aber wenig Gelegenheit, sie praktisch zu erleben.
  Sekundär: Jugendliche und junge Erwachsene, die gerne Strategie- oder Computerspiele spielen.
- **Wie gross ist die typische Spielgruppe?**
  2–6 Spieler:innen. Fehlende Mitspieler werden durch KI-Gegner ersetzt, damit das Rennen um die Bunker auch zu zweit spannend ist. Man kann sogar allein gegen die KI spielen.
- **In welchem Kontext wird gespielt?**
  1. Präsentation in der Klasse mit einer kurzen Spielrunde
  2. Spieleabend unter Freunden am Computer
  3. Repetition von W&R-Themen auf spielerische Art

### 1.2 Marktumfeld sichten

| Spiel | Was gut funktioniert | Was oft kritisiert wird* |
|---|---|---|
| Monopoly | Wirtschaftsthema, jeder kennt es | sehr lang, viel Glück, wer pleite ist, schaut nur noch zu |
| Risiko | Weltkarte, Konflikte, Strategie | sehr lange Partien |
| Die Siedler von Catan | Handel, Tausch, knappe Ressourcen | Wirtschaftsbegriffe werden nicht erklärt |
| Pandemic | Weltkarte, Zeitdruck, Spannung | kooperativ, kein Wettbewerb |
| Plague Inc. | 3D-Globus, Zeitdruck, Ereignisse | kein Wirtschaftsbezug |
| Quiz-Apps (z. B. Kahoot) | lehrreich, schnell | wenig Spieltiefe |

\* Bitte mit eigenen Recherchen bestätigen, z. B. in Rezensionen auf BoardGameGeek oder im App Store.

**Nische:** Es gibt kaum ein Spiel, das W&R-Konzepte wie Wechselkurse, Inflation, Zinseszins, Vertragsrecht und direkte Demokratie **erlebbar** macht, Spass macht **und** in einer Schulstunde spielbar ist.

### 1.3 Rahmenbedingungen klären

- **Spieldauer:** Eine Runde soll in eine Lektion passen. Deshalb gibt es den Einsteiger-Modus und die Spieldauer «Kurz» (9–11 Runden). Die echte Dauer messen wir in den Testrunden (✍️ siehe Phase 5).
- **Thematische Vorgaben (Auftrag):** Thema aus Wirtschaft & Recht, das Spiel soll zeigen, wie das Thema «funktioniert». Abgabe: Spiel + Spielregeln + ½ Seite Zusammenfassung. Präsentation mit Spielrunde.
- **Bewertung:** Thema verstanden und eingebaut · originelle, durchdachte Idee · saubere, spielbare Umsetzung mit verständlichen Regeln · überzeugende Präsentation.
- **Technik:** Läuft ohne Installation und ohne Internet im Browser (Mac und PC).

### 1.4 Absichten definieren

- **Warum entwickeln wir das Spiel?**
  Wirtschaft und Recht bestehen aus Mechanismen: verhandeln, Verträge schliessen, unter Unsicherheit entscheiden. Diese Mechanismen sollen die Mitschüler:innen selbst erleben.
- **Welches Problem soll gelöst werden?**
  Begriffe wie Inflation, Zinseszins oder Wechselkurs bleiben im Unterricht oft abstrakt. Man lernt die Definition, spürt aber nicht, was sie bedeuten.
- **Welche Ziele verfolgen wir?**
  1. Das Spiel macht Spass und ist spannend (knappe Bunker, Zeitdruck).
  2. Man versteht die Regeln in wenigen Minuten.
  3. Jede Mechanik zeigt ein echtes W&R-Konzept.
  4. Es ist in einer Präsentation spielbar.
- **Für wen ist das Produkt relevant?** Für Mitschüler:innen und die Lehrperson im EF W&R.
- **Was wissen wir bereits?** Den Auftrag, die Bewertungskriterien, den Unterrichtsstoff und unser eigenes Spielkonzept.
- **Welche Annahmen haben wir bisher nur getroffen?** (✍️ in Phase 2 überprüfen)
  - Das Bunker-Szenario (Atomkrieg) ist für die Zielgruppe spannend und nicht abschreckend.
  - Mehrere Währungen sind verständlich und nicht zu kompliziert.
  - Die 3D-Grafik motiviert zum Spielen.
  - Eine Runde ist in einer Lektion spielbar.
  - KI-Gegner machen das Spiel auch mit wenigen Menschen spannend.
  - Quizfragen werden als lehrreich und nicht als störend empfunden.

---

## Phase 2 – RESEARCH: Nutzer und Problem verstehen ✅ / ✍️

### 2.1 Geeignete Research-Methoden

| Methode | Wozu | Wer / wie viele |
|---|---|---|
| Qualitative Interviews | Bedürfnisse und Frustrationen bei Spielen verstehen | 4–6 Personen aus der Zielgruppe |
| Beobachtung bestehender Spielrunden | sehen, wo Freude, Langeweile, Verwirrung entstehen | 1 Runde Monopoly oder Catan |
| Usability-Test des Prototyps | prüfen, ob man BUNKER ohne Erklärung versteht | 2–3 Gruppen |
| Nutzerbefragung | Bewertungen sammeln | Formular «📝 Feedback geben» im Spiel |
| Markt- & Wettbewerbsanalyse | siehe 1.2 | Rezensionen lesen |

### 2.2 Bestehende Spielgruppen beobachten

Beobachtungsprotokoll (für bestehende Spiele **und** für BUNKER):

| Zeit | Situation im Spiel | Reaktion (Freude / Frust / Langeweile / Verwirrung) | Nonverbale Signale (lachen, aufs Handy schauen, diskutieren) | Notiz |
|---|---|---|---|---|
| ✍️ | | | | |
| ✍️ | | | | |

Worauf achten:
- Wann wird gelacht oder laut diskutiert?
- Wann schauen Leute aufs Handy?
- Wo wird in den Regeln nachgelesen oder nachgefragt?
- Wer verliert früh die Lust, und warum?

### 2.3 Interviewleitfaden

Kurze, offene Fragen. Keine Suggestivfragen – die Personen sollen frei erzählen. Nachfragen mit «Warum?» oder «Erzähl mehr davon».

1. Was macht für dich ein gutes Spielerlebnis aus?
2. Welches Spiel hast du zuletzt gespielt? Was hat dir daran gefallen, was nicht?
3. Was frustriert dich an Strategie- oder Brettspielen?
4. Erzähl von einem Spiel, bei dem du etwas gelernt hast, ohne es zu merken.
5. Wie bist du vorgegangen, als du zuletzt etwas über ein Wirtschaftsthema herausfinden wolltest (z. B. Inflation)?
6. Wie würdest du vorgehen, um zu verstehen, wie Wechselkurse funktionieren?
7. Wie lange darf ein Spiel in der Schule dauern, damit es noch Spass macht?

> Nicht so: «Würdest du ein Spiel spielen, um Wirtschaft zu lernen?»
> Besser: «Wie würdest du vorgehen, um zu lernen, wie Wirtschaft funktioniert?»

### 2.4 Ergebnisse der Befragung ✅

**Methode:** Wir haben uns im Team selbst befragt und die Fragen aus dem Interviewleitfaden (2.3) beantwortet.

> **Grenze dieser Methode:** Als Entwickler:innen kennen wir unser Spiel schon und sind keine neutralen Testpersonen. Eine Selbstbefragung ist deshalb nicht repräsentativ für die ganze Zielgruppe. Umso wichtiger sind die Testrunden mit Mitschüler:innen in Phase 5 (5.3), in denen wir die Ergebnisse überprüfen.

Diese Punkte wurden genannt (sinngemäss):

| # | Aussage aus der Befragung |
|---|---|
| 1 | Das Spiel braucht einen **hohen Skillcap**: Wer gut spielt, soll sich durch Können absetzen. |
| 2 | Es darf **nicht zu lange dauern**. Partien dürfen unterschiedlich lang sein, aber die **Unterschiede dürfen nicht zu gross** sein. |
| 3 | Es soll **strategisch** sein, damit das Spiel einen Sinn hat. |
| 4 | **Je weiter vorne man ist, also fast am Ziel, desto angreifbarer soll man sein**, weil die anderen nicht wollen, dass man gewinnt. |

Zu unseren Annahmen aus 1.4 (Bunker-Szenario, Währungen, 3D-Grafik, Quiz) gab es keine direkten Aussagen. Sie bleiben offen und werden in den Testrunden (5.3) geprüft.


---

## Phase 3 – SYNTHESIZE: Informationen interpretieren ✅

### 3.1 Muster synthetisieren

**Empathy Map** der Zielgruppe.
Nur «Sagt» stammt direkt aus der Befragung. «Denkt», «Fühlt» und «Tut» sind **unsere Interpretation** – in den Testrunden beobachten, ob sie stimmen.

| Sagt (aus der Befragung) | Denkt (Interpretation) |
|---|---|
| «Es braucht einen hohen Skillcap.»<br>«Es darf nicht zu lange dauern – und die Partien sollen nicht zu unterschiedlich lang sein.»<br>«Es soll strategisch sein, sonst hat das Spiel keinen Sinn.»<br>«Wer fast am Ziel ist, soll angreifbar sein, weil die anderen nicht wollen, dass er gewinnt.» | «Wenn Glück entscheidet, lohnt sich Nachdenken nicht.»<br>«Ich will vorausplanen und besser werden können.»<br>«Ich habe nur begrenzt Zeit für ein Spiel.» |

| Fühlt (Interpretation) | Tut (Interpretation – ✍️ in Testrunden beobachten) |
|---|---|
| Frust, wenn ein Würfelwurf eine gute Strategie zunichtemacht.<br>Ungeduld, wenn eine Partie zu lange oder unvorhersehbar lange dauert.<br>Ehrgeiz und Spannung, wenn alle den Führenden aufhalten wollen. | Plant voraus und vergleicht sich mit den anderen.<br>Verbündet sich gegen den, der vorne liegt.<br>Verliert die Lust, wenn das Ergebnis früh feststeht. |

**Affinity Diagram** – die Aussagen gruppiert:

| Cluster | Aussagen |
|---|---|
| 🧠 Können statt Glück | hoher Skillcap (1) · strategisch, damit es Sinn hat (3) |
| ⏱️ Spieldauer | nicht zu lange · keine zu grossen Unterschiede zwischen den Partien (2) |
| ⚔️ Spannung bis zum Schluss | wer vorne liegt, soll angreifbar sein (4) |

### 3.2 Insights formulieren

Schema: **«Eine [Zielgruppe] braucht eine [Möglichkeit / Bedürfnis], weil [Erkenntnis / Grund].»**

Insights aus der Befragung:

1. «Unsere Mitspieler:innen brauchen ein Spiel, in dem Können und Planung mehr zählen als Glück, weil sich gute Entscheidungen sonst nicht lohnen und das Spiel keinen Sinn hat.» *(Aussagen 1 und 3)*
2. «Spieler, die zurückliegen, brauchen eine Möglichkeit, den Führenden aufzuhalten, weil das Spiel sonst entschieden ist, bevor es zu Ende ist.» *(Aussage 4)*
3. «Eine Klasse braucht Partien mit kurzer und vorhersehbarer Dauer, weil die Zeit in einer Lektion begrenzt ist.» *(Aussage 2)*

Frühere Hypothesen (vor der Befragung, noch nicht überprüft):
- «Schüler:innen im EF W&R brauchen ein Spiel, in dem Wirtschaftsbegriffe direkte Folgen haben, weil Begriffe wie Inflation im Unterricht abstrakt bleiben.»
- «Neue Spieler:innen brauchen eine Einführung während des Spiels, weil lange Regeltexte abschrecken.»
- «Kleine Gruppen brauchen zusätzliche Gegenspieler, weil ein Wettbewerb um knappe Bunker erst mit mehreren Spielern spannend wird.»

### 3.3 Leitfragen («How Might We») ableiten

Aus der Befragung:
- Wie könnten wir das Glück im Kampf verringern, ohne die Spannung zu verlieren?
- Wie könnten wir den Spielern erlauben, vorauszuplanen?
- Wie könnten wir die Wahl des Bunkers zu einer echten strategischen Entscheidung machen?
- Wie könnten wir den Führenden angreifbar machen, ohne dass er chancenlos ist?
- Wie könnten wir gute Spieler auch bei einer Niederlage belohnen?
- Wie könnten wir die Spieldauer überraschend, aber trotzdem gut planbar machen?

Frühere HMW-Fragen (vor der Befragung):
- Wie könnten wir Inflation spürbar machen, ohne sie lange zu erklären?
- Wie könnten wir die Regeln so vermitteln, dass man nach 3 Minuten losspielen kann?
- Wie könnten wir das Spiel in einer Schulstunde spielbar machen?
- Wie könnten wir dafür sorgen, dass auch Verlierer etwas lernen?
- Wie könnten wir Recht (Verträge, Strafen, Abstimmungen) erlebbar machen?
- Wie könnten wir das Spiel auch mit nur 2 Personen spannend machen?

➔ **Ergebnis:** Problemdefinition: «Ein Spiel, in dem man W&R-Begriffe erlebt, in dem Können statt Glück entscheidet und das bis zum Schluss spannend bleibt – in einer Schulstunde.» Dazu mehrere HMW-Fragen als Ausgangspunkt für die Ideen.

---

## Phase 4 – IDEATE: Lösungsmöglichkeiten entwickeln ✅ / ✍️

Das Problem ist jetzt verstanden (Phase 3) und wird bewusst wieder geöffnet. Wir trennen klar:
1. **Divergentes Denken:** möglichst viele, auch ungewöhnliche Ideen sammeln – **ohne zu bewerten** (4.1–4.3)
2. **Konvergentes Denken:** Ideen bewerten, kombinieren und auswählen (4.4)

### 4.1 Vorbereitung

**Verschiedene Perspektiven.** Wir nehmen bewusst unterschiedliche Rollen ein (siehe Rollentausch in 4.2):
- Gamer:in, die Strategie und Können will
- Gelegenheitsspieler:in, die das Spiel schnell verstehen will
- Lehrperson, die einen Lerneffekt sehen will
- Ökonom:in und Jurist:in, die realistische Mechanismen wollen
- Zuschauer:in bei der Präsentation, die Spannung und Spektakel will

**Regeln für die Ideensammlung:**
- Keine Kritik – es gibt keine «schlechten» Ideen.
- Menge vor Qualität.
- Ideen der anderen aufgreifen und weiterspinnen.
- Auch verrückte Ideen aufschreiben.

**Diese «How Might We»-Fragen (aus 3.3) waren während der ganzen Ideensammlung sichtbar:**
- Wie könnten wir das Glück im Kampf verringern, ohne die Spannung zu verlieren?
- Wie könnten wir den Spielern erlauben, vorauszuplanen?
- Wie könnten wir die Wahl des Bunkers zu einer echten strategischen Entscheidung machen?
- Wie könnten wir den Führenden angreifbar machen, ohne dass er chancenlos ist?
- Wie könnten wir gute Spieler auch bei einer Niederlage belohnen?
- Wie könnten wir die Spieldauer überraschend, aber trotzdem gut planbar machen?
- Wie könnten wir W&R-Begriffe spürbar machen, ohne sie lange zu erklären?

✍️ Datum, Dauer und Teilnehmende der Ideensitzung ergänzen.

### 4.2 Divergente Ideenfindung: Methoden

In dieser Phase wird **nichts bewertet**. Auch Ideen, die wir später verwerfen, gehören dazu.

#### Brainstorming

1. Unser Ausgangskonzept aus der ersten Teamsitzung: Bunker vor dem Atomkrieg, Kontinente mit eigenen Währungen und Ressourcen, nur halb so viele Bunker wie Spieler
2. Bunkerplätze werden versteigert
3. Alle bauen gemeinsam einen grossen Bunker
4. Ein geheimer Verräter im Team
5. Aktien von Rüstungs- und Lebensmittelfirmen kaufen
6. Eine «Atomkriegsversicherung», die wegen des Kleingedruckten nie zahlt
7. Schwarzmarkt mit Polizeikontrollen
8. Kopfgeld auf den Führenden
9. Zeitlimit pro Zug (Schachuhr)
10. Volksabstimmungen über Gesetze
11. Lebensmittel verderben nach einigen Runden
12. Naturkatastrophen sperren Reiserouten
13. Kredite mit Zinseszins
14. Verträge, die man brechen kann – mit Strafe
15. Quizfragen bringen Geld
16. Wer zuletzt liegt, darf zuerst ziehen

✍️ Eure eigenen Ideen aus der Teamsitzung ergänzen:
- …

#### ABC-Methode

Zu jedem Buchstaben eine Idee zum Thema «Wirtschaft im Wettlauf um den Bunker»:

| | | | |
|---|---|---|---|
| **A** Auktion um Bunkerplätze | **B** Bankenpleite | **C** Crowdfunding für einen Gemeinschaftsbunker | **D** Devisenhandel mit schwankenden Kursen |
| **E** Embargo gegen einen Kontinent | **F** Fusion: zwei Spieler legen Ressourcen zusammen | **G** Gefangenendilemma: Pakt halten oder brechen? | **H** Hyperinflation |
| **I** Insiderhandel mit Infos über die nächste Karte | **J** Jahresabschluss: Bilanz als Punktewertung | **K** Kartell: Spieler sprechen Preise ab | **L** Lieferkette: Ressourcen brauchen Vorprodukte |
| **M** Monopol auf eine Ressource | **N** Notenbank druckt Geld | **O** Opportunitätskosten jeder Aktion anzeigen | **P** Pfändung bei Schulden |
| **Q** Quiz für Bonusgeld | **R** Rationierung: Höchstmengen pro Runde | **S** Sanktionen und Schmuggel | **T** Tauschhandel ohne Geld |
| **U** Untermiete: Bunkerplatz an andere vermieten | **V** Versicherung mit Kleingedrucktem | **W** Wechselkurs-Spekulation | **X** x-facher Hebel bei Krypto |
| **Y** Yield: Zinsen auf Ersparnisse | **Z** Zölle zwischen Kontinenten | | |

#### Analogietechnik

«Wie lösen andere Bereiche unser Problem?»

| Unser Problem | Bereich | Wie es dort gelöst wird | Idee für unser Spiel |
|---|---|---|---|
| Der Führende soll angreifbar sein | Mario Kart | Der blaue Panzer trifft immer den Ersten | Kopfgeld auf den Spitzenreiter, KI jagt ihn |
| | Golf | Starke Spieler erhalten ein Handicap | Der Spitzenreiter zahlt mehr fürs Reisen |
| | Steuerrecht | Progressive Steuer: Wer mehr hat, zahlt prozentual mehr | Vermögenssteuer für den Reichsten |
| | Wettbewerbsrecht | Die WEKO greift bei Marktbeherrschung ein | Strafe für ein Monopol auf eine Ressource |
| | Sport (Draft) | Die schwächsten Teams wählen zuerst | Wer zuletzt liegt, zieht zuerst |
| Weniger Glück, mehr Können | Schach | Kein Zufall, alles ist sichtbar | Kommende Ereignisse sichtbar machen |
| | Poker | Glück ist da, aber Können entscheidet langfristig | Kleiner Würfel, grosse Wirkung der Strategie |

#### Rollentausch

«Was würde sich … von unserem Spiel wünschen?»

| Rolle | Wunsch | Idee |
|---|---|---|
| Gamer:in | Tiefe, Kombinationen, Rangliste | Punktesystem, Ruhmeshalle, Charaktere mit Fähigkeiten |
| Gelegenheitsspieler:in | In 3 Minuten verstehen | Geführte Tour, Berater, Einsteiger-Modus |
| Lehrperson | Jede Mechanik zeigt ein Fachkonzept | Erklärung auf jeder Ereigniskarte, Quiz, Lektionen am Ende |
| Ökonom:in | Realistische Märkte | Preise steigen durch Nachfrage, Inflation, schwankende Kurse |
| Jurist:in | Rechtliche Folgen | Verträge mit Konventionalstrafe, Betreibung, Volksabstimmung |
| Zuschauer:in | Spannung und Spektakel | 3D-Globus, Raketen, Atom-Finale |

#### Reizwort / Zufallsmethode

Zufällig gewählte Wörter als Anstoss:

| Reizwort | Idee |
|---|---|
| Kühlschrank | Lebensmittel verderben nach 3 Runden → Lagerhaltung |
| Hochzeit | Zwei Spieler schliessen einen Gesellschaftsvertrag und teilen sich einen Bunkerplatz |
| Fahrrad | Reisen ohne Geld, aber langsam → Zeit gegen Geld (Opportunitätskosten) |
| Lotto | Wahl zwischen sicherer Staatsanleihe und riskantem Los |
| Schlüssel | Bunker brauchen einen Zugangscode, den man handeln oder stehlen kann |

#### Provokationstechnik

«Was wäre, wenn …?»

| Provokation | Idee daraus |
|---|---|
| … es gar kein Geld gäbe? | Reiner Tauschhandel – man erlebt, warum Geld erfunden wurde |
| … alle überleben könnten? | Ein gemeinsamer Bunker als öffentliches Gut, mit Trittbrettfahrern |
| … man den Bunker schon zu Beginn hätte? | Ein Spiel ums Verteidigen statt ums Bauen |
| … der Krieg gar nicht kommt? | Der Krieg ist nur ein Gerücht – Panikkäufe und Erwartungen treiben die Preise |
| … auch Verlierer gewinnen könnten? | Punkte auch ohne Überleben |

#### 6-3-5-Methode ✍️

Die klassische Methode braucht 6 Personen. Für unser Team passen wir sie an: **jede Person schreibt 3 Ideen in 5 Minuten** und gibt das Blatt dann weiter. Die nächste Person entwickelt die Ideen weiter. So viele Runden, wie es Teammitglieder gibt.

| Runde | Idee 1 | Idee 2 | Idee 3 |
|---|---|---|---|
| 1 (✍️ Name) | | | |
| 2 (✍️ Name) | | | |
| 3 (✍️ Name) | | | |

#### Ideen clustern

| Cluster | Ideen |
|---|---|
| 💱 Märkte & Geld | Devisenhandel, Wechselkurs-Spekulation, Aktien, Hyperinflation, Notenbank, Tauschhandel, Zölle, Yield, Lotto vs. Anleihe |
| ⚖️ Recht & Staat | Verträge mit Strafe, Volksabstimmung, Kartell- und Monopolstrafe, Pfändung, Embargo, Versicherung mit Kleingedrucktem, Schwarzmarkt |
| ⚔️ Konflikt & Fairness | Kopfgeld, Handicap für den Führenden, Letzter zieht zuerst, Sabotage, Verräter |
| 🤝 Kooperation | Gemeinschaftsbunker, Fusion / Gesellschaftsvertrag, Crowdfunding, Untermiete |
| ⏱️ Zeit & Tempo | Zugtimer, Lebensmittel verderben, Fahrrad-Reise, Krieg nur ein Gerücht |
| 🎯 Spielziel | Bunker bauen, Bunkerplätze ersteigern, Bunker verteidigen, Punkte statt nur Überleben |

### 4.3 Divergente Ideenfindung: Ziel / Konzept

Aus den Clustern haben wir drei Konzepte grob skizziert.

#### Konzept A – «BUNKER: Der Wettlauf»

| | |
|---|---|
| **Zentrale Spielmechanik** | Wettrennen und Set-Collection (Bunker-Ressourcen sammeln), Handel mit Währungen, Angriffe auf den Führenden |
| **Wichtige Elemente** | Zeitdruck (geheimer Kriegsausbruch, DEFCON) · begrenzter Zufall (Ereigniskarte eine Runde voraus sichtbar, Würfel 1–3) · Sammelmechanik mit Rohstoff-Joker · Knappheit (halb so viele Bunker wie Spieler) |
| **Spielablauf** | Vorbereitung (Charakter, Startkontinent, Startgeld) → Zugreihenfolge reihum mit 3 Aktionspunkten → Rundenablauf (Ereigniskarte, Einkommen, Züge, alle 3 Runden eine Volksabstimmung) → Kriegsausbruch beendet das Spiel → Auswertung (Überleben und Punkte) |
| **Gewinnen** | Wer beim Kriegsausbruch im eigenen, fertigen Bunker sitzt und keine Schulden hat, überlebt. Die Rangliste ergibt sich aus Punkten. |
| **W&R-Themen** | Wechselkurse, Inflation, Zinseszins, Angebot und Nachfrage, Verträge, Strafrecht, direkte Demokratie |
| **Elevator Pitch** | «Reist um die Welt, handelt mit schwankenden Währungen und sammelt Ressourcen für einen der wenigen Bunkerplätze – doch wer vorne liegt, wird von allen gejagt.» |

#### Konzept B – «BUNKER: Die Versteigerung»

| | |
|---|---|
| **Zentrale Spielmechanik** | Versteigerung mit verdeckten Geboten und Bluffen |
| **Wichtige Elemente** | Alle 3 Runden wird ein Bunkerplatz versteigert · Geld ist knapp · wer zu viel bietet, hat danach keine Vorräte mehr («Fluch des Gewinners») · Zeitdruck: nur wenige Auktionen bis zum Krieg |
| **Spielablauf** | Vorbereitung → Wirtschaftsrunden (handeln, arbeiten, spekulieren) → Auktionsrunde (verdeckte Gebote, Zuschlag an das höchste Gebot) → Spielende, wenn alle Plätze vergeben sind oder der Krieg ausbricht → Auswertung (Platz und Vorräte) |
| **Gewinnen** | Wer einen Bunkerplatz und genug Vorräte hat, überlebt. |
| **W&R-Themen** | Auktion, Vertragsschluss durch den Zuschlag (Art. 229 OR), Zahlungsbereitschaft, Fluch des Gewinners |
| **Elevator Pitch** | «Bunkerplätze gehen an die Höchstbietenden – aber wer sein ganzes Geld bietet, hat im Bunker nichts mehr zu essen.» |

#### Konzept C – «BUNKER: Gemeinsam oder allein»

| | |
|---|---|
| **Zentrale Spielmechanik** | Kooperation gegen das Spiel, mit geheimen Rollen und Bluffen |
| **Wichtige Elemente** | Alle bauen gemeinsam einen Stadtbunker · jede Person entscheidet verdeckt, wie viel sie beiträgt oder für sich behält · ein Spieler ist heimlich «Spekulant» und profitiert, wenn der Bunker scheitert · Zeitdruck |
| **Spielablauf** | Vorbereitung (geheime Rollen verteilen) → jede Runde: Ressourcen verdienen → verdeckt beitragen → Ereignis → Diskussion und Verdacht → Kriegsausbruch → Auswertung (Ist der Bunker fertig? Wer hat wie viel beigetragen?) |
| **Gewinnen** | Ist der Bunker rechtzeitig fertig, überleben alle. Gewinner ist, wer dabei am meisten Vermögen behalten hat. Der Spekulant gewinnt, wenn der Bunker scheitert. |
| **W&R-Themen** | Öffentliche Güter, Trittbrettfahrer-Problem, Gefangenendilemma, Vertrauen |
| **Elevator Pitch** | «Alle brauchen den gemeinsamen Bunker – aber jeder Franken, den du beiträgst, fehlt dir selbst, und jemand im Team will, dass ihr scheitert.» |

### 4.4 Konvergentes Denken: Bewertung und Auswahl

Bewertung von 1 (schlecht) bis 5 (sehr gut). ✍️ Das ist unser Vorschlag – bewertet im Team gemeinsam und passt die Zahlen an.

| Kriterium | A Wettlauf | B Versteigerung | C Gemeinsam oder allein |
|---|---|---|---|
| Passt zur Zielgruppe und zu den HMW-Fragen (Skillcap, Strategie, Führender angreifbar, Spieldauer) | 5 | 4 | 3 |
| Umsetzbar mit vertretbarem Aufwand (Material, Regelkomplexität) | 5 | 3 | 2 |
| Einzigartiges Spielerlebnis gegenüber bestehenden Spielen | 4 | 3 | 4 |
| In wenigen Sätzen erklärbar (Elevator Pitch) | 4 | 5 | 3 |
| Gehalt an Wirtschaft & Recht (Bildungsauftrag) | 5 | 4 | 5 |
| **Total** | **23** | **19** | **17** |

Begründungen:
- **A** erfüllt die HMW-Fragen am besten (Spitzenreiter, kleiner Würfel, sichtbare Karten). Achtung: Bei «umsetzbar» ist A im Vorteil, weil es schon als Prototyp existiert – das sollten wir bei der Bewertung bedenken.
- **B** ist am einfachsten zu erklären, bietet aber weniger Abwechslung zwischen den Auktionen.
- **C** hat den stärksten W&R-Gehalt (öffentliche Güter, Gefangenendilemma), ist aber mit geheimen Rollen am Computer schwer umzusetzen und passt weniger zur Aussage «Führender soll angreifbar sein».

**Kombinationen** – oft entstehen die stärksten Konzepte aus mehreren Clustern:
- **A + B:** Wettlauf mit Bunker-Auktion. Wollen zwei Spieler denselben freien Bunker, wird er versteigert.
- **A + C:** Zusätzlich zu den privaten Bunkern gibt es einen gemeinsamen Notbunker, der nur fertig wird, wenn alle beitragen.

➔ **Ergebnis der IDEATE-Phase:** 3 vielversprechende Spielkonzepte für die nächste Phase:
1. **Konzept A «Der Wettlauf»** (als Prototyp schon weit ausgearbeitet, siehe 4.5)
2. **Kombination A + B «Wettlauf mit Bunker-Auktion»**
3. **Konzept C «Gemeinsam oder allein»** als mutige Alternative

Die finale Auswahl erfolgt erst in der nächsten Phase (Konzeptionierung).

### 4.5 Ausarbeitung von Konzept A (als Prototyp umgesetzt)

Weil Design Thinking iterativ ist, haben wir Konzept A parallel schon als Prototyp gebaut und getestet (Phase 5). Hier sind die wichtigsten Entscheidungen festgehalten.

#### 4.5.1 Vom ersten Konzept zu den Regeln

Unser erstes Konzept enthielt viele offene Fragen. So haben wir sie gelöst:

| Offene Frage aus dem Konzept | Entscheidung im Spiel |
|---|---|
| Wie viele Spieler, wie viele Bunker? | 2–6 Spieler (Menschen oder KI). Bunker = halb so viele wie Spieler (2–3 Spieler: 1, 4–5: 2, 6: 3). |
| Wie lange dauert eine Runde? | Jeder Spieler hat pro Runde 3 Aktionspunkte. |
| Wann bricht der Krieg aus? | Zufällig und geheim beim Spielstart (seit Prototyp 7: Kurz 9–11, Normal 13–15, Lang 18–20 Runden). Die DEFCON-Anzeige zeigt ungefähr, wie nah er ist. Ereigniskarten können ihn verschieben, aber nur innerhalb dieses Bereichs. |
| Wie bewegt man sich? | Klick auf den Globus. Nahe Ziele kosten 70 €, weite 150 €. Technik −30%, Energie −20%. |
| Wie funktioniert der Bunkerbau? | 3 Lebensmittel + 2 Technik + 3 Energie + 2 Militär, danach 3 Bauschritte (seit Prototyp 6: höchstens 1 pro Zug). Jeder Standort hat eine Eigenschaft. |
| Wie läuft ein Angriff? | Würfel (seit Prototyp 6: 1–3) + Militär gegen Würfel + Militär. Der Sieger raubt Ressourcen, der Verlierer verliert 1 Militär. Bunker können sabotiert oder gestürmt werden. |
| Was passiert, wenn man verliert? | Niemand scheidet aus (Kritik an Monopoly!). Wer keinen Bunker hat, stirbt erst beim Kriegsausbruch. |
| Wie wird die Inflation bestimmt? | Jede Runde: zufällige Kursschwankungen, 3% allgemeine Teuerung und Ereigniskarten (z. B. Hyperinflation). |
| Startgeld? | 700 € in der Währung des Startkontinents, plus 120 € Einkommen pro Runde. |
| Wechselkurse fix oder schwankend? | Schwankend. Jede Währung hat einen Verlaufsgraphen. |
| Was sind Rohstoffe? | Zufällige Funde auf dem Globus. Wer zuerst dort ist, bekommt sie. Sie ersetzen jede fehlende Bunker-Ressource (Joker). |
| Lebensmittel «verkürzen Nächte» | Essen gibt +1 Aktionspunkt («Nachtschicht»). |
| Krypto mit Sperrfrist | Nach jedem Krypto-Geschäft 2 Züge kein Geldwechsel (wie bei einem Termingeschäft). |
| Fremdwährung teurer | Kaufen mit Fremdwährung kostet 30% Aufschlag. |
| Wer gewinnt? | Wer beim Kriegsausbruch im eigenen, fertigen Bunker sitzt und keine Schulden hat. Seit Prototyp 6 gibt es zusätzlich Punkte für die Rangliste. |

#### 4.5.2 Von den HMW-Fragen zu neuen Ideen

| How Might We … | Idee | Im Spiel umgesetzt als |
|---|---|---|
| … Inflation spürbar machen? | Preise steigen sichtbar, Geld verliert an Wert | Teuerung jede Runde, Karten «Hyperinflation» und «Helikoptergeld», Grundeinkommen-Abstimmung |
| … die Regeln in 3 Minuten vermitteln? | Lernen beim Spielen statt Regelheft | Geführte Tour, Berater 💡, Einsteiger-Modus |
| … in einer Schulstunde spielbar machen? | Kürzere Variante | Einsteiger-Modus, Spieldauer «Kurz», KI-Tempo «Schnell» |
| … auch Verlierer etwas lernen lassen? | Erklärungen bei jedem Ereignis | «Wirtschaft & Recht»-Erklärung auf jeder Karte, Lektionen und Auszeichnungen am Ende, Quiz mit Erklärung |
| … Recht erlebbar machen? | Rechtliche Folgen im Spiel | Verträge mit Konventionalstrafe, Schmuggel mit Busse und Vorstrafe, Betreibung und Pfändung, Volksabstimmung |
| … auch zu zweit spannend machen? | Computergegner | KI-Spieler mit eigenen Charakteren |

Weitere Ideen: 8 Charaktere mit Spezialfähigkeiten (Bankerin, General, …), Tag/Nacht-Zyklus, Musik, die schneller wird, je näher der Krieg ist.

#### 4.5.3 Aus der Befragung zu neuen Regeln (Prototyp 6 und 7)

| Aussage | How Might We … | Idee → umgesetzt im Spiel |
|---|---|---|
| Hoher Skillcap | … das Glück im Kampf verringern? | **Kampfwürfel 1–3 statt 1–6.** Wer mehr Militär hat, gewinnt fast immer. |
| Strategisch | … vorausplanen lassen? | **Die Ereigniskarte der nächsten Runde ist für alle sichtbar.** Die Ökonomin sieht sogar zwei Runden voraus. |
| Strategisch | … die Bunkerwahl zur Entscheidung machen? | **Bunker mit Eigenschaften:** Südl. Alpen nah, aber −1 Verteidigung · Neuseeland weit weg, aber +2 Verteidigung (Felsenbunker) · Spitzbergen braucht 1 Energie weniger (Permafrost). |
| Hoher Skillcap | … gute Spieler auch bei einer Niederlage belohnen? | **Punktesystem:** Überleben 1000 Punkte, pro Bauschritt 100 Punkte, 1 Punkt pro 10 € Vermögen. Die Rangliste und die Ruhmeshalle richten sich nach den Punkten. |
| Führender angreifbar | … den Führenden angreifbar machen? | **Höchstens 1 Bauschritt pro Zug** – die anderen haben Zeit zu reagieren. **Spitzenreiter 🎯:** Wer am nächsten am Ziel ist, wird auf dem Globus markiert, und alle sehen seine Ressourcen. **150 € Kopfgeld** für jeden erfolgreichen Angriff, jede Sabotage oder Übernahme gegen ihn. **Die KI-Spieler jagen den Spitzenreiter.** |
| Führender angreifbar | … ohne dass er chancenlos ist? | **Befestigen:** 1 Energie, Militär oder Rohstoff gibt dem eigenen Bunker +1 Verteidigung (max. +3). Eine Baustelle kann pro Runde nur einmal sabotiert werden. |
| Spieldauer ohne grosse Unterschiede | … die Spieldauer überraschend, aber planbar machen? | **Keinen festen Countdown** – unterschiedlich lange Partien machen hier Sinn: Niemand weiss genau, wann der Krieg kommt (Entscheiden unter Unsicherheit). Gemeint war, dass die Unterschiede nicht zu gross sein dürfen. Deshalb **Prototyp 7: engere Bereiche** (Normal 13–15 statt 12–16 Runden), und Ereigniskarten können den Krieg nicht mehr über diese Grenzen hinaus verschieben. |

---

## Phase 5 – PROTOTYPE & EVALUATE: Bauen und testen

### 5.1 Prototypen ✅

| Prototyp | Datum | Inhalt | Was wir getestet und daraufhin geändert haben |
|---|---|---|---|
| 1 | 23.09.2026 | 2D-Weltkarte im Browser: Kontinente, Währungen, Kaufen, Reisen, Bunkerbau | Rückmeldung im Team: zu schlicht, zu wenig Spannung → Wechsel auf 3D und mehr Ereignisse |
| 2 | 25.09.2026 | 3D-Globus, KI-Gegner, Ereigniskarten, Kredite, Verträge, Schwarzmarkt | Automatischer Test: Das Spiel fror in Runde 2 ein → behoben. Die KI raubte schon in Runde 1 → greift erst ab Runde 3 an |
| 3 | 25.09.2026 | Charaktere, Tag/Nacht, Berater, Autosave, Endbildschirm mit Diagramm | Spielerfarben für Farbenblinde schlecht unterscheidbar → geprüfte, neue Farben |
| 4 | 25.09.2026 | Volksabstimmung, Quiz, geführte Tour | Start oft auf der dunklen Nachtseite → Sonne startet über dem ersten Spieler. Langsame Computer → automatische Grafikanpassung |
| 5 | 21.10.2026 | Einsteiger-Modus, Feedback-Formular, Testauswertung, Making-of | Befragung der Zielgruppe (siehe 2.4) → Prototyp 6 |
| 6 | 28.10.2026 | Würfel 1–3, Ereigniskarte der nächsten Runde sichtbar, Bunker mit Eigenschaften, Punktesystem, 1 Bauschritt pro Zug, Spitzenreiter 🎯 mit Kopfgeld, Befestigen, KI jagt den Spitzenreiter | Automatischer Test (siehe 5.2) · ✍️ Testrunde mit Menschen |
| 7 | 28.10.2026 | Engere Spieldauer: Kurz 9–11, Normal 13–15, Lang 18–20 Runden. Ereigniskarten verschieben den Krieg nur noch innerhalb dieses Bereichs | Präzisierung der Befragung: Unterschiede in der Spieldauer ja, aber nicht zu gross |

### 5.2 Automatisierte Tests ✅

Wir haben ganze Partien mit 4, 5 und 6 KI-Spielern automatisch durchspielen lassen. Ergebnis:
- Das Spiel läuft von Runde 1 bis zum Kriegsausbruch ohne Fehler.
- Die Bunker werden rechtzeitig gebaut, aber nicht alle schaffen es. Das Rennen bleibt also spannend.
- Manche Spieler sammeln alle Ressourcen, kommen aber zu spät, weil die Bunker schon besetzt sind (Knappheit funktioniert).

Test von Prototyp 6 (28.10.2026, 3 Partien mit 4, 5 und 6 KI-Spielern):
- Trotz «1 Bauschritt pro Zug» und Angriffen auf den Spitzenreiter wurden in allen Partien die Bunker fertig gebaut. Die neuen Regeln machen das Spiel also nicht unspielbar.
- In allen 3 Partien wurde Kopfgeld kassiert: Der Spitzenreiter wird tatsächlich angegriffen.
- Fertige Bunker wurden befestigt. Wer zuletzt kam, hatte gegen befestigte Bunker kaum eine Chance – ✍️ in Testrunden mit Menschen prüfen, ob das zu stark ist.

### 5.3 Testrunden mit Menschen ✍️

So geht ihr vor:
1. Lasst 2–3 Personen aus der Zielgruppe eine Runde spielen. **Erklärt möglichst wenig** – die Tour und der Berater sollen reichen.
2. Beobachtet mit dem Protokoll aus 2.2: Wo zögern sie? Wo lachen sie?
3. Nach dem Spiel klickt jede Person auf **«📝 Feedback geben»**.
4. Auf dem Startbildschirm unter **«📊 Testauswertung»** seht ihr Durchschnittswerte, die gemessene Spieldauer und die häufigsten Fehlermeldungen. Die häufigsten Fehlermeldungen zeigen, wo Spieler etwas versuchen, das nicht geht – ein Hinweis auf Verwirrung.
5. Exportiert die Daten als CSV nach Excel und nehmt sie in die Synthese (Phase 3).
6. Leitet Verbesserungen ab und testet erneut.

| Testrunde | Datum | Personen | Wichtigste Erkenntnisse | Was wir geändert haben |
|---|---|---|---|---|
| ✍️ | | | | |
| ✍️ | | | | |

---

## Phase 6 – BUILD: Umsetzen ✅

- Fertiges Spiel: `index.html` doppelklicken, läuft offline in jedem Browser.
- Spielanleitung: im Spiel über ❓ und in der `README.md`.
- ½ Seite Zusammenfassung: Abschnitt «Zusammenfassung: Wirtschaft & Recht im Spiel» in der `README.md`.
- Präsentation: Making-of im Spiel zeigen, dann eine Runde im Einsteiger-Modus mit der Klasse spielen.
