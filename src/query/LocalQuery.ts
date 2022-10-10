import {Logger} from "tslog";
import {loggerSettings} from "../utils/loggerSettings";
import {Query} from "./Query";
import {QueryContext} from "../utils/queryContext";
import {AggregatedQuery} from "./AggregatedQuery";
import {Bindings} from "@comunica/bindings-factory";
import {SolidClient} from "../classes/SolidClient";
import {QueryExplanation} from "../queryExecutor/queryExplanation";
import {QueryExecutor} from "../queryExecutor/queryExecutor";

export class LocalQuery extends Query {
  private logger = new Logger(loggerSettings);
  private readonly solidClient: SolidClient;
  private queryExecutor: QueryExecutor | null;
  private readonly queryExplanation: QueryExplanation;
  private guardingEnabled = false;
  setGuardingEnabled = (val: boolean) => this.guardingEnabled = val;
  isGuardingEnabled = () => this.guardingEnabled;

  constructor(solidClient: SolidClient, queryContext: QueryContext, queryBindings?: Array<Bindings>) {
    super(queryContext, queryBindings);
    this.logger.info("AggregatedQuery");
    this.solidClient = solidClient;
    this.guardingEnabled = (queryContext.local == undefined)? false : queryContext.local.guarded

    this.queryExplanation = new QueryExplanation(
      queryContext.query,
      queryContext.sources,
      queryContext.comunicaVersion,
      queryContext.comunicaContext,
      queryContext.reasoningRules,
      true
    );

    this.queryExecutor = new QueryExecutor(
      "",
      this.queryExplanation,
      this.guardingEnabled
    );

    this.queryExecutor.on("queryEvent", (value) => {
      if (value === "initialized") {
        this.afterQueryReady();
      }
    });
  }

  private checkQueryExecutor(): void {
    if (this.queryExecutor == null) {
      this.queryExecutor = new QueryExecutor(
        "",
        this.queryExplanation,
        this.guardingEnabled
      );

      this.queryExecutor.on("queryEvent", (value) => {
        if (value === "initialized") {
          this.afterQueryReady();
        }
      });
    }
  }

  async getBindings(): Promise<Bindings[]> {
    this.checkQueryExecutor();

    await this.queryReadyPromise();

    // @ts-ignore
    this.queryBindings = this.queryExecutor.getData();

    return this.queryBindings;
  }

  streamBindings(cb: (bindings: Bindings, addition: boolean) => void): void {
    this.checkQueryExecutor();

    // @ts-ignore
    this.queryExecutor.on("binding", (bindings: Bindings[], addition: boolean) => {
      for (const binding of bindings) {
        cb(binding, addition);
      }
    });
  }

  switchQueryType(): AggregatedQuery {
    //TODO implement
    return new AggregatedQuery(this.solidClient, this.queryContext, this.queryBindings);
  }

  delete(): void {
    if (this.queryExecutor != null) {
      this.queryExecutor.delete();
      this.queryExecutor = null;
    }
  }
}
