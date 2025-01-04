const express = require('express');
const cors = require('cors');
const path = require('path');
const { setupDatabase, Product, Customer, Invoice } = require('./server/database');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'build')));

// Log middleware
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    next();
});

// Product Routes
app.get('/api/products', async (req, res) => {
    try {
        console.log('Fetching products...');
        const products = await Product.findAll();
        console.log('Products fetched:', products);
        res.json(products);
    } catch (error) {
        console.error('Server error fetching products:', error);
        res.status(500).json({ 
            error: error.message || 'Failed to fetch products',
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

app.post('/api/products', async (req, res) => {
    try {
        const product = await Product.create(req.body);
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/products/:id', async (req, res) => {
    try {
        const updated = await Product.update(parseInt(req.params.id), req.body);
        if (updated) {
            const product = await Product.findOne(parseInt(req.params.id));
            res.json(product);
        } else {
            res.status(404).json({ error: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/products/:id', async (req, res) => {
    try {
        const success = await Product.destroy(parseInt(req.params.id));
        res.json({ success });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Customer Routes
app.get('/api/customers', async (req, res) => {
    try {
        const customers = await Customer.findAll();
        res.json(customers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/customers', async (req, res) => {
    try {
        const customer = await Customer.create(req.body);
        res.json(customer);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/customers/:id', async (req, res) => {
    try {
        const updated = await Customer.update(parseInt(req.params.id), req.body);
        if (updated) {
            const customer = await Customer.findOne(parseInt(req.params.id));
            res.json(customer);
        } else {
            res.status(404).json({ error: 'Customer not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/customers/:id', async (req, res) => {
    try {
        const success = await Customer.destroy(parseInt(req.params.id));
        res.json({ success });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Invoice Routes
app.get('/api/invoices', async (req, res) => {
    try {
        const invoices = await Invoice.findAll();
        res.json(invoices);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/invoices', async (req, res) => {
    try {
        const invoice = await Invoice.create(req.body);
        res.json(invoice);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Analytics endpoint
app.get('/api/analytics', async (req, res) => {
    try {
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();

        // Get all data for calculations
        const invoices = await Invoice.findAll();
        const customers = await Customer.findAll();
        const products = await Product.findAll();

        // Calculate date ranges
        const startOfCurrentMonth = new Date(currentYear, currentMonth, 1);
        const startOfLastMonth = new Date(currentYear, currentMonth - 1, 1);
        const startOfCurrentYear = new Date(currentYear, 0, 1);
        const startOfLastYear = new Date(currentYear - 1, 0, 1);

        // Calculate revenues
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

        // Calculate customer metrics
        const totalCustomers = customers.length;
        const newCustomersThisMonth = customers
            .filter(cust => new Date(cust.createdAt) >= startOfCurrentMonth)
            .length;

        // Calculate product metrics
        const totalProducts = products.length;

        // Calculate monthly revenue for the chart
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

        const analytics = {
            currentMonthRevenue,
            lastMonthRevenue,
            currentYearRevenue,
            lastYearRevenue,
            totalCustomers,
            newCustomersThisMonth,
            totalProducts,
            monthlyRevenue
        };

        res.json(analytics);
    } catch (error) {
        console.error('Analytics error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Serve React app - must be after API routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Global error handler:', err);
    res.status(500).json({
        error: err.message || 'Internal Server Error',
        details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

// Initialize database and start server
setupDatabase().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}).catch(error => {
    console.error('Failed to start server:', error);
    process.exit(1);
});