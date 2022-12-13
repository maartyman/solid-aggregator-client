"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebSocketClient = void 0;
const tslog_1 = require("tslog");
const websocket_1 = require("websocket");
const loggerSettings_1 = require("../utils/loggerSettings");
class WebSocketClient {
    constructor() {
        this.logger = new tslog_1.Logger(loggerSettings_1.loggerSettings);
        this.protocolVersion = "1.0";
        this.generalProtocol = "solid-aggregator-" + this.protocolVersion;
        this.bindingProtocol = this.generalProtocol + "#bindings";
        this.readyProtocol = this.generalProtocol + "#ready";
        this.websockets = new Array();
    }
    static setInstance() {
        if (this.instance == null) {
            this.instance = new WebSocketClient();
        }
        return this.instance;
    }
    static getInstance() {
        if (this.instance == null) {
            throw new ReferenceError("WebSocketClient was not yet instantiated");
        }
        return this.instance;
    }
    connect(host, connectCB, protocol) {
        const wsClient = new websocket_1.client();
        this.websockets.push(wsClient);
        wsClient.on('connectFailed', (error) => {
            this.logger.debug('Connect Error: ' + error.toString());
        });
        wsClient.on('connect', (connection) => {
            this.logger.debug('WebSocket Client Connected');
            connectCB(connection);
            connection.on('error', (error) => {
                this.logger.error("Connection Error: " + error.toString());
            });
            connection.on('close', () => {
                this.logger.debug('Connection Closed');
            });
        });
        wsClient.connect(host, protocol);
    }
    connectToAggregator(host, connectCB) {
        this.connect(host, connectCB, this.generalProtocol);
    }
    connectToAggregatorReady(host, connectCB) {
        this.connect(host, connectCB, this.readyProtocol);
    }
    connectToAggregatorBindings(host, connectCB) {
        this.connect(host, connectCB, this.bindingProtocol);
    }
}
exports.WebSocketClient = WebSocketClient;
