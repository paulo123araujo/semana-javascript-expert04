class Attendee {
    constructor({ id, username, img }) {
        this.id = id;
        this.username = username;
        this.img = img;
    }
}

export default class Room {
    constructor({
        id, topic,subTopic, roomLink, attendeesCount, speakersCount,
        featuredAttendees, owner
    }) {
        this.id = id;
        this.topic = topic;
        this.subTopic = subTopic || "Teste";
        this.attendeesCount = attendeesCount;
        this.speakersCount = speakersCount;
        this.featuredAttendees = featuredAttendees?.map(attendee => new Attendee(attendee))
        this.owner = new Attendee(owner);
        this.roomLink = roomLink;
    }
}