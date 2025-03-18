import React from 'react';

interface PatternLockDisplayProps {
  pattern: string;
  size?: number;
}

/**
 * Componente para exibir um padrão de senha visualmente.
 * Aceita um padrão no formato "0-1-2-5-8" e exibe como um grid visual.
 */
const PatternLockDisplay: React.FC<PatternLockDisplayProps> = ({ pattern, size = 160 }) => {
  // Converter a string do padrão (ex: "0-3-6-7-8") em um array de números
  const dots = pattern.split('-').map(Number);
  
  // Calcular posições dos pontos na grade 3x3
  const getPosition = (index: number): { x: number, y: number } => {
    const row = Math.floor(index / 3);
    const col = index % 3;
    const spacing = size / 3;
    
    return {
      x: col * spacing + spacing / 2,
      y: row * spacing + spacing / 2,
    };
  };
  
  // Gerar caminhos entre os pontos
  const generatePaths = () => {
    if (dots.length < 2) return null;
    
    let pathsJSX = [];
    
    for (let i = 0; i < dots.length - 1; i++) {
      const current = getPosition(dots[i]);
      const next = getPosition(dots[i + 1]);
      
      pathsJSX.push(
        <line
          key={`path-${i}`}
          x1={current.x}
          y1={current.y}
          x2={next.x}
          y2={next.y}
          stroke="#3B82F6"
          strokeWidth={3}
          strokeLinecap="round"
        />
      );
    }
    
    return pathsJSX;
  };
  
  return (
    <div className="pattern-lock-display">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Grid de pontos de fundo (cinza) */}
        {Array.from({ length: 9 }).map((_, i) => {
          const { x, y } = getPosition(i);
          return (
            <circle
              key={`bg-dot-${i}`}
              cx={x}
              cy={y}
              r={size / 18}
              fill="#e0e0e0"
            />
          );
        })}
        
        {/* Linhas conectando os pontos */}
        {generatePaths()}
        
        {/* Pontos selecionados (azul) */}
        {dots.map((dotIndex, i) => {
          const { x, y } = getPosition(dotIndex);
          return (
            <circle
              key={`selected-dot-${i}`}
              cx={x}
              cy={y}
              r={size / 18}
              fill="#3B82F6"
            />
          );
        })}
        
        {/* Números dos pontos */}
        {dots.map((dotIndex, i) => {
          const { x, y } = getPosition(dotIndex);
          return (
            <text
              key={`dot-number-${i}`}
              x={x}
              y={y + 1}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="white"
              fontSize={size / 20}
              fontWeight="bold"
            >
              {i + 1}
            </text>
          );
        })}
      </svg>
    </div>
  );
};

export default PatternLockDisplay; 