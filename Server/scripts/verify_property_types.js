import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Place from '../models/Place.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env') });

async function verify() {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        const places = await Place.find({}, 'title propertyType');

        console.log('--- Current Property Types ---');
        places.forEach(p => {
            console.log(`[${p.propertyType || 'MISSING'}] ${p.title}`);
        });
        console.log('------------------------------');

        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

verify();
