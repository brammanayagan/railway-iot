import express from 'express';
import { 
  createUserAccount, 
  getUserAccounts,
  getUserAccountById,
  updateUserAccount,
  deleteUserAccount
} from '../controllers/userAccountController.js';

const router = express.Router();

router.post('/create', createUserAccount);
router.get('/all', getUserAccounts);
router.get('/:id', getUserAccountById);
router.put('/:id', updateUserAccount);
router.delete('/:id', deleteUserAccount);

export default router;



// http://localhost:5000/api/user-account/create---- POST
// http://localhost:5000/api/user-account/all----GET