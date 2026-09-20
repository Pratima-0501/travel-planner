import * as fs from 'fs';
import * as path from 'path';

export class SafetyPipeline {
  private blockedInputPatterns = [
    /ignore previous instructions/i,
    /system prompt/i,
    /act as an unrestricted ai/i,
    /reveal confidential/i,
  ];

  private forbiddenOutputPhrases = [
    /internal server key/i,
    /password123/i,
  ];

  public sanitizeInput(input: string): { safe: boolean; reason?: string } {
    for (const pattern of this.blockedInputPatterns) {
      if (pattern.test(input)) {
        return { safe: false, reason: `Disallowed prompt pattern detected: "${pattern}"` };
      }
    }
    return { safe: true };
  }

  public sanitizeOutput(output: string): string {
    let sanitized = output;
    for (const phrase of this.forbiddenOutputPhrases) {
      sanitized = sanitized.replace(phrase, '[REDACTED]');
    }
    return sanitized;
  }

  public auditLog(event: string, details: object): void {
    const logDir = path.join(process.cwd(), 'logs');
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    const record = {
      timestamp: new Date().toISOString(),
      event,
      ...details,
    };
    fs.appendFileSync(path.join(logDir, 'audit.log'), JSON.stringify(record) + '\n');
  }
}