import AWS from 'aws-sdk';
import dotenv from 'dotenv';
dotenv.config();

const s3Config = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
};

if (process.env.AWS_S3_ENDPOINT) {
  s3Config.endpoint = new AWS.Endpoint(process.env.AWS_S3_ENDPOINT);
  s3Config.s3ForcePathStyle = true; // Necessário para S3 compatíveis (Railway, MinIO, etc)
}

const s3 = new AWS.S3(s3Config);

export default s3;
