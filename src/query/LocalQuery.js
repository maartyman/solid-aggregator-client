"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocalQuery = void 0;
const tslog_1 = require("tslog");
const loggerSettings_1 = require("../utils/loggerSettings");
const Query_1 = require("./Query");
const AggregatedQuery_1 = require("./AggregatedQuery");
const incremunica_1 = require("incremunica");
const incremunica_2 = require("incremunica");
class LocalQuery extends Query_1.Query {
    constructor(solidClient, queryContext, queryBindings) {
        super(queryContext, queryBindings);
        this.logger = new tslog_1.Logger(loggerSettings_1.loggerSettings);
        this.guardingEnabled = false;
        this.setGuardingEnabled = (val) => this.guardingEnabled = val;
        this.isGuardingEnabled = () => this.guardingEnabled;
        this.logger.info("LocalQuery");
        this.solidClient = solidClient;
        this.guardingEnabled = (queryContext.local == undefined) ? false : queryContext.local.guarded;
        this.queryExplanation = new incremunica_2.QueryExplanation(queryContext.query, queryContext.sources, queryContext.comunicaVersion, queryContext.comunicaContext, queryContext.reasoningRules, queryContext.lenient);
        this.queryExecutor = new incremunica_1.QueryExecutor("", this.queryExplanation, this.guardingEnabled);
        this.queryExecutor.on("queryEvent", (value) => {
            if (value === "initialized") {
                this.afterQueryReady();
            }
        });
    }
    checkQueryExecutor() {
        if (this.queryExecutor == null) {
            this.queryExecutor = new incremunica_1.QueryExecutor("", this.queryExplanation, this.guardingEnabled);
            this.queryExecutor.on("queryEvent", (value) => {
                if (value === "initialized") {
                    this.afterQueryReady();
                }
            });
        }
    }
    getBindings() {
        return __awaiter(this, void 0, void 0, function* () {
            this.checkQueryExecutor();
            yield this.queryReadyPromise();
            // @ts-ignore
            this.queryBindings = yield this.queryExecutor.getData();
            return this.queryBindings;
        });
    }
    streamBindings(cb) {
        this.checkQueryExecutor();
        // @ts-ignore
        this.queryExecutor.on("binding", (bindings, addition) => {
            cb(bindings, addition);
        });
    }
    switchQueryType() {
        //TODO implement
        return new AggregatedQuery_1.AggregatedQuery(this.solidClient, this.queryContext, this.queryBindings);
    }
    delete() {
        if (this.queryExecutor != null) {
            this.queryExecutor.delete();
            this.queryExecutor = null;
        }
    }
}
exports.LocalQuery = LocalQuery;
