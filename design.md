# Novair Design System

Dieses Dokument beschreibt das grundlegende Design-System für die Novair-Anwendung. Es dient als Referenz für die verwendeten Farben, Schriftarten und allgemeinen UI-Prinzipien, um ein konsistentes Erscheinungsbild zu gewährleisten.

## 1. Typografie

**Hauptschriftart:** `Inter` (via Google Fonts)
- **Gewichte:** 300 (Light), 400 (Regular), 500 (Medium), 600 (Semi-Bold), 700 (Bold), 800 (Extra-Bold)
- **Verwendung:** Wird für den gesamten Text der Anwendung eingesetzt, von markanten Überschriften bis hin zu dezenten Labels. 

*CSS-Import:*
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
```

## 2. Farbpalette

Das Design von Novair ist bewusst minimalistisch, aufgeräumt und "Clean" gehalten (fokussiert auf Schwarz, Weiß und Grautöne). Bunte Farben werden nur sehr gezielt als Akzente oder für Zustände (Status) eingesetzt.

### Primärfarben (Monochrom)
- **Hintergrund:** `#FFFFFF` (Weiß)
- **Haupttext / Buttons (Primär):** `#000000` (Schwarz)
- **Karten-Rahmen (Borders):** `#E5E5E5`

### Graustufen (Text & Flächen)
- **Dezenter Text (z.B. Untertitel):** Tailwind `text-gray-500`
- **Labels / Metadaten:** Tailwind `text-gray-400`
- **Platzhalter-Text (Inputs):** `#A3A3A3`
- **Hintergrund für Inputs / Flächen:** Tailwind `bg-gray-50`
- **Hervorgehobene Badges:** `#FAFAFA`

### Akzent- & Statusfarben
- **Erfolg / Positives Feedback:** Sanfte Grüntöne (z.B. Verlauf von Tailwind `green-50` zu Weiß)
- **Motivation / Streaks (Serien):** Orangetöne (Text Tailwind `orange-500`, Hintergrund Tailwind `orange-50`)
- **Warnung / Ausrutscher:** Rottöne (Text Tailwind `red-400` / `red-600`, Hintergrund Tailwind `red-50`)

## 3. UI-Elemente & Styling

- **Karten (Cards):** Werden mit der Klasse `.clean-card` gestylt (Weißer Hintergrund, sanfter grauer Rand `#E5E5E5`, abgerundete Ecken, dezenter Schatten).
- **Buttons:**
  - *Primär:* Schwarzer Hintergrund (`#000000`), weißer Text, oft pillenförmig (`rounded-full`), mit leichtem Hover-Scale-Effekt (Vergrößerung).
  - *Sekundär:* Grauer Hintergrund oder Text, der beim Hover dunkler oder schwarz wird.
- **Formulare & Eingabefelder:** Leichter grauer Hintergrund (`bg-gray-50`), der beim Anklicken (Fokus) einen klaren schwarzen Rand erhält. Die Akzentfarbe (`accent-color`) ist auf `#000000` gesetzt.
- **Icons:** [Lucide Icons](https://lucide.dev/) – eingesetzt für eine moderne, klare Linienführung.

## 4. Design-Prinzipien

1. **Viel Weißraum (Whitespace):** Die Elemente haben viel Platz zum Atmen, was die Oberfläche hochwertig und beruhigend wirken lässt.
2. **Starker Kontrast:** Wichtige Handlungsaufrufe (CTAs) und Kennzahlen werden durch starken Schwarz-Weiß-Kontrast hervorgehoben.
3. **Subtile Animationen:** Eingesetzt für Interaktionen (z.B. Button-Klicks) und spezielle Features (z.B. die "Urge Surfing" Atem-Animation).
