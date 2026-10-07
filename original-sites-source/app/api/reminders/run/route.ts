import {env} from 'cloudflare:workers';
import {getChatGPTUser} from '@/app/chatgpt-auth';
import {identity} from '@/lib/admin';
import {runDueReminders} from '@/lib/reminders';
export const dynamic='force-dynamic';
export async function POST(request:Request){const secret=(env as any).REMINDER_JOB_SECRET;const jobAuthorized=Boolean(secret&&request.headers.get('Authorization')==='Bearer '+secret);if(!jobAuthorized){const user=await getChatGPTUser();if(!user)return Response.json({error:'Job credential or administrator login required'},{status:401});if(await identity(user)!=='admin')return Response.json({error:'Administrator access required'},{status:403});const origin=request.headers.get('origin');if(origin&&origin!==new URL(request.url).origin)return Response.json({error:'Invalid origin'},{status:403});}try{return Response.json(await runDueReminders());}catch(e){return Response.json({error:(e as Error).message},{status:503});}}
