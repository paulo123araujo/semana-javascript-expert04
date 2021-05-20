import { constants } from '../../_shared/consts.js'
import LobbyController from './controller.js';
import LobbySocketBuilder from "./util/lobbySocketBuilder.js";
import LobbyView from './view.js'

const user = {
    img: "https://cdn4.iconfinder.com/data/icons/essential-app-2/16/user-avatar-human-admin-login-256.png",
    username: "Paulo Araujo"
}

const socketBuilder = new LobbySocketBuilder({
    socketUrl: constants.socketUrl,
    namespace: constants.socketNamespaces.lobby
})

const deps = {
    socketBuilder,
    user,
    view: LobbyView
}

await LobbyController.initialize(deps);