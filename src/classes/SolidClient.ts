import {RDFResource} from "./RDFResource";
import N3 from "n3";
import {IResource} from "./interfaces/IResource";
import {N3StoreToTurtle} from "../utils/N3StoreToTurtle";
import {Query} from "../query/Query";
import {QueryFactory} from "../query/QueryFactory";
import {QueryContext} from "../utils/queryContext";
import {AggregatedQuery} from "../query/AggregatedQuery";
import {LocalQuery} from "../query/LocalQuery";
import {WebSocketClient} from "../http/webSocketClient";
import fetch from "cross-fetch";
import {loggerSettings} from "../utils/loggerSettings";
import {TLogLevelName} from "tslog";

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

  private readonly webSocketClient = WebSocketClient.setInstance();

  constructor(podUrl: string, customFetch?: (input: RequestInfo | URL, init?: RequestInit | undefined) => Promise<Response>, aggregationServerUrl?: string, debug?: TLogLevelName) {
    //TODO make sure the URL's are normalized (no trailing backslash)

    this.podUrl = podUrl;
    this.customFetch = customFetch? customFetch : fetch;
    this.aggregationServerUrl = aggregationServerUrl;
    loggerSettings.minLevel = debug;
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
    return true;
  }

  public async makeResource(resource: IResource) {
    let body;
    if (resource.data instanceof N3.Store) {
      N3StoreToTurtle(resource.data);
    }
    else if(resource.data) {
      body = resource.data;
    }
    else {
      body = "";
    }

    await this.customFetch(
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
    //TODO return response
    if (accept) {
      return await this.customFetch(
        resource.url,
        {
          method: "GET",
          headers: {
            "Accept": accept,
          }
        }
      );
    }
    else {
      return await this.customFetch(
        resource.url,
        {
          method: "GET"
        }
      );
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

    await this.customFetch(
      resource.url,
      {
        method: "PATCH",
        body: `@prefix solid: <http://www.w3.org/ns/solid/terms#>. _:rename a solid:InsertDeletePatch; solid:inserts { ${turtle} }.`,
        headers: {
          "Content-Type": "text/n3",
        }
      }
    );
  }
}
