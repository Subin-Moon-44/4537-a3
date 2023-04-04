const { mongoose } = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const connectDB = async (input) => {
    try {
        const db = await mongoose.connect(process.env.DB_STRING);
        console.log("Connected to db");
        if (input.drop === true) {
            mongoose.connection.db.dropDatabase();
        }
    } catch (err) {
        console.log("ERROR: Database not connected");
        console.log(err);
    }
}

module.exports = { connectDB };