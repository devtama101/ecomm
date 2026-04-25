"use client";

import { useState } from "react";
import Link from "next/link";

interface Variant {
  id: string;
  size: string;
  color: string;
  stock: number;
}

interface ProductImage {
  id: string;
  url: string;
  order: number;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string | null;
  images: ProductImage[];
  variants: Variant[];
}

export default function ProductDetailClient({ product }: { product: Product }) {
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState(product.images[0]?.url || product.imageUrl);

  // Group variants by color and size
  const colors = Array.from(new Set(product.variants.map(v => v.color)));
  const sizes = Array.from(new Set(product.variants.map(v => v.size)));

  // Find selected variant
  const selectedVariant = product.variants.find(
    v => v.size === selectedSize && v.color === selectedColor
  );

  const isOutOfStock = selectedVariant ? selectedVariant.stock === 0 : false;

  return (
    <div className="grid lg:grid-cols-2 gap-16">
      {/* Left: Gallery */}
      <div className="space-y-6">
        <div className="aspect-[4/5] bg-stone-100 rounded-3xl overflow-hidden border border-stone-200">
          {activeImage ? (
            <img 
              src={activeImage} 
              alt={product.name} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-stone-300">
              No Image
            </div>
          )}
        </div>
        
        {product.images.length > 1 && (
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {product.images.sort((a, b) => a.order - b.order).map((img) => (
              <button
                key={img.id}
                onClick={() => setActiveImage(img.url)}
                className={`flex-shrink-0 w-24 aspect-[4/5] rounded-xl overflow-hidden border-2 transition-all ${
                  activeImage === img.url ? "border-stone-900 shadow-md" : "border-transparent opacity-70 hover:opacity-100"
                }`}
              >
                <img src={img.url} className="w-full h-full object-cover" alt="" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Right: Info */}
      <div className="flex flex-col py-4">
        <nav className="mb-8 text-sm text-stone-400 font-medium">
          <Link href="/" className="hover:text-stone-900 transition-colors">Store</Link>
          <span className="mx-2">/</span>
          <span className="text-stone-900">{product.name}</span>
        </nav>

        <h1 className="text-4xl font-black text-stone-900 tracking-tight mb-4">{product.name}</h1>
        <p className="text-3xl font-bold text-stone-900 mb-8">Rp {product.price.toLocaleString()}</p>
        
        <div className="prose prose-stone mb-12">
          <p className="text-stone-500 leading-relaxed text-lg">{product.description}</p>
        </div>

        {/* Color Selection */}
        {colors.length > 0 && (
          <div className="mb-8">
            <h3 className="text-sm font-bold uppercase tracking-wider text-stone-400 mb-4">Color</h3>
            <div className="flex flex-wrap gap-3">
              {colors.map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`px-6 py-3 rounded-full text-sm font-bold border-2 transition-all ${
                    selectedColor === color 
                      ? "bg-stone-900 border-stone-900 text-[#fdfbf7] shadow-lg scale-105" 
                      : "bg-white border-stone-100 text-stone-600 hover:border-stone-300"
                  }`}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Size Selection */}
        {sizes.length > 0 && (
          <div className="mb-12">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-stone-400">Size</h3>
              <button className="text-xs font-bold text-stone-400 underline hover:text-stone-900 transition-colors uppercase tracking-widest">Size Guide</button>
            </div>
            <div className="flex flex-wrap gap-3">
              {sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`w-14 h-14 rounded-xl flex items-center justify-center text-sm font-black border-2 transition-all ${
                    selectedSize === size 
                      ? "bg-stone-900 border-stone-900 text-[#fdfbf7] shadow-lg" 
                      : "bg-white border-stone-100 text-stone-600 hover:border-stone-300"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-auto space-y-4">
          {selectedVariant && (
            <p className={`text-sm font-bold ${selectedVariant.stock < 5 ? "text-orange-600" : "text-stone-400"}`}>
              {selectedVariant.stock === 0 
                ? "Out of stock" 
                : selectedVariant.stock < 5 
                  ? `Only ${selectedVariant.stock} left in stock!` 
                  : `In Stock (${selectedVariant.stock} units)`}
            </p>
          )}

          <button 
            disabled={!selectedSize || !selectedColor || isOutOfStock}
            className={`w-full py-5 rounded-full text-lg font-black transition-all shadow-xl ${
              !selectedSize || !selectedColor || isOutOfStock
                ? "bg-stone-100 text-stone-400 cursor-not-allowed"
                : "bg-stone-900 text-[#fdfbf7] hover:bg-stone-800 hover:-translate-y-1 active:translate-y-0"
            }`}
          >
            {!selectedSize || !selectedColor 
              ? "Select Size & Color" 
              : isOutOfStock 
                ? "Out of Stock" 
                : "Add to Cart"}
          </button>
          
          <p className="text-center text-xs text-stone-400 font-medium pt-4">
            Free shipping on orders over Rp 2.000.000
          </p>
        </div>
      </div>
    </div>
  );
}
