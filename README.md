# Inhaltsverzeichnis<!-- omit in Inhaltsverzeichnis -->

- [Inhaltsverzeichnis](#inhaltsverzeichnis)
  - [Intsalation und Setup](#intsalation-und-setup)
  - [Dokumentation](#dokumentation)
    - [Komponenten-Ähnlichkeit-Test](#komponenten-ähnlichkeit-test)
    - [Verbindungs-Ähnlichkeiten-Test](#verbindungs-ähnlichkeiten-test)
    - [Vollständige-Verbindungen-Test](#vollständige-verbindungen-test)
    - [Verbindungs-Matrix-Test](#verbindungs-matrix-test)

## Intsalation und Setup

1. Das Projekt wird über den folgenden Befehl geklont:

``` bash
https://github.com/FlorianGaiser/ADF-Checker.git
```

2. Die benötigten Pakete und TypeScript selber müssen nich installiert werden, da diese bereits im Projekt enthalten sind.

3. Anpassen der Daten in der Konfigurationsdatei

``` bash
ADF-Checker/src/config.ts
```

4. Kompilieren der TypeScript Dateien zu JavaScript Dateien und ausführen des Codes über die CMD

``` bash
tsc && node out/Main.js
```

## Dokumentation

### Komponenten-Ähnlichkeit-Test

Dieser Test überprüft die Komponenten anhand einer "String Similarity" Bibliothek auf ihre Ähnlichkeit. Die gewollte Ähnlichkeit kann in der Konfigurationsdatei individuell angepasst werden.

### Verbindungs-Ähnlichkeiten-Test

Dieser Test überprüft die Verbindungen anhand einer "String Similarity" Bibliothek auf ihre Ähnlichkeit. Die gewollte Ähnlichkeit kann in der Konfigurationsdatei individuell angepasst werden.

### Vollständige-Verbindungen-Test

Bei diese Test wird überprüft, ob alle Verbindungen, also alle Pfeile, mit den Komponenten verbunden sind.
Sollte dies nicht der Fall sein, werden in dem Ergebniss die fehlerhaften Verbindungen als "undefined" angezeigt.

Zur Übersichtlichkeit und bildlichen Darstellung ist das folgende Beispiel aus dem "ValidConnectionTest" zu sehen:

![image](Readme_Pictures\Collständige_Verbindungen.png)

### Verbindungs-Matrix-Test

Bei diesem Test wird eine Matrix Tabelle erstellt, welche alle Komponenten und die zugehörigen Verbindungen beinhaltet.
Dadurch wird die Übersichtlichkeit der Verbindungen zwischen den Komponenten erhöht.

Zur Übersichtlichkeit und bildlichen Darstellung ist das folgende Beispiel aus dem "DataUtilizationTest" zu sehen:

![image](Readme_Pictures\Verbindungs_Matrix.png)
