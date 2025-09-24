import mongoose from "mongoose";
import DB_NAME from "../constants.js";
import dotenv from "dotenv";
dotenv.config("./env");

const connectMongoDb = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}${DB_NAME}`);
        

        console.log(`MongoDB Connected Successfully ${connectionInstance.connection.host}`);
        console.log(connectionInstance.connection.readyState);
        // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
        // const conn = connectionInstance.connection;
        // console.log(conn.host);      // Hostname
        // console.log(conn.port);      // Port
        // console.log(conn.name);      // Database name
        // console.log(conn.user);      // Username (if any)
        console.log(connectionInstance.modelNames()); // Array of model names
        console.log(connectionInstance.models);       // { User: Model, Order: Model, … }
    } catch (err) {
        console.error(`The error is catch in db/index.js: ${err}`)
        throw err
        
        
        

    }
}
export default connectMongoDb;
