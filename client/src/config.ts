import * as z from 'zod';

const configSchema = z.object({
  apiEndpoint: z.url(),
  appUrl: z.url(),
});

const projectEnvConfig = configSchema.safeParse({
  apiEndpoint: process.env.NEXT_PUBLIC_API_ENDPOINT,
  appUrl: process.env.NEXT_PUBLIC_APP_URL,
});

if (projectEnvConfig.error) {
  console.error('>>> Invalid env variables: ', projectEnvConfig.error.issues);
  throw new Error('Invalid env variables');
}

const envConfig = projectEnvConfig.data;
export default envConfig;
