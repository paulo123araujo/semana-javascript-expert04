import { constants } from "../../_shared/consts.js";


export default class RoomController
{
    constructor({ socketBuilder, roomInfo, view, peerBuilder, service }) {
        this.socketBuilder = socketBuilder;
        this.roomInfo = roomInfo;
        this.view = view;
        this.peerBuilder = peerBuilder;
        this.service = service
        this.socket = {};
    }

    async static initialize(deps) {
        return new RoomController(deps);
    }

    async _initialize() {
        this._setupViewEvents()
        this.service.init();
        this.socket = this._setupSocket()
        this.service.setCurrentPeer(await this._setupWebRTC());

        this.socket.emit(constants.events.JOIN_ROOM, { roomInfo })
    }

    _setupViewEvents() {
        this.view.updateUserImage(this.roomInfo.user)
        this.view.updateRoomTopic(this.roomInfo.room)
    }

    _setupSocket() {
        return this.socketBuilder
            .setOnUserConnected(this.onUserConnected())
            .setOnUserDisconnected(this.onUserDisconnected())
            .setOnLobbyUpdated(this.onLobbyUpdated())
            .setOnUserProfileUpgrade(this.onUserProfileUpgrade())
            .build();
    }

    _setupWebRTC() {
        return this.peerBuilder
            .setOnError(this.onPeerError())
            .onConnectionOpened(this.onPeerConnectionOpened())
            .setOnCallReceived(this.onPeerCallReceived())
            .setOnCallError(this.onPeerCallError())
            .setOnCallClose(this.onPeerCallClose())
            .setOnStreamReceived(this.onPeerStreamReceived())
            .build()
    }

    onPeerStreamReceived() {
        return (call, stream) => {
            console.log("Stream received", call, stream)
            const calledId = call.peer;
            const { isCurrentId } = this.service.addReceivedPeer(call);
            this.view.renderAudioElement({
                calledId,
                stream,
                isCurrentId
            });
        };
    }

    onPeerCallClose() {
        return (call) => {
            console.log("Call Close", call);
            this.service.disconnectPeer({ peerId: call.peer })
        };
    }

    onPeerCallError() {
        return (call, error) => {
            console.log("Call Error", call, error)
        };
    }

    onPeerCallReceived() {
        return async (call) => {
            const stream = await this.service.getCurrentStream();
            console.log("answering call");
            call.answer(stream)
        };
    }

    onPeerError() {
        return error => {
            console.log("eerroou", error)
        }
    }

    onPeerConnectionOpened() {
        return peer => {
            this.roomInfo.user.peerId = peer.id
            this.socket.emit(constants.events.JOIN_ROOM, this.roomInfo)
        }
    }

    onUserProfileUpgrade() {
        return (user) => {
            console.log("user upgraded", user)
            this.service.upgradeUserPermission(user)
            this.activateUserFeatures()
            if (user.isSpeaker) {
                this.view.addAttendeeOnGrid(user, true)
            }
        }
    }

    onUserConnected() {
        return (user) => {
            console.log("user connected", user)
            this.view.addAttendeeOnGrid(user)
            this.service.callNewUser(user);
        };
    }

    onUserDisconnected() {
        return (user) => {
            this.view.removeItemFromGrid(user.id)
            console.log("user disconnected", user)
            this.service.disconnectPeer({ peerId: user.peerId })
        };
    }

    onLobbyUpdated() {
        return (room) => {
            console.log("lobby updated", room)
            this.service.updateCurrentUserProfile(room.users)
            this.view.updateAttendeesOnGrid(room)
            this.activateUserFeatures()
        };
    }

    activateUserFeatures() {
        const currentUser = this.service.getCurrentUser();
        this.view.showUserFeatures(currentUser.isSpeaker);
    }
}