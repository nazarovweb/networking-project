import express from 'express';
import userUpdate from './routes/userUpdate'
import authentication from './routes/authentication';
import userOTP from './routes/userOTP';
import products from './routes/products';
import userDetails from './routes/userDetails'
import siteData from './routes/siteData'
import productCheckout from './routes/productCheckout'
import cartCheckout from './routes/cartCheckout'
import homeData from './routes/homeData'
import support from './routes/support'
import { authRateLimiterMiddleware } from './middleware/rateLimit';
const router = express.Router();
router.use('/user/signup', authRateLimiterMiddleware);
router.use('/user/signin', authRateLimiterMiddleware);
router.use('/user/send-forgot-otp', authRateLimiterMiddleware);
router.use('/user/reset-password', authRateLimiterMiddleware);
router.use('/auth/google', authRateLimiterMiddleware);
router.use('/native/auth/google', authRateLimiterMiddleware);
router.use('/', authentication);
router.use('/update', userUpdate);
router.use('/', userOTP);
router.use('/',products);
router.use('/',userDetails);
router.use('/',siteData);
router.use('/',productCheckout);
router.use('/',cartCheckout);
router.use('/',homeData);
router.use('/',support);
export default router;