import React, { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const GraphTab = ({ data }) => {
  const [showSpeed, setShowSpeed] = useState(false);

  // Speed calculation: v = ds / dt
  const speedData = data.map((d, i) => {
    if (i === 0 || d.distance === '') return null;
    const prevDist = Number(data[i - 1].distance);
    const currDist = Number(d.distance);
    return (currDist - prevDist) / 5; // 5s interval
  });

  const datasets = [
    {
      label: 'Dráha [mm]',
      data: data.map(d => d.distance === '' ? null : d.distance),
      borderColor: 'rgba(15, 44, 89, 1)',
      backgroundColor: 'rgba(15, 44, 89, 0.5)',
      tension: 0, 
      pointRadius: 5,
      pointHoverRadius: 8,
      yAxisID: 'y',
    }
  ];

  if (showSpeed) {
    datasets.push({
      label: 'Rychlost [mm/s]',
      data: speedData,
      borderColor: 'rgba(198, 124, 78, 1)',
      backgroundColor: 'rgba(198, 124, 78, 0.5)',
      tension: 0,
      pointRadius: 5,
      pointHoverRadius: 8,
      yAxisID: 'y1',
    });
  }

  const chartData = {
    labels: data.map(d => d.time),
    datasets,
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Graf závislosti dráhy na čase',
        font: {
          size: 16
        }
      },
    },
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        beginAtZero: true,
        title: {
          display: true,
          text: 'Dráha s [mm]'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Čas t [s]'
        }
      },
      ...(showSpeed && {
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          beginAtZero: true,
          title: {
            display: true,
            text: 'Rychlost v [mm/s]'
          },
          grid: {
            drawOnChartArea: false,
          },
        }
      })
    }
  };

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'flex-end' }}>
        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontWeight: '500' }}>
          <input 
            type="checkbox" 
            checked={showSpeed} 
            onChange={(e) => setShowSpeed(e.target.checked)} 
            style={{ marginRight: '8px', cursor: 'pointer' }}
          />
          Zobrazit graf rychlosti
        </label>
      </div>
      <div style={{ flex: 1, minHeight: 0 }}>
        <Line options={options} data={chartData} />
      </div>
    </div>
  );
};

export default GraphTab;
