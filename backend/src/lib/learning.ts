import { z } from 'zod';
export const activitySchema = z.object({
 id:z.string().max(80), concept:z.string().max(100), difficulty:z.number().int().min(1).max(3),
 title:z.string().max(180), scenario:z.string().max(1800),
 visual:z.object({kind:z.enum(['email','conversation','brief']),from:z.string().max(180),subject:z.string().max(180),body:z.string().max(1600)}),
 options:z.array(z.object({id:z.string().max(20),label:z.string().max(300)})).min(3).max(4),
 correctId:z.string().max(20), explanation:z.string().max(1200),hint:z.string().max(700),
 evidence:z.string().max(1200),sourceRef:z.string().max(250),
});
export const courseSchema=z.object({title:z.string().max(180),objectives:z.array(z.string().max(300)).min(1).max(6),concepts:z.array(z.string().max(100)).min(1).max(6),activities:z.array(activitySchema).min(3).max(18)}).superRefine((v,ctx)=>{
 const ids=new Set();for(const a of v.activities){if(ids.has(a.id)||!v.concepts.includes(a.concept)||!a.options.some(o=>o.id===a.correctId)||new Set(a.options.map(o=>o.id)).size!==a.options.length)ctx.addIssue({code:'custom',message:'Invalid activity references'});ids.add(a.id);}
});
export type Activity=z.infer<typeof activitySchema>;
export type Course=z.infer<typeof courseSchema> & {mode:string;source:string;level:string;language:string;duration:number;sourceChunks?:{id:string;page:number;text:string}[]};
export type Config={language:string;level:string;duration:number;voice:boolean;gamification:boolean;reviewDays:number;audience?:string;tone?:string;foundationThreshold?:number;advancedThreshold?:number;nudges?:boolean};
export type State={config:Config;course:Course|null;activeId:string|null;mastery:Record<string,number>;history:any[];xp:number;completed:string[];hinted:string[];lastFeedback:any;review:Record<string,string>;sessions:number;lastVisit:string|null;generationTimes?:number[]};
export const initialState=():State=>({config:{language:'English',level:'Beginner',duration:5,voice:true,gamification:true,reviewDays:1},course:null,activeId:null,mastery:{},history:[],xp:0,completed:[],hinted:[],lastFeedback:null,review:{},sessions:0,lastVisit:null});
export function publicState(s:State){return {...s,course:s.course?{...s.course,activities:s.course.activities.map(({correctId,explanation,...a})=>a)}:null};}
export function chooseNext(s:State){
 if(!s.course||s.completed.length>=Math.min(s.course.activities.length,Math.max(3,Math.floor(s.course.duration))))return null;
 const remaining=s.course.activities.filter(a=>!s.completed.includes(a.id));
 const last=s.history.at(-1);
 if(s.completed.length>0&&last&&(!last.correct||last.usedHint||last.confidence<40)){const guided=remaining.filter(a=>a.concept===last.concept).sort((a,b)=>a.difficulty-b.difficulty);if(guided.length)return guided[0].id;}
 remaining.sort((a,b)=>{const target=(c:string)=>s.completed.length===0&&s.course?.level==='Advanced'?3:s.mastery[c]<(s.config.foundationThreshold??40)?1:s.mastery[c]<(s.config.advancedThreshold??80)?2:3;return (s.mastery[a.concept]-s.mastery[b.concept])+12*(Math.abs(a.difficulty-target(a.concept))-Math.abs(b.difficulty-target(b.concept)));});
 return remaining[0]?.id??null;
}
export function recordAnswer(s:State,answer:{activityId:string;optionId:string;confidence:number;seconds:number;explanation?:string;assessment?:any}){
 if(!s.course||s.activeId!==answer.activityId)throw new Error('This activity is no longer active. Refresh your journey.');
 const a=s.course.activities.find(a=>a.id===s.activeId)!;
 if(!a.options.some(o=>o.id===answer.optionId))throw new Error('Choose a valid response.');
 const correct=answer.optionId===a.correctId;const usedHint=s.hinted.includes(a.id);const previous=s.mastery[a.concept]??35;
 // Observable accuracy, hint independence and confidence calibration. Unobserved retention,
 // application quality and self-correction are deliberately excluded, rather than invented.
 const calibration=correct?answer.confidence:100-answer.confidence;
 const evidence=answer.assessment?(20*answer.assessment.score+10*(usedHint?30:100)+10*calibration)/40:(20*(correct?100:0)+10*(usedHint?30:100)+10*calibration)/40;
 const retentionProbe=Boolean(s.review[a.concept]&&new Date(s.review[a.concept]).getTime()<=Date.now());
 const mastery=Math.round(.8*previous+.2*evidence);s.mastery[a.concept]=mastery;
 const xp=s.config.gamification?(correct?(usedHint?15:25):5):0;s.xp+=xp;s.completed.push(a.id);
 const interval=mastery<60?s.config.reviewDays:mastery<80?3:7;
 s.review[a.concept]=new Date(Date.now()+interval*86400000).toISOString();
 const recent=s.history.filter(h=>h.concept===a.concept).slice(-2);
 const reason=!correct&&answer.confidence>=75?'High confidence + incorrect: revisit the misconception.':!correct?'A missed cue: guided practice comes next.':usedHint?'Correct with a hint: reinforce before increasing difficulty.':answer.confidence<40?'Correct, but uncertain: build confidence with another example.':answer.seconds<30?'Fast and accurate: progress toward a harder challenge.':'Correct: continue at a steady pace.';
 s.history.push({id:crypto.randomUUID(),at:new Date().toISOString(),concept:a.concept,activity:a.title,correct,usedHint,confidence:answer.confidence,seconds:answer.seconds,previous,mastery,xp,reason,explanation:answer.explanation?.slice(0,1000)||null,assessment:answer.assessment||null,retentionProbe,repeatError:!correct&&recent.some(h=>!h.correct)});
 s.history=s.history.slice(-500);s.activeId=chooseNext(s);s.lastFeedback={correct,explanation:a.explanation,correctLabel:a.options.find(o=>o.id===a.correctId)!.label,previous,mastery,xp,reason,concept:a.concept,assessment:answer.assessment||null};s.lastVisit=new Date().toISOString();return s;
}
