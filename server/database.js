const initSqlJs = require('sql.js');
const path = require('path');
const fs = require('fs');

let db = null;

// Database schema definitions
const SCHEMA = {
    products: `
        CREATE TABLE IF NOT EXISTS Products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL,
            rate DECIMAL(10,2) NOT NULL,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `,
    customers: `
        CREATE TABLE IF NOT EXISTS Customers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            mobile TEXT UNIQUE NOT NULL,
            address TEXT NOT NULL,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `,
    invoices: `
        CREATE TABLE IF NOT EXISTS Invoices (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            invoiceNumber TEXT UNIQUE NOT NULL,
            date DATETIME NOT NULL,
            total DECIMAL(10,2) NOT NULL DEFAULT 0,
            CustomerId INTEGER NOT NULL,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (CustomerId) REFERENCES Customers(id)
        )
    `,
    invoiceItems: `
        CREATE TABLE IF NOT EXISTS InvoiceItems (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            InvoiceId INTEGER NOT NULL,
            ProductId INTEGER NOT NULL,
            quantity INTEGER NOT NULL,
            rate DECIMAL(10,2) NOT NULL,
            total DECIMAL(10,2) NOT NULL,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (InvoiceId) REFERENCES Invoices(id),
            FOREIGN KEY (ProductId) REFERENCES Products(id)
        )
    `
};

const getDbPath = () => {
    const rootDir = path.join(__dirname, '..');
    return path.join(rootDir, 'database.sqlite');
};

const saveDatabase = () => {
    if (!db) return;
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(getDbPath(), buffer);
};

const initializeDB = async () => {
    try {
        console.log('Initializing database...');
        const SQL = await initSqlJs();
        const dbPath = getDbPath();
        
        if (fs.existsSync(dbPath)) {
            console.log('Loading existing database...');
            const data = fs.readFileSync(dbPath);
            db = new SQL.Database(new Uint8Array(data));
        } else {
            console.log('Creating new database...');
            db = new SQL.Database();
            
            // Create tables
            Object.values(SCHEMA).forEach(query => {
                console.log('Running schema query:', query);
                db.run(query);
            });
            
            // Save the initial database
            saveDatabase();
        }
        
        // Verify database
        try {
            const test = db.exec('SELECT name FROM sqlite_master WHERE type="table"');
            console.log('Available tables:', test);
        } catch (error) {
            console.error('Database verification failed:', error);
            throw error;
        }
        
        console.log('Database initialized successfully');
    } catch (error) {
        console.error('Database initialization error:', error);
        throw error;
    }
};

// Model-like functions for Products
const Product = {
    findAll: (options = {}) => {
        try {
            const { order = 'name ASC' } = options;
            const query = `SELECT * FROM Products ORDER BY ${order}`;
            const result = db.exec(query);
            return result[0]?.values.map(row => ({
                id: row[0],
                name: row[1],
                rate: row[2],
                createdAt: row[3],
                updatedAt: row[4]
            })) || [];
        } catch (error) {
            console.error('Error in Product.findAll:', error);
            throw error;
        }
    },

    findOne: (id) => {
        try {
            const query = 'SELECT * FROM Products WHERE id = ? LIMIT 1';
            const result = db.exec(query, [id]);
            if (!result[0]?.values?.length) return null;
            
            const row = result[0].values[0];
            return {
                id: row[0],
                name: row[1],
                rate: row[2],
                createdAt: row[3],
                updatedAt: row[4]
            };
        } catch (error) {
            console.error('Error in Product.findOne:', error);
            throw error;
        }
    },

    create: (data) => {
        try {
            const { name, rate } = data;
            const query = 'INSERT INTO Products (name, rate) VALUES (?, ?)';
            db.run(query, [name, rate]);
            const id = db.exec('SELECT last_insert_rowid()')[0].values[0][0];
            saveDatabase();
            return { id, name, rate };
        } catch (error) {
            console.error('Error in Product.create:', error);
            throw error;
        }
    },

    update: (id, data) => {
        try {
            const { name, rate } = data;
            const query = 'UPDATE Products SET name = ?, rate = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?';
            db.run(query, [name, rate, id]);
            saveDatabase();
            return true;
        } catch (error) {
            console.error('Error in Product.update:', error);
            throw error;
        }
    },

    destroy: (id) => {
        try {
            const query = 'DELETE FROM Products WHERE id = ?';
            db.run(query, [id]);
            saveDatabase();
            return true;
        } catch (error) {
            console.error('Error in Product.destroy:', error);
            throw error;
        }
    }
};

