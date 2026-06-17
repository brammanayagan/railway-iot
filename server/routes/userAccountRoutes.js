import express from 'express';
import { createUserAccount, getUserAccounts } from '../controllers/userAccountController.js';

const router = express.Router();

// Route to create a new user account
router.post('/create', createUserAccount);

// Route to get all user accounts
router.get('/all', getUserAccounts);

export default router;



// http://localhost:5000/api/user-account/create---- POST
// http://localhost:5000/api/user-account/all----GET