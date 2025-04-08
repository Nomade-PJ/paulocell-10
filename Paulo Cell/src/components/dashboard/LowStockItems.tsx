
import React from 'react';
import { ArrowRightIcon, AlertCircleIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface LowStockItemsProps {
  inventory: any[];
}

const LowStockItems: React.FC<LowStockItemsProps> = ({ inventory }) => {
  const navigate = useNavigate();
  const lowStockItems = inventory
    .filter(item => Number(item.currentStock) < 5)
    .slice(0, 5);
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Estoque Baixo</h2>
        <Button variant="outline" size="sm" className="gap-1" onClick={() => navigate('/inventory')}>
          <span>Ver estoque</span>
          <ArrowRightIcon size={16} />
        </Button>
      </div>
      
      <div className="bg-card rounded-xl border border-border p-4 space-y-3">
        {lowStockItems.length > 0 ? (
          lowStockItems.map((item) => (
            <div key={item.id} className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-full bg-red-100">
                  <AlertCircleIcon size={16} className="text-red-600" />
                </div>
                <div>
                  <p className="font-medium text-sm">{item.name}</p>
                  <p className="text-xs text-muted-foreground">Mínimo: {item.minimumStock}</p>
                </div>
              </div>
              <div className="text-sm font-semibold text-red-600">
                {item.currentStock}
              </div>
            </div>
          ))
        ) : (
          <div className="flex items-center justify-center h-20">
            <p className="text-muted-foreground">Nenhum item com estoque baixo</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LowStockItems;