// Model-like functions for Customers
const Customer = {
    findAll: (options = {}) => {
        try {
            const { order = 'name ASC' } = options;
            const query = `SELECT * FROM Customers ORDER BY ${order}`;
            const result = db.exec(query);
            return result[0]?.values.map(row => ({
                id: row[0],
                name: row[1],
                mobile: row[2],
                address: row[3],
                createdAt: row[4],
                updatedAt: row[5]
            })) || [];
        } catch (error) {
            console.error('Error in Customer.findAll:', error);
            throw error;
        }
    },

    findOne: (id) => {
        try {
            const query = 'SELECT * FROM Customers WHERE id = ? LIMIT 1';
            const result = db.exec(query, [id]);
            if (!result[0]?.values?.length) return null;
            
            const row = result[0].values[0];
            return {
                id: row[0],
                name: row[1],
                mobile: row[2],
                address: row[3],
                createdAt: row[4],
                updatedAt: row[5]
            };
        } catch (error) {
            console.error('Error in Customer.findOne:', error);
            throw error;
        }
    },

    create: (data) => {
        try {
            const { name, mobile, address } = data;
            const query = 'INSERT INTO Customers (name, mobile, address) VALUES (?, ?, ?)';
            db.run(query, [name, mobile, address]);
            const id = db.exec('SELECT last_insert_rowid()')[0].values[0][0];
            saveDatabase();
            return { id, name, mobile, address };
        } catch (error) {
            console.error('Error in Customer.create:', error);
            throw error;
        }
    },

    update: (id, data) => {
        try {
            const { name, mobile, address } = data;
            const query = 'UPDATE Customers SET name = ?, mobile = ?, address = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?';
            db.run(query, [name, mobile, address, id]);
            saveDatabase();
            return true;
        } catch (error) {
            console.error('Error in Customer.update:', error);
            throw error;
        }
    },

    destroy: (id) => {
        try {
            const query = 'DELETE FROM Customers WHERE id = ?';
            db.run(query, [id]);
            saveDatabase();
            return true;
        } catch (error) {
            console.error('Error in Customer.destroy:', error);
            throw error;
        }
    }
};

// Model-like functions for Invoices
const Invoice = {
    findAll: () => {
        try {
            const query = `
                SELECT 
                    i.*,
                    c.name as customerName,
                    c.mobile as customerMobile,
                    c.address as customerAddress
                FROM Invoices i
                LEFT JOIN Customers c ON i.CustomerId = c.id
                ORDER BY i.date DESC
            `;
            
            const result = db.exec(query);
            if (!result[0]?.values) return [];

            const invoices = result[0].values.map(row => ({
                id: row[0],
                invoiceNumber: row[1],
                date: row[2],
                total: row[3],
                CustomerId: row[4],
                customerDetails: {
                    name: row[7],
                    mobile: row[8],
                    address: row[9]
                }
            }));

            // Get invoice items for each invoice
            return invoices.map(invoice => {
                const itemsQuery = `
                    SELECT 
                        ii.*,
                        p.name as productName
                    FROM InvoiceItems ii
                    LEFT JOIN Products p ON ii.ProductId = p.id
                    WHERE ii.InvoiceId = ?
                `;
                
                const itemsResult = db.exec(itemsQuery, [invoice.id]);
                const items = itemsResult[0]?.values?.map(row => ({
                    id: row[0],
                    quantity: row[3],
                    rate: row[4],
                    total: row[5],
                    name: row[8]
                })) || [];

                return { ...invoice, items };
            });
        } catch (error) {
            console.error('Error in Invoice.findAll:', error);
            throw error;
        }
    },

    create: (data) => {
        try {
            const { customerId, total, items } = data;
            
            db.run('BEGIN TRANSACTION');
            
            // Generate invoice number
            const date = new Date();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = String(date.getFullYear()).slice(-2);
            
            const lastInvoiceQuery = `
                SELECT invoiceNumber 
                FROM Invoices 
                WHERE invoiceNumber LIKE ?
                ORDER BY id DESC 
                LIMIT 1
            `;
            
            const result = db.exec(lastInvoiceQuery, [`%/${month}/${year}`]);
            let nextNumber = 1;
            
            if (result[0]?.values?.length) {
                const lastSerial = parseInt(result[0].values[0][0].split('/')[0]);
                nextNumber = lastSerial + 1;
            }
            
            const invoiceNumber = `${String(nextNumber).padStart(3, '0')}/${month}/${year}`;
            
            // Create invoice
            const createInvoiceQuery = `
                INSERT INTO Invoices (invoiceNumber, date, total, CustomerId)
                VALUES (?, ?, ?, ?)
            `;
            
            db.run(createInvoiceQuery, [invoiceNumber, date.toISOString(), total, customerId]);
            const invoiceId = db.exec('SELECT last_insert_rowid()')[0].values[0][0];
            
            // Create invoice items
            items.forEach(item => {
                const createItemQuery = `
                    INSERT INTO InvoiceItems (InvoiceId, ProductId, quantity, rate, total)
                    VALUES (?, ?, ?, ?, ?)
                `;
                db.run(createItemQuery, [
                    invoiceId,
                    item.id,
                    item.quantity,
                    item.rate,
                    item.total
                ]);
            });
            
            db.run('COMMIT');
            saveDatabase();
            
            return {
                success: true,
                invoice: {
                    id: invoiceId,
                    invoiceNumber,
                    date,
                    total,
                    items
                }
            };
        } catch (error) {
            db.run('ROLLBACK');
            console.error('Error in Invoice.create:', error);
            throw error;
        }
    }
};

const setupDatabase = async () => {
    try {
        await initializeDB();
        return true;
    } catch (error) {
        console.error('Database setup failed:', error);
        throw error;
    }
};

module.exports = {
    setupDatabase,
    Product,
    Customer,
    Invoice,
    saveDatabase
};