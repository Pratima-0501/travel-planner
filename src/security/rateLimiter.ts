export class SlidingWindowRateLimiter {
  private requestTimestamps: number[] = [];
  constructor(private maxRequests: number, private windowMs: number) {}

  public isAllowed(): boolean {
    const now = Date.now();
    // Evict timestamps older than current window
    this.requestTimestamps = this.requestTimestamps.filter(t => now - t < this.windowMs);
    
    if (this.requestTimestamps.length >= this.maxRequests) {
      return false;
    }
    this.requestTimestamps.push(now);
    return true;
  }
}