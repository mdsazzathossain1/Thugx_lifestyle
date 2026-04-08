import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import api from '../utils/api';
import ProductCard from '../components/product/ProductCard';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Shop = () => {
  const { category } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [categories, setCategories] = useState([]);

  const currentSort = searchParams.get('sort') || 'featured';
  const currentPage = parseInt(searchParams.get('page') || '1');

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (category) params.set('category', category);
        params.set('sort', currentSort);
        params.set('page', currentPage.toString());
        params.set('limit', '20');

        const { data } = await api.get(`/products?${params}`);
        setProducts(data.products);
        setTotalPages(data.totalPages);
      } catch (err) {
        console.error('Failed to fetch products:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [category, currentSort, currentPage]);

  useEffect(() => {
    api.get('/settings').then((r) => {
      setCategories(r.data.categories || []);
    }).catch(() => {
      setCategories([{ slug: 'watches', label: 'Watches' }, { slug: 'sunglasses', label: 'Sunglasses' }]);
    });
  }, []);

  const handleSortChange = (sort) => {
    setSearchParams({ sort, page: '1' });
  };

  const handlePageChange = (page) => {
    setSearchParams({ sort: currentSort, page: page.toString() });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getCategoryTitle = () => {
    if (!category) return 'All Products';
    const found = categories.find((c) => c.slug === category);
    return found ? found.label : category.charAt(0).toUpperCase() + category.slice(1);
  };

  return (
    <div className="section-padding">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-secondary tracking-[0.3em] uppercase text-sm font-medium mb-3">
            Our Collection
          </p>
          <h1 className="heading-lg">{getCategoryTitle()}</h1>
        </div>

        {/* Filters and Sort */}
        <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
          {/* Category tabs */}
          <div className="flex items-center space-x-4">
            <a
              href="/shop"
              className={`text-sm uppercase tracking-wider pb-1 border-b-2 transition-colors ${
                !category ? 'border-secondary text-secondary font-semibold' : 'border-transparent text-gray-500 hover:text-primary'
              }`}
            >
              All
            </a>
            {categories.map((cat) => (
              <a
                key={cat.slug}
                href={`/shop/${cat.slug}`}
                className={`text-sm uppercase tracking-wider pb-1 border-b-2 transition-colors ${
                  category === cat.slug
                    ? 'border-secondary text-secondary font-semibold'
                    : 'border-transparent text-gray-500 hover:text-primary'
                }`}
              >
                {cat.label}
              </a>
            ))}
          </div>

          {/* Sort */}
          <select
            value={currentSort}
            onChange={(e) => handleSortChange(e.target.value)}
            className="input-field !w-auto !py-2 text-sm"
          >
            <option value="featured">Featured</option>
            <option value="newest">Newest</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </div>

        {/* Products Grid */}
        {loading ? (
          <LoadingSpinner />
        ) : products.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center space-x-2 mt-12">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className="px-4 py-2 border border-border rounded-md text-sm disabled:opacity-50 hover:bg-light transition-colors"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`w-10 h-10 rounded-md text-sm transition-colors ${
                      page === currentPage
                        ? 'bg-primary text-white'
                        : 'hover:bg-light'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  className="px-4 py-2 border border-border rounded-md text-sm disabled:opacity-50 hover:bg-light transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">No products found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Shop;
