import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HiArrowRight } from 'react-icons/hi';
import api from '../utils/api';
import ProductCard from '../components/product/ProductCard';
import LoadingSpinner from '../components/common/LoadingSpinner';

const CATEGORY_IMAGES = {
  watches: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800',
  sunglasses: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800',
  bags: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800',
  shoes: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',
  clothing: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800',
  accessories: 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=800',
};
const DEFAULT_CATEGORY_IMAGE = 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800';

const Home = () => {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    api.get('/settings').then((r) => {
      setCategories(r.data.categories || []);
    }).catch(() => {
      setCategories([{ slug: 'watches', label: 'Watches' }, { slug: 'sunglasses', label: 'Sunglasses' }]);
    });
  }, []);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const { data } = await api.get('/products/featured');
        setFeatured(data);
      } catch (err) {
        console.error('Failed to fetch featured products:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-primary text-white min-h-[80vh] flex items-center">
        <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/95 to-primary/70" />
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=1920)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="container-custom relative z-10">
          <div className="max-w-2xl animation-slide-up">
            <p className="text-secondary tracking-[0.3em] uppercase text-sm font-medium mb-4">
              Premium Collection
            </p>
            <h1 className="heading-xl text-white leading-tight mb-6">
              Elevate Your{' '}
              <span className="text-secondary">Style</span>
            </h1>
            <p className="text-gray-300 text-lg leading-relaxed mb-8 max-w-lg">
              Discover our curated collection of luxury watches and designer
              sunglasses. Crafted for those who demand excellence in every detail.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/shop" className="btn-gold inline-flex items-center justify-center space-x-2">
                <span>Shop Now</span>
                <HiArrowRight className="w-5 h-5" />
              </Link>
              {categories[0] && (
                <Link to={`/shop/${categories[0].slug}`} className="btn-secondary !border-white !text-white hover:!bg-white hover:!text-primary inline-flex items-center justify-center">
                  View {categories[0].label}
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <p className="text-secondary tracking-[0.3em] uppercase text-sm font-medium mb-3">
              Collections
            </p>
            <h2 className="heading-lg">Shop by Category</h2>
          </div>

          <div className={`grid grid-cols-1 ${categories.length === 1 ? '' : categories.length > 2 ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-8`}>
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                to={`/shop/${cat.slug}`}
                className="group relative h-80 md:h-96 rounded-lg overflow-hidden"
              >
                <img
                  src={CATEGORY_IMAGES[cat.slug] || DEFAULT_CATEGORY_IMAGE}
                  alt={`${cat.label} Collection`}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-8 left-8">
                  <h3 className="font-heading text-3xl font-bold text-white mb-2">{cat.label}</h3>
                  <span className="text-secondary text-sm tracking-wide uppercase flex items-center space-x-2">
                    <span>Explore Collection</span>
                    <HiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="section-padding bg-light">
        <div className="container-custom">
          <div className="text-center mb-12">
            <p className="text-secondary tracking-[0.3em] uppercase text-sm font-medium mb-3">
              Handpicked
            </p>
            <h2 className="heading-lg">Featured Products</h2>
          </div>

          {loading ? (
            <LoadingSpinner />
          ) : featured.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featured.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500">No featured products yet.</p>
          )}

          <div className="text-center mt-10">
            <Link to="/shop" className="btn-primary inline-flex items-center space-x-2">
              <span>View All Products</span>
              <HiArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Brand Story */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-secondary tracking-[0.3em] uppercase text-sm font-medium mb-3">
                Our Story
              </p>
              <h2 className="heading-lg mb-6">
                Redefining Luxury,{' '}
                <span className="text-secondary">Your Way</span>
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                At Thugx Lifestyle, we believe luxury should be accessible to
                those who appreciate fine craftsmanship. Every watch and pair of
                sunglasses in our collection is carefully selected to meet the
                highest standards of quality and design.
              </p>
              <p className="text-gray-600 leading-relaxed mb-6">
                Our mission is simple: to provide premium accessories that elevate
                your everyday style. From classic timepieces to modern shades,
                each piece tells a story of elegance and confidence.
              </p>
              <Link to="/shop" className="btn-secondary inline-flex items-center space-x-2">
                <span>Discover More</span>
                <HiArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1612817159949-195b6eb9e31a?w=800"
                alt="Premium accessories"
                className="rounded-lg shadow-2xl"
                loading="lazy"
              />
              <div className="absolute -bottom-6 -left-6 bg-secondary text-primary p-6 rounded-lg hidden md:block">
                <p className="font-heading text-3xl font-bold">100%</p>
                <p className="text-sm font-medium">Authentic Products</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-primary text-white py-16">
        <div className="container-custom text-center">
          <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
            Ready to Elevate Your Style?
          </h2>
          <p className="text-gray-400 max-w-lg mx-auto mb-8">
            Browse our complete collection and find the perfect accessory that speaks to your personality.
          </p>
          <Link to="/shop" className="btn-gold inline-flex items-center space-x-2">
            <span>Shop the Collection</span>
            <HiArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
