import { useState } from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineShoppingCart } from 'react-icons/hi';
import { useCart } from '../../context/CartContext';
import { formatPrice } from '../../utils/helpers';

const ProductCard = ({ product }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const { addToCart } = useCart();

  const primaryImage = product.media?.[0]?.url || '';
  const secondaryImage = product.media?.[1]?.url || '';
  const hasDiscount = product.discountPrice && product.discountPrice < product.price;

  return (
    <div className="group bg-white rounded-lg overflow-hidden border border-transparent hover:border-border hover:shadow-lg transition-all duration-300">
      {/* Image */}
      <Link to={`/product/${product._id}`} className="block relative aspect-[4/5] overflow-hidden bg-light">
        {hasDiscount && (
          <span className="absolute top-3 left-3 bg-secondary text-primary text-xs font-bold px-2 py-1 rounded z-10">
            SALE
          </span>
        )}

        {(!primaryImage || imageError) ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 text-gray-400">
            <svg className="w-12 h-12 mb-2 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-xs">No Image</span>
          </div>
        ) : (
          <>
            {!imageLoaded && (
              <div className="absolute inset-0 bg-gray-100 animate-pulse" />
            )}
            <img
              src={primaryImage}
              alt={product.name}
              className={`w-full h-full object-cover transition-all duration-500 ${
                secondaryImage ? 'group-hover:opacity-0' : 'group-hover:scale-105'
              } ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
              loading="lazy"
            />
            {secondaryImage && (
              <img
                src={secondaryImage}
                alt={`${product.name} - alternate view`}
                className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                loading="lazy"
              />
            )}
          </>
        )}
      </Link>

      {/* Info */}
      <div className="p-4">
        <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">
          {product.category}
        </p>
        <Link to={`/product/${product._id}`}>
          <h3 className="font-heading text-lg font-semibold text-primary hover:text-secondary transition-colors line-clamp-1">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-lg text-primary">
              {formatPrice(hasDiscount ? product.discountPrice : product.price)}
            </span>
            {hasDiscount && (
              <span className="text-sm text-gray-400 line-through">
                {formatPrice(product.price)}
              </span>
            )}
          </div>

          <button
            onClick={() => addToCart(product)}
            disabled={product.stock <= 0}
            className="p-2 bg-primary text-white rounded-md hover:bg-gray-800 transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            title={product.stock <= 0 ? 'Out of stock' : 'Add to cart'}
          >
            <HiOutlineShoppingCart className="w-5 h-5" />
          </button>
        </div>

        {product.stock <= 0 && (
          <p className="text-red-500 text-xs mt-2">Out of Stock</p>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
