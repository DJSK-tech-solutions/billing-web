import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { API } from '../services/api';

function AddProduct() {
    const [products, setProducts] = useState([]);
    const [newProduct, setNewProduct] = useState({ name: '', rate: '' });
    const [editingProduct, setEditingProduct] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [toast, setToast] = useState({ show: false, message: '', type: '' });
    const [showDeleteConfirm, setShowDeleteConfirm] = useState({ show: false, id: null });

    useEffect(() => {
        loadProducts();
    }, []);

    useEffect(() => {
        filterProducts();
    }, [searchQuery, products]);

    const showToast = (message, type = 'error') => {
        setToast({ show: true, message, type });
        setTimeout(() => {
            setToast({ show: false, message: '', type: '' });
        }, 3000);
    };

    const loadProducts = async () => {
        try {
            console.log('Fetching products...');
            const fetchedProducts = await API.getAllProducts();
            console.log('Fetched products:', fetchedProducts);
            setProducts(fetchedProducts || []);
            setFilteredProducts(fetchedProducts || []);
        } catch (error) {
            console.error('Error loading products:', error);
            setProducts([]);
            setFilteredProducts([]);
            showToast('Error loading products');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingProduct) {
                console.log('Updating product:', editingProduct.id, newProduct);
                await API.updateProduct(editingProduct.id, {
                    name: newProduct.name,
                    rate: parseFloat(newProduct.rate)
                });
                setEditingProduct(null);
                showToast('Product updated successfully', 'success');
            } else {
                await API.addProduct({
                    name: newProduct.name,
                    rate: parseFloat(newProduct.rate)
                });
                showToast('Product added successfully', 'success');
            }
            setNewProduct({ name: '', rate: '' });
            loadProducts();
        } catch (error) {
            console.error('Error saving product:', error);
            showToast('Error saving product');
        }
    };

    const handleDeleteClick = (id) => {
        setShowDeleteConfirm({ show: true, id });
        // Auto hide the confirmation after 3 seconds
        setTimeout(() => {
            setShowDeleteConfirm({ show: false, id: null });
        }, 3000);
    };

    const handleDelete = async (id) => {
        if (!id) {
            showToast('Invalid product ID');
            return;
        }

        try {
            await API.deleteProduct(id);
            loadProducts();
            showToast('Product deleted successfully', 'success');
            setShowDeleteConfirm({ show: false, id: null });
        } catch (error) {
            console.error('Error deleting product:', error);
            showToast('Error deleting product');
        }
    };

    const handleEdit = (product) => {
        if (!product || !product.id) {
            showToast('Invalid product data');
            return;
        }

        console.log('Editing product:', product);
        setEditingProduct(product);
        setNewProduct({
            name: product.name || '',
            rate: product.rate || ''
        });
    };

    const filterProducts = () => {
        if (!Array.isArray(products)) return;

        const filtered = products.filter(product => {
            if (!product || typeof product.name !== 'string') return false;
            return product.name.toLowerCase().includes((searchQuery || '').toLowerCase());
        });
        setFilteredProducts(filtered);
    };

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Toast Notification */}
            {toast.show && (
                <div
                    className={`fixed top-4 right-4 px-4 py-2 rounded-lg shadow-lg z-50 ${
                        toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
                    } text-white transition-all duration-500 ease-in-out`}
                >
                    {toast.message}
                </div>
            )}

            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Add Product</h1>
                <Link
                    to="/"
                    className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors duration-200"
                >
                    Back to Home
                </Link>
            </div>

            {/* Add/Edit Product Form */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
                <div className="p-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">
                        {editingProduct ? 'Edit Product' : 'Add New Product'}
                    </h2>
                    <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4">
                        <input
                            type="text"
                            placeholder="Product Name"
                            value={newProduct.name}
                            onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                        <input
                            type="number"
                            placeholder="Rate"
                            value={newProduct.rate}
                            onChange={(e) => setNewProduct({ ...newProduct, rate: e.target.value })}
                            className="w-full md:w-32 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                            step="0.01"
                        />
                        <button
                            type="submit"
                            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors duration-200"
                        >
                            {editingProduct ? 'Update' : 'Add'} Product
                        </button>
                    </form>
                </div>
            </div>

            {/* Search Bar */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
                <div className="p-6">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search products by name..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <svg
                            className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Product List */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="p-6">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Product Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Rate
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {Array.isArray(filteredProducts) && filteredProducts
                                    .filter(product => product && product.id)
                                    .map((product) => (
                                        <tr key={`product-${product.id}`}>
                                            <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                                                {product.name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                                                ₹{product.rate}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <button
                                                    onClick={() => handleEdit(product)}
                                                    className="text-blue-500 hover:text-blue-700 mr-4 transition-colors duration-200"
                                                >
                                                    Edit
                                                </button>
                                                {showDeleteConfirm.show && showDeleteConfirm.id === product.id ? (
                                                    <button
                                                        onClick={() => handleDelete(product.id)}
                                                        className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition-colors duration-200"
                                                    >
                                                        Confirm Delete
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleDeleteClick(product.id)}
                                                        className="text-red-500 hover:text-red-700 transition-colors duration-200"
                                                    >
                                                        Delete
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                {(!Array.isArray(filteredProducts) || filteredProducts.length === 0) && (
                                    <tr key="no-products-found">
                                        <td colSpan="3" className="px-6 py-4 text-center text-gray-500">
                                            No products found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AddProduct;