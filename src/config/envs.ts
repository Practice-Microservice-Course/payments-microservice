import 'dotenv/config';
import * as Joi from 'joi';

interface EnvVars {
  PORT: number;
  STRIPE_SECRET: string;
  ENDPOINT_SECRET: string;
  SUCCESS_URL: string;
  CANCEL_URL: string;
  NATS_SERVERS: string[];
}

const envVarsSchema = Joi.object({
  PORT: Joi.number().default(3000),
  STRIPE_SECRET: Joi.string().required(),
  ENDPOINT_SECRET: Joi.string().required(),
  SUCCESS_URL: Joi.string().required(),
  CANCEL_URL: Joi.string().required(),
  NATS_SERVERS: Joi.array().items(Joi.string()).required(),
}).unknown(true);

const { error, value } = envVarsSchema.validate({
  ...process.env,
  NATS_SERVERS: process.env.NATS_SERVERS.split(','),
});

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

const envVars: EnvVars = value;

export const envs = {
  PORT: envVars.PORT,
  STRIPE_SECRET: envVars.STRIPE_SECRET,
  ENDPOINT_SECRET: envVars.ENDPOINT_SECRET,
  SUCCESS_URL: envVars.SUCCESS_URL,
  CANCEL_URL: envVars.CANCEL_URL,
  NATS_SERVERS: envVars.NATS_SERVERS,
};
