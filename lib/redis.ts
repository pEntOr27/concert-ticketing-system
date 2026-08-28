import Redis from 'ioredis';

class MemoryRedisFallback {
  private store = new Map<string, { value: string; expiresAt?: number }>();
  private lists = new Map<string, string[]>();

  async get(key: string): Promise<string | null> {
    const item = this.store.get(key);
    if (!item) return null;
    if (item.expiresAt && Date.now() > item.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return item.value;
  }

  async set(key: string, value: string, mode?: string, duration?: number): Promise<'OK'> {
    let expiresAt: number | undefined;
    if (mode === 'EX' && duration) {
      expiresAt = Date.now() + duration * 1000;
    }
    this.store.set(key, { value, expiresAt });
    return 'OK';
  }

  async del(key: string): Promise<number> {
    const existed = this.store.has(key);
    this.store.delete(key);
    this.lists.delete(key);
    return existed ? 1 : 0;
  }

  async rpush(key: string, value: string): Promise<number> {
    const list = this.lists.get(key) || [];
    list.push(value);
    this.lists.set(key, list);
    return list.length;
  }

  async lpop(key: string): Promise<string | null> {
    const list = this.lists.get(key) || [];
    const item = list.shift() || null;
    this.lists.set(key, list);
    return item;
  }

  async llen(key: string): Promise<number> {
    return (this.lists.get(key) || []).length;
  }

  async incr(key: string): Promise<number> {
    const current = await this.get(key);
    const count = (current ? parseInt(current, 10) : 0) + 1;
    await this.set(key, count.toString());
    return count;
  }

  async expire(key: string, seconds: number): Promise<number> {
    const item = this.store.get(key);
    if (item) {
      item.expiresAt = Date.now() + seconds * 1000;
      return 1;
    }
    return 0;
  }
}

const memoryStore = new MemoryRedisFallback();
let realRedisClient: Redis | null = null;
let isRedisConnected = false;

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

try {
  const client = new Redis(redisUrl, {
    maxRetriesPerRequest: 1,
    connectTimeout: 2000,
    lazyConnect: true,
    retryStrategy: () => null, // Don't retry if offline
  });

  client.on('connect', () => {
    isRedisConnected = true;
  });

  client.on('error', () => {
    isRedisConnected = false;
  });

  client.connect().then(() => {
    isRedisConnected = true;
  }).catch(() => {
    isRedisConnected = false;
  });

  realRedisClient = client;
} catch {
  isRedisConnected = false;
}

// Proxy client that automatically falls back to in-memory store if Redis is offline
export const redisClient: any = new Proxy(
  {},
  {
    get(_target, prop: string) {
      return async (...args: any[]) => {
        if (isRedisConnected && realRedisClient && typeof (realRedisClient as any)[prop] === 'function') {
          try {
            return await (realRedisClient as any)[prop](...args);
          } catch {
            isRedisConnected = false;
            return (memoryStore as any)[prop](...args);
          }
        }
        // Fallback to in-memory store
        if (typeof (memoryStore as any)[prop] === 'function') {
          return (memoryStore as any)[prop](...args);
        }
        return null;
      };
    },
  }
);
