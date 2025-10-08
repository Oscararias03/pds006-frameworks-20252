"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.newDeviceCriteria = newDeviceCriteria;
const constants_1 = require("@core/constants");
function newDeviceCriteria() {
    return {
        limit: constants_1.DEFAULT_PAGINATION_LIMIT,
        offset: 0
    };
}
