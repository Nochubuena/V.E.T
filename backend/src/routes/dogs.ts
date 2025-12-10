import express, { Response } from 'express';
import Dog from '../models/Dog';
import { authenticate, AuthRequest } from '../middleware/auth';
import { collarLimiter } from '../middleware/rateLimit';

const router = express.Router();

// Get all dogs for logged-in owner
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const dogs = await Dog.find({ ownerId: req.userId }).sort({ createdAt: -1 });
    res.json(dogs.map(dog => ({
      id: dog._id.toString(),
      name: dog.name,
      ownerId: dog.ownerId.toString(),
      imageUri: dog.imageUri,
      heartRate: dog.heartRate,
      temperature: dog.temperature,
      vitalRecords: dog.vitalRecords || [],
      isDeceased: dog.isDeceased || false,
    })));
  } catch (error) {
    console.error('Get dogs error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add a new dog
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { name, imageUri, heartRate, temperature } = req.body;

    // Check if dog with same name already exists for this owner
    const existingDog = await Dog.findOne({
      ownerId: req.userId,
      name: { $regex: new RegExp(`^${name}$`, 'i') }, // Case-insensitive
    });

    if (existingDog) {
      return res.status(400).json({ error: 'Dog with this name already exists' });
    }

    const dog = new Dog({
      name: name.trim(),
      ownerId: req.userId,
      imageUri,
      heartRate,
      temperature,
      vitalRecords: [],
    });

    await dog.save();

    res.status(201).json({
      id: dog._id.toString(),
      name: dog.name,
      ownerId: dog.ownerId.toString(),
      imageUri: dog.imageUri,
      heartRate: dog.heartRate,
      temperature: dog.temperature,
      vitalRecords: dog.vitalRecords || [],
      isDeceased: dog.isDeceased || false,
    });
  } catch (error) {
    console.error('Add dog error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Helper function to validate ISO timestamp
const isValidISOString = (str: string): boolean => {
  try {
    const date = new Date(str);
    return date.toISOString() === str || !isNaN(date.getTime());
  } catch {
    return false;
  }
};

// Helper function to calculate status if not provided
const calculateVitalStatus = (heartRate: number, temperature: number): string => {
  // Basic validation ranges for dogs
  const hrNormal = heartRate >= 40 && heartRate <= 200;
  const tempNormal = temperature >= 30 && temperature <= 45; // Celsius
  
  // More specific normal ranges
  const hrInNormalRange = heartRate >= 60 && heartRate <= 140;
  const tempInNormalRange = temperature >= 37.5 && temperature <= 39.5; // Normal dog temp
  
  if (!hrNormal || !tempNormal) {
    return 'critical'; // Out of reasonable bounds
  } else if (!hrInNormalRange || !tempInNormalRange) {
    return 'warning'; // Outside normal but within reasonable bounds
  } else {
    return 'normal';
  }
};

// Update dog vitals
router.put('/:id/vitals', authenticate, collarLimiter, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { heartRate, temperature, status, time } = req.body;

    // Validation: Check required fields
    if (heartRate === undefined || temperature === undefined) {
      return res.status(400).json({ 
        error: 'heartRate and temperature are required' 
      });
    }

    // Validation: Check data ranges (prevent invalid data)
    if (typeof heartRate !== 'number' || heartRate < 0 || heartRate > 300) {
      return res.status(400).json({ 
        error: 'heartRate must be a number between 0 and 300' 
      });
    }

    if (typeof temperature !== 'number' || temperature < 20 || temperature > 50) {
      return res.status(400).json({ 
        error: 'temperature must be a number between 20 and 50°C' 
      });
    }

    // Validation: Check status values
    const validStatuses = ['normal', 'warning', 'critical', 'abnormal'];
    let finalStatus = status;
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ 
        error: `status must be one of: ${validStatuses.join(', ')}` 
      });
    }

    // Calculate status if not provided
    if (!finalStatus) {
      finalStatus = calculateVitalStatus(heartRate, temperature);
    }

    // Validation: Check timestamp format
    const timestamp = time || new Date().toISOString();
    if (time && !isValidISOString(time)) {
      return res.status(400).json({ 
        error: 'time must be a valid ISO 8601 timestamp' 
      });
    }

    const dog = await Dog.findOne({ _id: id, ownerId: req.userId });
    if (!dog) {
      return res.status(404).json({ error: 'Dog not found' });
    }

    // Update current vitals
    dog.heartRate = heartRate;
    dog.temperature = temperature;

    // Add to vital records
    if (heartRate !== undefined && temperature !== undefined && finalStatus && timestamp) {
      dog.vitalRecords = dog.vitalRecords || [];
      dog.vitalRecords.push({
        heartRate,
        temperature,
        status: finalStatus,
        time: timestamp,
      });

      // Keep only last 1000 records to prevent database bloat
      if (dog.vitalRecords.length > 1000) {
        dog.vitalRecords = dog.vitalRecords.slice(-1000);
      }
    }

    await dog.save();

    res.json({
      id: dog._id.toString(),
      name: dog.name,
      ownerId: dog.ownerId.toString(),
      imageUri: dog.imageUri,
      heartRate: dog.heartRate,
      temperature: dog.temperature,
      vitalRecords: dog.vitalRecords || [],
      isDeceased: dog.isDeceased || false,
    });
  } catch (error: any) {
    console.error('Update vitals error:', error);
    
    // More specific error handling
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        error: 'Validation error',
        details: error.message 
      });
    }
    
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        error: 'Invalid dog ID format' 
      });
    }
    
    res.status(500).json({ 
      error: 'Server error',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Mark dog as deceased
router.patch('/:id/deceased', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const dog = await Dog.findOne({ _id: id, ownerId: req.userId });
    if (!dog) {
      return res.status(404).json({ error: 'Dog not found' });
    }

    dog.isDeceased = true;
    await dog.save();

    res.json({
      id: dog._id.toString(),
      name: dog.name,
      ownerId: dog.ownerId.toString(),
      imageUri: dog.imageUri,
      heartRate: dog.heartRate,
      temperature: dog.temperature,
      vitalRecords: dog.vitalRecords || [],
      isDeceased: dog.isDeceased,
      message: 'Dog marked as deceased',
    });
  } catch (error) {
    console.error('Mark deceased error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete a dog (complete deletion from database)
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const dog = await Dog.findOneAndDelete({ _id: id, ownerId: req.userId });
    if (!dog) {
      return res.status(404).json({ error: 'Dog not found' });
    }

    res.json({ message: 'Dog deleted successfully' });
  } catch (error) {
    console.error('Delete dog error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;

