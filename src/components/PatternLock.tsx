import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { XCircle } from 'lucide-react';

interface PatternLockProps {
  value?: string;
  pattern?: string;
  onChange?: (value: string) => void;
  size?: number;
}

const PatternLock: React.FC<PatternLockProps> = ({ 
  value, 
  pattern, 
  onChange, 
  size = 200 
}) => {
  // Determinar se estamos no modo de edição ou apenas visualização
  const isEditMode = !!onChange;
  
  // Estado para o padrão em modo de edição
  const [currentPattern, setCurrentPattern] = useState<number[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  
  // Usar o pattern se fornecido ou decodificar o value
  const dots = pattern ? pattern.split('-').map(Number) : 
               isEditMode ? currentPattern : 
               value ? value.split('-').map(Number) : [];
  
  // Calcular posições dos pontos
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
          strokeWidth={4}
          strokeLinecap="round"
        />
      );
    }
    
    return pathsJSX;
  };
  
  // Handlers para edição de padrão
  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isEditMode) return;
    e.preventDefault();
    setIsDrawing(true);
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    const element = e.currentTarget as HTMLDivElement;
    const rect = element.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    
    // Verificar se clicou em algum ponto
    const hitDot = getDotAtPosition(x, y);
    
    if (hitDot !== -1 && !currentPattern.includes(hitDot)) {
      setCurrentPattern([hitDot]);
    }
  };
  
  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isEditMode || !isDrawing) return;
    e.preventDefault();
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    const element = e.currentTarget as HTMLDivElement;
    const rect = element.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    
    // Verificar se passou por algum ponto
    const hitDot = getDotAtPosition(x, y);
    
    if (hitDot !== -1 && !currentPattern.includes(hitDot)) {
      setCurrentPattern(prev => [...prev, hitDot]);
    }
  };
  
  const handleEnd = () => {
    if (!isEditMode) return;
    setIsDrawing(false);
    if (currentPattern.length > 0 && onChange) {
      const patternString = currentPattern.join('-');
      onChange(patternString);
    }
  };
  
  const handleClear = () => {
    if (!isEditMode) return;
    setCurrentPattern([]);
    if (onChange) {
      onChange('');
    }
  };
  
  // Utilitário para encontrar o ponto na posição x, y
  const getDotAtPosition = (x: number, y: number): number => {
    const dotRadius = size / 15;
    
    for (let i = 0; i < 9; i++) {
      const pos = getPosition(i);
      const distX = pos.x - x;
      const distY = pos.y - y;
      const distance = Math.sqrt(distX * distX + distY * distY);
      
      if (distance < dotRadius) {
        return i;
      }
    }
    
    return -1;
  };
  
  // Carregar padrão existente se houver
  useEffect(() => {
    if (isEditMode && value && currentPattern.length === 0) {
      const loadedPattern = value.split('-').map(Number);
      if (loadedPattern.some(n => !isNaN(n))) {
        setCurrentPattern(loadedPattern);
      }
    }
  }, [value, isEditMode]);
  
  // Renderização para modo de visualização
  if (!isEditMode) {
    return (
      <div className="pattern-lock">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Grid de pontos */}
          {Array.from({ length: 9 }).map((_, i) => {
            const { x, y } = getPosition(i);
            const isSelected = dots.includes(i);
            
            return (
              <circle
                key={`dot-${i}`}
                cx={x}
                cy={y}
                r={size / 15}
                fill={isSelected ? "#3B82F6" : "#e0e0e0"}
                className="transition-colors"
              />
            );
          })}
          
          {/* Linhas conectando os pontos */}
          {generatePaths()}
          
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
  }
  
  // Renderização para modo de edição
  return (
    <div className="flex flex-col items-center">
      <div 
        className="pattern-lock relative w-full max-w-xs"
        onMouseDown={handleStart}
        onMouseMove={handleMove}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onTouchStart={handleStart}
        onTouchMove={handleMove}
        onTouchEnd={handleEnd}
      >
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Grid de pontos */}
          {Array.from({ length: 9 }).map((_, i) => {
            const { x, y } = getPosition(i);
            const isSelected = currentPattern.includes(i);
            
            return (
              <circle
                key={`dot-${i}`}
                cx={x}
                cy={y}
                r={size / 15}
                fill={isSelected ? "#3B82F6" : "#e0e0e0"}
                className="transition-colors"
              />
            );
          })}
          
          {/* Linhas conectando os pontos */}
          {generatePaths()}
        </svg>
      </div>
      
      {/* Botão centralizado - abordagem final */}
      <div className="text-center w-full mt-4">
        <Button 
          type="button" 
          variant="outline" 
          size="sm" 
          onClick={handleClear}
          className="text-red-500 hover:text-red-700 inline-flex items-center gap-1"
        >
          <XCircle size={16} />
          Limpar Padrão
        </Button>
      </div>
    </div>
  );
};

export default PatternLock; 