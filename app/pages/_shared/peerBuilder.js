class PeerCustomModule extends globalThis.Peer
{
    constructor({ config, onCall }) {
        super(config)

        this.onCall = onCall;
    }

    call(...args) {
        const originalCallResult = super.call(...args)
        this.onCall(originalCallResult)
    }
}

export default class peerBuilder
{
    constructor({ peerConfig }) {
        this.peerConfig = peerConfig;
        this.onError = () => {};
        this.onConnectionOpened = () => {};
        this.onCallError = () => {};
        this.onCallClose = () => { };
        this.onCallReceived = () => { };
        this.onStreamReceived = () => { };
    }

    setOnError(fn) {
        this.onError = fn;
        return this;
    }

    setOnCallError(fn) {
        this.onCallError = fn;
        return this;
    }

    setOnCallClose(fn) {
        this.onCallClose = fn;
        return this;
    }

    setOnCallReceived(fn) {
        this.onCallReceived = fn;
        return this;
    }

    setOnStreamReceived(fn) {
        this.onStreamReceived = fn;
        return this;
    }

    setOnConnectionOpened() {
        this.onConnectionOpened = fn;
        return this;
    }

    _prepareCallEvent(call) {
        call.on("stream", (stream) => this.onStreamReceived(call, stream))
        call.on("error", (error) => this.onCallError(call, error))
        call.on("close", () => this.onCallClose(call))

        this.onCallReceived(call)
    }

    build() {
        const peer = new PeerCustomModule({
            config: [...this.peerConfig],
            onCall: this._prepareCallEvent.bind(this)
        })
        peer.on("error", this.onError)
        peer.on("call", this._prepareCallEvent.bind(this))

        return new Promise((resolve) => peer.on("open", () => {
            this.onConnectionOpened(peer)
            return resolve(peer)
        }))
    }
}