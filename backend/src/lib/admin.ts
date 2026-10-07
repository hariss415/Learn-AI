import { env } from './env';
import type {AppUser} from '../auth';
import {database} from './store';
import {initialState} from './learning';
export type Role='learner'|'manager'|'admin';
export const defaults=()=>({...initialState().config,audience:'Employees',tone:'Supportive',foundationThreshold:40,advancedThreshold:80,nudges:true});
export async function identity(user:AppUser):Promise<Role>{
 const email=user.email.trim().toLowerCase();
 await database().prepare('INSERT INTO members (email,user_id,name,role,department) VALUES (?,?,?,\'learner\',\'Unassigned\') ON CONFLICT(email) DO UPDATE SET user_id=excluded.user_id,name=excluded.name').bind(email,user.userId,user.fullName||'Learner').run();
 const admins=String((env as any).ADMIN_EMAILS||'').split(',').map(v=>v.trim().toLowerCase()).filter(Boolean);
 if(admins.includes(email))return 'admin';
 const row=await database().prepare('SELECT role FROM members WHERE email=?').bind(email).first();
 return ['admin','manager'].includes(row?.role)?row.role:'learner';
}
export async function settings(){const row=await database().prepare('SELECT payload FROM organization_settings WHERE id=\'default\'').first();return row?{...defaults(),...JSON.parse(row.payload)}:defaults();}
export async function report(){
 const data=await database().prepare('SELECT m.email,m.name,m.department,m.role,s.payload,s.updated_at FROM members m LEFT JOIN learner_states s ON s.user_id=m.user_id ORDER BY s.updated_at DESC LIMIT 100').all();
 return data.results.map((row:any)=>{const s=row.payload?JSON.parse(row.payload):initialState();const history=s.history||[];const retained=history.filter((h:any)=>h.retentionProbe);const concepts=s.course?.concepts||[];return {email:row.email,name:row.name,department:row.department,role:row.role,lastActive:row.updated_at||null,course:s.course?.title||'No journey',language:s.config.language,level:s.config.level,sessions:s.sessions,responses:history.length,correct:history.filter((h:any)=>h.correct).length,hints:history.filter((h:any)=>h.usedHint).length,seconds:history.reduce((n:number,h:any)=>n+h.seconds,0),mastery:concepts.length?Math.round(concepts.reduce((n:number,c:string)=>n+(s.mastery[c]||0),0)/concepts.length):null,completion:s.course?Math.round(100*s.completed.length/Math.min(s.course.activities.length,Math.max(3,s.course.duration))):0,retentionProbes:retained.length,retentionCorrect:retained.filter((h:any)=>h.correct).length,improvement:history.length?history.at(-1).mastery-history[0].previous:null,weakAreas:Object.entries(s.mastery).filter(([,m]:any)=>m<60).map(([c])=>c),xp:s.xp};});
}

export async function library(userId?:string){const member=userId?await database().prepare('SELECT department FROM members WHERE user_id=?').bind(userId).first():null;const q=userId?database().prepare("SELECT id,title,department,language,level FROM content_library WHERE department='All' OR department=? ORDER BY created_at DESC LIMIT 50").bind(member?.department||'Unassigned'):database().prepare('SELECT id,title,department,language,level FROM content_library ORDER BY created_at DESC LIMIT 50');return (await q.all()).results;}
export async function libraryCourse(userId:string,id:string){const member=await database().prepare('SELECT department FROM members WHERE user_id=?').bind(userId).first();const row=await database().prepare("SELECT payload FROM content_library WHERE id=? AND (department='All' OR department=?)").bind(id,member?.department||'Unassigned').first();if(!row)throw new Error('This journey is not available to your department.');return JSON.parse(row.payload);}
