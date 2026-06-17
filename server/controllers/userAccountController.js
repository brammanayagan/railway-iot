import UserAccount from '../models/UserAccount.js';

export const createUserAccount = async (req, res) => {
  try {
    const { name, email, mobileNo, role, assignedGate, currentLocation, status } = req.body;
    
    // Check if user already exists
    const userExists = await UserAccount.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }
    
    const user = await UserAccount.create({
      name,
      email,
      mobileNo,
      role,
      assignedGate,
      currentLocation,
      status: status || 'active',
      lastSeen: new Date(),
    });
    
    res.status(201).json({ message: 'User Account created successfully', user });
  } catch (error) {
    console.error('Error creating user account:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

export const getUserAccounts = async (req, res) => {
  try {
    const users = await UserAccount.find({});
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
