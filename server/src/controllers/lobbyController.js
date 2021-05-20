import { constants } from "../util/constants";

export default class LobbyController
{
    constructor({ activeRooms, roomsListener }) {
        this.activeRooms = activeRooms;
        this.roomsListener = roomsListener;
    }

    onNewConnection(socket) {
        const { id } = socket;
        console.log("lobby connection established", id);
        this.#updateLobbyRooms(socket, [...this.activeRooms.values()])
        this.#activateEventProxy(socket)
    }

    #activateEventProxy(socket) {
        this.roomsListener.on(constants.events.LOBBY_UPDATED, rooms => {
            this.#updateLobbyRooms(socket, rooms)
        })
    }

    #updateLobbyRooms(socket, activeRooms) {
        socket.emit(constants.events.LOBBY_UPDATED, activeRooms)
    }

    getEvents() {
        const functions = Reflect.ownKeys(LobbyController.prototype)
            .filter(fn => fn !== "constructor")
            .map(name => [name, this[name].bind(this)]);

        return new Map(functions);
    }
}