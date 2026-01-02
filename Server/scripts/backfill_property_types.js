import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Place from '../models/Place.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load env vars from parent directory
dotenv.config({ path: join(__dirname, '../.env') });

const propertyTypes = ['1RK', '1BHK', '2BHK', '3BHK', 'Villa'];

async function backfill() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URL);
        console.log('Connected.');

        const places = await Place.find({});
        console.log(`Found ${places.length} places.`);

        let updatedCount = 0;
        for (const place of places) {
            // Force update to redistribute types
            const randomType = propertyTypes[Math.floor(Math.random() * propertyTypes.length)];
            place.propertyType = randomType;
            await place.save();
            console.log(`Updated place ${place._id} with type ${randomType}`);
            updatedCount++;
        }

        console.log(`Backfill complete. Updated ${updatedCount} places.`);
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

backfill();
