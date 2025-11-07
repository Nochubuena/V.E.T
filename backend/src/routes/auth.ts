import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import Owner from '../models/Owner';

const router = express.Router();

// Register Owner - Stores user data in the Users collection
router.post('/signup', async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;

    // Check if owner exists in Users collection
    const existingOwner = await Owner.findOne({ email: email.toLowerCase() });
    if (existingOwner) {
      return res.status(400).json({ error: 'Owner already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create owner - will be saved to Users collection
    const owner = new Owner({
      email: email.toLowerCase(),
      password: hashedPassword,
      name: name || email.split('@')[0],
    });

    // Save to Users collection in MongoDB
    await owner.save();
    
    // Verify the save by checking the database
    const mongooseConnection = mongoose.connection;
    const dbName = mongooseConnection.db?.databaseName || 'unknown';
    const collectionName = owner.collection.name;
    console.log(`✅ User saved to Users collection:`);
    console.log(`   Database: ${dbName}`);
    console.log(`   Collection: ${collectionName}`);
    console.log(`   Email: ${owner.email}`);
    console.log(`   ID: ${owner._id}`);

    // Generate JWT token
    const token = jwt.sign(
      { userId: owner._id.toString() },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      owner: {
        id: owner._id.toString(),
        email: owner.email,
        name: owner.name,
      },
    });
  } catch (error: any) {
    console.error('❌ Signup error:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      name: error.name,
      stack: error.stack,
    });
    
    // Check for duplicate key error (unique constraint)
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// Login Owner
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Find owner
    const owner = await Owner.findOne({ email: email.toLowerCase() });
    if (!owner) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, owner.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: owner._id.toString() },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    res.json({
      token,
      owner: {
        id: owner._id.toString(),
        email: owner.email,
        name: owner.name,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;

