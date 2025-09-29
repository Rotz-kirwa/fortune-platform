import React, { useEffect, useState } from 'react';

interface CandleData {
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

const LiveChart: React.FC = () => {
  const [candles, setCandles] = useState<CandleData[]>([]);
  const [currentPrice, setCurrentPrice] = useState(370150);
  const [volume, setVolume] = useState(1250000);
  const [isUp, setIsUp] = useState(true);
  const [activeInvestments, setActiveInvestments] = useState(1247);

  useEffect(() => {
    // Generate initial candlestick data
    const initialCandles: CandleData[] = [];
    let basePrice = 364000;
    
    for (let i = 0; i < 20; i++) {
      const open = basePrice + (Math.random() - 0.5) * 20;
      const close = open + (Math.random() - 0.5) * 30;
      const high = Math.max(open, close) + Math.random() * 15;
      const low = Math.min(open, close) - Math.random() * 15;
      const volume = 800000 + Math.random() * 600000;
      
      initialCandles.push({ open, high, low, close, volume });
      basePrice = close;
    }
    
    setCandles(initialCandles);
    setCurrentPrice(basePrice);

    // Animate with new candles
    const interval = setInterval(() => {
      setCandles(prev => {
        const lastCandle = prev[prev.length - 1];
        const open = lastCandle.close;
        const close = open + (Math.random() - 0.5) * 25;
        const high = Math.max(open, close) + Math.random() * 12;
        const low = Math.min(open, close) - Math.random() * 12;
        const volume = 800000 + Math.random() * 600000;
        
        const newCandle = { open, high, low, close, volume };
        const newCandles = [...prev.slice(1), newCandle];
        
        setCurrentPrice(close);
        setIsUp(close > open);
        setVolume(volume);
        setActiveInvestments(1200 + Math.floor(Math.random() * 100));
        
        return newCandles;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const maxPrice = Math.max(...candles.map(c => c.high));
  const minPrice = Math.min(...candles.map(c => c.low));
  const range = maxPrice - minPrice;

  return (
    <div style={{
      height: '450px',
      width: '100%',
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)',
      borderRadius: '1rem',
      padding: '1.5rem',
      border: '2px solid rgba(255, 107, 53, 0.2)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Animated background particles */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(circle at 20% 80%, rgba(255, 107, 53, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(16, 185, 129, 0.1) 0%, transparent 50%)',
        animation: 'float 8s ease-in-out infinite'
      }}></div>

      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem',
        position: 'relative',
        zIndex: 10
      }}>
        <div>
          <h3 style={{ color: '#ffffff', fontSize: '1.4rem', margin: 0, textShadow: '0 0 10px rgba(255, 107, 53, 0.5)' }}>FORTUNE LIVE</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
            <span style={{ color: '#10b981', fontSize: '0.8rem' }}>🟢 {activeInvestments} Active Investments</span>
            <span style={{ color: '#ff6b35', fontSize: '0.8rem' }}>📊 Vol: {(volume / 1000000).toFixed(1)}M</span>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            color: isUp ? '#10b981' : '#f59e0b',
            textShadow: `0 0 15px ${isUp ? '#10b981' : '#f59e0b'}50`
          }}>
            KSh {currentPrice.toLocaleString()}
          </div>
          <div style={{
            fontSize: '1rem',
            color: isUp ? '#10b981' : '#f59e0b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '0.5rem'
          }}>
            <span style={{ fontSize: '1.2rem' }}>{isUp ? '🚀' : '📉'}</span>
            {isUp ? '+' : ''}{((currentPrice - 364000) / 364000 * 100).toFixed(2)}%
          </div>
        </div>
      </div>

      {/* Candlestick Chart */}
      <div style={{ height: '280px', position: 'relative', zIndex: 10 }}>
        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
          {/* Grid */}
          {[20, 40, 60, 80].map(y => (
            <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="rgba(255, 255, 255, 0.05)" strokeWidth="0.1" />
          ))}
          
          {/* Candlesticks */}
          {candles.map((candle, index) => {
            const x = (index / (candles.length - 1)) * 100;
            const openY = 100 - ((candle.open - minPrice) / range) * 100;
            const closeY = 100 - ((candle.close - minPrice) / range) * 100;
            const highY = 100 - ((candle.high - minPrice) / range) * 100;
            const lowY = 100 - ((candle.low - minPrice) / range) * 100;
            const isGreen = candle.close > candle.open;
            const color = isGreen ? '#10b981' : '#f59e0b';
            
            return (
              <g key={index}>
                {/* Wick */}
                <line
                  x1={x}
                  y1={highY}
                  x2={x}
                  y2={lowY}
                  stroke={color}
                  strokeWidth="0.2"
                  opacity="0.8"
                />
                {/* Body */}
                <rect
                  x={x - 1}
                  y={Math.min(openY, closeY)}
                  width="2"
                  height={Math.abs(closeY - openY) || 0.5}
                  fill={color}
                  opacity="0.9"
                  style={{
                    filter: `drop-shadow(0 0 2px ${color}80)`,
                    animation: index === candles.length - 1 ? 'glow 1s ease-in-out infinite alternate' : 'none'
                  }}
                />
              </g>
            );
          })}
        </svg>
        
        {/* Live pulse indicator */}
        <div style={{
          position: 'absolute',
          top: '15px',
          right: '15px',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: 'rgba(0, 0, 0, 0.7)',
          padding: '0.5rem 1rem',
          borderRadius: '2rem',
          border: '1px solid rgba(255, 107, 53, 0.3)'
        }}>
          <div style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, #10b981 0%, #10b981 40%, transparent 70%)',
            animation: 'pulse-ring 2s infinite'
          }}></div>
          <span style={{ color: '#10b981', fontSize: '0.9rem', fontWeight: 'bold' }}>LIVE INVESTING</span>
        </div>
      </div>
      
      {/* Bottom stats */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-around',
        marginTop: '1rem',
        padding: '0.5rem',
        background: 'rgba(255, 255, 255, 0.02)',
        borderRadius: '0.5rem',
        position: 'relative',
        zIndex: 10
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: '#10b981', fontSize: '1.1rem', fontWeight: 'bold' }}>{(maxPrice).toFixed(0)}</div>
          <div style={{ color: '#888', fontSize: '0.7rem' }}>24H HIGH</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: '#f59e0b', fontSize: '1.1rem', fontWeight: 'bold' }}>{(minPrice).toFixed(0)}</div>
          <div style={{ color: '#888', fontSize: '0.7rem' }}>24H LOW</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: '#ff6b35', fontSize: '1.1rem', fontWeight: 'bold' }}>{((volume / 1000000).toFixed(1))}M</div>
          <div style={{ color: '#888', fontSize: '0.7rem' }}>VOLUME</div>
        </div>
      </div>
      
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(1deg); }
        }
        @keyframes pulse-ring {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(2); opacity: 0; }
        }
        @keyframes glow {
          0% { filter: drop-shadow(0 0 2px currentColor); }
          100% { filter: drop-shadow(0 0 8px currentColor); }
        }
      `}</style>
    </div>
  );
};

export default LiveChart;