import express from 'express'
import { Server } from "socket.io"
import http from 'http'
import path from 'path'
import { fileURLToPath } from 'url';
import Filter from 'bad-words';
import { getTimeWithMessage } from './time.js';
import { addUser,removeUser,getUser,getUsersInRoom } from './utils/users.js';

const app = express()
const server = http.createServer(app)
const io = new Server(server);
const port = process.env.PORT || 3000

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDirectory = path.join(__dirname,'../public')


app.use(express.json())
app.use(express.static(publicDirectory))

io.on('connection',(socket)=>{
    console.log('connection full filled')   

    socket.on('join', (options, callback) => {
        const { error, user } = addUser({ id: socket.id, ...options })
        if(error) {
            return callback(error)
        }
    socket.join(user.room)

    socket.emit('message',getTimeWithMessage('Admin','Welcome'))
    socket.broadcast.to(user.room).emit('message',getTimeWithMessage('Admin',`${user.username}joined please welcome him`))
    io.to(user.room).emit('roomData',{
        room:user.room,
        users : getUsersInRoom(user.room)
    })
    callback()
    })
    


    socket.on('sendMessage',(message,callback)=>{
        const user = getUser(socket.id)
        const filter = new Filter()
        if(filter.isProfane(message)) {
            callback('bad words are not allowed')
        }
       io.to(user.room).emit('message',getTimeWithMessage(user.username,message))
       callback()
    })

    socket.on('disconnect',()=>{
        const removedUser = removeUser(socket.id)
        if(removedUser) {
            io.to(removedUser.room).emit('message',getTimeWithMessage('Admin',`${removedUser.username} left the chat`))
            io.to(removedUser.room).emit('roomData',{
                room:removedUser.room,
                users : getUsersInRoom(removedUser.room)
            })
        }
       
    })

    socket.on('location',(data,callback)=>{
        //console.log(data.lat,data.lon)
        const user = getUser(socket.id)
        io.to(user.room).emit('locationMessage',getTimeWithMessage(user.username,`https://google.com/maps?q=${data.lat},${data.lon}`))
        callback()
    })

   

})
server.listen(port,()=>{
    console.log(`application up and running port:${port}!`)
})