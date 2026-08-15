/**
 * Structured logger that automatically redacts sensitive information.
 */
export class Logger {
  private static redact(obj: any): any {
    if (!obj) return obj;
    if (typeof obj !== 'object') return obj;

    const redacted = { ...obj };
    const sensitiveKeys = ['password', 'token', 'secret', 'card', 'cvv', 'signature', 'creditCard'];

    for (const key of Object.keys(redacted)) {
      if (sensitiveKeys.some(s => key.toLowerCase().includes(s))) {
        redacted[key] = '***REDACTED***';
      } else if (typeof redacted[key] === 'object') {
        redacted[key] = this.redact(redacted[key]);
      }
    }
    return redacted;
  }

  static info(message: string, context?: Record<string, any>) {
    console.log(JSON.stringify({
      level: 'INFO',
      timestamp: new Date().toISOString(),
      message,
      ...(context ? { context: this.redact(context) } : {})
    }));
  }

  static error(message: string, context?: Record<string, any>) {
    console.error(JSON.stringify({
      level: 'ERROR',
      timestamp: new Date().toISOString(),
      message,
      ...(context ? { context: this.redact(context) } : {})
    }));
  }

  static warn(message: string, context?: Record<string, any>) {
    console.warn(JSON.stringify({
      level: 'WARN',
      timestamp: new Date().toISOString(),
      message,
      ...(context ? { context: this.redact(context) } : {})
    }));
  }
}
