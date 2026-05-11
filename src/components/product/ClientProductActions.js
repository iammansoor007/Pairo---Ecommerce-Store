"use client";

import { useState } from "react";
import { Plus, Minus, ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function ClientProductActions({ product }) {
  const [selectedSize, setSelectedSize] = useState("Large");
  const [selectedColor, setSelectedColor] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    for(let i = 0; i < quantity; i++) {
      addToCart({
        ...product,
        selectedSize,
        selectedColor: (product.colors || ["#000000"])[selectedColor]
      });
    }
  };

  return (
    <div className="space-y-6 pt-6 border-t border-black/5">
      <div className="space-y-2">
        <p className="text-[9px] font-bold text-black/30 uppercase tracking-[0.1em]">Finish</p>
        <div className="flex gap-3">
          {(product.colors || ["#000000"]).map((color, index) => (
            <button
              key={color}
              onClick={() => setSelectedColor(index)}
              className={`w-7 h-7 md:w-8 md:h-8 rounded-full border transition-all ${selectedColor === index ? 'border-black scale-110 shadow-md' : 'border-transparent'}`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-[9px] font-bold text-black/30 uppercase tracking-[0.1em]">Size</p>
        <div className="flex flex-wrap gap-2">
          {(product.sizes || ["S", "M", "L", "XL"]).map((size) => (
            <button
              key={size}
              onClick={() => setSelectedSize(size)}
              className={`h-10 md:h-12 px-6 md:px-10 rounded-lg text-[9px] md:text-[10px] font-bold uppercase tracking-widest transition-all border ${selectedSize === size
                  ? "bg-black text-white border-black"
                  : "bg-[#F9F9F9] text-black/40 border-transparent hover:border-black hover:text-black"
                }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3 pt-2">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex items-center justify-between bg-[#F9F9F9] rounded-lg px-4 h-12 gap-6 border border-black/5 w-full sm:w-auto">
            <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="text-black/30 hover:text-black transition-colors">
              <Minus className="w-4 h-4" />
            </button>
            <span className="font-bold text-base w-4 text-center heading-font">{quantity}</span>
            <button onClick={() => setQuantity(quantity + 1)} className="text-black/30 hover:text-black transition-colors">
              <Plus className="w-4 h-4" />
            </button>
          </div>
          
          <button 
            onClick={handleAddToCart}
            className="flex-1 bg-black text-white h-12 rounded-lg font-bold uppercase tracking-widest text-[9px] md:text-[10px] hover:bg-black/90 active:scale-[0.98] transition-all shadow-lg shadow-black/10 flex items-center justify-center gap-2"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            Add to Bag
          </button>
        </div>

        <button className="w-full h-12 border-2 border-black rounded-lg text-black font-bold uppercase tracking-[0.2em] text-[9px] md:text-[10px] hover:bg-black hover:text-white transition-all active:scale-[0.98]">
          Express Checkout
        </button>
      </div>
    </div>
  );
}
