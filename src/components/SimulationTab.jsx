import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Ruler, CheckCircle2 } from 'lucide-react';

// 1 mm = 5 pixels
const SCALE = 5;

const SimulationTab = ({ 
  appState, setAppState, 
  antPath, setAntPath, 
  currentMeasureTime, setCurrentMeasureTime,
  measuredData, setMeasuredData
}) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const animationRef = useRef(null);
  const antImgRef = useRef(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  useEffect(() => {
    const img = new Image();
    const basePath = import.meta.env.BASE_URL || '/';
    img.src = `${basePath.endsWith('/') ? basePath : basePath + '/'}mravenec.png`;
    img.onload = () => {
      antImgRef.current = img;
      setImageLoaded(true);
    };
  }, []);
  
  // Animation state
  const [animStartTime, setAnimStartTime] = useState(null);
  const [currentAnimTime, setCurrentAnimTime] = useState(0);

  // Ruler state
  const [ruler, setRuler] = useState({ active: false, start: null, end: null, isDrawing: false });
  const [currentSegmentLength, setCurrentSegmentLength] = useState(0);

  // Auto-activate ruler on step change
  useEffect(() => {
    if (appState === 'measuring') {
      setRuler({ active: true, start: null, end: null, isDrawing: false });
      setCurrentSegmentLength(0);
    }
  }, [appState, currentMeasureTime]);

  // Generate path when appState becomes 'simulating'
  useEffect(() => {
    if (appState === 'simulating') {
      const canvas = canvasRef.current;
      const width = canvas.width;
      const height = canvas.height;
      
      let path = [];
      let t = 0;
      let x = 30; // Start offset
      let y = height / 2;
      let v = (width - 60) / 50; // base speed to cross in ~50s
      let currentAngle = 0;
      let timeInPositiveExtreme = 0;
      let timeInNegativeExtreme = 0;
      let stepCount = 0;

      // Start point at t = 0
      path.push({ x, y, time: 0, angle: 0 });

      while (x < width - 30 && t < 45) {
        // Change angle every 1s (10 steps of 0.1s)
        if (stepCount % 10 === 0) {
          if (timeInPositiveExtreme >= 5) {
            // Force angle to be heavily negative
            currentAngle = (-15 - Math.random() * 15) * (Math.PI / 180);
          } else if (timeInNegativeExtreme >= 5) {
            // Force angle to be heavily positive
            currentAngle = (15 + Math.random() * 15) * (Math.PI / 180);
          } else {
            currentAngle = (Math.random() * 60 - 30) * (Math.PI / 180);
          }

          if (currentAngle >= 15 * (Math.PI / 180)) {
            timeInPositiveExtreme += 1;
            timeInNegativeExtreme = 0;
          } else if (currentAngle <= -15 * (Math.PI / 180)) {
            timeInNegativeExtreme += 1;
            timeInPositiveExtreme = 0;
          } else {
            timeInPositiveExtreme = 0;
            timeInNegativeExtreme = 0;
          }
        }
        
        // Change speed every 2s (20 steps)
        if (stepCount % 20 === 0) {
          v = v * (1 + (Math.random() * 0.4 - 0.2));
        }
        
        let dt = 0.1;
        const prevX = x;
        const prevY = y;
        x += v * Math.cos(currentAngle) * dt;
        y += v * Math.sin(currentAngle) * dt;
        
        // Boundaries
        if (y < 20) { 
          y = 20; 
          currentAngle = Math.abs(currentAngle); 
        }
        if (y > height - 20) { 
          y = height - 20; 
          currentAngle = -Math.abs(currentAngle); 
        }
        
        t += dt;
        stepCount += 1;
        const actualAngle = Math.atan2(y - prevY, x - prevX);
        path.push({ x, y, time: Number(t.toFixed(1)), angle: actualAngle });
      }

      if (path.length > 1) {
        path[0].angle = path[1].angle;
      }
      
      setAntPath(path);
      setAnimStartTime(performance.now());
      setCurrentAnimTime(0);
    }
  }, [appState]);

  // Animation Loop
  const animate = useCallback((now) => {
    if (appState === 'simulating' && antPath.length > 0 && animStartTime) {
      const elapsedSec = (now - animStartTime) / 1000;
      setCurrentAnimTime(elapsedSec);
      
      const maxTime = antPath[antPath.length - 1].time;
      if (elapsedSec >= maxTime) {
        setAppState('measuring');
        setCurrentMeasureTime(5); // Start measuring first 5s segment
      } else {
        animationRef.current = requestAnimationFrame(animate);
      }
    }
  }, [appState, antPath, animStartTime, setAppState, setCurrentMeasureTime]);

  useEffect(() => {
    if (appState === 'simulating') {
      animationRef.current = requestAnimationFrame(animate);
    }
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [appState, animate]);

  // Handle Resize
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current && canvasRef.current) {
        canvasRef.current.width = containerRef.current.clientWidth;
        canvasRef.current.height = containerRef.current.clientHeight;
        draw(); // Redraw on resize
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Main Draw Function
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // 1. Draw Millimeter Paper
    ctx.fillStyle = '#fdfbf7';
    ctx.fillRect(0, 0, width, height);

    ctx.lineWidth = 1;
    for (let x = 0; x <= width; x += SCALE) {
      ctx.strokeStyle = (x % (SCALE * 10) === 0) ? '#d0c8b6' : '#eeebe1';
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
    }
    for (let y = 0; y <= height; y += SCALE) {
      ctx.strokeStyle = (y % (SCALE * 10) === 0) ? '#d0c8b6' : '#eeebe1';
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
    }

    // Helper to draw Ant (with head pointing in direction of angle)
    const drawAnt = (x, y, color = '#0f2c59', opacity = 1, angle = 0) => {
      ctx.save();
      ctx.globalAlpha = opacity;
      ctx.translate(x, y);
      ctx.rotate(angle + Math.PI / 2); // Rotate +90deg because both ant image and fallback head face UP (-y)
      
      if (antImgRef.current) {
        const imgW = 29.04; // 26.4 * 1.1
        const imgH = 29.04;
        ctx.drawImage(antImgRef.current, -imgW/2, -imgH/2, imgW, imgH);
      } else {
        ctx.fillStyle = color;
        // Head (top)
        ctx.beginPath();
        ctx.arc(0, -6, 4, 0, 2 * Math.PI); 
        ctx.fill();
        // Thorax (center)
        ctx.beginPath();
        ctx.arc(0, 0, 3.5, 0, 2 * Math.PI); 
        ctx.fill();
        // Abdomen (bottom)
        ctx.beginPath();
        ctx.arc(0, 7, 5, 0, 2 * Math.PI); 
        ctx.fill();
        // Legs & Antennae
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5;
        [-1, 1].forEach(side => {
          // Antennae
          ctx.beginPath(); ctx.moveTo(0, -8); ctx.lineTo(4 * side, -12); ctx.stroke();
          // Front legs
          ctx.beginPath(); ctx.moveTo(0, -2); ctx.lineTo(6 * side, -5); ctx.stroke();
          // Middle legs
          ctx.beginPath(); ctx.moveTo(0, 1); ctx.lineTo(7 * side, 1); ctx.stroke();
          // Back legs
          ctx.beginPath(); ctx.moveTo(0, 4); ctx.lineTo(6 * side, 8); ctx.stroke();
        });
      }
      ctx.restore();
    };

    if (appState === 'simulating' && antPath.length > 0) {
      // Draw path so far
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(198, 124, 78, 0.4)';
      ctx.lineWidth = 2;
      for (let i = 0; i < antPath.length; i++) {
        if (antPath[i].time > currentAnimTime) break;
        if (i === 0) ctx.moveTo(antPath[i].x, antPath[i].y);
        else ctx.lineTo(antPath[i].x, antPath[i].y);
      }
      ctx.stroke();

      // Find current ant position
      const currentPoint = antPath.find(p => p.time >= currentAnimTime) || antPath[antPath.length - 1];
      drawAnt(currentPoint.x, currentPoint.y, '#0f2c59', 1, currentPoint.angle || 0);
    } 
    else if (appState === 'measuring') {
      // Draw path up to currentMeasureTime
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(198, 124, 78, 0.6)';
      ctx.lineWidth = 2;
      for (let i = 0; i < antPath.length; i++) {
        if (antPath[i].time > currentMeasureTime) break;
        if (i === 0) ctx.moveTo(antPath[i].x, antPath[i].y);
        else ctx.lineTo(antPath[i].x, antPath[i].y);
      }
      ctx.stroke();

      // Draw ghost ant at previous step and current ant at current step
      const prevTime = currentMeasureTime - 5;
      const prevPoint = antPath.find(p => p.time >= prevTime) || antPath[0];
      const currentPoint = antPath.find(p => p.time >= currentMeasureTime) || antPath[antPath.length - 1];
      
      // Step direction of movement between previous and current step
      const stepAngle = Math.atan2(currentPoint.y - prevPoint.y, currentPoint.x - prevPoint.x);

      drawAnt(prevPoint.x, prevPoint.y, '#555555', 0.5, stepAngle); // Ghost
      drawAnt(currentPoint.x, currentPoint.y, '#0f2c59', 1, stepAngle);
    }
    else if (appState === 'done') {
      // Draw full path
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(198, 124, 78, 0.6)';
      ctx.lineWidth = 2;
      for (let i = 0; i < antPath.length; i++) {
        if (i === 0) ctx.moveTo(antPath[i].x, antPath[i].y);
        else ctx.lineTo(antPath[i].x, antPath[i].y);
      }
      ctx.stroke();

      if (antPath.length > 0) {
        const lastPoint = antPath[antPath.length - 1];
        drawAnt(lastPoint.x, lastPoint.y, '#0f2c59', 1, lastPoint.angle || 0);
      }
    }
    else if (appState === 'idle') {
      // Draw ant at start position facing right
      const startX = 30;
      const startY = height / 2;
      drawAnt(startX, startY, '#0f2c59', 1, 0);
    }

    // Draw Ruler
    if (ruler.active && ruler.start) {
      const endPoint = ruler.end || ruler.start;
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(46, 204, 113, 0.8)';
      ctx.lineWidth = 3;
      ctx.moveTo(ruler.start.x, ruler.start.y);
      ctx.lineTo(endPoint.x, endPoint.y);
      ctx.stroke();

      // Draw dots at ends
      ctx.fillStyle = '#27ae60';
      ctx.beginPath(); ctx.arc(ruler.start.x, ruler.start.y, 4, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(endPoint.x, endPoint.y, 4, 0, Math.PI*2); ctx.fill();
      
      // Draw length text
      const dx = endPoint.x - ruler.start.x;
      const dy = endPoint.y - ruler.start.y;
      const distPx = Math.sqrt(dx*dx + dy*dy);
      const distMm = (distPx / SCALE).toFixed(1);
      
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.fillRect(endPoint.x + 10, endPoint.y - 25, 60, 20);
      ctx.fillStyle = '#000';
      ctx.font = '12px Inter';
      ctx.fillText(`${distMm} mm`, endPoint.x + 15, endPoint.y - 10);
    }

  }, [appState, antPath, currentAnimTime, currentMeasureTime, ruler]);

  // Redraw when image finishes loading
  useEffect(() => {
    if (imageLoaded) {
      draw();
    }
  }, [imageLoaded, draw]);

  // Request redraw when dependencies change
  useEffect(() => {
    draw();
  }, [draw]);

  // Pointer Handlers for Ruler (works for mouse and touch)
  const getCoordinates = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    if (e.touches && e.touches.length > 0) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      };
    }
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const handlePointerDown = (e) => {
    if (appState !== 'measuring' || !ruler.active) return;
    const { x, y } = getCoordinates(e);
    setRuler({ ...ruler, start: {x, y}, end: {x, y}, isDrawing: true });
  };

  const handlePointerMove = (e) => {
    if (!ruler.isDrawing) return;
    const { x, y } = getCoordinates(e);
    setRuler(prev => ({ ...prev, end: {x, y} }));
    
    // Update live segment length
    if (ruler.start) {
      const dx = x - ruler.start.x;
      const dy = y - ruler.start.y;
      setCurrentSegmentLength(Math.sqrt(dx*dx + dy*dy) / SCALE);
    }
  };

  const handlePointerUp = () => {
    if (ruler.isDrawing) {
      setRuler(prev => ({ ...prev, isDrawing: false }));
    }
  };

  // Save measurement
  const saveMeasurement = () => {
    setMeasuredData(prev => {
      const newData = [...prev];
      // Find previous cumulative distance
      let prevCumDist = 0;
      const prevIdx = newData.findIndex(d => d.time === currentMeasureTime - 5);
      if (prevIdx >= 0 && newData[prevIdx].distance !== '') {
        prevCumDist = Number(newData[prevIdx].distance);
      }
      
      const currentIdx = newData.findIndex(d => d.time === currentMeasureTime);
      if (currentIdx >= 0) {
        newData[currentIdx].distance = (prevCumDist + currentSegmentLength).toFixed(1);
      }
      return newData;
    });

    setRuler({ active: false, start: null, end: null, isDrawing: false });
    setCurrentSegmentLength(0);

    // Advance to next 5s step or finish
    const maxTime = antPath[antPath.length - 1].time;
    if (currentMeasureTime + 5 <= maxTime) {
      setCurrentMeasureTime(currentMeasureTime + 5);
    } else {
      setAppState('done');
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }}>
        <canvas 
          ref={canvasRef} 
          onMouseDown={handlePointerDown}
          onMouseMove={handlePointerMove}
          onMouseUp={handlePointerUp}
          onMouseLeave={handlePointerUp}
          onTouchStart={handlePointerDown}
          onTouchMove={handlePointerMove}
          onTouchEnd={handlePointerUp}
          onTouchCancel={handlePointerUp}
          style={{ cursor: ruler.active ? 'crosshair' : 'default', display: 'block', touchAction: 'none' }}
        />
      </div>

      {appState === 'measuring' && (
        <div style={{
          position: 'absolute',
          top: 16,
          left: 16,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          padding: '12px 16px',
          borderRadius: '8px',
          boxShadow: 'var(--shadow-md)',
          border: '1px solid var(--color-border)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          maxWidth: '300px'
        }}>
          <h4 style={{ margin: 0, color: 'var(--color-primary)' }}>Krok {currentMeasureTime/5}: t = {currentMeasureTime}s</h4>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#555' }}>
            Změřte vzdálenost mezi šedým (předchozím) a modrým (aktuálním) mravencem.
          </p>
          
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px' }}>
            <button 
              onClick={() => setRuler({ active: !ruler.active, start: null, end: null, isDrawing: false })}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '6px 12px', borderRadius: '4px',
                backgroundColor: ruler.active ? 'var(--color-bg-main)' : 'white',
                border: `1px solid ${ruler.active ? 'var(--color-primary)' : 'var(--color-border)'}`,
                fontWeight: ruler.active ? '600' : '400',
                color: ruler.active ? 'var(--color-primary)' : 'inherit'
              }}
            >
              <Ruler size={16} /> {ruler.active ? 'Měření aktivní' : 'Zapnout pravítko'}
            </button>
          </div>

          {ruler.start && !ruler.isDrawing && (
            <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: '600', color: '#27ae60' }}>{currentSegmentLength.toFixed(1)} mm</span>
              <button 
                onClick={saveMeasurement}
                style={{
                  display: 'flex', alignItems: 'center', gap: '4px',
                  backgroundColor: '#27ae60', color: 'white', padding: '6px 12px',
                  borderRadius: '4px', fontSize: '0.9rem', fontWeight: '600'
                }}
              >
                <CheckCircle2 size={16} /> Zapsat
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SimulationTab;
