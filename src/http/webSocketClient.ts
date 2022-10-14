import {Logger} from "tslog";
import {client, connection, Message} from "websocket";
import {loggerSettings} from "../utils/loggerSettings";

export class WebSocketClient {
  private readonly logger = new Logger(loggerSettings);
  private static instance: WebSocketClient;
  private readonly protocolVersion = "1.0";
  private readonly generalProtocol = "solid-aggregator-" + this.protocolVersion;
  private readonly bindingProtocol = this.generalProtocol + "#bindings";
  private readonly readyProtocol = this.generalProtocol + "#ready";

  private websockets = new Array<client>();

  constructor() {
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

  public connect(host: string, connectCB: (conn: connection) => void, protocol?: string) {
    const wsClient = new client();

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

  public connectToAggregator(host: string, connectCB: (conn: connection) => void) {
    this.connect(host, connectCB, this.generalProtocol);
  }

  public connectToAggregatorReady(host: string, connectCB: (conn: connection) => void) {
    this.connect(host, connectCB, this.readyProtocol);
  }

  public connectToAggregatorBindings(host: string, connectCB: (conn: connection) => void) {
    this.connect(host, connectCB, this.bindingProtocol);
  }
}
