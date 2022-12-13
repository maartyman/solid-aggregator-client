"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RDFResource = void 0;
class RDFResource {
    constructor(url, data) {
        this.contentType = "application/n-quads";
        this.url = url;
        this.data = data;
    }
}
exports.RDFResource = RDFResource;
