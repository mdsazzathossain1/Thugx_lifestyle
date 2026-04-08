import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { HiMinus, HiPlus, HiOutlineShoppingCart, HiArrowRight } from 'react-icons/hi';
import api from '../utils/api';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/helpers';
import ProductGallery from '../components/product/ProductGallery';
import ProductCard from '../components/product/ProductCard';
import LoadingSpinner from '../components/common/LoadingSpinner';

const ProductDetail = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/products/${id}`);
        setProduct(data);

        // Fetch related products
        const { data: relatedData } = await api.get(`/products?category=${data.category}&limit=4`);
        setRelated(relatedData.products.filter((p) => p._id !== id).slice(0, 4));
      } catch (err) {
        console.error('Failed to fetch product:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (!product) return (
    <div className="section-padding text-center">
      <p className="text-gray-500 text-lg">Product not found</p>
      <Link to="/shop" className="btn-primary mt-4 inline-block">Back to Shop</Link>
    </div>
  );

  const hasDiscount = product.discountPrice && product.discountPrice < product.price;
  const currentPrice = hasDiscount ? product.discountPrice : product.price;
  const inStock = product.stock > 0;

  const handleAddToCart = () => {
    addToCart(product, quantity);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    window.location.href = '/checkout';
  };

  return (
    <div className="section-padding">
      <div className="container-custom">
        {/* Breadcrumb */}
        <nav className="mb-8 text-sm text-gray-500">
          <Link to="/" className="hover:text-secondary">Home</Link>
          <span className="mx-2">/</span>
          <Link to="/shop" className="hover:text-secondary">Shop</Link>
          <span className="mx-2">/</span>
          <Link to={`/shop/${product.category}`} className="hover:text-secondary capitalize">
            {product.category}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-primary">{product.name}</span>
        </nav>

        {/* Product */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Gallery */}
          <ProductGallery media={product.media} />

          {/* Info */}
          <div className="animation-fade-in">
            <p className="text-secondary tracking-[0.2em] uppercase text-sm font-medium mb-2">
              {product.category}
            </p>
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-primary mb-4">
              {product.name}
            </h1>

            {/* Price */}
            <div className="flex items-center space-x-3 mb-6">
              <span className="font-bold text-2xl text-primary">
                {formatPrice(currentPrice)}
              </span>
              {hasDiscount && (
                <>
                  <span className="text-lg text-gray-400 line-through">
                    {formatPrice(product.price)}
                  </span>
                  <span className="bg-secondary/20 text-secondary text-sm px-2 py-1 rounded font-medium">
                    {Math.round((1 - product.discountPrice / product.price) * 100)}% OFF
                  </span>
                </>
              )}
            </div>

            {/* Stock */}
            <p className={`text-sm mb-6 ${inStock ? 'text-green-600' : 'text-red-500'}`}>
              {inStock ? `In Stock (${product.stock} available)` : 'Out of Stock'}
            </p>

            {/* Description */}
            <p className="text-gray-600 leading-relaxed mb-8">{product.description}</p>

            {/* Quantity and Actions */}
            {inStock && (
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium text-gray-600">Quantity:</span>
                  <div className="flex items-center border border-border rounded-md">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="p-2 hover:bg-light transition-colors"
                    >
                      <HiMinus className="w-4 h-4" />
                    </button>
                    <span className="px-4 py-2 font-medium min-w-[3rem] text-center">{quantity}</span>
                    <button
                      onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                      className="p-2 hover:bg-light transition-colors"
                    >
                      <HiPlus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button onClick={handleAddToCart} className="btn-secondary flex-1 inline-flex items-center justify-center space-x-2">
                    <HiOutlineShoppingCart className="w-5 h-5" />
                    <span>Add to Cart</span>
                  </button>
                  <button onClick={handleBuyNow} className="btn-primary flex-1 inline-flex items-center justify-center space-x-2">
                    <span>Buy Now</span>
                    <HiArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {/* Specifications */}
            {product.specifications?.length > 0 && (
              <div className="mt-10 border-t border-border pt-8">
                <h3 className="font-heading text-xl font-semibold mb-4">Specifications</h3>
                <table className="w-full">
                  <tbody>
                    {product.specifications.map((spec, index) => (
                      <tr key={index} className="border-b border-border last:border-0">
                        <td className="py-3 text-sm text-gray-500 font-medium w-1/3">{spec.key}</td>
                        <td className="py-3 text-sm text-primary">{spec.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <div className="mt-20">
            <h2 className="heading-md text-center mb-10">You May Also Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {related.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
