import { Request, Response, NextFunction } from 'express';

const API_SECRET = process.env.API_SECRET as string;

function authenticateToken(req: Request, res: Response, next: NextFunction) {
    const secret = req.headers['x-api-secret'];

    if (!secret || secret !== API_SECRET) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    next();
}

export default authenticateToken;
