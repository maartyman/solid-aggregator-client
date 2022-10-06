import {Logger} from "tslog";
import {loggerSettings} from "../utils/loggerSettings";
import {Query} from "./Query";
import {QueryContext} from "../utils/queryContext";
import {AggregatedQuery} from "./AggregatedQuery";
import {Bindings} from "@comunica/bindings-factory";
import {SolidClient} from "../classes/SolidClient";

export class LocalQuery extends Query {
  private logger = new Logger();
  private readonly solidClient: SolidClient;


  constructor(solidClient: SolidClient, queryContext: QueryContext, queryBindings?: Array<Bindings>) {
    super(queryContext, queryBindings);
    new Logger(loggerSettings).info("AggregatedQuery");
    this.solidClient = solidClient;
  }

  switchQueryType(): AggregatedQuery {
    //TODO implement
    return new AggregatedQuery(this.solidClient, this.queryContext, this.queryBindings);
  }

  getBindings(): Promise<Bindings[]> {
    return Promise.resolve([]);
  }

  streamBindings(callBackFn: (bindings: Bindings, addition: boolean) => void): void {
  }

}
