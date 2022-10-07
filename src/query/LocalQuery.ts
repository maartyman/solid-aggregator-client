import {Logger} from "tslog";
import {loggerSettings} from "../utils/loggerSettings";
import {Query} from "./Query";
import {QueryContext} from "../utils/queryContext";
import {AggregatedQuery} from "./AggregatedQuery";
import {Bindings} from "@comunica/bindings-factory";
import {SolidClient} from "../classes/SolidClient";
import {QueryExplanation} from "./queryExplanation";
import {QueryEngine} from "@comunica/query-sparql";

export class LocalQuery extends Query {
  private logger = new Logger(loggerSettings);
  private readonly solidClient: SolidClient;
  private queryEngine: QueryEngine | undefined;

  constructor(solidClient: SolidClient, queryContext: QueryContext, queryBindings?: Array<Bindings>) {
    super(queryContext, queryBindings);
    this.logger.info("AggregatedQuery");
    this.solidClient = solidClient;

    const queryExplanation = new QueryExplanation(
      queryContext.query,
      queryContext.sources,
      queryContext.comunicaVersion,
      queryContext.comunicaContext,
      queryContext.reasoningRules,
      true
    );

    const queryEngineFactory = require(queryExplanation.comunicaVersion.toString()).QueryEngineFactory;

    this.logger.debug("comunica context path = " + queryExplanation.comunicaContext);
    new queryEngineFactory().create({
      configPath: queryExplanation.comunicaContext,
    }).then(async (queryEngine: QueryEngine) => {
      this.queryEngine = queryEngine;
      this.logger.debug(`Comunica engine build`);
      
    });
  }

  getBindings(): Promise<Bindings[]> {
    return Promise.resolve([]);
  }

  streamBindings(callBackFn: (bindings: Bindings, addition: boolean) => void): void {

  }

  switchQueryType(): AggregatedQuery {
    //TODO implement
    return new AggregatedQuery(this.solidClient, this.queryContext, this.queryBindings);
  }
}
