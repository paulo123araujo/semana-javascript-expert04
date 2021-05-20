import Room from './entities/room.js'
import getTemplate from './templates/lobbyItemTemplate.js'

const roomGrid = document.getElementById("roomGrid");
const imgUser = document.getElementById("imgUser");
const createWithoutTopicButton = document.getElementById("btnCreateRoomWithoutTopic");
const createTopicButton = document.getElementById("btnCreateRoomWithTopic");
const txtTopic = document.getElementById("extTopic");

export default class LobbyView
{
    static clearRoomList() {
        roomGrid.innerHTML = ""
    }

    static redirectToRoom(topic = "") {
        const uniqueId = Date.now().toString(36) + Math.random().toString(36).substring(2);
        window.location = LobbyView.generateRoomLink({ id: uniqueId, topic });
    }

    static configureCreateRoomButton() {
        createWithoutTopicButton.addEventListener("click", () => {
            LobbyView.redirectToRoom()
        })
        createTopicButton.addEventListener("click", () => {
            const topic = txtTopic.value
            LobbyView.redirectToRoom(topic)
        })
    }

    static generateRoomLink({ id, topic }) {
        return `./../room/index.html?id=${id}&topic=${topic}`;
    }

    static updateRoomList(rooms) {
        LobbyView.clearRoomList()
        rooms.forEach(room => {
            const params = new Room({
                ...room,
                roomLink: LobbyView.generateRoomLink(room)
            });

            const htmlTemplate = getTemplate(params)
            roomGrid.innerHTML += htmlTemplate
        });
    }

    static updateUserImage({ img, username }) {
        imgUser.src = img
        imgUser.alt = username
    }
}