import Attendee from "./entities/attendee.js";
import getTemplate from "./templates/attendeeTemplate.js";

const imgUser = document.getElementById("imgUser");
const roomTopic = document.getElementById("pTopic");
const gridSpeakers = document.getElementById("gridSpeakers");
const gridAttendees = document.getElementById("gridAttendees");
const btnMicrophone = document.getElementById("btnMicrophone");
const btnClipBoard = document.getElementById("btnClipBoard");
const btnClap = document.getElementById("btnClap");

export default class RoomView
{
    static updateUserImage({ img, username }) {
        imgUser.src = img
        imgUser.alt = username
    }

    static updateRoomTopic({ topic }) {
        roomTopic.innerHTML = topic
    }

    static updateAttendeesOnGrid(users) {
        users.forEach(item => RoomView.addAttendeeOnGrid(item))
    }

    static addAttendeeOnGrid(item, removeFirst = false) {
        const attendee = new Attendee(item)
        const htmlTemplate = getTemplate(attendee)
        const baseElement = attendee.isSpeaker ? gridSpeakers : gridAttendees

        if (removeFirst) {
            RoomView.removeItemFromGrid(attendee.id)
            baseElement.innerHTML += htmlTemplate;
            return;
        }

        const existingItem = RoomView._getExistingItemOnGrid(attendee.id, baseElement)
        if (existingItem) {
            existingItem.innerHTML = htmlTemplate;
            return;
        }

        baseElement.innerHTML += htmlTemplate

    }

    static _getExistingItemOnGrid({ id, baseElement = document }) {
        const existingItem = baseElement.querySelector(`[id="${id}"]`)
        return existingItem
    }

    static removeItemFromGrid(id) {
        const existingElement = RoomView._getExistingItemOnGrid({ id })
        existingElement?.remove()
    }

    static showUserFeatures(isSpeaker) {
        if (!isSpeaker) {
            btnMicrophone.classList.add("hidden")
            btnClipBoard.classList.add("hidden")
            btnClap.classList.remove("hidden")
            return;
        }

        btnClap.classList.add("hidden")
        btnMicrophone.classList.remove("hidden")
        btnClipBoard.classList.remove("hidden")
    }

    static _createAudioElement({ muted = true, srcObject }) {
        const audio = document.createElement("audio");
        audio.muted = muted;
        audio.srcObject = srcObject;

        audio.addEventListener("loadedmetadata", async () => {
            try {
                await audio.play()
            } catch (error) {
                console.log("error to play", error);
            }
        });
    }

    static renderAudioElement({ calledId, stream, isCurrentId }) {
        RoomView._createAudioElement({
            muted: isCurrentId,
            srcObject: stream
        });
    }
}