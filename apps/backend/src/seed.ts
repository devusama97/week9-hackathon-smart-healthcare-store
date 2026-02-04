import { MongoClient } from 'mongodb';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

const uri = process.env.MONGODB_URI;

if (!uri) {
    console.error("MONGODB_URI is not defined in .env");
    process.exit(1);
}

const products = [
    {
        title: "Centrum Adult Multivitamin",
        description: "Multivitamin/Multimineral Supplement with Antioxidants, Vitamins and Minerals.",
        category: "Vitamins",
        price: 15.99,
        image: "https://images.placeholder.com/150",
        tags: ["multivitamin", "health", "daily-supplements", "energy"]
    },
    {
        title: "Calcium with Vitamin D3",
        description: "Helps support bone health and maintain strong teeth.",
        category: "Supplements",
        price: 12.49,
        image: "https://images.placeholder.com/150",
        tags: ["calcium", "bone-health", "vitamin-d3", "weak-bones", "osteoporosis"]
    },
    {
        title: "Biotin 5000mcg",
        description: "Supports healthy hair, skin, and nails.",
        category: "Beauty",
        price: 9.99,
        image: "https://images.placeholder.com/150",
        tags: ["biotin", "hair-fall", "skin-care", "nails", "hair-growth"]
    },
    {
        title: "Vitamin C 1000mg",
        description: "Immune system support with high-potency Vitamin C.",
        category: "Vitamins",
        price: 11.00,
        image: "https://images.placeholder.com/150",
        tags: ["vitamin-c", "immunity", "health", "cold", "flu"]
    },
    {
        title: "Fish Oil Omega-3",
        description: "Supports heart, brain, and eye health.",
        category: "Supplements",
        price: 18.25,
        image: "https://images.placeholder.com/150",
        tags: ["omega-3", "fish-oil", "heart-health", "brain", "cholesterol"]
    },
    {
        title: "Joint Support Glucosamine",
        description: "Helps support joint comfort and flexibility.",
        category: "Supplements",
        price: 22.99,
        image: "https://images.placeholder.com/150",
        tags: ["joints", "bone-health", "flexibility", "arthritis", "joint-pain"]
    },
    {
        title: "Magnesium 400mg",
        description: "Supports muscle relaxation, sleep quality, and stress relief.",
        category: "Supplements",
        price: 13.99,
        image: "https://images.placeholder.com/150",
        tags: ["magnesium", "sleep", "stress", "muscle-cramps", "relaxation"]
    },
    {
        title: "Zinc 50mg",
        description: "Boosts immune function and supports wound healing.",
        category: "Vitamins",
        price: 8.49,
        image: "https://images.placeholder.com/150",
        tags: ["zinc", "immunity", "healing", "cold", "skin"]
    },
    {
        title: "Probiotics 10 Billion CFU",
        description: "Supports digestive health and gut flora balance.",
        category: "Supplements",
        price: 24.99,
        image: "https://images.placeholder.com/150",
        tags: ["probiotics", "digestion", "gut-health", "bloating", "stomach"]
    },
    {
        title: "Iron 65mg",
        description: "Helps prevent anemia and supports energy production.",
        category: "Supplements",
        price: 10.99,
        image: "https://images.placeholder.com/150",
        tags: ["iron", "anemia", "energy", "fatigue", "weakness"]
    },
    {
        title: "Turmeric Curcumin 1500mg",
        description: "Natural anti-inflammatory with antioxidant properties.",
        category: "Supplements",
        price: 19.99,
        image: "https://images.placeholder.com/150",
        tags: ["turmeric", "inflammation", "joint-pain", "antioxidant", "arthritis"]
    },
    {
        title: "Vitamin D3 5000 IU",
        description: "Supports bone health, immune function, and mood.",
        category: "Vitamins",
        price: 14.49,
        image: "https://images.placeholder.com/150",
        tags: ["vitamin-d", "bone-health", "immunity", "mood", "depression"]
    },
    {
        title: "Collagen Peptides",
        description: "Promotes skin elasticity, joint health, and hair strength.",
        category: "Beauty",
        price: 29.99,
        image: "https://images.placeholder.com/150",
        tags: ["collagen", "skin", "anti-aging", "joints", "hair"]
    },
    {
        title: "B-Complex Vitamins",
        description: "Supports energy metabolism and nervous system health.",
        category: "Vitamins",
        price: 12.99,
        image: "https://images.placeholder.com/150",
        tags: ["b-complex", "energy", "stress", "metabolism", "fatigue"]
    },
    {
        title: "Melatonin 10mg",
        description: "Helps regulate sleep cycles and improve sleep quality.",
        category: "Sleep Aid",
        price: 9.49,
        image: "https://images.placeholder.com/150",
        tags: ["melatonin", "sleep", "insomnia", "jet-lag", "rest"]
    }
];

async function seed() {
    const client = new MongoClient(uri as string);
    try {
        await client.connect();
        const db = client.db();
        const collection = db.collection('products');

        await collection.deleteMany({});
        console.log('Cleared existing products');

        await collection.insertMany(products);
        console.log(`Seeded ${products.length} healthcare products successfully`);
    } catch (error) {
        console.error('Error seeding data:', error);
    } finally {
        await client.close();
    }
}

seed();
