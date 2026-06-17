import Gate from '../models/Gate.js';

export const createGate = async (req, res) => {
  try {
    const { gateId, gateName, location } = req.body;
    
    // Check if gate already exists
    const gateExists = await Gate.findOne({ gateId });
    if (gateExists) {
      return res.status(400).json({ message: 'Gate ID already exists' });
    }
    
    const gate = await Gate.create({
      gateId,
      gateName,
      location,
      status: 'Open', // default
      currentUpdate: 'System Initialized',
      lastUpdated: new Date()
    });
    
    res.status(201).json({ message: 'Gate created successfully', gate });
  } catch (error) {
    console.error('Error creating gate:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

export const updateGateStatus = async (req, res) => {
  try {
    const { gateId, sensorStatus } = req.body;

    if (!gateId || !sensorStatus) {
      return res.status(400).json({ message: 'Gate ID and sensor status are required' });
    }

    // Find the gate by gateId
    const gate = await Gate.findOne({ gateId });

    if (!gate) {
      return res.status(404).json({ message: 'Gate not found' });
    }

    // Update logic based on sensor input
    // If sensor indicates a train is approaching, close the gate
    if (sensorStatus === 'Train Approaching') {
      gate.status = 'Closed';
      gate.closeTime = new Date();
      gate.currentUpdate = 'Gate Closed - Train Approaching';
    } 
    // If sensor indicates train has passed, open the gate
    else if (sensorStatus === 'Train Passed') {
      gate.status = 'Open';
      gate.openTime = new Date();
      gate.currentUpdate = 'Gate Opened - Train Passed';
      
      // Calculate waiting time if closeTime exists
      if (gate.closeTime) {
        const waitingTimeMs = gate.openTime - gate.closeTime;
        gate.waitingTime = Math.round(waitingTimeMs / 60000); // converting ms to minutes
      }
    }

    gate.sensorStatus = sensorStatus;
    gate.lastUpdated = new Date();

    await gate.save();

    res.status(200).json({ message: 'Gate status updated successfully', gate });
  } catch (error) {
    console.error('Error updating gate status:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
