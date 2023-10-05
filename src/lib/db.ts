// import { Redis } from '@upstash/redis';

// export const db = Redis.fromEnv();

import Redis from 'ioredis';

export const db = new Redis();
