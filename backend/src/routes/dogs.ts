import express, { Response } from 'express';
import Dog from '../models/Dog';
import { authenticate, AuthRequest } from '../middleware/auth';

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

// Update dog vitals
router.put('/:id/vitals', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { heartRate, temperature, status, time } = req.body;

    const dog = await Dog.findOne({ _id: id, ownerId: req.userId });
    if (!dog) {
      return res.status(404).json({ error: 'Dog not found' });
    }

    // Update current vitals
    dog.heartRate = heartRate;
    dog.temperature = temperature;

    // Add to vital records
    if (heartRate && temperature && status && time) {
      dog.vitalRecords = dog.vitalRecords || [];
      dog.vitalRecords.push({
        heartRate,
        temperature,
        status,
        time,
      });
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
  } catch (error) {
    console.error('Update vitals error:', error);
    res.status(500).json({ error: 'Server error' });
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

