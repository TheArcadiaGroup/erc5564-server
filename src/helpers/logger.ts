import { createLogger, format, transports } from 'winston'
const { combine, printf, timestamp } = format
const config = require('config')

const lFormat = printf(({ level , message, timestamp }) => {
    return `${timestamp} ${level.toUpperCase()}: ${message}`
})

const logger = createLogger({
    level: config.get('logs.level'),
    format: combine(
      format.splat(),
      timestamp(),
      lFormat
    ),
    transports: [new transports.Console()]
})

export const stream = {
    write: (t : string) => logger.info(t.trim())
}

export default logger