import {Logger} from "tslog";
import {loggerSettings} from "../utils/loggerSettings";
import {QueryContext} from "../utils/queryContext";
import {Query} from "./Query";
import {LocalQuery} from "./LocalQuery";
import {Bindings} from "@comunica/bindings-factory";
import {WebSocketClient} from "../http/webSocketClient";
import {SolidClient} from "../classes/SolidClient";
import {connection, Message} from "websocket";
import fetch from "cross-fetch";

export class AggregatedQuery extends Query {
  private logger = new Logger();
  private UUID: string | undefined;
  private readonly solidClient: SolidClient;

  constructor(solidClient: SolidClient, queryContext: QueryContext, queryBindings?: Array<Bindings>) {
    super(queryContext, queryBindings);
    new Logger(loggerSettings).info("AggregatedQuery");

    this.solidClient = solidClient;

    const queryExplanation = {
      queryString: queryContext.query,
      sources: queryContext.sources,
      reasoningRules: queryContext.reasoningRules,
      lenient: true,
      comunicaVersion: queryContext.comunicaVersion,
      comunicaContext: queryContext.comunicaContext
    }

    fetch("http://localhost:3001", {
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
            throw new Error("aggregationServerUrl not defined (this shouldn't happen, something is wrong in the package)")
          }

          WebSocketClient.getInstance().connectToAggregatorReady(
            this.solidClient.aggregationServerUrl,
            (conn: connection) => {
              conn.sendUTF(tempUUID.toString());
              this.subscribeOnReady(() => {
                conn.close();
              });
            },
            (message: Message) => {
              if (message.type === 'utf8') {
                this.logger.debug(message.utf8Data);
                if (message.utf8Data === "initialized") {
                  this.logger.debug("query initialized");
                  this.queryReady = true;
                  this.afterQueryReady();
                }
              }
            }
          );
        }
        else {
          this.logger.debug("Response didn't mention query location");
        }
      }
    });
  }

  streamBindings(callBackFn: (bindings: Bindings) => void ): void {

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
      for (const binding of parsedData.bindings){
        this.logger.debug("\t bindings: ");
        for (const element of Object.keys(binding.entries)) {
          this.logger.debug("\t\t" + element + ": " + binding.entries[element].value);
        }
      }

      return parsedData;
    }
    else {
      this.logger.error(response.status.toString());
    }
    return [];
  }

  switchQueryType(): LocalQuery {
    //TODO implement
    return new LocalQuery(this.solidClient, this.queryContext, this.queryBindings);
  }
}
