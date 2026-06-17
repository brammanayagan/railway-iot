import express from 'express';
import { 
  updateGateStatus, 
  createGate,
  getGates,
  getGateById,
  updateGate,
  deleteGate
} from '../controllers/gateController.js';

const router = express.Router();

// General CRUD
router.post('/create', createGate);
router.get('/all', getGates);
router.get('/:id', getGateById);
router.put('/:id', updateGate);
router.delete('/:id', deleteGate);

// Sensor specific
router.put('/status/update', updateGateStatus); // updated path to avoid conflict with generic PUT

export default router;

// http://localhost:5000/api/gate/create  -----POST
// http://localhost:5000/api/gate/update-status -----PUT