"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stream = void 0;
const winston_1 = require("winston");
const { combine, printf, timestamp } = winston_1.format;
const config = require('config');
const lFormat = printf(({ level, message, timestamp }) => {
    return `${timestamp} ${level.toUpperCase()}: ${message}`;
});
const logger = (0, winston_1.createLogger)({
    level: config.get('logs.level'),
    format: combine(winston_1.format.splat(), timestamp(), lFormat),
    transports: [new winston_1.transports.Console()]
});
exports.stream = {
    write: (t) => logger.info(t.trim())
};
exports.default = logger;
