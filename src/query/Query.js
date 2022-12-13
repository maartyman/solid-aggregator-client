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
exports.Query = void 0;
class Query {
    constructor(queryContext, queryBindings) {
        this.subscribedReadyFunctions = new Array();
        this.queryReady = false;
        this.isQueryReady = () => this.queryReady;
        this.queryContext = queryContext;
        this.queryBindings = queryBindings ? queryBindings : new Array();
    }
    getBindings() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.queryReadyPromise();
            return this.queryBindings;
        });
    }
    queryReadyPromise() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.queryReady) {
                yield new Promise((resolve, reject) => {
                    this.subscribeOnReady(() => {
                        resolve();
                    });
                });
            }
        });
    }
    subscribeOnReady(cb) {
        this.subscribedReadyFunctions.push(cb);
    }
    afterQueryReady() {
        this.queryReady = true;
        this.subscribedReadyFunctions.forEach((value) => {
            value();
        });
    }
}
exports.Query = Query;
