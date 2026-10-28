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
| 4 Ideate | ✅ Ideen und Entscheidungen dokumentiert, inkl. Ideen aus der Befragung |
| 5 Prototype & Evaluate | ✅ 6 Prototypen + automatisierte Tests · ✍️ Testrunden mit Menschen |
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

- **Spieldauer:** Eine Runde soll in eine Lektion passen. Deshalb gibt es den Einsteiger-Modus und die Spieldauer «Kurz» (8–11 Runden). Die echte Dauer messen wir in den Testrunden (✍️ siehe Phase 5).
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

Befragt: ✍️ Anzahl Personen, Kürzel und Datum ergänzen.

In der Befragung wurden diese Punkte genannt (sinngemäss):

| # | Aussage aus der Befragung |
|---|---|
| 1 | Das Spiel braucht einen **hohen Skillcap**: Wer gut spielt, soll sich durch Können absetzen. |
| 2 | Es darf **nicht zu lange dauern**, und jede Partie sollte **gleich lang** sein. |
| 3 | Es soll **strategisch** sein, damit das Spiel einen Sinn hat. |
| 4 | **Je weiter vorne man ist, also fast am Ziel, desto angreifbarer soll man sein**, weil die anderen nicht wollen, dass man gewinnt. |

Zu unseren Annahmen aus 1.4 (Bunker-Szenario, Währungen, 3D-Grafik, Quiz) gab es keine direkten Aussagen. Sie bleiben offen und werden in den Testrunden (5.3) geprüft.

| Person (Kürzel) | Wichtigste Aussagen | Beobachtungen |
|---|---|---|
| ✍️ | | |
| ✍️ | | |

---

## Phase 3 – SYNTHESIZE: Informationen interpretieren ✅

### 3.1 Muster synthetisieren

**Empathy Map** der Zielgruppe.
Nur «Sagt» stammt direkt aus der Befragung. «Denkt», «Fühlt» und «Tut» sind **unsere Interpretation** – in den Testrunden beobachten, ob sie stimmen.

| Sagt (aus der Befragung) | Denkt (Interpretation) |
|---|---|
| «Es braucht einen hohen Skillcap.»<br>«Es darf nicht zu lange dauern – jede Partie gleich lang.»<br>«Es soll strategisch sein, sonst hat das Spiel keinen Sinn.»<br>«Wer fast am Ziel ist, soll angreifbar sein, weil die anderen nicht wollen, dass er gewinnt.» | «Wenn Glück entscheidet, lohnt sich Nachdenken nicht.»<br>«Ich will vorausplanen und besser werden können.»<br>«Ich habe nur begrenzt Zeit für ein Spiel.» |

| Fühlt (Interpretation) | Tut (Interpretation – ✍️ in Testrunden beobachten) |
|---|---|
| Frust, wenn ein Würfelwurf eine gute Strategie zunichtemacht.<br>Ungeduld, wenn eine Partie zu lange oder unvorhersehbar lange dauert.<br>Ehrgeiz und Spannung, wenn alle den Führenden aufhalten wollen. | Plant voraus und vergleicht sich mit den anderen.<br>Verbündet sich gegen den, der vorne liegt.<br>Verliert die Lust, wenn das Ergebnis früh feststeht. |

**Affinity Diagram** – die Aussagen gruppiert:

| Cluster | Aussagen |
|---|---|
| 🧠 Können statt Glück | hoher Skillcap (1) · strategisch, damit es Sinn hat (3) |
| ⏱️ Spieldauer | nicht zu lange · jede Partie gleich lang (2) |
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
- Wie könnten wir jede Partie gleich lang machen? *(noch offen, siehe 4.3)*

Frühere HMW-Fragen (vor der Befragung):
- Wie könnten wir Inflation spürbar machen, ohne sie lange zu erklären?
- Wie könnten wir die Regeln so vermitteln, dass man nach 3 Minuten losspielen kann?
- Wie könnten wir das Spiel in einer Schulstunde spielbar machen?
- Wie könnten wir dafür sorgen, dass auch Verlierer etwas lernen?
- Wie könnten wir Recht (Verträge, Strafen, Abstimmungen) erlebbar machen?
- Wie könnten wir das Spiel auch mit nur 2 Personen spannend machen?

➔ **Ergebnis:** Problemdefinition: «Ein Spiel, in dem man W&R-Begriffe erlebt, in dem Können statt Glück entscheidet und das bis zum Schluss spannend bleibt – in einer Schulstunde.» Dazu mehrere HMW-Fragen als Ausgangspunkt für die Ideen.

---

## Phase 4 – IDEATE: Ideen entwickeln ✅

