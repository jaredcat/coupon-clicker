import fs from 'fs';
import { Page } from 'puppeteer';
import winston, {
  format,
  child,
  createLogger,
  LeveledLogMethod,
} from 'winston';
//@ts-expect-error Winston doesn't export the Logger class but it's easy to reach for it. See https://github.com/winstonjs/winston/issues/2170
import HiddenLogger from 'winston/lib/winston/logger';

const { printf, json, combine } = format;

class Logger extends (HiddenLogger as typeof winston.Logger) {
  private currentSite = 'coupon-clipper';
  private siteCount = 0;
  private currentSiteAction = 1;
  private logDir: string;

  public setCurrentSite = (siteName: string): void => {
    this.siteCount++;
    this.currentSiteAction = 1;
    this.currentSite = siteName;
  };

  public screenshot = async (page: Page, message?: string) => {
    const filename = `${this.logDir}/${this.siteCount}-${this.currentSiteAction}-${this.currentSite}.png`;
    if (message) {
      this.info(`${this.siteCount}-${this.currentSiteAction}: ${message}`);
    }
    await page.screenshot({ path: filename, fullPage: true });
    this.currentSiteAction++;
  };

  // private coreLogger: winston.Logger;
  isErrorEnabled!: () => boolean;
  isWarnEnabled!: () => boolean;
  isInfoEnabled!: () => boolean;
  isVerboseEnabled!: () => boolean;
  isDebugEnabled!: () => boolean;
  isSillyEnabled!: () => boolean;
  error!: LeveledLogMethod;
  warn!: LeveledLogMethod;
  info!: LeveledLogMethod;
  http!: LeveledLogMethod;
  verbose!: LeveledLogMethod;
  debug!: LeveledLogMethod;
  silly!: LeveledLogMethod;
  child!: typeof child;

  constructor(logDir = './logs', logLevel: string | undefined) {
    let level = logLevel;
    if (process.env.NODE_ENV === 'development') {
      level = 'debug';
    } else if (!level) {
      level = 'info';
    }

    fs.rmSync(logDir, { recursive: true, force: true });
    fs.mkdirSync(logDir);

    const config = {
      level,
      format: json(),
      // defaultMeta: { service: 'user-service' },
      transports: [
        //
        // - Write all logs with importance level of `error` or less to `error.log`
        // - Write all logs with importance level of `info` or less to `combined.log`
        //
        new winston.transports.File({
          filename: `${logDir}/error.log`,
          level: 'error',
        }),
        new winston.transports.File({
          filename: `${logDir}/combined.log`,
        }),
      ],
    };

    super(config);
    const winstonLogger = createLogger(config);
    Object.setPrototypeOf(this, Object.getPrototypeOf(winstonLogger));
    // this.coreLogger = winstonLogger;
    // for (const key of Object.keys(winstonLogger)) {
    //   this[key] = winstonLogger[key];
    // }

    this.format = combine(json(), this.sitePrefixFormat);
    this.logDir = logDir;

    //
    // If we're not in production then log to the `console` with the format:
    // `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
    //
    if (process.env.NODE_ENV !== 'production') {
      this.add(
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple(),
            this.sitePrefixFormat,
          ),
        }),
      );
    }
  }

  private sitePrefixFormat = printf(({ level, message, label }) => {
    let prefixLabel = this.currentSite;
    if (label) {
      prefixLabel = label;
    }
    return `[${prefixLabel.toUpperCase()}] ${level}: ${message}`;
  });
}

export default Logger;
