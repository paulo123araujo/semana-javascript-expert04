import RoomsController from "./controllers/roomsController.js";
import SocketServer from "./util/socket.js";
import Event from 'events';
import { constants } from "./util/constants.js";
import LobbyController from "./controllers/lobbyController.js";

const port = process.env.PORT || 3000;
const socketServer = new SocketServer({ port });

const server = await socketServer.start();

const eventEmitterRoomAndLobby = new Event();

const roomsController = new RoomsController({
    roomsListener: eventEmitterRoomAndLobby
});
const lobbyController = new LobbyController({
    activeRooms: roomsController.rooms,
    roomsListener: eventEmitterRoomAndLobby
})
const namespaces = {
    room: { controller: roomsController, eventEmitter: eventEmitterRoomAndLobby },
    lobby: { controller: lobbyController, eventEmitter: eventEmitterRoomAndLobby }
}

const routeConfig = Object.entries(namespaces)
    .map(([namespace, { controller, eventEmitter }]) => {
        const controllerEvents = controller.getEvents()
        eventEmitter.on(
            constants.events.USER_CONNECTED,
            controller.onNewConnection.bind(controller)
        )

        return {
            [namespace]: {
                events: controllerEvents, eventEmitter
            }
        }
    });

socketServer.attachEvents(routeConfig)

console.log("Socket server is running at", server.address().port);
