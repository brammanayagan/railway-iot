import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import RailwayGate from './models/RailwayGate.js';
import ESP32Device from './models/ESP32Device.js';

dotenv.config();

const seedDatabase = async () => {
  try {
    await connectDB();
    
    console.log('Seeding Database...');

    // Clear existing master data to avoid duplication errors
    await RailwayGate.deleteMany();
    await ESP32Device.deleteMany();

    // Create the Railway Gate
    const gate = await RailwayGate.create({
      gateCode: 'GATE001',
      gateName: 'Tambaram Railway Gate',
      latitude: 12.9249,
      longitude: 80.1100,
      address: 'Tambaram Main Road',
      city: 'Chennai',
      state: 'Tamil Nadu',
      installationDate: new Date(),
      isActive: true,
      currentStatus: 'UNKNOWN',
    });

    console.log(`Created Gate: ${gate.gateName}`);

    // Create the ESP32 Device and assign it to the gate
    const device = await ESP32Device.create({
      deviceCode: 'ESP001',
      deviceName: 'Tambaram ESP32',
      serialNumber: 'SN-001',
      macAddress: '00:1B:44:11:3A:B7',
      firmwareVersion: 'v1.0.0',
      hardwareVersion: 'v2.0',
      railwayGate: gate._id,
      onlineStatus: false,
    });

    console.log(`Created Device: ${device.deviceName}`);

    // Update Gate to reference the Device
    gate.currentDevice = device._id;
    await gate.save();

    console.log('Database seeded successfully!');
    process.exit();
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
