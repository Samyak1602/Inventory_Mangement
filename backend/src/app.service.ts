import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  getHello(): string {
    return 'Hello World!';
  }

  // Ping itself every 14 minutes to keep Render instance awake
  @Cron('*/14 * * * *')
  async handleCron() {
    const url = process.env.RENDER_EXTERNAL_URL || 'http://localhost:3001';
    this.logger.debug(`Pinging ${url} to keep alive...`);
    try {
      const response = await fetch(url);
      if (response.ok) {
        this.logger.debug('Self-ping successful.');
      } else {
        this.logger.error(`Self-ping failed with status: ${response.status}`);
      }
    } catch (error) {
      this.logger.error('Self-ping error:', error);
    }
  }
}
