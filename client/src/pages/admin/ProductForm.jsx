import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { HiPlus, HiTrash, HiUpload } from 'react-icons/hi';
import api, { adminApi } from '../../utils/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);
  const [media, setMedia] = useState([]);
  const [specs, setSpecs] = useState([{ key: '', value: '' }]);
  const [uploading, setUploading] = useState(false);
  const [categories, setCategories] = useState([]);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  // Load categories from settings
  useEffect(() => {
    api.get('/api/settings').then((r) => {
      setCategories(r.data.categories || []);
    }).catch(() => {
      // fallback to defaults if API fails
      setCategories([{ slug: 'watches', label: 'Watches' }, { slug: 'sunglasses', label: 'Sunglasses' }]);
    });
  }, []);

  useEffect(() => {
    if (isEditing) {
      const fetchProduct = async () => {
        try {
          const { data } = await adminApi.get(`/api/admin/products?search=`);
          const product = data.products.find((p) => p._id === id);
          if (product) {
            reset({
              name: product.name,
              category: product.category,
              description: product.description,
              price: product.price,
              discountPrice: product.discountPrice || '',
              stock: product.stock,
              isActive: product.isActive,
              featured: product.featured,
            });
            setMedia(product.media || []);
            setSpecs(product.specifications?.length > 0 ? product.specifications : [{ key: '', value: '' }]);
          }
        } catch (err) {
          toast.error('Failed to load product');
        } finally {
          setLoading(false);
        }
      };
      fetchProduct();
    }
  }, [id, isEditing, reset]);

  const handleMediaUpload = async (e) => {
    const files = e.target.files;
    if (!files?.length) return;

    setUploading(true);
    try {
      const formData = new FormData();
      Array.from(files).forEach((file) => formData.append('media', file));

      const { data } = await adminApi.post('/api/admin/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setMedia((prev) => [...prev, ...data.media]);
      toast.success('Media uploaded');
    } catch (err) {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const removeMedia = (index) => {
    setMedia((prev) => prev.filter((_, i) => i !== index));
  };

  const addSpec = () => {
    setSpecs((prev) => [...prev, { key: '', value: '' }]);
  };

  const removeSpec = (index) => {
    setSpecs((prev) => prev.filter((_, i) => i !== index));
  };

  const updateSpec = (index, field, value) => {
    setSpecs((prev) => prev.map((spec, i) => (i === index ? { ...spec, [field]: value } : spec)));
  };

  const onSubmit = async (formData) => {
    setSubmitting(true);
    try {
      const productData = {
        name: formData.name,
        category: formData.category,
        description: formData.description,
        price: parseFloat(formData.price),
        discountPrice: formData.discountPrice ? parseFloat(formData.discountPrice) : null,
        stock: parseInt(formData.stock) || 0,
        isActive: formData.isActive,
        featured: formData.featured,
        media,
        specifications: specs.filter((s) => s.key && s.value),
      };

      if (isEditing) {
        await adminApi.put(`/api/admin/products/${id}`, productData);
        toast.success('Product updated');
      } else {
        await adminApi.post('/api/admin/products', productData);
        toast.success('Product created');
      }

      navigate('/admin/products');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save product');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h1 className="font-heading text-3xl font-bold text-primary mb-8">
        {isEditing ? 'Edit Product' : 'Add New Product'}
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl space-y-8">
        {/* Basic Info */}
        <div className="bg-white border border-border rounded-lg p-6">
          <h2 className="font-heading text-lg font-semibold mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-600 mb-1">Product Name *</label>
              <input
                {...register('name', { required: 'Name is required' })}
                className="input-field"
                placeholder="e.g., Chronograph Elite"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Category *</label>
              <select {...register('category', { required: 'Category is required' })} className="input-field">
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat.slug} value={cat.slug}>{cat.label}</option>
                ))}
              </select>
              {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Stock Quantity</label>
              <input
                {...register('stock')}
                type="number"
                min="0"
                className="input-field"
                placeholder="0"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-600 mb-1">Description *</label>
              <textarea
                {...register('description', { required: 'Description is required' })}
                rows={4}
                className="input-field"
                placeholder="Product description..."
              />
              {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-white border border-border rounded-lg p-6">
          <h2 className="font-heading text-lg font-semibold mb-4">Pricing</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Price (৳ BDT) *</label>
              <input
                {...register('price', { required: 'Price is required' })}
                type="number"
                min="0"
                step="1"
                className="input-field"
                placeholder="0"
              />
              {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Discount Price (৳ BDT)</label>
              <input
                {...register('discountPrice')}
                type="number"
                min="0"
                step="1"
                className="input-field"
                placeholder="Leave empty for no discount"
              />
            </div>
          </div>
        </div>

        {/* Media */}
        <div className="bg-white border border-border rounded-lg p-6">
          <h2 className="font-heading text-lg font-semibold mb-4">
            Media ({media.length}/8)
          </h2>

          {/* Upload Area */}
          <label className="block border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-secondary transition-colors mb-4">
            <input
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp,video/mp4,video/webm"
              onChange={handleMediaUpload}
              className="hidden"
              disabled={uploading || media.length >= 8}
            />
            <HiUpload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">
              {uploading ? 'Uploading...' : 'Click to upload images or videos'}
            </p>
            <p className="text-xs text-gray-400 mt-1">JPEG, PNG, WebP, MP4, WebM (max 20MB)</p>
          </label>

          {/* Media Preview */}
          {media.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {media.map((item, index) => (
                <div key={index} className="relative group rounded-lg overflow-hidden border border-border">
                  {item.type === 'video' ? (
                    <div className="aspect-square bg-gray-100 flex items-center justify-center">
                      <span className="text-sm text-gray-500">Video</span>
                    </div>
                  ) : (
                    <img
                      src={item.url}
                      alt={`Media ${index}`}
                      className="aspect-square w-full object-cover"
                      onError={(e) => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }}
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => removeMedia(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <HiTrash className="w-3 h-3" />
                  </button>
                  {index === 0 && (
                    <span className="absolute bottom-1 left-1 bg-secondary text-primary text-xs px-1.5 py-0.5 rounded font-medium">
                      Primary
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Specifications */}
        <div className="bg-white border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading text-lg font-semibold">Specifications</h2>
            <button
              type="button"
              onClick={addSpec}
              className="text-secondary text-sm font-medium flex items-center space-x-1 hover:underline"
            >
              <HiPlus className="w-4 h-4" />
              <span>Add Row</span>
            </button>
          </div>
          <div className="space-y-3">
            {specs.map((spec, index) => (
              <div key={index} className="flex items-center gap-3">
                <input
                  value={spec.key}
                  onChange={(e) => updateSpec(index, 'key', e.target.value)}
                  placeholder="e.g., Material"
                  className="input-field flex-1"
                />
                <input
                  value={spec.value}
                  onChange={(e) => updateSpec(index, 'value', e.target.value)}
                  placeholder="e.g., Stainless Steel"
                  className="input-field flex-1"
                />
                {specs.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeSpec(index)}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <HiTrash className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Toggles */}
        <div className="bg-white border border-border rounded-lg p-6">
          <h2 className="font-heading text-lg font-semibold mb-4">Visibility</h2>
          <div className="flex flex-wrap gap-6">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input {...register('isActive')} type="checkbox" className="w-4 h-4 accent-secondary" />
              <span className="text-sm font-medium">Active (visible on store)</span>
            </label>
            <label className="flex items-center space-x-3 cursor-pointer">
              <input {...register('featured')} type="checkbox" className="w-4 h-4 accent-secondary" />
              <span className="text-sm font-medium">Featured (shown on homepage)</span>
            </label>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center gap-4">
          <button type="submit" disabled={submitting} className="btn-primary">
            {submitting ? 'Saving...' : isEditing ? 'Update Product' : 'Create Product'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/products')}
            className="btn-secondary"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
