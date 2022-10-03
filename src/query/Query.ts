import {QueryContext} from "../utils/queryContext";
import {Bindings} from "@comunica/bindings-factory";

export abstract class Query {
  public queryBindings: Array<Bindings>;
  public queryContext: QueryContext;

  private subscribedReadyFunctions: (() => void)[] = new Array<() => void>();
  protected queryReady: boolean = false;
  public isQueryReady = () => this.queryReady;

  protected constructor(queryContext: QueryContext, queryBindings?: Array<Bindings>) {
    this.queryContext = queryContext;
    this.queryBindings = queryBindings? queryBindings : new Array<Bindings>();
  }

  abstract streamBindings(callBackFn: (bindings: Bindings) => void): void;

  async getBindings(): Promise<Bindings[]> {
    async function callBackToPromise(this: any): Promise<void> {
      this.subscribeOnFinished(() => {
        return;
      });
    }

    if (!this.queryReady) {
      await callBackToPromise();
    }

    return this.queryBindings;
  }

  abstract switchQueryType(): Query;

  subscribeOnReady(callBackFn: () => void): void {
    this.subscribedReadyFunctions.push(callBackFn);
  }

  protected afterQueryReady() {
    this.subscribedReadyFunctions.forEach((value) => {
      value();
    });
  }
}
