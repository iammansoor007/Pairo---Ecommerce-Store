import React from 'react';
import { Trash2, ShoppingCart, Tag, Percent, ArrowRight } from 'lucide-react';

export default function ActionBlock({ action, index, onUpdate, onRemove }) {
  const types = [
    { value: 'percentage_discount', label: 'Percentage Discount' },
    { value: 'fixed_discount', label: 'Fixed Amount Discount' },
    { value: 'free_shipping', label: 'Free Shipping' },
    { value: 'bxgy', label: 'Buy X Get Y' },
  ];

  const targets = [
    { value: 'cart', label: 'Entire Cart' },
    { value: 'product', label: 'Specific Products' },
    { value: 'category', label: 'Specific Categories' },
    { value: 'shipping', label: 'Shipping Fee' },
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-sm shadow-sm overflow-hidden mb-3">
      {/* Action Header */}
      <div className="bg-[#f9fafb] border-b border-gray-100 px-3 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1 bg-emerald-100 text-emerald-700 rounded-sm">
            <Percent className="w-3.5 h-3.5" />
          </div>
          <span className="text-[12px] font-bold text-gray-700 uppercase tracking-tight">Action #{index + 1}</span>
        </div>
        <button onClick={() => onRemove(index)} className="text-gray-400 hover:text-rose-600 p-1">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Action Settings */}
      <div className="p-4 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-gray-500 uppercase">Discount Type</label>
            <select 
              value={action.type} 
              onChange={(e) => onUpdate(index, 'type', e.target.value)}
              className="w-full text-[13px] border border-gray-300 p-2 rounded-sm outline-none focus:border-[#2271b1]"
            >
              {types.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>

          {action.type !== 'bxgy' && (
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-gray-500 uppercase">Target Scope</label>
              <select 
                value={action.target} 
                onChange={(e) => onUpdate(index, 'target', e.target.value)}
                className="w-full text-[13px] border border-gray-300 p-2 rounded-sm outline-none focus:border-[#2271b1]"
              >
                {targets.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
          )}
        </div>

        {action.type === 'bxgy' ? (
          <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-sm space-y-3">
            <div className="flex items-center gap-2 text-[13px]">
              <span className="font-bold text-emerald-800">Buy</span>
              <input 
                type="number" 
                value={action.bxgyConfig?.buyQty || 1} 
                onChange={(e) => onUpdate(index, 'bxgyConfig', { ...action.bxgyConfig, buyQty: parseInt(e.target.value) })}
                className="w-16 border border-emerald-200 p-1 rounded-sm text-center" 
              />
              <span className="text-emerald-800">of Product ID</span>
              <input 
                type="text" 
                value={action.bxgyConfig?.buyX || ''} 
                onChange={(e) => onUpdate(index, 'bxgyConfig', { ...action.bxgyConfig, buyX: e.target.value })}
                placeholder="Product ID"
                className="flex-1 border border-emerald-200 p-1 rounded-sm text-[12px]" 
              />
            </div>
            <div className="flex items-center justify-center">
               <ArrowRight className="w-4 h-4 text-emerald-300" />
            </div>
            <div className="flex items-center gap-2 text-[13px]">
              <span className="font-bold text-emerald-800">Get</span>
              <input 
                type="number" 
                value={action.bxgyConfig?.getQty || 1} 
                onChange={(e) => onUpdate(index, 'bxgyConfig', { ...action.bxgyConfig, getQty: parseInt(e.target.value) })}
                className="w-16 border border-emerald-200 p-1 rounded-sm text-center" 
              />
              <span className="text-emerald-800">of Product ID</span>
              <input 
                type="text" 
                value={action.bxgyConfig?.getY || ''} 
                onChange={(e) => onUpdate(index, 'bxgyConfig', { ...action.bxgyConfig, getY: e.target.value })}
                placeholder="Target Product ID"
                className="flex-1 border border-emerald-200 p-1 rounded-sm text-[12px]" 
              />
            </div>
            <div className="flex items-center gap-4 text-[12px] pt-1">
               <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    checked={action.bxgyConfig?.useCheapest || false} 
                    onChange={(e) => onUpdate(index, 'bxgyConfig', { ...action.bxgyConfig, useCheapest: e.target.checked })}
                    id={`cheapest-${index}`}
                  />
                  <label htmlFor={`cheapest-${index}`} className="text-emerald-700 font-medium">Use cheapest eligible item</label>
               </div>
               <div className="flex items-center gap-2">
                  <span className="text-emerald-700">Discount:</span>
                  <input 
                    type="number" 
                    value={action.bxgyConfig?.discountValue || 100} 
                    onChange={(e) => onUpdate(index, 'bxgyConfig', { ...action.bxgyConfig, discountValue: parseInt(e.target.value) })}
                    className="w-12 border-b border-emerald-300 bg-transparent text-center font-bold"
                  />
                  <span className="text-emerald-700">% OFF</span>
               </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-gray-500 uppercase">Discount Value</label>
              <div className="relative">
                <span className="absolute left-2 top-2 text-gray-400 text-sm">{action.type === 'fixed_discount' ? '$' : '%'}</span>
                <input 
                  type="number" 
                  value={action.value || 0} 
                  onChange={(e) => onUpdate(index, 'value', parseFloat(e.target.value))}
                  className="w-full text-[13px] border border-gray-300 p-2 pl-6 rounded-sm outline-none focus:border-[#2271b1]"
                />
              </div>
            </div>
            {(action.target === 'product' || action.target === 'category') && (
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-500 uppercase">Target IDs (Comma separated)</label>
                <input 
                  type="text" 
                  value={action.targetIds?.join(', ') || ''} 
                  onChange={(e) => onUpdate(index, 'targetIds', e.target.value.split(',').map(s => s.trim()))}
                  placeholder="ID1, ID2..."
                  className="w-full text-[13px] border border-gray-300 p-2 rounded-sm outline-none focus:border-[#2271b1]"
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
