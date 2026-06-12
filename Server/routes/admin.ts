import express, { Request, Response, NextFunction } from 'express';
import { client } from '../data/DB';
import jwt from 'jsonwebtoken';

const router = express.Router();
const JWT_SECRET = process.env.JWT_ENCRYPTION_KEY as string;

interface JwtPayload {
    userID: number;
    iat: number;
    exp: number;
}

// Admin middleware - checks JWT token and verifies role = 'admin'
async function adminMiddleware(req: Request, res: Response, next: NextFunction) {
    const token = req.headers['authorization']?.replace('Bearer ', '') || req.body?.token || req.query?.token;
    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }
    try {
        const decoded = jwt.verify(token as string, JWT_SECRET) as JwtPayload;
        (req as any).adminUserID = decoded.userID;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid token' });
    }
}

router.use('/admin', adminMiddleware);

// GET /admin/stats
router.get('/admin/stats', async (req: Request, res: Response) => {
    try {
        const [usersResult, ordersResult, productsResult, revenueResult] = await Promise.all([
            client.query(`SELECT COUNT(*) AS total FROM users`),
            client.query(`SELECT COUNT(*) AS total FROM orders`),
            client.query(`SELECT COUNT(*) AS total FROM products`),
            client.query(`SELECT COALESCE(SUM(totalamount), 0) AS total FROM orders`),
        ]);
        const recentOrders = await client.query(
            `SELECT orders.orderid, orders.totalamount, orders.orderstatus, orders.createdat, users.username, users.email
             FROM orders
             INNER JOIN users ON orders.userid = users.userid
             ORDER BY orders.createdat DESC
             LIMIT 10`
        );
        res.status(200).json({
            totalUsers: parseInt(usersResult.rows[0].total),
            totalOrders: parseInt(ordersResult.rows[0].total),
            totalProducts: parseInt(productsResult.rows[0].total),
            totalRevenue: parseFloat(revenueResult.rows[0].total),
            recentOrders: recentOrders.rows,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// GET /admin/users
router.get('/admin/users', async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;
    try {
        const countResult = await client.query(`SELECT COUNT(*) AS total FROM users`);
        const result = await client.query(
            `SELECT userid, username, email, role, createdat FROM users ORDER BY createdat DESC LIMIT $1 OFFSET $2`,
            [limit, offset]
        );
        res.status(200).json({
            data: result.rows,
            total: parseInt(countResult.rows[0].total),
            page,
            limit,
        });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// PUT /admin/users/:id/role
router.put('/admin/users/:id/role', async (req: Request, res: Response) => {
    const { id } = req.params;
    const { role } = req.body;
    if (!['admin', 'customer'].includes(role)) {
        return res.status(400).json({ error: 'Invalid role. Must be admin or customer.' });
    }
    try {
        const result = await client.query(
            `UPDATE users SET role = $1 WHERE userid = $2 RETURNING userid, username, email, role`,
            [role, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json({ message: 'Role updated', user: result.rows[0] });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// GET /admin/products
router.get('/admin/products', async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;
    try {
        const countResult = await client.query(`SELECT COUNT(*) AS total FROM products`);
        const result = await client.query(
            `SELECT products.productid, products.title, products.price, products.discount, products.stock,
                    categories.name AS category, productimages.imglink
             FROM products
             LEFT JOIN categories ON products.categoryid = categories.categoryid
             LEFT JOIN productimages ON products.productid = productimages.productid AND productimages.isprimary = true
             ORDER BY products.productid DESC
             LIMIT $1 OFFSET $2`,
            [limit, offset]
        );
        res.status(200).json({
            data: result.rows,
            total: parseInt(countResult.rows[0].total),
            page,
            limit,
        });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// DELETE /admin/products/:id
router.delete('/admin/products/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        await client.query(`DELETE FROM productimages WHERE productid = $1`, [id]);
        await client.query(`DELETE FROM productparams WHERE productid = $1`, [id]);
        const result = await client.query(`DELETE FROM products WHERE productid = $1 RETURNING productid`, [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.status(200).json({ message: 'Product deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// PUT /admin/products/:id
router.put('/admin/products/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    const { title, description, price, discount, stock } = req.body;
    try {
        const result = await client.query(
            `UPDATE products SET title = COALESCE($1, title), description = COALESCE($2, description),
             price = COALESCE($3, price), discount = COALESCE($4, discount), stock = COALESCE($5, stock)
             WHERE productid = $6 RETURNING *`,
            [title, description, price, discount, stock, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.status(200).json({ message: 'Product updated', product: result.rows[0] });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// GET /admin/orders
router.get('/admin/orders', async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;
    try {
        const countResult = await client.query(`SELECT COUNT(*) AS total FROM orders`);
        const result = await client.query(
            `SELECT orders.orderid, orders.totalamount, orders.orderstatus, orders.createdat,
                    orders.order_code, users.username, users.email
             FROM orders
             INNER JOIN users ON orders.userid = users.userid
             ORDER BY orders.createdat DESC
             LIMIT $1 OFFSET $2`,
            [limit, offset]
        );
        res.status(200).json({
            data: result.rows,
            total: parseInt(countResult.rows[0].total),
            page,
            limit,
        });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// PUT /admin/orders/:id/status
router.put('/admin/orders/:id/status', async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }
    try {
        const result = await client.query(
            `UPDATE orders SET orderstatus = $1 WHERE orderid = $2 RETURNING orderid, orderstatus`,
            [status, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }
        res.status(200).json({ message: 'Order status updated', order: result.rows[0] });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// GET /admin/reviews
router.get('/admin/reviews', async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;
    try {
        const countResult = await client.query(`SELECT COUNT(*) AS total FROM reviews`);
        const result = await client.query(
            `SELECT reviews.reviewid, reviews.rating, reviews.title, reviews.comment, reviews.createdat,
                    users.username, users.email, products.title AS product_title
             FROM reviews
             INNER JOIN users ON reviews.userid = users.userid
             INNER JOIN products ON reviews.productid = products.productid
             ORDER BY reviews.createdat DESC
             LIMIT $1 OFFSET $2`,
            [limit, offset]
        );
        res.status(200).json({
            data: result.rows,
            total: parseInt(countResult.rows[0].total),
            page,
            limit,
        });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// DELETE /admin/reviews/:id
router.delete('/admin/reviews/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const result = await client.query(`DELETE FROM reviews WHERE reviewid = $1 RETURNING reviewid`, [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Review not found' });
        }
        res.status(200).json({ message: 'Review deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

export default router;
