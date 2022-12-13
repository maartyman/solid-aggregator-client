"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueryFactory = void 0;
const AggregatedQuery_1 = require("./AggregatedQuery");
const LocalQuery_1 = require("./LocalQuery");
class QueryFactory {
    static makeAggregatedQuery(solidClient, queryContext) {
        return new AggregatedQuery_1.AggregatedQuery(solidClient, queryContext);
    }
    static makeLocalQuery(solidClient, queryContext) {
        return new LocalQuery_1.LocalQuery(solidClient, queryContext);
    }
}
exports.QueryFactory = QueryFactory;
