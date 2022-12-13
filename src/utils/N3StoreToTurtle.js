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
exports.N3StoreToTriples = void 0;
const n3_1 = __importDefault(require("n3"));
function N3StoreToTriples(store) {
    return __awaiter(this, void 0, void 0, function* () {
        const writer = new n3_1.default.Writer(null, {
            format: "N-Triples",
        });
        for (const quad of store) {
            writer.addQuad(quad);
        }
        return new Promise((resolve, reject) => {
            writer.end((error, result) => resolve(result));
        });
    });
}
exports.N3StoreToTriples = N3StoreToTriples;
