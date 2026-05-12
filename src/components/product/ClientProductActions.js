"use client";

import { useState } from "react";
import { Plus, Minus, ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";

export default function ClientProductActions({ product }) {
  // Store selected options as { "Size": "M", "Color": "Red" }
  const [selectedOptions, setSelectedOptions] = useState({});
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const router = useRouter();

  const handleOptionSelect = (attrName, value) => {
    setSelectedOptions(prev => ({
      ...prev,
      [attrName]: value
    }));
  };

  const handleAddToCart = () => {
    for(let i = 0; i < quantity; i++) {
      addToCart({
        ...product,
        selectedOptions
      });
    }
  };

  const handleSecureCheckout = () => {
    handleAddToCart();
    router.push("/checkout");
  };

  // Extract variants from product
  const variants = product.variants || [];

  return (
    <div className="space-y-8 pt-6 border-t border-black/5">
      {/* Dynamic Variants from DB */}
      {variants.map((variant) => (
        <div key={variant.name} className="space-y-3">
          <p className="text-[10px] font-bold text-black/30 uppercase tracking-[0.2em]">{variant.name}</p>
          <div className="flex flex-wrap gap-2">
            {(variant.values || []).map((option) => {
              const isSelected = selectedOptions[variant.name] === option;
              
              // Simple Color detection for visual dots
              const isColor = variant.name.toLowerCase().includes("color");
              const colorMap = { "Black": "#000000", "White": "#FFFFFF", "Navy": "#000080", "Gray": "#808080", "Red": "#FF0000" };
              const colorValue = colorMap[option] || option;

              if (isColor) {
                return (
                  <button
                    key={option}
                    onClick={() => handleOptionSelect(variant.name, option)}
                    className={`w-8 h-8 md:w-10 md:h-10 rounded-full border-2 transition-all flex items-center justify-center ${isSelected ? 'border-black scale-110 shadow-lg' : 'border-transparent hover:border-black/20'}`}
                    style={{ backgroundColor: colorValue.startsWith("#") ? colorValue : "transparent" }}
                    title={option}
                  >
                     {!colorValue.startsWith("#") && <span className="text-[8px] font-bold uppercase">{option.substring(0,1)}</span>}
                     {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white shadow-sm" />}
                  </button>
                );
              }

              return (
                <button
                  key={option}
                  onClick={() => handleOptionSelect(variant.name, option)}
                  className={`h-11 md:h-13 px-6 md:px-10 rounded-xl text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em] transition-all border-2 ${isSelected
                      ? "bg-black text-white border-black shadow-xl"
                      : "bg-[#F9F9F9] text-black/30 border-transparent hover:border-black/10 hover:text-black"
                    }`}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {/* Legacy Fallbacks (Remove if you want purely dynamic) */}
      {variants.length === 0 && (
         <p className="text-[10px] text-gray-400 italic">No specific variations available for this selection.</p>
      )}

      {/* Quantity & Add to Cart */}
      <div className="space-y-4 pt-4 border-t border-black/[0.03]">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex items-center justify-between bg-[#F9F9F9] rounded-xl px-6 h-13 gap-10 border border-black/[0.03] w-full sm:w-auto shadow-sm">
            <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="text-black/20 hover:text-black transition-colors">
              <Minus className="w-5 h-5" />
            </button>
            <span className="font-bold text-lg w-6 text-center heading-font">{quantity}</span>
            <button onClick={() => setQuantity(quantity + 1)} className="text-black/20 hover:text-black transition-colors">
              <Plus className="w-5 h-5" />
            </button>
          </div>
          
          <button 
            onClick={handleAddToCart}
            className="flex-1 bg-black text-white h-13 rounded-xl font-bold uppercase tracking-[0.2em] text-[10px] hover:bg-black/90 active:scale-[0.98] transition-all shadow-2xl shadow-black/20 flex items-center justify-center gap-3"
          >
            <ShoppingBag className="w-4 h-4" />
            Add to Bag
          </button>
        </div>

        <button 
          onClick={handleSecureCheckout}
          className="w-full h-13 border-2 border-black rounded-xl text-black font-bold uppercase tracking-[0.3em] text-[10px] hover:bg-black hover:text-white transition-all active:scale-[0.98]"
        >
          Secure Checkout
        </button>
      </div>
    </div>
  );
}
