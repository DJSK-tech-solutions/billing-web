import { logoBase64 } from '../utils/logoBase64';

const isElectron = window && window.electronAPI;
const BASE_URL = process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : '';

export const API = {
    // Product operations
    getAllProducts: async () => {
        if (isElectron) {
            return window.electronAPI.getAllProducts();
        }
        try {
            console.log('Fetching products from:', `${BASE_URL}/api/products`);
            const response = await fetch(`${BASE_URL}/api/products`);
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || 'Failed to fetch products');
            }
            return response.json();
        } catch (error) {
            console.error('Error fetching products:', error);
            throw error;
        }
    },

    addProduct: async (product) => {
        if (isElectron) {
            return window.electronAPI.addProduct(product);
        }
        try {
            const response = await fetch(`${BASE_URL}/api/products`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(product)
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || 'Failed to add product');
            }
            return response.json();
        } catch (error) {
            console.error('Error adding product:', error);
            throw error;
        }
    },

    updateProduct: async (id, data) => {
        if (isElectron) {
            return window.electronAPI.updateProduct(id, data);
        }
        try {
            const response = await fetch(`${BASE_URL}/api/products/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(data)
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || 'Failed to update product');
            }
            return response.json();
        } catch (error) {
            console.error('Error updating product:', error);
            throw error;
        }
    },

    deleteProduct: async (id) => {
        if (isElectron) {
            return window.electronAPI.deleteProduct(id);
        }
        try {
            const response = await fetch(`${BASE_URL}/api/products/${id}`, {
                method: 'DELETE'
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || 'Failed to delete product');
            }
            return response.json();
        } catch (error) {
            console.error('Error deleting product:', error);
            throw error;
        }
    },

    // Customer operations
    getAllCustomers: async () => {
        if (isElectron) {
            return window.electronAPI.getAllCustomers();
        }
        try {
            const response = await fetch(`${BASE_URL}/api/customers`);
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || 'Failed to fetch customers');
            }
            return response.json();
        } catch (error) {
            console.error('Error fetching customers:', error);
            throw error;
        }
    },

    addCustomer: async (customer) => {
        if (isElectron) {
            return window.electronAPI.addCustomer(customer);
        }
        try {
            const response = await fetch(`${BASE_URL}/api/customers`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(customer)
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || 'Failed to add customer');
            }
            return response.json();
        } catch (error) {
            console.error('Error adding customer:', error);
            throw error;
        }
    },

    updateCustomer: async (id, data) => {
        if (isElectron) {
            return window.electronAPI.updateCustomer(id, data);
        }
        try {
            const response = await fetch(`${BASE_URL}/api/customers/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(data)
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || 'Failed to update customer');
            }
            return response.json();
        } catch (error) {
            console.error('Error updating customer:', error);
            throw error;
        }
    },

    deleteCustomer: async (id) => {
        if (isElectron) {
            return window.electronAPI.deleteCustomer(id);
        }
        try {
            const response = await fetch(`${BASE_URL}/api/customers/${id}`, {
                method: 'DELETE'
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || 'Failed to delete customer');
            }
            return response.json();
        } catch (error) {
            console.error('Error deleting customer:', error);
            throw error;
        }
    },

    // Invoice operations
    getAllInvoices: async () => {
        if (isElectron) {
            return window.electronAPI.getAllInvoices();
        }
        try {
            const response = await fetch(`${BASE_URL}/api/invoices`);
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || 'Failed to fetch invoices');
            }
            return response.json();
        } catch (error) {
            console.error('Error fetching invoices:', error);
            throw error;
        }
    },

    createInvoice: async (invoiceData) => {
        if (isElectron) {
            return window.electronAPI.createInvoice(invoiceData);
        }
        try {
            const response = await fetch(`${BASE_URL}/api/invoices`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(invoiceData)
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || 'Failed to create invoice');
            }
            return response.json();
        } catch (error) {
            console.error('Error creating invoice:', error);
            throw error;
        }
    },

    printInvoice: (invoiceData) => {
        if (isElectron) {
            return window.electronAPI.printInvoice(invoiceData);
        }

        const printWindow = window.open('', '_blank');
        const content = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Invoice</title>
                <style>
                    @page { size: 80mm auto; margin: 0; }
                    body { 
                        font-family: Arial;
                        width: 80mm;
                        padding: 5mm;
                        font-size: 12px;
                    }
                    .header { text-align: center; margin-bottom: 10px; }
                    .logo { max-width: 50px; margin-bottom: 5px; }
                    table { width: 100%; border-collapse: collapse; }
                    th, td { text-align: center; padding: 2px; font-size: 12px; }
                    .total { text-align: right; margin-right: 15px; margin-top: 10px; }
                    .footer { text-align: center; margin-top: 10px; font-size: 10px; }
                </style>
            </head>
            <body onload="window.print()">
                <div class="header">
                    <img src="data:image/jpeg;base64,${logoBase64}" class="logo" alt="Logo">
                    <div>Your Shop Name</div>
                    <div>123, Shop Street, City - 123456</div>
                    <div>Phone: +91 1234567890</div>
                    <div>Invoice #${invoiceData.invoiceNumber}</div>
                    <div>Date: ${new Date(invoiceData.date).toLocaleDateString()}</div>
                </div>
                <div>
                    <div>Customer: ${invoiceData.customerDetails.name}</div>
                    <div>Mobile: ${invoiceData.customerDetails.mobile}</div>
                    <div>Address: ${invoiceData.customerDetails.address}</div>
                </div>
                <table>
                    <tr>
                        <th>Item</th>
                        <th>Qty</th>
                        <th>Rate</th>
                        <th>Amt</th>
                    </tr>
                    ${invoiceData.items.map(item => `
                        <tr>
                            <td>${item.name}</td>
                            <td>${item.quantity}</td>
                            <td>₹${item.rate}</td>
                            <td>₹${item.total}</td>
                        </tr>
                    `).join('')}
                </table>
                <div class="total">Total: ₹${invoiceData.total}</div>
                <div class="terms-conditions">
                    <div>Terms & Conditions:</div>
                    <ol>
                        <li>Goods once sold cannot be returned</li>
                        <li>All disputes are subject to local jurisdiction</li>
                    </ol>
                </div>
                <div class="footer">
                    Thank you for your business!<br>
                    Visit Again
                </div>
            </body>
            </html>
        `;
        printWindow.document.write(content);
        printWindow.document.close();
        return Promise.resolve({ success: true });
    },

    // Analytics operations
    getAnalytics: async () => {
        if (isElectron) {
            return window.electronAPI.getAnalytics();
        }
        try {
            const response = await fetch(`${BASE_URL}/api/analytics`);
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || 'Failed to fetch analytics');
            }
            return response.json();
        } catch (error) {
            console.error('Error fetching analytics:', error);
            throw error;
        }
    }
};