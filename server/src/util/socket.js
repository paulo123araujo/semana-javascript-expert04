import http from 'http'
import { Server } from 'socket.io'


export default class SocketServer
{
    constructor({ port }) {
        this.port = port;
    }

    async start() {
        const server = http.createServer((request, response) => {
            response.writeHead(200, {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
            })

            response.end("Hey there!")
        });

        this.socketIO = new Server(server, {
            cors: {
                origin: "*",
                credentials: false
            }
        });

        const room = this.socketIO.off("/room");

        room.on("connection", socket => {
            socket.emit("userConnection", "socket id connected" + socket.id)

            socket.on("joinRoom", (data) => {
                console.log("dados recebidos", data);
            })
        })

        return new Promise((resolve, reject) => {
            server.on("error", reject)

            server.listen(this.port, () => resolve(server))
        })
    }
}
