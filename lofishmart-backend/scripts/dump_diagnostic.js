require('dotenv').config();
const AppDataSource = require("./config/data-source");

const User = require("./db/entities/User");
const Profile = require("./db/entities/Profile");
const Stock = require("./db/entities/Stock");

async function dumpData() {
    try {
        await AppDataSource.initialize();
        console.log("Database initialized");

        const userRepo = AppDataSource.getRepository(User);
        const profileRepo = AppDataSource.getRepository(Profile);
        const stockRepo = AppDataSource.getRepository(Stock);

        console.log("\n--- Users ---");
        const users = await userRepo.find({ relations: ['role', 'market'] });
        users.forEach(u => {
            console.log(`ID: ${u.id}, Name: ${u.name}, Role: ${u.role?.id}, MarketID_col: ${u.market_id}, MarketObj: ${u.market?.name} (ID: ${u.market?.id})`);
        });

        console.log("\n--- Profiles (Markets) ---");
        const profiles = await profileRepo.find();
        profiles.forEach(p => {
            console.log(`ID: ${p.id}, Name: ${p.name}`);
        });

        console.log("\n--- Stock ---");
        const stocks = await stockRepo.find({ relations: ['market', 'product'] });
        stocks.forEach(s => {
            console.log(`ID: ${s.id}, MarketID: ${s.market?.id}, MarketName: ${s.market?.name}, Product: ${s.product?.name}, Qty: ${s.qty}`);
        });

        await AppDataSource.destroy();
    } catch (err) {
        console.error(err);
    }
}

dumpData();
