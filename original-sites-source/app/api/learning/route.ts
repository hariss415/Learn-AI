import { getChatGPTUser } from '@/app/chatgpt-auth';
import {identity,settings,library,libraryCourse} from '@/lib/admin';
import {assessSpokenDecision} from '@/lib/voice';
import {load,save} from '@/lib/store';
import {chooseNext,publicState,recordAnswer} from '@/lib/learning';
import {prepared} from '@/lib/prepared';
import {generate,liveAvailable} from '@/lib/generator';
import {retrievePublicPage,validatePublicUrl} from '@/lib/url';
import {z} from 'zod';
import {extractedDocumentSchema,chunkDocument} from '@/lib/source';
export const dynamic='force-dynamic';
const config=z.object({language:z.enum(['English','Urdu','English + Urdu']),level:z.enum(['Beginner','Intermediate','Advanced']),duration:z.number().int().min(3).max(20),voice:z.boolean(),gamification:z.boolean(),reviewDays:z.number().int().min(1).max(7),audience:z.string().max(120).optional(),tone:z.string().max(40).optional(),foundationThreshold:z.number().min(20).max(60).optional(),advancedThreshold:z.number().min(65).max(95).optional(),nudges:z.boolean().optional()});
const respond=(s:any)=>Response.json(s,{headers:{'Cache-Control':'no-store'}});
export async function GET(){const user=await getChatGPTUser();if(!user)return respond({error:'Sign in to save and resume your learning.',signIn:true});try{const role=await identity(user);const {state,revision}=await load(user.userId);if(revision<0)state.config=await settings();return respond({state:publicState(state),library:await library(user.userId),role,liveAI:liveAvailable(),name:user.fullName||'Learner'});}catch(e){return Response.json({error:(e as Error).message},{status:503});}}
export async function POST(request:Request){
 const user=await getChatGPTUser();if(!user)return Response.json({error:'Sign in to continue.'},{status:401});
 const origin=request.headers.get('origin');if(origin&&origin!==new URL(request.url).origin)return Response.json({error:'Invalid request origin'},{status:403});
 if(Number(request.headers.get('content-length')||0)>7_000_000)return Response.json({error:'Upload must be under 5 MB.'},{status:413});
 try{const role=await identity(user);const loaded=await load(user.userId);const s=loaded.state;let revision=loaded.revision;let body:any;
 const raw=await request.text();if(raw.length>7_000_000)throw new Error('Upload must be under 5 MB.');body=JSON.parse(raw);
 if(body.action==='config'){s.config=config.parse(body.config);}
 else if(body.action==='library'){const course=await libraryCourse(user.userId,z.string().uuid().parse(body.id));s.course=course;s.config={...s.config,level:course.level,language:course.language,duration:course.duration};s.completed=[];s.hinted=[];s.lastFeedback=null;for(const c of course.concepts)s.mastery[c]??=course.level==='Advanced'?65:course.level==='Intermediate'?50:35;s.activeId=chooseNext(s);s.sessions++;s.lastVisit=new Date().toISOString();}
 else if(body.action==='generate'){
 const shared=await settings();const c=config.parse({...shared,...(body.config||s.config),audience:shared.audience,tone:shared.tone,foundationThreshold:shared.foundationThreshold,advancedThreshold:shared.advancedThreshold,nudges:shared.nudges});const topic=z.string().min(3).max(20000).parse(body.topic);const source=z.enum(['topic','document','url']).parse(body.source||'topic');
 // Rate limit costly generation using persistent per-learner history.
 if(s.lastVisit&&Date.now()-new Date(s.lastVisit).getTime()<10000&&source!=='topic')throw new Error('Please wait a few seconds before generating another experience.');
 let course=source==='topic'?prepared(topic,c.level,c.language,c.duration):null;
 if(!course){if(!liveAvailable())return Response.json({error:'Live generation is unavailable because the server AI API key has not been configured. Document text can be extracted and previewed, but a new learning journey needs this connection.',code:'AI_NOT_CONFIGURED'},{status:503});
 const sourceChunks=source==='document'?chunkDocument(extractedDocumentSchema.parse(body.document)):undefined;const filename=source==='document'?body.document.filename:undefined;
 const now=Date.now();s.generationTimes=(s.generationTimes||[]).filter(t=>now-t<300000);if(s.generationTimes.length>=6||s.generationTimes.some(t=>now-t<10000))throw new Error('Please wait before generating another AI experience. Limit: 6 experiences per 5 minutes.');s.generationTimes.push(now);await save(user.userId,s,revision);revision=revision<0?0:revision+1;
 let sourceText=topic;let sourceUrl:string|undefined;
 if(source==='url'){validatePublicUrl(topic);const page=await retrievePublicPage(topic);sourceText=page.text;sourceUrl=page.url;}
 course=await generate({topic:sourceText,language:c.language,level:c.level,duration:c.duration,sourceChunks,filename,audience:c.audience,tone:c.tone,referenceKind:body.document?.referenceKind});
 if(sourceUrl){course.source=sourceUrl;course.activities=course.activities.map(a=>({...a,sourceRef:sourceUrl!}));}}
 s.config=c;s.course=course;s.completed=[];s.hinted=[];s.lastFeedback=null;
 for(const concept of course.concepts)s.mastery[concept]??=c.level==='Advanced'?65:c.level==='Intermediate'?50:35;
 s.activeId=chooseNext(s);s.sessions++;s.lastVisit=new Date().toISOString();
 }else if(body.action==='hint'){if(!s.activeId)throw new Error('Start an activity first.');if(!s.hinted.includes(s.activeId))s.hinted.push(s.activeId);}
 else if(body.action==='voice'){if(!liveAvailable())return Response.json({error:'Semantic speech evaluation requires the server AI connection.'},{status:503});const input=z.object({activityId:z.string().max(80),transcript:z.string().trim().min(3).max(1000),confidence:z.number().min(0).max(100),seconds:z.number().min(0).max(3600)}).parse(body);if(input.activityId!==s.activeId)throw new Error('Activity changed. Refresh before continuing.');const a=s.course?.activities.find(a=>a.id===s.activeId);if(!a)throw new Error('Start a mission first.');const now=Date.now();s.generationTimes=(s.generationTimes||[]).filter(t=>now-t<300000);if(s.generationTimes.length>=6||s.generationTimes.some(t=>now-t<10000))throw new Error('Please wait before another AI request.');s.generationTimes.push(now);await save(user.userId,s,revision);revision=revision<0?0:revision+1;const judged=await assessSpokenDecision(a,input.transcript);if(!judged.optionId)return Response.json({error:'Your answer was unclear. Say which action you would take, or select a response.'},{status:422});recordAnswer(s,{...input,optionId:judged.optionId,explanation:input.transcript});s.lastFeedback.voiceInterpretation=judged.reason;}
 else if(body.action==='answer'){const answer=z.object({activityId:z.string().max(80),optionId:z.string().max(20),confidence:z.number().min(0).max(100),seconds:z.number().min(0).max(3600),explanation:z.string().max(1000).optional()}).parse(body);recordAnswer(s,answer);}
 else if(body.action==='review'){if(!s.course)throw new Error('Generate a journey first.');s.completed=[];s.hinted=[];s.lastFeedback=null;s.activeId=chooseNext(s);s.sessions++;}
 else throw new Error('Unknown action');
 await save(user.userId,s,revision);return respond({state:publicState(s),library:await library(user.userId),role,liveAI:liveAvailable(),name:user.fullName||'Learner'});
 }catch(e){console.error('Learning operation failed', (e as Error).name);return Response.json({error:e instanceof z.ZodError?'Please check your inputs.':(e as Error).message||'Unable to save your learning.'},{status:400});}
}
