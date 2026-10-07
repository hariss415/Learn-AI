import {env} from 'cloudflare:workers';
import {getChatGPTUser} from '@/app/chatgpt-auth';
import {database} from '@/lib/store';
export const dynamic='force-dynamic';
export async function GET(_request:Request,context:{params:Promise<{id:string}>}){const user=await getChatGPTUser();if(!user)return new Response('Sign in required',{status:401});try{const {id}=await context.params;const row=await database().prepare('SELECT object_key FROM generated_assets WHERE id=? AND owner_id=?').bind(id,user.userId).first();if(!row)return new Response('Not found',{status:404});const object=await (env as any).ASSETS.get(row.object_key);if(!object)return new Response('Not found',{status:404});return new Response(object.body,{headers:{'Content-Type':'image/png','Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}});}catch{return new Response('Image unavailable',{status:503});}}
