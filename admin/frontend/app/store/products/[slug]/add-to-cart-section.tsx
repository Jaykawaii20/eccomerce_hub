'use client';

import { useState } from 'react';
import { ShoppingCart, Check, Minus, Plus } from 'lucide-react';
import { useCart } from '../../context/cart-context';
import { useCustomerAuth } from '../../context/customer-auth-context';
import { useAuthModal } from '../../context/auth-modal-context';
import { useRouter } from 'next/navigation';

interface Variant {
  id: string;
  sku: string;
  price: number;
  salePrice?: number | null;
  stockQuantity: number;
  imageUrl?: string | null;
  attributes: { value: string; attribute: { name: string } }[];
}

interface AddToCartProps {
  product: {
    id: string;
    slug: string;
    name: string;
    price: number;
    salePrice?: number | null;
    featuredImageUrl?: string | null;
    stockQuantity: number;
    manageStock: boolean;
    allowBackorders: boolean;
    variants: Variant[];
  };
}

export function AddToCartSection({ product }: AddToCartProps) {
  const { addItem } = useCart();
  const { customer } = useCustomerAuth();
  const { openAuthModal } = useAuthModal();
  const router = useRouter();

  const [quantity, setQuantity] = useState(1);
  const [selectedVariantId, setSelectedVariantId] = useState<string | undefined>(
    product.variants.length === 1 ? product.variants[0].id : undefined
  );
  const [added, setAdded] = useState(false);

  const selectedVariant = product.variants.find((v) => v.id === selectedVariantId);
  const effectivePrice = selectedVariant
    ? (selectedVariant.salePrice ?? selectedVariant.price)
    : (product.salePrice ?? product.price);
  const originalPrice = selectedVariant ? selectedVariant.price : product.price;
  const maxQty = product.manageStock
    ? (selectedVariant ? selectedVariant.stockQuantity : product.stockQuantity)
    : 99;
  const inStock = !product.manageStock || maxQty > 0 || product.allowBackorders;

  // Group variants by attribute name
  const attributeGroups: Record<string, Set<string>> = {};
  for (const variant of product.variants) {
    for (const attr of variant.attributes) {
      if (!attributeGroups[attr.attribute.name]) {
        attributeGroups[attr.attribute.name] = new Set();
      }
      attributeGroups[attr.attribute.name].add(attr.value);
    }
  }

  function doAddToCart() {
    addItem({
      productId: product.id,
      variantId: selectedVariantId,
      slug: product.slug,
      name: product.name,
      price: effectivePrice,
      originalPrice,
      image: product.featuredImageUrl ?? undefined,
      quantity,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  function handleAddToCart() {
    if (!inStock) return;
    if (!customer) {
      openAuthModal({ tab: 'login', onSuccess: doAddToCart });
      return;
    }
    doAddToCart();
  }

  function handleBuyNow(e: React.MouseEvent) {
    e.preventDefault();
    if (!inStock) return;
    if (!customer) {
      openAuthModal({
        tab: 'login',
        onSuccess: () => {
          doAddToCart();
          router.push('/store/cart');
        },
      });
      return;
    }
    doAddToCart();
    router.push('/store/cart');
  }

  return (
    <div className="mt-6 space-y-4">
      {/* Variant selector */}
      {product.variants.length > 1 && (
        <div className="space-y-3">
          {Object.entries(attributeGroups).map(([attrName, values]) => (
            <div key={attrName}>
              <p className="text-sm font-semibold text-gray-700 mb-2">{attrName}</p>
              <div className="flex flex-wrap gap-2">
                {Array.from(values).map((val) => {
                  const matchingVariant = product.variants.find((v) =>
                    v.attributes.some((a) => a.attribute.name === attrName && a.value === val)
                  );
                  const isSelected = selectedVariantId === matchingVariant?.id;
                  const isAvailable = !product.manageStock || (matchingVariant?.stockQuantity ?? 0) > 0;

                  return (
                    <button
                      key={val}
                      onClick={() => setSelectedVariantId(matchingVariant?.id)}
                      disabled={!isAvailable}
                      className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                        isSelected
                          ? 'border-orange-500 bg-orange-50 text-orange-600'
                          : isAvailable
                          ? 'border-gray-200 text-gray-700 hover:border-orange-300'
                          : 'border-gray-100 text-gray-300 cursor-not-allowed line-through'
                      }`}
                    >
                      {val}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quantity + Add to Cart */}
      <div className="flex items-center gap-3">
        <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
          <button
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="p-2.5 text-gray-500 hover:bg-gray-50 transition-colors"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-10 text-center text-sm font-semibold text-gray-900">{quantity}</span>
          <button
            onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
            disabled={product.manageStock && quantity >= maxQty}
            className="p-2.5 text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition-colors"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        <button
          onClick={handleAddToCart}
          disabled={!inStock || (product.variants.length > 1 && !selectedVariantId)}
          className={`flex-1 py-3 rounded-xl text-white text-sm font-bold transition-all flex items-center justify-center gap-2 ${
            added
              ? 'bg-green-500'
              : !inStock
              ? 'bg-gray-200 cursor-not-allowed text-gray-400'
              : 'bg-orange-500 hover:bg-orange-600 active:scale-95'
          }`}
        >
          {added ? (
            <><Check className="h-5 w-5" /> Added to Cart!</>
          ) : (
            <><ShoppingCart className="h-5 w-5" /> Add to Cart</>
          )}
        </button>
      </div>

      {/* Buy now */}
      {inStock && (
        <button
          onClick={handleBuyNow}
          disabled={product.variants.length > 1 && !selectedVariantId}
          className="block w-full py-3 rounded-xl border-2 border-orange-500 text-orange-500 hover:bg-orange-50 text-sm font-bold text-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Buy Now
        </button>
      )}

      {product.variants.length > 1 && !selectedVariantId && (
        <p className="text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
          Please select a variant before adding to cart.
        </p>
      )}
    </div>
  );
}
