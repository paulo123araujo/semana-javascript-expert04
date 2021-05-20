import Attendee from "../domain/attendee.js";
import Room from "../domain/room.js";
import { constants } from "../util/constants.js";
import CustomMap from "../util/customMap.js";

export default class RoomsController
{
    #users = new Map();

    constructor ({ roomsListener }) {
        this.roomsListener = roomsListener;
        this.rooms = new CustomMap({
            observer: this.#roomObserver(),
            customMapper: this.#mapRoom.bind(this)
        });
    }

    notifyRoomSubscribers(rooms) {
        const event = constants.events.LOBBY_UPDATED
        this.roomsListener.emit(event, [...rooms.values()])
    }

    #roomObserver() {
        return {
            notify: rooms => this.notifyRoomSubscribers(rooms)
        }
    }

    #joinUserRoom(socket, user, room) {
        const roomId = room.id;
        const existingRoom = this.rooms.has(roomId);
        const currentRoom = existingRoom ? this.rooms.get(roomId) : {}
        const currentUser = new Attendee({
            ...user,
            roomId
        });

        const [owner, users] = existingRoom ?
            [currentRoom.owner, currentRoom.users] :
            [currentUser, new Set()];

        const updatedRoom = this.#mapRoom({
            ...currentRoom,
            ...room,
            owner,
            users: new Set([ ...users, ...[currentUser] ])
        });

        this.rooms.set(roomId, updatedRoom);

        socket.join(roomId);

        return this.rooms.get(roomId);
    }

    #notifyUsersOnRoom(socket, roomId, user) {
        const event = constants.events.USER_CONNECTED;
        socket.to(roomId).emit(event, user);
    }

    #mapRoom(room) {
        const users = [...room.users.values()];
        const speakersCount = users.filter(user => user.isSpeaker).length
        const featuredAttendees = users.slice(0,3);
        const mappedRoom = new Room({
            ...room,
            featuredAttendees,
            speakersCount,
            attendeesCount: room.users.size
        });

        return mappedRoom
    }

    #updateGlobalUserData(userId, userData = {}, roomId = "") {
        const user = this.#users.get(userId) ?? {}
        const existingRoom = this.rooms.has(roomId);

        const updatedUserData = new Attendee({
            ...user,
            ...userData,
            roomId,
            isSpeaker: !existingRoom
        });

        this.#users.set(userId, updatedUserData);
        return this.#users.get(userId);
    }

    #replyWithActiveUsers(socket, users) {
        const event = constants.events.LOBBY_UPDATED;
        socket.emit(event, [...users.values()]);
    }

    onNewConnection(socket) {
        const { id } = socket;
        console.log("connection established with", id)
        this.#updateGlobalUserData(id);
    }

    disconnect() {
        console.log("disconnect", socket.id);
        this.#logoutUser(socket);
    }

    #notifyUserProfileUpgrade(socket, roomId, user) {
        socket.to(roomId).emit(constants.events.UPGRADED_USER_PERMISSION, user);
    }

    #logoutUser(socket) {
        const userId = socket.id;
        const user = this.#users.get(userId);
        const roomId = user.roomId;
        this.#users.delete(userId);

        if (!this.rooms.has(roomId)) {
            return;
        }

        const room = this.rooms.get(roomId);
        const toBeRemoved = [...room.users].find(({ id }) => id === userId);
        room.users.delete(toBeRemoved);

        if (!room.users.size) {
            this.rooms.delete(roomId);
            return;
        }

        const disconnectedUserWasOwner = userId === room.owner.id;
        const onlyOneUserLeft = room.size === 1;

        if (onlyOneUserLeft || disconnectedUserWasOwner) {
            room.owner = this.#getNewRoomOwner(room, socket)
        }

        this.rooms.set(roomId, room);

        socket.to(roomId).emit(constants.events.USER_DISCONNECTED, user);
    }

    #getNewRoomOwner(room, socket) {
        const users = [...room.users.values()];
        const activeSpeakers = users.find(user => user.isSpeaker);
        const [newOwner] = activeSpeakers ? [activeSpeakers] : users;
        newOwner.isSpeaker = true;

        const outdatedUser = this.#users.get(newOwner.id);
        const updatedUser = new Attendee({
            ...outdatedUser,
            ...newOwner
        });

        this.#users.set(newOwner.id, updatedUser)

        this.#notifyUserProfileUpgrade(socket, room.id, newOwner);

        return newOwner
    }

    joinRoom(socket, { user, room }) {
        const userId = user.id = socket.id;
        const roomId = room.id;

        const updatedUserData = this.#updateGlobalUserData(userId, user, roomId);

        const updatedRoom = this.#joinUserRoom(socket, updatedUserData, room);

        this.#notifyUsersOnRoom(socket, roomId, updatedUserData);
        this.#replyWithActiveUsers(socket, updatedRoom.users)
    }

    getEvents() {
        const functions = Reflect.ownKeys(RoomsController.prototype)
            .filter(fn => fn !== "constructor")
            .map(name => [name, this[name].bind(this)]);
        
        return new Map(functions);
    }
}