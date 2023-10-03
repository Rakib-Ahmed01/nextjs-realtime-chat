const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

type Command = 'get' | 'zrange' | 'sismember' | 'smembers';

export async function fetchFromRedis(
  command: Command,
  ...args: (string | number)[]
) {
  const response = await fetch(`${redisUrl}/${command}/${args.join('/')}`, {
    headers: {
      Authorization: `Bearer ${redisToken}`,
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Error executing redis command: ${response.statusText}`);
  }

  const data = (await response.json()) as { result: string };

  return data.result;
}
