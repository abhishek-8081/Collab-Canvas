import express from "express";
// import { z } from 'zod';
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";
import { middleware } from "./middleware";

const app = express();
app.use(express.json());


app.post("/signup",(req,res)=>{
    
    res.json({
        userId:"123"
    })

})


app.post("/signin",(req,res)=>{


    const userId =1;
    const token = jwt.sign({
        userId
    },JWT_SECRET);

    res.send({token});


    
})


app.post("/room",middleware,(req,res)=>{
    //db call
    res.json({
        roomId:"123"
    })
    
})


app.listen(3001);