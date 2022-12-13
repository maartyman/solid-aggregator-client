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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AggregatedQuery = void 0;
const tslog_1 = require("tslog");
const Query_1 = require("./Query");
const LocalQuery_1 = require("./LocalQuery");
const webSocketClient_1 = require("../http/webSocketClient");
const cross_fetch_1 = __importDefault(require("cross-fetch"));
const jsonToBindings_1 = require("../utils/jsonToBindings");
const loggerSettings_1 = require("../utils/loggerSettings");
class AggregatedQuery extends Query_1.Query {
    constructor(solidClient, queryContext, queryBindings) {
        super(queryContext, queryBindings);
        this.logger = new tslog_1.Logger(loggerSettings_1.loggerSettings);
        this.makingConnection = false;
        this.subscribedWSReadyFunctions = new Array();
        this.addedRegEx = new RegExp(/added (.+)/);
        this.removedRegEx = new RegExp(/removed (.+)/);
        this.solidClient = solidClient;
        const queryExplanation = {
            queryString: queryContext.query,
            sources: queryContext.sources,
            reasoningRules: queryContext.reasoningRules,
            lenient: true,
            comunicaVersion: queryContext.comunicaVersion,
            comunicaContext: queryContext.comunicaContext
        };
        if (!solidClient.aggregationServerUrl) {
            throw new Error("aggregationServerUrl not defined, this shouldn't happen!");
        }
        (0, cross_fetch_1.default)(solidClient.aggregationServerUrl, {
            method: "POST",
            body: JSON.stringify(queryExplanation),
            headers: {
                'Content-Type': 'application/json'
            }
        }).then((response) => {
            if (response.status == 200 || response.status == 201) {
                const tempUUID = response.headers.get("location");
                if (tempUUID) {
                    this.UUID = tempUUID.toString();
                    if (!this.solidClient.aggregationServerUrl) {
                        throw new Error("aggregationServerUrl not defined, this shouldn't happen!");
                    }
                    webSocketClient_1.WebSocketClient.getInstance().connectToAggregatorReady(this.solidClient.aggregationServerUrl, (conn) => {
                        this.logger.debug("connectToAggregatorReady: connection established");
                        conn.sendUTF(tempUUID.toString());
                        this.subscribeOnReady(() => {
                            conn.close();
                        });
                        conn.on("message", (message) => {
                            if (message.type === 'utf8') {
                                this.logger.debug(message.utf8Data);
                                if (message.utf8Data === "initialized") {
                                    this.logger.debug("query initialized");
                                    this.afterQueryReady();
                                }
                            }
                        });
                    });
                }
                else {
                    this.logger.debug("Response didn't mention query location");
                }
            }
        });
        this.logger.info("AggregatedQuery instantiated");
    }
    streamBindings(cb) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.makingConnection) {
                this.makingConnection = true;
                this.makeBindingWS();
            }
            if (!this.connection) {
                yield this.WSReadyPromise();
            }
            if (!this.connection) {
                throw new Error("connection undefined, this shouldn't happen!");
            }
            this.connection.on("message", (message) => {
                this.logger.debug("incoming message:");
                if (message.type === 'utf8') {
                    let tempMessage = this.addedRegEx.exec(message.utf8Data);
                    if (tempMessage && tempMessage[1]) {
                        cb((0, jsonToBindings_1.jsonStringToBindings)(tempMessage[1]), true);
                        return;
                    }
                    tempMessage = this.removedRegEx.exec(message.utf8Data);
                    if (tempMessage && tempMessage[1]) {
                        cb((0, jsonToBindings_1.jsonStringToBindings)(tempMessage[1]), false);
                    }
                }
            });
        });
    }
    makeBindingWS() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.queryReadyPromise();
            if (!this.solidClient.aggregationServerUrl) {
                throw new Error("aggregationServerUrl not defined, this shouldn't happen!");
            }
            webSocketClient_1.WebSocketClient.getInstance().connectToAggregatorBindings(this.solidClient.aggregationServerUrl, (conn) => {
                this.logger.debug("connectToAggregatorBindings: connection established");
                if (!this.UUID) {
                    throw new Error("UUID is undefined, this shouldn't happen!");
                }
                conn.sendUTF(this.UUID.toString());
                this.connection = conn;
                this.afterWSReady();
            });
        });
    }
    WSReadyPromise() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.connection) {
                yield new Promise((resolve, reject) => {
                    this.subscribeOnWSReady(() => {
                        resolve();
                    });
                });
            }
        });
    }
    subscribeOnWSReady(cb) {
        this.subscribedWSReadyFunctions.push(cb);
    }
    afterWSReady() {
        this.subscribedWSReadyFunctions.forEach((cb) => {
            cb();
        });
    }
    getBindings() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.solidClient.aggregationServerUrl) {
                throw new Error("aggregationServerUrl not defined (this shouldn't happen, something is wrong in the package)");
            }
            yield this.queryReadyPromise();
            const response = yield (0, cross_fetch_1.default)(this.solidClient.aggregationServerUrl + `/` + this.UUID, {
                method: "GET",
            });
            if (response.status == 200 && response.body) {
                const parsedData = yield response.json();
                this.queryBindings = [];
                for (const bindingJson of parsedData) {
                    this.queryBindings.push((0, jsonToBindings_1.jsonObjectToBindings)(bindingJson));
                }
            }
            else {
                this.logger.error(response.status.toString());
            }
            return this.queryBindings;
        });
    }
    switchQueryType() {
        //TODO implement
        return new LocalQuery_1.LocalQuery(this.solidClient, this.queryContext, this.queryBindings);
    }
    delete() {
        //TODO
    }
}
exports.AggregatedQuery = AggregatedQuery;
