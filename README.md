# Novair

**Der einfachste Weg in dein rauchfreies Leben.**

Novair ist eine minimalistische, "Local-First" Web-App, die dich bei der Raucherentwöhnung begleitet. Im Gegensatz zu vielen anderen Apps erfordert Novair keinen Account und kommuniziert mit keinem Server. Deine persönlichen Gesundheits- und Fortschrittsdaten gehören dir und verlassen niemals dein Gerät.

## Features

- **Datenschutz im Fokus (Local-First):** Alle Daten (Startzeitpunkt, Motivation, Konsumgewohnheiten) werden ausschließlich lokal im `LocalStorage` deines Browsers gespeichert.
- **Fortschritts-Tracking:** Verfolge sekundengenau deine rauchfreie Zeit, das gesparte Geld und die vermiedenen Zigaretten.
- **Gesundheits-Meilensteine:** Erlebe, wie sich dein Körper über die Zeit regeneriert – basierend auf medizinischen Fakten (von sinkendem Blutdruck bis hin zu reduziertem Infarktrisiko).
- **Gamification:** Verdiene dir Badges für das Erreichen von Meilensteinen bei Zeit, Geld und vermiedenen Zigaretten.
- **Urge Surfing (Akuthilfe):** Eine integrierte 4-4-8 Atemübung hilft dir, akutes Verlangen ("Schmacht") psychologisch fundiert zu überwinden.

## Tech Stack

Novair ist bewusst als leichtgewichtige Single Page Application (SPA) ohne komplexe Build-Tools konzipiert:

- **Struktur:** HTML5
- **Styling:** Tailwind CSS (via CDN) & Custom CSS für Animationen
- **Icons:** Lucide Icons
- **Logik & State:** Vanilla JavaScript (ES6)

## Lokale Ausführung

Da Novair komplett clientseitig läuft, brauchst du keinen speziellen Backend-Server. 

1. Klone oder lade das Repository herunter.
2. Öffne das Verzeichnis in deinem Terminal.
3. Starte einen simplen lokalen Webserver, z.B. mit Node.js (`npx serve`) oder Python:
   ```bash
   python3 -m http.server 3000
   ```
4. Öffne `http://localhost:3000` in deinem Browser.

## Design-Philosophie

"Simple but Premium" – Novair verzichtet auf Ablenkungen, Werbung oder unnötige Klicks. Ein klares, modernes Design mit Fokus auf das Wesentliche: Deinen Erfolg.
