export const constants = {
    socketUrl: "http://localhost:3000",
    socketNamespaces: {
        room: "room",
        lobby: "lobby"
    },
    peerConfig: Object.values({
        id: undefined
    }),
    events: {
        USER_CONNECTED: "userConnection",
        USER_DISCONNECTED: "userDisconnection",

        JOIN_ROOM: "joinRoom",

        LOBBY_UPDATED: "lobbyUpdated",

        UPGRADED_USER_PERMISSION: "upgradeUserPermission"
    }
}
