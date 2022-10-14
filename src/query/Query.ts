import {QueryContext} from "../utils/queryContext";
import {Bindings} from "@comunica/bindings-factory";

export abstract class Query {
  public queryBindings: Array<Bindings>;
  protected readonly queryContext: QueryContext;

  private subscribedReadyFunctions: (() => void)[] = new Array<() => void>();
  protected queryReady: boolean = false;
  public isQueryReady = () => this.queryReady;

  protected constructor(queryContext: QueryContext, queryBindings?: Array<Bindings>) {
    this.queryContext = queryContext;
    this.queryBindings = queryBindings? queryBindings : new Array<Bindings>();
  }

  abstract streamBindings(cb: (bindings: Bindings, addition: boolean) => void): void;

  async getBindings(): Promise<Bindings[]> {
    await this.queryReadyPromise();

    return this.queryBindings;
  }

  protected async queryReadyPromise(): Promise<void> {
    if (!this.queryReady) {
      await new Promise<void>((resolve, reject) => {
        this.subscribeOnReady(() => {
          resolve();
        });
      })
    }
  }

  abstract switchQueryType(): Query;

  subscribeOnReady(cb: () => void): void {
    this.subscribedReadyFunctions.push(cb);
  }

  protected afterQueryReady() {
    this.subscribedReadyFunctions.forEach((value) => {
      value();
    });
  }

  abstract delete(): void;
}
