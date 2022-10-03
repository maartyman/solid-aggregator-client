import {Logger} from "tslog";
import {client, Message} from "websocket";

export class WebSocketClient {
  private readonly logger = new Logger();
  private static instance: WebSocketClient;
  private wsClient = new client();

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

  public connect(host: string, callBackFn: (message: Message) => void, protocol?: string) {
    this.wsClient.on('connect', (connection) => {
      this.logger.debug('WebSocket Client Connected');
      connection.on('error', (error) => {
        this.logger.debug("Connection Error: " + error.toString());
      });
      connection.on('close', () => {
        this.logger.debug('Connection Closed');
      });
      connection.on('message', callBackFn);
    });

    this.wsClient.connect(host, protocol);
  }

}
