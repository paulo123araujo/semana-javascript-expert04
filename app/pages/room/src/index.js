import { constants } from "../../_shared/consts.js";
import RoomSocketBuilder from "./util/roomSocket.js";

const room = {
    id: Date.now(),
    topic: "qualquer coisa"
}

const user = {
    img: "https://cdn4.iconfinder.com/data/icons/essential-app-2/16/user-avatar-human-admin-login-256.png",
    username: "Paulo Araujo"
}

const socket = (new RoomSocketBuilder({
    socketUrl: constants.socketUrl,
    namespace: constants.socketNamespaces.room
}))
    .setOnUserConnected((user) => console.log("user connected", user))
    .setOnUserDisconnected((user) => console.log("user disconnected", user))
    .setOnLobbyUpdated((room) => console.log("lobby updated", room))
    .build();

socket.emit(constants.events.JOIN_ROOM, { user, room })
