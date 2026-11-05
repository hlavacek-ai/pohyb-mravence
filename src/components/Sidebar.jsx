import React from 'react';

const Sidebar = ({ appState, onStart, onReset, isGraphUnlocked, currentMeasureTime, maxTime }) => {
  return (
    <div className="sidebar card">
      <div style={{ marginBottom: '1rem' }}>
        <h1 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>Pohyb mravence</h1>
        <div className="divider"></div>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
          Simulace pro výuku kinematiky. Sledujte pohyb mravence a změřte jeho dráhu.
        </p>
      </div>

      <div className="control-group card" style={{ padding: '16px' }}>
        <h2 style={{ fontSize: '1rem' }}>Ovládání</h2>
        
        <div className="control-row" style={{ marginTop: '8px' }}>
          <span style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>Stav:</span>
          <span style={{ fontWeight: '600' }}>
            {appState === 'idle' && 'Připraveno'}
            {appState === 'simulating' && 'Probíhá simulace...'}
            {appState === 'measuring' && 'Fáze odměřování'}
            {appState === 'done' && 'Hotovo'}
          </span>
        </div>

        {appState === 'measuring' && (
          <div className="control-row" style={{ marginTop: '8px' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>Aktuální čas:</span>
            <span style={{ fontWeight: '600', color: 'var(--color-accent)' }}>{currentMeasureTime} s / {Math.floor(maxTime)} s</span>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' }}>
          <button 
            className="btn-primary" 
            onClick={onStart}
            disabled={appState === 'simulating'}
          >
            Start simulace
          </button>
          
          <button 
            className="btn-outline" 
            onClick={onReset}
            disabled={appState === 'idle'}
          >
            Reset
          </button>
        </div>
      </div>

      <div className="control-group card" style={{ padding: '16px', marginTop: 'auto' }}>
        <h2 style={{ fontSize: '1rem' }}>Nápověda</h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginTop: '8px' }}>
          {appState === 'idle' && 'Klikněte na Start pro spuštění pohybu mravence.'}
          {appState === 'simulating' && 'Sledujte pohyb mravence.'}
          {appState === 'measuring' && 'Nyní v plátně interaktivně odměřujte pomocí úsečky dráhu pro každý 5s úsek. Odměřená délka se zapíše do tabulky.'}
          {appState === 'done' && 'Tabulka je vyplněna. Můžete se přepnout na záložku Graf.'}
        </p>
      </div>
    </div>
  );
};

export default Sidebar;
