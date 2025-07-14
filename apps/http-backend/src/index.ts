import express from "express";
// import { z } from 'zod';
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";
import { middleware } from "./middleware.js";
import { CreateUserSchema, SiginUserSchema, CreateRoomSchema } from "@repo/common/types";
import { prismaClient } from "@repo/db/client";


const app = express();
app.use(express.json());


app.post("/signup", async (req, res) => {

    const parsedData = CreateUserSchema.safeParse(req.body);
    if (!parsedData.success) {
        console.log(parsedData.error);
        res.json({
            mesaage: "Incorrect Inputs"
        })
        return;
    }
    try {
        const user = await prismaClient.user.create({
            data: {
                email: parsedData.data?.username,
                //Hash the Password
                password: parsedData.data.password,
                name: parsedData.data.name
            }
        })
        res.json({
            userId: user.id
        })
    }
    catch {
        res.status(411).json({
            message: "User Already exist with this email/username"
        })
    }
})


app.post("/signin", async(req, res) => {
    const parsedData = SiginUserSchema.safeParse(req.body);
    if (!parsedData.success) {
        res.json({
            mesaage: "Incorrect Inputs"
        })
        return;
    }

    //To - do Compare the Hashed Password
    const user = await prismaClient.user.findFirst({
        where:{
            email:parsedData.data.username,
            password:parsedData.data.password
        }
        
    })
    if(!user){
        res.status(403).json({
            message:"Not Authorized"
        })
        return;
    }

    const token = jwt.sign({
        userId:user?.id
    }, JWT_SECRET);

    res.send({ token });



})


app.post("/room", middleware, (req, res) => {

    const data = CreateRoomSchema.safeParse(req.body);
    if (!data.success) {
        res.json({
            mesaage: "Incorrect Inputs"
        })
        return;
    }
    //db call
    res.json({
        roomId: "123"
    })

})


app.listen(3001);