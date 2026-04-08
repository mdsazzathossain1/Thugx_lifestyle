import { Link } from 'react-router-dom';
import { HiMinus, HiPlus, HiTrash, HiArrowRight, HiOutlineShoppingBag } from 'react-icons/hi';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/helpers';

const Cart = () => {
  const { items, updateQuantity, removeFromCart, subtotal, itemCount } = useCart();

  if (items.length === 0) {
    return (
      <div className="section-padding">
        <div className="container-custom text-center">
          <HiOutlineShoppingBag className="w-20 h-20 text-gray-300 mx-auto mb-6" />
          <h1 className="heading-lg mb-4">Your Cart is Empty</h1>
          <p className="text-gray-500 mb-8">
            Looks like you haven&apos;t added anything to your cart yet.
          </p>
          <Link to="/shop" className="btn-primary inline-flex items-center space-x-2">
            <span>Start Shopping</span>
            <HiArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="section-padding">
      <div className="container-custom">
        <h1 className="heading-lg mb-8">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div
                key={item.productId}
                className="flex items-center gap-4 p-4 bg-white border border-border rounded-lg hover:shadow-sm transition-shadow"
              >
                {/* Image */}
                <Link to={`/product/${item.productId}`} className="flex-shrink-0">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 md:w-24 md:h-24 object-cover rounded-md bg-light"
                    loading="lazy"
                  />
                </Link>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <Link to={`/product/${item.productId}`} className="font-heading font-semibold text-primary hover:text-secondary transition-colors line-clamp-1">
                    {item.name}
                  </Link>
                  <p className="text-sm text-gray-500 mt-1">{formatPrice(item.price)} each</p>

                  {/* Quantity */}
                  <div className="flex items-center mt-2">
                    <div className="flex items-center border border-border rounded-md">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="p-1.5 hover:bg-light transition-colors"
                      >
                        <HiMinus className="w-3 h-3" />
                      </button>
                      <span className="px-3 text-sm font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="p-1.5 hover:bg-light transition-colors"
                      >
                        <HiPlus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Price & Remove */}
                <div className="text-right">
                  <p className="font-bold text-primary">{formatPrice(item.price * item.quantity)}</p>
                  <button
                    onClick={() => removeFromCart(item.productId)}
                    className="text-gray-400 hover:text-red-500 transition-colors mt-2 p-1"
                    title="Remove item"
                  >
                    <HiTrash className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-light border border-border rounded-lg p-6 sticky top-24">
              <h2 className="font-heading text-xl font-semibold mb-6">Order Summary</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Items ({itemCount})</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Shipping</span>
                  <span className="text-green-600">Calculated at checkout</span>
                </div>
                <div className="border-t border-border pt-3">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                </div>
              </div>

              <Link
                to="/checkout"
                className="btn-primary w-full inline-flex items-center justify-center space-x-2"
              >
                <span>Proceed to Checkout</span>
                <HiArrowRight className="w-5 h-5" />
              </Link>

              <Link
                to="/shop"
                className="block text-center text-sm text-gray-500 hover:text-secondary mt-4 transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
