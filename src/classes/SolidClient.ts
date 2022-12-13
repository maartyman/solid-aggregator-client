import {RDFResource} from "./RDFResource";
import N3, {DataFactory, Parser, Store} from "n3";
import {IResource} from "./interfaces/IResource";
import {N3StoreToTriples} from "../utils/N3StoreToTurtle";
import {Query} from "../query/Query";
import {QueryFactory} from "../query/QueryFactory";
import {QueryContext} from "../utils/queryContext";
import {AggregatedQuery} from "../query/AggregatedQuery";
import {LocalQuery} from "../query/LocalQuery";
import {WebSocketClient} from "../http/webSocketClient";
import fetch from "cross-fetch";
import {loggerSettings} from "../utils/loggerSettings";
import {Logger, TLogLevelName} from "tslog";

/*
SolidClient:
  init:
    -make save folder (if it doesn't exist yet)
    -get save files and return it
    -give application aggregator url
    -custom fetch function (authentication)

  make query:
    give query and variables
    =>
    determine to run client side or aggregator (or let developer decide)
    => return appropriate query object
 */

export class SolidClient {
  public readonly podUrl: string;
  public readonly customFetch: ((input: RequestInfo | URL, init?: RequestInit | undefined) => Promise<Response>);
  public readonly aggregationServerUrl?: string;
  private readonly webSocketClient;
  private readonly logger;

  constructor(podUrl: string, customFetch?: (input: RequestInfo | URL, init?: RequestInit | undefined) => Promise<Response>, aggregationServerUrl?: string, debug?: TLogLevelName) {
    //TODO make sure the URL's are normalized (no trailing backslash)

    loggerSettings.minLevel = debug;
    this.podUrl = podUrl;
    this.customFetch = customFetch? customFetch : fetch;
    this.aggregationServerUrl = aggregationServerUrl;
    this.logger = new Logger(loggerSettings);
    this.webSocketClient = WebSocketClient.setInstance();
  }

  public makeQuery(queryContext: QueryContext): Query {
    //TODO check aggregator availability
    if(queryContext.aggregated && this.aggregationServerUrl) {
      return QueryFactory.makeAggregatedQuery(this, queryContext);
    }
    else {
      return QueryFactory.makeLocalQuery(this, queryContext);
    }
  }

  public switchQueryType(query: AggregatedQuery | LocalQuery): boolean {
    //query = query.switchQueryType();
    //TODO implement
    throw new Error("Function switchQueryType() is not yet implemented");
    return true;
  }

  public async makeResource(resource: IResource) {
    let body;
    if (resource.data instanceof N3.Store) {
      body = await N3StoreToTriples(resource.data);
    }
    else if(resource.data) {
      body = resource.data;
    }
    else {
      body = "";
    }

    return this.customFetch(
      resource.url,
      {
        method: "PUT",
        body: body,
        headers: {
          "Content-Type": resource.contentType,
        }
      }
    );
    /*
    curl -X PUT -H "Content-Type: text/plain" \
    -d "abc" \
    http://localhost:3000/myfile.txt

    curl -X PUT -H "Content-Type: text/turtle" \
    -d "<ex:s> <ex:p> <ex:o>." \
    http://localhost:3000/myfile.ttl
     */
  }

  public async getResource(resource: IResource, accept?: string) {
    if (resource instanceof RDFResource) {
      return this.customFetch(
        resource.url,
        {
          method: "GET",
        }
      ).then(async (response) => {
        let text = await response.text();
        const parser = new Parser({
          blankNodePrefix: ""
        });
        let quads = parser.parse(text);
        resource.data = new Store(quads, {
          factory: DataFactory
        });
        return;
      });
    }
    else if (accept) {
      return this.customFetch(
        resource.url,
        {
          method: "GET",
          headers: {
            "Accept": accept,
          }
        }
      ).then(async (response) => {
        resource.data = await response.text();
        return;
      });
    }
    else {
      return this.customFetch(
        resource.url,
        {
          method: "GET"
        }
      ).then(async (response) => {
        resource.data = await response.text();
        return;
      });
    }
    /*
    Retrieve a plain text file:

      curl -H "Accept: text/plain" \
        http://localhost:3000/myfile.txt

      Retrieve a turtle file:

      curl -H "Accept: text/turtle" \
        http://localhost:3000/myfile.ttl

      Retrieve a turtle file in a different serialization:

      curl -H "Accept: application/ld+json" \
        http://localhost:3000/myfile.ttl
     */
  }

  public async deleteResource(resource: IResource) {
    await this.customFetch(
      resource.url,
      {
        method: "DELETE"
      }
    );
    /*
    curl -X DELETE http://localhost:3000/myfile.txt
     */
  }

  public async addTriplesToResource(resource: RDFResource, triples: N3.Store | string) {
    let turtle;

    if (typeof triples === typeof N3.Store) {
      let writer = new N3.Writer({format: "Turtle"});
      //const turtle = writer.quadsToString()
      //TODO implement N3.Store
      throw new Error("Not implemented");
    }
    else {
      turtle = triples;
    }

    /*
    curl -X PATCH -H "Content-Type: application/sparql-update" \
  -d "INSERT DATA { <ex:s2> <ex:p2> <ex:o2> }" \
  http://localhost:3000/myfile.ttl
     */

    await this.customFetch(
      resource.url,
      {
        method: "PATCH",
        body: `INSERT DATA { ${turtle} }`,
        headers: {
          "Content-Type": "application/sparql-update",
        }
      }
    )
  }
}
