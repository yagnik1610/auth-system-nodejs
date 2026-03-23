import {Router} from 'express';
import * as authcontroller from '../controllers/auth.controller.js';

const authRouter = Router();



/** 
 * POST /api/auth/register
 */
authRouter.post('/register', authcontroller.register)

/**
 * POST /api/auth/login
 */
authRouter.post('/login', authcontroller.login)

/** 
 * GET /api/auth/get-me
 */
authRouter.get('/get-me', authcontroller.getMe)

/**
 * GET /api/auth/referesh-token
 */
authRouter.get("/refresh-token", authcontroller.refreshToken)


/**
* GET /api/auth/logout
*/
authRouter.get("/logout", authcontroller.logout)


/**
 * GET /api/auth/logout-all
 */
authRouter.get("/logout-all", authcontroller.logoutAll)

/**
 * POST /api/auth/verify-email
 */
authRouter.post("/verify-email", authcontroller.verifyEmail)

export default authRouter; 
