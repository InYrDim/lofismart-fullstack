const winston = require('winston');
require('winston-daily-rotate-file');
const path = require('path');

const logDir = 'logs';

const { createLogger, format, transports } = winston;
const { combine, timestamp, printf, colorize, json } = format;

// Custom format for console
const consoleFormat = printf(({ level, message, timestamp, stack }) => {
    return `${timestamp} [${level}]: ${stack || message}`;
});

const logger = createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format.errors({ stack: true }),
        json()
    ),
    defaultMeta: { service: 'lofishmart-backend' },
    transports: [
        // Daily Rotate File Transport for errors
        new transports.DailyRotateFile({
            filename: path.join(logDir, 'error-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            level: 'error',
            maxFiles: '14d',
            maxSize: '20m',
        }),
        // Daily Rotate File Transport for all logs
        new transports.DailyRotateFile({
            filename: path.join(logDir, 'combined-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            maxFiles: '14d',
            maxSize: '20m',
        }),
    ],
});

// If we're not in production then log to the `console` with the colorized format
if (process.env.PROD !== 'true') {
    logger.add(new transports.Console({
        format: combine(
            colorize(),
            consoleFormat
        ),
    }));
}

module.exports = logger;
