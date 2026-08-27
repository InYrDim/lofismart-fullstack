require('dotenv').config();
const AppDataSource = require('../config/data-source');
const Product = require('../db/entities/Product');
const Grade = require('../db/entities/Grade');
const Size = require('../db/entities/Size');
const Category = require('../db/entities/Category');
const Price = require('../db/entities/Price');

async function check() {
    await AppDataSource.initialize();
    
    const productCount = await AppDataSource.getRepository(Product).count();
    const gradeCount = await AppDataSource.getRepository(Grade).count();
    const sizeCount = await AppDataSource.getRepository(Size).count();
    const categoryCount = await AppDataSource.getRepository(Category).count();
    const priceCount = await AppDataSource.getRepository(Price).count();
    
    console.log('--- Database Status ---');
    console.log('Products:', productCount);
    console.log('Grades:', gradeCount);
    console.log('Sizes:', sizeCount);
    console.log('Categories:', categoryCount);
    console.log('Prices:', priceCount);
    
    if (productCount > 0) {
        const sampleProducts = await AppDataSource.getRepository(Product).find({ take: 3 });
        console.log('\nSample Products:', sampleProducts.map(p => p.id));
    }
    
    await AppDataSource.destroy();
}

check().catch(console.error);
