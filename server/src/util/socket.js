import http from 'http'
import { Server } from 'socket.io'
import { constants } from './constants.js';


export default class SocketServer
{
    #io
    constructor({ port }) {
        this.port = port;
        this.namespaces = {}
    }

    attachEvents({ routeConfig }) {
        for (const routes of routeConfig) {
            for (const [namespace, { events, eventEmitter }] of Object.entries(routes)) {
                const route = this.#io.namespaces[namespace] = this.#io.of(`/${namespace}`);
                route.on('connection', socket => {
                    for (const [key, fn] of events) {
                        socket.on(key, (...args) => fn(socket, ...args))
                    }

                    eventEmitter.emit(constants.events.USER_CONNECTED, socket)
                })
            }
        }
    }

    async start() {
        const server = http.createServer((request, response) => {
            response.writeHead(200, {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
            })

            response.end("Hey there!")
        });

        this.#io = new Server(server, {
            cors: {
                origin: "*",
                credentials: false
            }
        });

        const room = this.#io.off("/room");

        return new Promise((resolve, reject) => {
            server.on("error", reject)

            server.listen(this.port, () => resolve(server))
        })
    }
}
