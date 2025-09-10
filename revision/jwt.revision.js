import jwt from "jsonwebtoken";
import express from "express";
import cookieParser from "cookie-parser";


const app = express();
app.use(cookieParser());

app.use("/getCookies", async  (req, res)=> {
    res.cookie("cookie", "alkdjf",{
        httpOnly: true,
        secure: true
    }).send({
        "hi":"aryan"
    })
    
})
// Code to create tokens 
const secrete = "qwe123!@#";
const payload = {
    name: "Aryan yadav",
    phoneNo: 8924878488
};
const expiresIn = {
    expiresIn: "1m"
}
const token = jwt.sign(
    payload,
    secrete,
    expiresIn
)
console.log(token);

// //verify token


// var verifiedData = jwt.verify(
//     "a;lskjfjf",
//     secrete,
// )


app.listen(800);





// console.log(verifiedData())