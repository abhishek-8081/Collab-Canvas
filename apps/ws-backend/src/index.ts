import WebSocket, {WebSocketServer} from "ws";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";
import { prismaClient } from "@repo/db/client";

const wss = new WebSocketServer({ port: 8080 });


// Here we are not persisting things to Database 
//Anyone can send the message even he has not authorised from the database 
//No Permission like Certain  people can join certain rooms 

interface User {
  ws:WebSocket,
  rooms:string[],
  userId:string

}

const users:User[]=[];


  function checkUser(token:string):string|null{
  try{
  const decoded = jwt.verify(token,JWT_SECRET);
  if(typeof decoded=='string'){
    return null;
  }
  if(!decoded || !decoded.userId){
    return null;
  }
  return decoded.userId;
}catch(e){
  return null;
}
return null;
}


wss.on('connection', function connection(ws,request) {  
  const url = request.url;
  if (!url) {
    return;
  }
  const queryParams = new URLSearchParams(url.split('?')[1]);
  const token = queryParams.get('token')|| "";
  const userId = checkUser(token);

  if(userId==null){
    ws.close();
    return ;
  }

  users.push({
    userId,
    rooms:[],
    ws
  })

  ws.on('message', async function message(data) {
    const parsedData= JSON.parse(data as unknown as string); //{type:join_room,roomID:1}
    if(parsedData.type==="join_room"){
      const user= users.find(x=>x.ws===ws);
      user?.rooms.push(parsedData.roomId);
    }

    if(parsedData.type==="leave_room"){
      const user= users.find(x=>x.ws===ws);
      if(!user){
        return;
      }
      user.rooms = user?.rooms.filter(x=>x===parsedData.room);
      
    }

    if(parsedData.type==="chat"){
      const roomId = parsedData.roomId;
      const message= parsedData.message;
      
      //before broadcasting save the data in Databse but it will take time since its a DB call
      //Better approach - Push it queue and then pipeline 

      await prismaClient.chat.create({
        data:
        {
          roomId,
          message,
          userId
        }
      });

      users.forEach(user=>{
        if(user.rooms.includes(roomId)){
          user.ws.send(JSON.stringify({
            type:"chat",
            message:message,
            roomId
          }))
        }
      })


    }

  });

 
});