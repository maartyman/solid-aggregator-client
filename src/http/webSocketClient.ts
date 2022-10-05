import {Logger} from "tslog";
import {client, connection, Message} from "websocket";

export class WebSocketClient {
  private readonly logger = new Logger();
  private static instance: WebSocketClient;
  private wsClient = new client();
  private readonly protocolVersion = "1.0";
  private readonly generalProtocol = "solid-aggregator-" + this.protocolVersion;
  private readonly bindingProtocol = this.generalProtocol + "#bindings";
  private readonly readyProtocol = this.generalProtocol + "#ready";

  constructor() {
    this.wsClient.on('connectFailed', (error) => {
      this.logger.debug('Connect Error: ' + error.toString());
    });
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

  public connect(host: string, connectCB: (conn: connection) => void, messageCB: (message: Message) => void, protocol?: string) {
    this.wsClient.on('connect', (connection) => {
      this.logger.debug('WebSocket Client Connected');
      connectCB(connection);
      connection.on('error', (error) => {
        this.logger.error("Connection Error: " + error.toString());
      });
      connection.on('close', () => {
        this.logger.debug('Connection Closed');
      });
      connection.on('message', messageCB);
    });

    this.wsClient.connect(host, protocol);
  }

  public connectToAggregator(host: string, connectCB: (conn: connection) => void, callBackFn: (message: Message) => void) {
    this.connect(host, connectCB, callBackFn, this.generalProtocol);
  }

  public connectToAggregatorReady(host: string, connectCB: (conn: connection) => void, callBackFn: (message: Message) => void) {
    this.connect(host, connectCB, callBackFn, this.readyProtocol);
  }

  public connectToAggregatorBindings(host: string, connectCB: (conn: connection) => void, callBackFn: (message: Message) => void) {
    this.connect(host, connectCB, callBackFn, this.bindingProtocol);
  }
}
