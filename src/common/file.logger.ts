import { ConsoleLogger, ConsoleLoggerOptions } from '@nestjs/common';
import * as fs from 'fs';
import { timestamp } from '.';

export class FileLogger extends ConsoleLogger {
  constructor(context?: string, options?: ConsoleLoggerOptions) {
    super(context, options);
    FileLogger.clearLogs();
  }

  public static clearLogs() {
    fs.writeFileSync('app.log', '');
  }

  private async writeLog(log1: string, log2: string) {
    const msg = `${log1} - ${timestamp()} ${log2}\n`;

    fs.appendFileSync('app.log', msg);
  }

  debug(message: any, context: any = 'Nest', ...rest: any[]): void {
    const log1 = `[${context}]`;
    const log2 = `DEBUG ${message}`;
    this.writeLog(log1, log2);
    super.debug(message, context, ...rest);
  }

  error(
    message: any,
    stack?: any,
    context: any = 'Nest',
    ...rest: any[]
  ): void {
    const log1 = `[${context}]`;
    const log2 = `ERROR ${message} ${stack}`;
    this.writeLog(log1, log2);

    super.error(message, stack, context, ...rest);
  }

  log(message: any, context: any = 'Nest', ...rest: any[]): void {
    const log1 = `[${context}]`;
    const log2 = `LOG ${message}`;
    this.writeLog(log1, log2);

    super.log(message, context, ...rest);
  }

  verbose(message: any, context: any = 'Nest', ...rest: any[]): void {
    const log1 = `[${context}]`;
    const log2 = `VERBOSE ${message}`;
    this.writeLog(log1, log2);

    super.verbose(message, context, ...rest);
  }

  warn(message: any, context: any = 'Nest', ...rest: any[]): void {
    const log1 = `[${context}]`;
    const log2 = `WARN ${message}`;
    this.writeLog(log1, log2);

    super.warn(message, context, ...rest);
  }
}
