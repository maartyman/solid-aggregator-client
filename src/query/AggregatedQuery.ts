import {Logger} from "tslog";
import {QueryContext} from "../utils/queryContext";
import {Query} from "./Query";
import {LocalQuery} from "./LocalQuery";
import {Bindings} from "@comunica/bindings-factory";
import {WebSocketClient} from "../http/webSocketClient";
import {SolidClient} from "../classes/SolidClient";
import {connection} from "websocket";
import fetch from "cross-fetch";
import {jsonToBindings} from "../utils/jsonToBindings";

export class AggregatedQuery extends Query {
  private logger = new Logger();
  private UUID: string | undefined;
  private readonly solidClient: SolidClient;
  private connection?: connection;
  private makingConnection = false;
  private subscribedWSReadyFunctions = new Array<() => void>();
  private addedRegEx = new RegExp(/added (.+)/);
  private removedRegEx = new RegExp(/removed (.+)/);

  constructor(solidClient: SolidClient, queryContext: QueryContext, queryBindings?: Array<Bindings>) {
    super(queryContext, queryBindings);

    this.solidClient = solidClient;

    const queryExplanation = {
      queryString: queryContext.query,
      sources: queryContext.sources,
      reasoningRules: queryContext.reasoningRules,
      lenient: true,
      comunicaVersion: queryContext.comunicaVersion,
      comunicaContext: queryContext.comunicaContext
    }

    if (!solidClient.aggregationServerUrl) {
      throw new Error("aggregationServerUrl not defined, this shouldn't happen!");
    }

    fetch(solidClient.aggregationServerUrl, {
      method: "POST",
      body: JSON.stringify(queryExplanation),
      headers: {
        'Content-Type': 'application/json'
      }
    }).then((response) => {
      if (response.status == 200 || response.status == 201) {
        const tempUUID = response.headers.get("location");
        if (tempUUID) {
          this.UUID = tempUUID.toString();

          if (!this.solidClient.aggregationServerUrl) {
            throw new Error("aggregationServerUrl not defined, this shouldn't happen!")
          }

          WebSocketClient.getInstance().connectToAggregatorReady(
            this.solidClient.aggregationServerUrl,
            (conn: connection) => {
              this.logger.debug("connectToAggregatorReady: connection established")
              conn.sendUTF(tempUUID.toString());
              this.subscribeOnReady(() => {
                conn.close();
              });
              conn.on("message", (message) => {
                if (message.type === 'utf8') {
                  this.logger.debug(message.utf8Data);
                  if (message.utf8Data === "initialized") {
                    this.logger.debug("query initialized");
                    this.queryReady = true;
                    this.afterQueryReady();
                  }
                }
              });
            }
          );

        }
        else {
          this.logger.debug("Response didn't mention query location");
        }
      }
    });
    this.logger.info("AggregatedQuery instantiated");
  }

  async streamBindings(cb: (bindings: Bindings, addition: boolean) => void ): Promise<void> {
    if (!this.makingConnection) {
      this.makingConnection = true;
      this.makeBindingWS();
    }
    if (!this.connection) {
      await this.WSReadyPromise();
    }
    if (!this.connection) {
      throw new Error("connection undefined, this shouldn't happen!");
    }
    this.connection.on("message", (message) => {
      this.logger.debug("incoming message:")
      if (message.type === 'utf8') {
        let tempMessage = this.addedRegEx.exec(message.utf8Data);
        if (tempMessage && tempMessage[1]) {
          cb(jsonToBindings(tempMessage[1]), true);
          return;
        }

        tempMessage = this.removedRegEx.exec(message.utf8Data);
        if (tempMessage && tempMessage[1]) {
          cb(jsonToBindings(tempMessage[1]), false);
        }
      }
    });
  }

  private async makeBindingWS(): Promise<void> {
    await this.queryReadyPromise();

    if (!this.solidClient.aggregationServerUrl) {
      throw new Error("aggregationServerUrl not defined, this shouldn't happen!");
    }

    WebSocketClient.getInstance().connectToAggregatorBindings(
      this.solidClient.aggregationServerUrl,
      (conn: connection) => {
        this.logger.debug("connectToAggregatorBindings: connection established")
        if (!this.UUID) {
          throw new Error("UUID is undefined, this shouldn't happen!");
        }
        conn.sendUTF(this.UUID.toString());
        this.connection = conn;
        this.afterWSReady();
      }
    );
  }

  private async WSReadyPromise(): Promise<void> {
    if (!this.connection) {
      await new Promise<void>((resolve, reject) => {
        this.subscribeOnWSReady(() => {
          resolve();
        });
      })
    }
  }

  private subscribeOnWSReady(cb: () => void): void {
    this.subscribedWSReadyFunctions.push(cb);
  }

  private afterWSReady() {
    this.subscribedWSReadyFunctions.forEach((cb) => {
      cb();
    });
  }


  async getBindings(): Promise<Bindings[]> {
    if (!this.solidClient.aggregationServerUrl) {
      throw new Error("aggregationServerUrl not defined (this shouldn't happen, something is wrong in the package)")
    }

    await this.queryReadyPromise();

    const response = await fetch(this.solidClient.aggregationServerUrl + `/` + this.UUID, {
      method: "GET",
    });

    if (response.status == 200 && response.body) {
      const parsedData = await response.json();

      this.logger.debug("Received: ");
      for (const binding of parsedData){
        this.logger.debug("\t bindings: ");
        for (const element of Object.keys(binding.entries)) {
          this.logger.debug("\t\t" + element + ": " + binding.entries[element].value);
        }
      }

      this.queryBindings = parsedData;
    }
    else {
      this.logger.error(response.status.toString());
    }
    return this.queryBindings;
  }

  switchQueryType(): LocalQuery {
    //TODO implement
    return new LocalQuery(this.solidClient, this.queryContext, this.queryBindings);
  }
}
