import { ConsoleLogger, ConsoleLoggerOptions } from '@nestjs/common';
import { promises as fsPromises } from 'fs';
import { timestamp } from '.';

export class FileLogger extends ConsoleLogger {
  private readonly logFilePath: string;

  constructor(
    context: string = 'DefaultContext',
    options: ConsoleLoggerOptions = {},
    logFilePath: string = 'app.log',
  ) {
    super(context, options);
    this.logFilePath = logFilePath;

    FileLogger.clearLogs(logFilePath);
  }

  /**
   * Clears the log file content or creates it if it doesn't exist
   */
  public static async clearLogs(
    logFilePath: string = 'app.log',
  ): Promise<void> {
    try {
      await fsPromises.writeFile(logFilePath, '');
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Failed to clear logs: ${error.message}`);
      } else {
        console.error(`Failed to clear logs: Unknown error ${error}`);
      }
    }
  }

  /**
   * Writes a log entry to the file
   */
  private async writeLog(
    logLevel: string,
    message: any,
    context: string,
  ): Promise<void> {
    try {
      const formattedMessage = `[${context}] - ${timestamp()} ${logLevel} ${message}\n`;

      await fsPromises.appendFile(this.logFilePath, formattedMessage);
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Failed to write to log file: ${error.message}`);
      } else {
        console.error(`Failed to write to log file: Unknown error ${error}`);
      }
    }
  }

  /**
   * Common logging method to reduce duplication
   */
  private logToFileAndConsole(
    logLevel: string,
    message: any,
    context: string = 'Nest',
    superMethod: Function,
    ...additionalArgs: any[]
  ): void {
    this.writeLog(logLevel, message, context).catch((err) =>
      console.error(`Logging error: ${err.message}`),
    );

    superMethod.call(
      this,
      message,
      ...(additionalArgs.length ? additionalArgs : [context]),
    );
  }

  debug(message: any, context: any = 'Nest', ...rest: any[]): void {
    this.logToFileAndConsole(
      'DEBUG',
      message,
      context,
      super.debug,
      ...(rest.length ? [context, ...rest] : [context]),
    );
  }

  error(
    message: any,
    stack?: any,
    context: any = 'Nest',
    ...rest: any[]
  ): void {
    const stackStr = stack ? `\n${stack}` : '';
    this.logToFileAndConsole(
      'ERROR',
      `${message}${stackStr}`,
      context,
      super.error,
      stack,
      context,
      ...rest,
    );
  }

  log(message: any, context: any = 'Nest', ...rest: any[]): void {
    this.logToFileAndConsole(
      'LOG',
      message,
      context,
      super.log,
      ...(rest.length ? [context, ...rest] : [context]),
    );
  }

  verbose(message: any, context: any = 'Nest', ...rest: any[]): void {
    this.logToFileAndConsole(
      'VERBOSE',
      message,
      context,
      super.verbose,
      ...(rest.length ? [context, ...rest] : [context]),
    );
  }

  warn(message: any, context: any = 'Nest', ...rest: any[]): void {
    this.logToFileAndConsole(
      'WARN',
      message,
      context,
      super.warn,
      ...(rest.length ? [context, ...rest] : [context]),
    );
  }

  fatal(message: any, context: any = 'Nest', ...rest: any[]): void {
    this.logToFileAndConsole(
      'FATAL',
      message,
      context,
      super.fatal,
      ...(rest.length ? [context, ...rest] : [context]),
    );
  }
}
