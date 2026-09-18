import React from 'react';

const DataTable = ({ data, setData, currentMeasureTime }) => {
  return (
    <div style={{ padding: '16px', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <h3 style={{ fontSize: '1rem', color: 'var(--color-primary)', marginBottom: '12px' }}>
        Tabulka naměřených hodnot
      </h3>
      <div style={{ overflowX: 'auto', flex: 1 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center' }}>
          <tbody>
            <tr>
              <th style={cellStyle(true, false)}>Čas [s]</th>
              {data.map((col, idx) => (
                <td key={`time-${idx}`} style={cellStyle(true, currentMeasureTime === col.time)}>
                  {col.time}
                </td>
              ))}
            </tr>
            <tr>
              <th style={cellStyle(true, false)}>Dráha [mm]</th>
              {data.map((col, idx) => (
                <td key={`dist-${idx}`} style={cellStyle(false, currentMeasureTime === col.time)}>
                  {col.distance !== '' ? Number(col.distance).toFixed(1) : '-'}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

const cellStyle = (isHeaderRow, isHighlighted) => ({
  border: '1px solid var(--color-border)',
  padding: '8px 12px',
  backgroundColor: isHeaderRow 
    ? 'var(--color-bg-main)' 
    : (isHighlighted ? 'rgba(198, 124, 78, 0.1)' : 'var(--color-bg-card)'),
  fontWeight: isHeaderRow ? '600' : '400',
  color: isHeaderRow ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
  minWidth: '60px'
});

export default DataTable;
