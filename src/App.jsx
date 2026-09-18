import React, { useState, useEffect } from 'react';
import './App.css';
import Sidebar from './components/Sidebar';
import SimulationTab from './components/SimulationTab';
import GraphTab from './components/GraphTab';
import DataTable from './components/DataTable';

function App() {
  const [activeTab, setActiveTab] = useState('simulation');
  
  // 'idle' | 'simulating' | 'measuring' | 'done'
  const [appState, setAppState] = useState('idle');
  
  // Real path of the ant during simulation: Array<{ x, y, time }>
  const [antPath, setAntPath] = useState([]);
  
  // Data for the table: Array<{ time, distance }>
  const [measuredData, setMeasuredData] = useState([]);

  // Time tracking for measuring phase
  const [currentMeasureTime, setCurrentMeasureTime] = useState(0);

  // Initialize table data based on final simulation time (in 5s intervals)
  useEffect(() => {
    if (appState === 'measuring' && antPath.length > 0 && measuredData.length === 0) {
      const maxTime = antPath[antPath.length - 1].time;
      const initialData = [];
      for (let t = 0; t <= maxTime; t += 5) {
        initialData.push({ time: t, distance: t === 0 ? 0 : '' });
      }
      setMeasuredData(initialData);
      setCurrentMeasureTime(5);
    }
  }, [appState, antPath]);

  // Check if all data is filled to unlock the graph
  const isGraphUnlocked = measuredData.length > 0 && measuredData.every(d => d.distance !== '');

  const handleStartSimulation = () => {
    setAppState('simulating');
    setAntPath([]);
    setMeasuredData([]);
    setActiveTab('simulation');
  };

  const handleReset = () => {
    setAppState('idle');
    setAntPath([]);
    setMeasuredData([]);
    setActiveTab('simulation');
    setCurrentMeasureTime(0);
  };

  return (
    <div className="app-container">
      <Sidebar 
        appState={appState}
        onStart={handleStartSimulation}
        onReset={handleReset}
        isGraphUnlocked={isGraphUnlocked}
        currentMeasureTime={currentMeasureTime}
        maxTime={antPath.length > 0 ? antPath[antPath.length - 1].time : 0}
      />
      
      <div className="main-content">
        <div className="tabs-header">
          <button 
            className={`tab-button ${activeTab === 'simulation' ? 'active' : ''}`}
            onClick={() => setActiveTab('simulation')}
          >
            Simulace pohybu
          </button>
          <button 
            className={`tab-button ${activeTab === 'graph' ? 'active' : ''}`}
            onClick={() => setActiveTab('graph')}
            disabled={!isGraphUnlocked}
          >
            Graf závislosti dráhy na čase
          </button>
        </div>
        
        <div className="tab-content">
          {activeTab === 'simulation' && (
            <>
              <div className="simulation-area">
                <SimulationTab 
                  appState={appState}
                  setAppState={setAppState}
                  antPath={antPath}
                  setAntPath={setAntPath}
                  currentMeasureTime={currentMeasureTime}
                  setCurrentMeasureTime={setCurrentMeasureTime}
                  measuredData={measuredData}
                  setMeasuredData={setMeasuredData}
                />
              </div>
              <div className="table-area">
                <DataTable 
                  data={measuredData}
                  setData={setMeasuredData}
                  currentMeasureTime={currentMeasureTime}
                />
              </div>
            </>
          )}
          
          {activeTab === 'graph' && (
            <div className="simulation-area" style={{ padding: '20px' }}>
              <GraphTab data={measuredData} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
