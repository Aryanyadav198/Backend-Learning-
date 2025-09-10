import dotenv from "dotenv";
dotenv.config("./env");
import connectDb from "./db/index.js"
import { app } from "./app.js";

connectDb()
    .then(() => {
        app.listen(process.env.PORT, () => {
            console.log("App is Listing on PORT:", process.env.PORT)
        });
    }).catch((err) => {
        console.error("❌ Server startup aborted. DB not connected.");
        process.exit(1); // 💥 Optional: forcefully exit the app

    });

//iife
// ; (async () => {
//   try {
//     await mongoose.connect(`${process.env.MONGODB_URI}${DB_NAME}`);
//     app.on("error", (error)=>{
//       console.error(`Error from ${error}`);
//     });
//     app.listen(process.env.PORT, ()=>{
//       console.log(`The process is running on port ${process.env.PORT}`);


//     });

//   } catch (err) {
//     console.error(`Error During DB_Connect: ${err}`);
//   }

// })()


 