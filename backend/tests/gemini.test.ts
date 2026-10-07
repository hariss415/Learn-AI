import {test} from 'node:test';
import assert from 'node:assert/strict';
import {newDb} from 'pg-mem';
import {env} from '../src/lib/env';
import {useDatabase,migrate,pool as unused} from '../src/lib/database';
import {jsonCompletion} from '../src/lib/ai';
import {generate} from '../src/lib/generator';
import {prepared} from '../src/lib/prepared';
import {chunkDocument} from '../src/lib/source';
import {indexSource,searchSources} from '../src/lib/retrieval';
import {retrievePublicPage} from '../src/lib/url';
import {assessOpen} from '../src/lib/advanced-ai';
await test('Gemini adapter, source-grounded generation and model-isolated retrieval',async()=>{
 const memory=newDb();const Pg=memory.adapters.createPg();const db=new Pg.Pool();useDatabase(db);await migrate();const original=globalThis.fetch;
 Object.assign(env,{AI_PROVIDER:'gemini',GEMINI_API_KEY:'mock-key-no-real-call',GEMINI_MODEL:'gemini-2.5-flash',GEMINI_EMBEDDING_MODEL:'gemini-embedding-2'});
 let result:any={reply:'Test answer'},finish='STOP',status=200,metadata:any=undefined;const requests:any[]=[];
 globalThis.fetch=async(input:any,init:any)=>{const url=String(input);assert.ok(url.startsWith('https://generativelanguage.googleapis.com/'));assert.ok(!url.includes('mock-key'));assert.equal(init.headers['x-goog-api-key'],'mock-key-no-real-call');const body=JSON.parse(init.body);requests.push({url,body});if(url.endsWith(':batchEmbedContents'))return Response.json({embeddings:body.requests.map(()=>({values:Array.from({length:768},(_,i)=>i===0?1:0)}))});return Response.json({candidates:[{finishReason:finish,content:{parts:[{text:typeof result==='string'?result:JSON.stringify(result)}]},urlContextMetadata:metadata}]},{status});};
 try{
 assert.deepEqual(await jsonCompletion('Test instruction',{message:'Hello'}),{reply:'Test answer'});assert.equal(requests[0].body.generationConfig.responseMimeType,'application/json');assert.equal(requests[0].body.systemInstruction.parts[0].text,'Test instruction');
 finish='MAX_TOKENS';await assert.rejects(()=>jsonCompletion('test',{}),/incomplete/);finish='STOP';result='not JSON';await assert.rejects(()=>jsonCompletion('test',{}),/invalid JSON/);status=429;await assert.rejects(()=>jsonCompletion('test',{}),/quota/);status=200;
 const doc={filename:'wellbeing.docx',referenceKind:'section' as const,pages:[{page:1,text:'Employee wellbeing policy. Managers review workload regularly. Employees can request confidential support and agree on priorities. Never demand personal medical information during a public team discussion. Follow up within seven days.'}]};const chunks=chunkDocument(doc);const course=prepared('phishing','Beginner','English',5)!;result={...course,activities:course.activities.map(a=>({...a,sourceRef:chunks[0].id,evidence:chunks[0].text.slice(0,90)}))};const generated=await generate({topic:'Create from document',language:'English',level:'Beginner',duration:5,filename:doc.filename,referenceKind:'section',sourceChunks:chunks});assert.ok(generated.activities[0].sourceRef.includes('section 1'));result.activities[0].evidence='Invented policy evidence that does not occur in the source.';await assert.rejects(()=>generate({topic:'Document',language:'English',level:'Beginner',duration:5,sourceChunks:chunks}),/evidence|excerpt|source/i);
 const indexed=await indexSource('A',doc);assert.equal(indexed.mode,'Semantic');assert.equal((await searchSources('A','workload'))[0].mode,'Semantic');assert.equal((await searchSources('B','workload')).length,0);const request=requests.find(r=>r.url.endsWith(':batchEmbedContents'));assert.equal(request.body.requests[0].embedContentConfig.outputDimensionality,768);assert.ok(request.body.requests[0].content.parts[0].text.includes('text: '));
 Object.assign(env,{GEMINI_EMBEDDING_MODEL:'different-model'});assert.equal((await searchSources('A','workload'))[0].mode,'Keyword');Object.assign(env,{GEMINI_EMBEDDING_MODEL:'gemini-embedding-2'});
 const criterion={score:3,reason:'Test justification'};result={application:criterion,reasoning:criterion,sourceUse:criterion,safety:criterion,uncertain:false,feedback:'Test feedback',quote:chunks[0].text.slice(0,90)};assert.equal((await assessOpen(generated.activities[0],'I would discuss workload privately.','Urdu')).score,75);
 result='Retrieved learning material. '.repeat(12);metadata={urlMetadata:[{retrievedUrl:'https://www.google.com/article',urlRetrievalStatus:'URL_RETRIEVAL_STATUS_SUCCESS'}]};assert.ok((await retrievePublicPage('https://www.google.com/article')).text.length>200);metadata={urlMetadata:[{retrievedUrl:'https://www.google.com/other',urlRetrievalStatus:'URL_RETRIEVAL_STATUS_SUCCESS'}]};await assert.rejects(()=>retrievePublicPage('https://www.google.com/article'),/not verified/);
 }finally{globalThis.fetch=original;await db.end();await unused.end();}
});
