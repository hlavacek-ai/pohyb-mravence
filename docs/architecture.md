# Architektura aplikace "Pohyb mravence"

Tento projekt je postaven na Vite + React + Vanilla CSS a slouží k výuce kinematiky (pozorování dráhy mravence v závislosti na čase).

## Struktura projektu

- `src/` - Zdrojové kódy React aplikace
  - `main.jsx` - Vstupní bod, React DOM.
  - `App.jsx` - Hlavní komponenta. Spravuje stav (běh simulace, nasbíraná data, přepínání záložek).
  - `components/` - Rozdělení do logických částí:
    - `SimulationTab.jsx` - Kreslící plátno `<canvas>`, renderování milimetrového papíru a polohy mravence. 
      - Obsahuje také interaktivní odměřování.
    - `GraphTab.jsx` - Druhá záložka odemčená po odměření, používá `react-chartjs-2` k vykreslení dat.
    - `DataTable.jsx` - Tabulka pro záznam nasbíraných dat.
    - `Sidebar.jsx` - Postranní panel s nastavením a informacemi o stavu.
- `src/styles/` - CSS soubory pro aplikaci.
- `public/` - Statické assety (obrázky).

## Stavová logika (React State)
- `antPath`: Pole objektů `{x, y, time}` zachycující reálný pohyb mravence.
- `measuredData`: Pole naměřených dat `[{time: 0, distance: 0}, {time: 5, distance: X}, ...]` doplňované uživatelem.
- `isSimulating`: Boolean určující, zda zrovna probíhá prvotní "skutečný" pohyb mravence.
- `isReplaying`: Boolean pro fázi odměřování po 5 s krocích.
- `activeTab`: `'simulation' | 'graph'` - Odemčení záložky pro graf závisí na vyplnění `measuredData`.

## Fyzikální model mravence
- Rychlost je zvolena tak, aby plátno prošel za 45 až 60 s.
- Směr se mění náhodně v úhlu 2 až 4 hodiny (od cca -30° do +30° vzhledem ke vodorovné ose) každou sekundu.
- Rychlost se mění o +/- 20 % každé 2 s.
