import express from 'express';
import { updateGateStatus, createGate } from '../controllers/gateController.js';

const router = express.Router();

// Route to create a new gate (for testing purposes)
router.post('/create', createGate);

// Route to handle sensor updates
router.put('/update-status', updateGateStatus);

export default router;

// http://localhost:5000/api/gate/create  -----POST
// http://localhost:5000/api/gate/update-status -----PUT