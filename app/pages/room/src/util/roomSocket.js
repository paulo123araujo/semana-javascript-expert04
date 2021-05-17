import { constants } from '../../../_shared/consts.js';
import SocketBuilder from '../../../_shared/socketBuilder.js'

export default class RoomSocketBuilder extends SocketBuilder
{
    constructor({ socketUrl, namespace }) {
        super({ socketUrl, namespace });
        this.onLobbyUpdated = () => {};
    }

    setOnLobbyUpdated(fn) {
        this.onLobbyUpdated = fn;
        return this;
    }

    build() {
        const socket = super.build()

        socket.on(constants.events.LOBBY_UPDATED, this.onLobbyUpdated)

        return socket;
    }
}