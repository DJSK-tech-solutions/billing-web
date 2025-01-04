const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');
const fs = require('fs');
const htmlPdf = require('html-pdf');
const { print } = require('pdf-to-printer');
const { Product, Customer, Invoice, setupDatabase } = require('./server/database');

const handlePrint = async (html) => {
    const options = {
        width: '80mm',
        height: 'auto',
        margin: {
            top: '5mm',
            right: '5mm',
            bottom: '5mm',
            left: '5mm'
        }
    };

    return new Promise((resolve, reject) => {
        htmlPdf.create(html, options).toFile('./temp-invoice.pdf', (err, result) => {
            if (err) return reject(err);
            print(result.filename)
                .then(() => {
                    fs.unlink(result.filename, () => {});
                    resolve({ success: true });
                })
                .catch(reject);
        });
    });
};

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        }
    });

    mainWindow.loadURL(
        isDev
            ? 'http://localhost:3000'
            : `file://${path.join(__dirname, '../build/index.html')}`
    );

    if (isDev) {
        mainWindow.webContents.openDevTools();
    }
}

app.whenReady().then(async () => {
    try {
        await setupDatabase();
        createWindow();
    } catch (error) {
        console.error('Failed to start application:', error);
        app.quit();
    }
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

// Product IPC Handlers
ipcMain.handle('product:getAll', async () => {
    try {
        const products = await Product.findAll({
            order: [['name', 'ASC']]
        });
        return products;
    } catch (error) {
        console.error('Error fetching products:', error);
        throw error;
    }
});

ipcMain.handle('product:add', async (_, productData) => {
    try {
        const product = await Product.create(productData);
        return product;
    } catch (error) {
        console.error('Error adding product:', error);
        throw error;
    }
});

ipcMain.handle('product:update', async (_, { id, data }) => {
    try {
        if (!id) throw new Error('Product ID is required');
        await Product.update(id, data);
        return await Product.findOne(id);
    } catch (error) {
        console.error('Error updating product:', error);
        throw error;
    }
});

ipcMain.handle('product:delete', async (_, id) => {
    try {
        if (!id) throw new Error('Product ID is required');
        return await Product.destroy(id);
    } catch (error) {
        console.error('Error deleting product:', error);
        throw error;
    }
});

// Customer IPC Handlers
ipcMain.handle('customer:getAll', async () => {
    try {
        const customers = await Customer.findAll({
            order: [['name', 'ASC']]
        });
        return customers;
    } catch (error) {
        console.error('Error fetching customers:', error);
        throw error;
    }
});

ipcMain.handle('customer:add', async (_, customerData) => {
    try {
        const customer = await Customer.create(customerData);
        return customer;
    } catch (error) {
        console.error('Error adding customer:', error);
        throw error;
    }
});

ipcMain.handle('customer:update', async (_, { id, data }) => {
    try {
        if (!id) throw new Error('Customer ID is required');
        await Customer.update(id, data);
        return await Customer.findOne(id);
    } catch (error) {
        console.error('Error updating customer:', error);
        throw error;
    }
});

ipcMain.handle('customer:delete', async (_, id) => {
    try {
        if (!id) throw new Error('Customer ID is required');
        return await Customer.destroy(id);
    } catch (error) {
        console.error('Error deleting customer:', error);
        throw error;
    }
});

// Invoice IPC Handlers
ipcMain.handle('invoice:getAll', async () => {
    try {
        return await Invoice.findAll();
    } catch (error) {
        console.error('Error fetching invoices:', error);
        throw error;
    }
});

ipcMain.handle('invoice:create', async (_, invoiceData) => {
    try {
        const result = await Invoice.create(invoiceData);
        return result;
    } catch (error) {
        console.error('Error creating invoice:', error);
        throw error;
    }
});

ipcMain.handle('analytics:get', async () => {
    try {
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();

        // Get all invoices for analysis
        const invoices = await Invoice.findAll();
        
        // Calculate date ranges
        const startOfCurrentMonth = new Date(currentYear, currentMonth, 1);
        const startOfLastMonth = new Date(currentYear, currentMonth - 1, 1);
        const startOfCurrentYear = new Date(currentYear, 0, 1);
        const startOfLastYear = new Date(currentYear - 1, 0, 1);

        // Calculate metrics
        const currentMonthRevenue = invoices
            .filter(inv => new Date(inv.date) >= startOfCurrentMonth)
            .reduce((sum, inv) => sum + parseFloat(inv.total), 0);

        const lastMonthRevenue = invoices
            .filter(inv => {
                const date = new Date(inv.date);
                return date >= startOfLastMonth && date < startOfCurrentMonth;
            })
            .reduce((sum, inv) => sum + parseFloat(inv.total), 0);

        const currentYearRevenue = invoices
            .filter(inv => new Date(inv.date) >= startOfCurrentYear)
            .reduce((sum, inv) => sum + parseFloat(inv.total), 0);

        const lastYearRevenue = invoices
            .filter(inv => {
                const date = new Date(inv.date);
                return date >= startOfLastYear && date < startOfCurrentYear;
            })
            .reduce((sum, inv) => sum + parseFloat(inv.total), 0);

        // Get customer metrics
        const customers = await Customer.findAll();
        const totalCustomers = customers.length;
        const newCustomersThisMonth = customers
            .filter(cust => new Date(cust.createdAt) >= startOfCurrentMonth)
            .length;

        // Get product metrics
        const products = await Product.findAll();
        const totalProducts = products.length;

        // Calculate monthly revenue for chart
        const monthlyRevenue = Array.from({ length: 12 }, (_, i) => {
            const month = new Date(currentYear, currentMonth - i, 1);
            const monthRevenue = invoices
                .filter(inv => {
                    const invDate = new Date(inv.date);
                    return invDate.getMonth() === month.getMonth() &&
                           invDate.getFullYear() === month.getFullYear();
                })
                .reduce((sum, inv) => sum + parseFloat(inv.total), 0);

            return {
                month: month.toLocaleString('default', { month: 'short' }),
                revenue: monthRevenue
            };
        }).reverse();

        return {
            currentMonthRevenue,
            lastMonthRevenue,
            currentYearRevenue,
            lastYearRevenue,
            totalCustomers,
            newCustomersThisMonth,
            totalProducts,
            monthlyRevenue
        };
    } catch (error) {
        console.error('Error getting analytics:', error);
        throw error;
    }
});

// Invoice Printing Handler
ipcMain.handle('printInvoice', async (_, invoiceData) => {
    try {
        const html = generateInvoiceHTML(invoiceData);
        await handlePrint(html);
        return { success: true };
    } catch (error) {
        console.error('Print error:', error);
        throw error;
    }
});

function generateInvoiceHTML(data) {
    const logoPath = path.join(__dirname, 'assets', 'oil-logo.jpg');
    const logoBase64 = fs.readFileSync(logoPath, 'base64');

    return `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; font-size: 10px; margin: 0; padding: 5px; width: 58mm; }
                .header { text-align: center; margin-bottom: 5px; }
                .header img { max-width: 50px; margin-bottom: 5px; }
                .invoice-details, .customer-details, .items, .total, .terms-conditions, .footer { margin-bottom: 5px; }
                .items { border-collapse: collapse; width: 100%; }
                .items th, .items td { border: 1px solid #ddd; padding: 2px; }
                .items th { background-color: #f2f2f2; }
                .total { text-align: right; font-weight: bold; }
                .footer { text-align: center; margin-top: 5px; }
            </style>
        </head>
        <body>
            <div class="header">
                <img src="data:image/jpeg;base64,${logoBase64}" class="logo" alt="Logo">
                <div>Your Shop Name</div>
                <div>123, Shop Street, City - 123456</div>
                <div>Phone: +91 1234567890</div>
                <div>Invoice #: ${data.invoiceNumber}</div>
                <div>Date: ${new Date(data.date).toLocaleDateString()}</div>
            </div>
            
            <div class="customer-details">
                <div>Bill To:</div>
                <div>Name: ${data.customerDetails.name}</div>
                <div>Mobile: ${data.customerDetails.mobile}</div>
                <div>Address: ${data.customerDetails.address}</div>
            </div>
            
            <table class="items">
                <tr>
                    <th>Item</th>
                    <th>Qty</th>
                    <th>Price</th>
                    <th>Amount</th>
                </tr>
                ${data.items.map(item => `
                    <tr>
                        <td>${item.name}</td>
                        <td>${item.quantity}</td>
                        <td>₹${item.rate}</td>
                        <td>₹${item.total}</td>
                    </tr>
                `).join('')}
            </table>
            
            <div class="total">
                Total: ₹${data.total}
            </div>
            
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
}

module.exports = { mainWindow }