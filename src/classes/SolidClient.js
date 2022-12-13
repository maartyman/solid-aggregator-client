"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.SolidClient = void 0;
const RDFResource_1 = require("./RDFResource");
const n3_1 = __importStar(require("n3"));
const N3StoreToTurtle_1 = require("../utils/N3StoreToTurtle");
const QueryFactory_1 = require("../query/QueryFactory");
const webSocketClient_1 = require("../http/webSocketClient");
const cross_fetch_1 = __importDefault(require("cross-fetch"));
const loggerSettings_1 = require("../utils/loggerSettings");
const tslog_1 = require("tslog");
/*
SolidClient:
  init:
    -make save folder (if it doesn't exist yet)
    -get save files and return it
    -give application aggregator url
    -custom fetch function (authentication)

  make query:
    give query and variables
    =>
    determine to run client side or aggregator (or let developer decide)
    => return appropriate query object
 */
class SolidClient {
    constructor(podUrl, customFetch, aggregationServerUrl, debug) {
        //TODO make sure the URL's are normalized (no trailing backslash)
        loggerSettings_1.loggerSettings.minLevel = debug;
        this.podUrl = podUrl;
        this.customFetch = customFetch ? customFetch : cross_fetch_1.default;
        this.aggregationServerUrl = aggregationServerUrl;
        this.logger = new tslog_1.Logger(loggerSettings_1.loggerSettings);
        this.webSocketClient = webSocketClient_1.WebSocketClient.setInstance();
    }
    makeQuery(queryContext) {
        //TODO check aggregator availability
        if (queryContext.aggregated && this.aggregationServerUrl) {
            return QueryFactory_1.QueryFactory.makeAggregatedQuery(this, queryContext);
        }
        else {
            return QueryFactory_1.QueryFactory.makeLocalQuery(this, queryContext);
        }
    }
    switchQueryType(query) {
        //query = query.switchQueryType();
        //TODO implement
        throw new Error("Function switchQueryType() is not yet implemented");
        return true;
    }
    makeResource(resource) {
        return __awaiter(this, void 0, void 0, function* () {
            let body;
            if (resource.data instanceof n3_1.default.Store) {
                body = yield (0, N3StoreToTurtle_1.N3StoreToTriples)(resource.data);
            }
            else if (resource.data) {
                body = resource.data;
            }
            else {
                body = "";
            }
            return this.customFetch(resource.url, {
                method: "PUT",
                body: body,
                headers: {
                    "Content-Type": resource.contentType,
                }
            });
            /*
            curl -X PUT -H "Content-Type: text/plain" \
            -d "abc" \
            http://localhost:3000/myfile.txt
        
            curl -X PUT -H "Content-Type: text/turtle" \
            -d "<ex:s> <ex:p> <ex:o>." \
            http://localhost:3000/myfile.ttl
             */
        });
    }
    getResource(resource, accept) {
        return __awaiter(this, void 0, void 0, function* () {
            if (resource instanceof RDFResource_1.RDFResource) {
                return this.customFetch(resource.url, {
                    method: "GET",
                }).then((response) => __awaiter(this, void 0, void 0, function* () {
                    let text = yield response.text();
                    const parser = new n3_1.Parser({
                        blankNodePrefix: ""
                    });
                    let quads = parser.parse(text);
                    resource.data = new n3_1.Store(quads, {
                        factory: n3_1.DataFactory
                    });
                    return;
                }));
            }
            else if (accept) {
                return this.customFetch(resource.url, {
                    method: "GET",
                    headers: {
                        "Accept": accept,
                    }
                }).then((response) => __awaiter(this, void 0, void 0, function* () {
                    resource.data = yield response.text();
                    return;
                }));
            }
            else {
                return this.customFetch(resource.url, {
                    method: "GET"
                }).then((response) => __awaiter(this, void 0, void 0, function* () {
                    resource.data = yield response.text();
                    return;
                }));
            }
            /*
            Retrieve a plain text file:
        
              curl -H "Accept: text/plain" \
                http://localhost:3000/myfile.txt
        
              Retrieve a turtle file:
        
              curl -H "Accept: text/turtle" \
                http://localhost:3000/myfile.ttl
        
              Retrieve a turtle file in a different serialization:
        
              curl -H "Accept: application/ld+json" \
                http://localhost:3000/myfile.ttl
             */
        });
    }
    deleteResource(resource) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.customFetch(resource.url, {
                method: "DELETE"
            });
            /*
            curl -X DELETE http://localhost:3000/myfile.txt
             */
        });
    }
    addTriplesToResource(resource, triples) {
        return __awaiter(this, void 0, void 0, function* () {
            let turtle;
            if (typeof triples === typeof n3_1.default.Store) {
                let writer = new n3_1.default.Writer({ format: "Turtle" });
                //const turtle = writer.quadsToString()
                //TODO implement N3.Store
                throw new Error("Not implemented");
            }
            else {
                turtle = triples;
            }
            /*
            curl -X PATCH -H "Content-Type: application/sparql-update" \
          -d "INSERT DATA { <ex:s2> <ex:p2> <ex:o2> }" \
          http://localhost:3000/myfile.ttl
             */
            yield this.customFetch(resource.url, {
                method: "PATCH",
                body: `INSERT DATA { ${turtle} }`,
                headers: {
                    "Content-Type": "application/sparql-update",
                }
            });
        });
    }
}
exports.SolidClient = SolidClient;
