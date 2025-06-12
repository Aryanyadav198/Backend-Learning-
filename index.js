const express = require("express");
require("dotenv").config();
const app = express();
app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Successfully created the home route",
        data: [
            "<h1> Hi!, How are you<h1> "
        ]
    });
});
app.listen(process.env.PORT, () => { console.log(`The server is running on port :- ${process.env.PORT}`) })