import {AggregatedQuery} from "./AggregatedQuery";
import {Query} from "./Query";
import {LocalQuery} from "./LocalQuery";
import {QueryContext} from "../utils/queryContext";
import {SolidClient} from "../classes/SolidClient";

export abstract class QueryFactory {
  static makeAggregatedQuery(solidClient: SolidClient, queryContext: QueryContext) : Query {
    return new AggregatedQuery(solidClient, queryContext);
  }

  static makeLocalQuery(solidClient: SolidClient, queryContext: QueryContext) : Query {
    return new LocalQuery(solidClient, queryContext);
  }
}
