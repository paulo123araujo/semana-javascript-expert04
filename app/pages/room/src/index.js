import { constants } from "../../_shared/consts.js";
import peerBuilder from "../../_shared/peerBuilder.js";
import RoomController from "./controller.js";
import RoomService from "./service.js";
import RoomSocketBuilder from "./util/roomSocket.js";
import RoomView from "./view.js";
import Media from '../../_shared/media.js';

const urlParams = new URLSearchParams(window.location.search)
const keys = ["id", "topic"]
const urlData = keys.map(key => [key, urlParams.get(key)])

const room = {
    ...Object.fromEntries(urlData)
}

const user = {
    img: "https://cdn4.iconfinder.com/data/icons/essential-app-2/16/user-avatar-human-admin-login-256.png",
    username: "Paulo Araujo"
}

const peerBuilder = new peerBuilder({
    peerConfig: constants.peerConfig
});

const socketBuilder = new RoomSocketBuilder({
    socketUrl: constants.socketUrl,
    namespace: constants.socketNamespaces.room
});

const roomInfo = { room, user };

const roomService = new RoomService({
    media: Media
})

const deps = {
    socketBuilder,
    roomInfo,
    view: RoomView,
    peerBuilder,
    service: roomService
}

await RoomController.initialize(deps);
