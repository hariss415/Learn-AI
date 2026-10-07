import {databaseAdapter} from './database';
export const env={...process.env,ADMIN_EMAILS:[process.env.ADMIN_EMAILS,process.env.BOOTSTRAP_ADMIN_EMAIL].filter(Boolean).join(','),DB:databaseAdapter};