### 4.1 Vom ersten Konzept zu den Regeln

Unser erstes Konzept enthielt viele offene Fragen. So haben wir sie gelöst:

| Offene Frage aus dem Konzept | Entscheidung im Spiel |
|---|---|
| Wie viele Spieler, wie viele Bunker? | 2–6 Spieler (Menschen oder KI). Bunker = halb so viele wie Spieler (2–3 Spieler: 1, 4–5: 2, 6: 3). |
| Wie lange dauert eine Runde? | Jeder Spieler hat pro Runde 3 Aktionspunkte. |
| Wann bricht der Krieg aus? | Zufällig und geheim beim Spielstart (Kurz 8–11, Normal 12–16, Lang 17–22 Runden). Die DEFCON-Anzeige zeigt ungefähr, wie nah er ist. Ereigniskarten können ihn verschieben. |
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

### 4.2 Von den HMW-Fragen zu neuen Ideen

| How Might We … | Idee | Im Spiel umgesetzt als |
|---|---|---|
| … Inflation spürbar machen? | Preise steigen sichtbar, Geld verliert an Wert | Teuerung jede Runde, Karten «Hyperinflation» und «Helikoptergeld», Grundeinkommen-Abstimmung |
| … die Regeln in 3 Minuten vermitteln? | Lernen beim Spielen statt Regelheft | Geführte Tour, Berater 💡, Einsteiger-Modus |
| … in einer Schulstunde spielbar machen? | Kürzere Variante | Einsteiger-Modus, Spieldauer «Kurz», KI-Tempo «Schnell» |
| … auch Verlierer etwas lernen lassen? | Erklärungen bei jedem Ereignis | «Wirtschaft & Recht»-Erklärung auf jeder Karte, Lektionen und Auszeichnungen am Ende, Quiz mit Erklärung |
| … Recht erlebbar machen? | Rechtliche Folgen im Spiel | Verträge mit Konventionalstrafe, Schmuggel mit Busse und Vorstrafe, Betreibung und Pfändung, Volksabstimmung |
| … auch zu zweit spannend machen? | Computergegner | KI-Spieler mit eigenen Charakteren |

Weitere Ideen: 8 Charaktere mit Spezialfähigkeiten (Bankerin, General, …), Tag/Nacht-Zyklus, Musik, die schneller wird, je näher der Krieg ist.

### 4.3 Aus der Befragung zu neuen Regeln (Prototyp 6)

| Aussage | How Might We … | Idee → umgesetzt im Spiel |
|---|---|---|
| Hoher Skillcap | … das Glück im Kampf verringern? | **Kampfwürfel 1–3 statt 1–6.** Wer mehr Militär hat, gewinnt fast immer. |
| Strategisch | … vorausplanen lassen? | **Die Ereigniskarte der nächsten Runde ist für alle sichtbar.** Die Ökonomin sieht sogar zwei Runden voraus. |
| Strategisch | … die Bunkerwahl zur Entscheidung machen? | **Bunker mit Eigenschaften:** Südl. Alpen nah, aber −1 Verteidigung · Neuseeland weit weg, aber +2 Verteidigung (Felsenbunker) · Spitzbergen braucht 1 Energie weniger (Permafrost). |
| Hoher Skillcap | … gute Spieler auch bei einer Niederlage belohnen? | **Punktesystem:** Überleben 1000 Punkte, pro Bauschritt 100 Punkte, 1 Punkt pro 10 € Vermögen. Die Rangliste und die Ruhmeshalle richten sich nach den Punkten. |
| Führender angreifbar | … den Führenden angreifbar machen? | **Höchstens 1 Bauschritt pro Zug** – die anderen haben Zeit zu reagieren. **Spitzenreiter 🎯:** Wer am nächsten am Ziel ist, wird auf dem Globus markiert, und alle sehen seine Ressourcen. **150 € Kopfgeld** für jeden erfolgreichen Angriff, jede Sabotage oder Übernahme gegen ihn. **Die KI-Spieler jagen den Spitzenreiter.** |
| Führender angreifbar | … ohne dass er chancenlos ist? | **Befestigen:** 1 Energie, Militär oder Rohstoff gibt dem eigenen Bunker +1 Verteidigung (max. +3). Eine Baustelle kann pro Runde nur einmal sabotiert werden. |
| Gleiche Spiellänge | … jede Partie gleich lang machen? | ✍️ **Bewusst noch nicht umgesetzt** (Entscheidung des Teams) – Begründung ergänzen. Mögliche Lösungen: fester Countdown (z. B. immer 8 bzw. 12 Runden), Zugtimer. |

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
