import pg from 'pg';
export let pool:any=new pg.Pool({connectionString:process.env.DATABASE_URL,max:5,connectionTimeoutMillis:10000,idleTimeoutMillis:30000});
export function useDatabase(testPool:any){pool=testPool;}
function prepared(sql:string){let values:any[]=[];let index=0;const query=sql.replace(/\?/g,()=>'$'+(++index));return {query,get values(){return values;},bind(...args:any[]){values=args;return this;},async first(){return (await pool.query(query,values)).rows[0]||null;},async all(){return {results:(await pool.query(query,values)).rows};},async run(){const result=await pool.query(query,values);return {meta:{changes:result.rowCount||0}};}};}
export const databaseAdapter={prepare:prepared,async batch(statements:any[]){const client=await pool.connect();try{await client.query('BEGIN');for(const s of statements)await client.query(s.query,s.values);await client.query('COMMIT');}catch(e){await client.query('ROLLBACK');throw e;}finally{client.release();}}};
export const SCHEMA=`
CREATE TABLE IF NOT EXISTS app_users (id TEXT PRIMARY KEY,email TEXT UNIQUE NOT NULL,name TEXT NOT NULL,password_hash TEXT NOT NULL,created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS app_sessions (token_hash TEXT PRIMARY KEY,user_id TEXT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,expires_at TEXT NOT NULL);
CREATE INDEX IF NOT EXISTS app_sessions_expiry ON app_sessions(expires_at);
CREATE TABLE IF NOT EXISTS learner_states (user_id TEXT PRIMARY KEY,payload TEXT NOT NULL,revision INTEGER NOT NULL DEFAULT 0,updated_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS members (email TEXT PRIMARY KEY,user_id TEXT UNIQUE,name TEXT NOT NULL,role TEXT NOT NULL DEFAULT 'learner',department TEXT NOT NULL DEFAULT 'Unassigned');
CREATE TABLE IF NOT EXISTS organization_settings (id TEXT PRIMARY KEY,payload TEXT NOT NULL,updated_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS content_library (id TEXT PRIMARY KEY,title TEXT NOT NULL,department TEXT NOT NULL,language TEXT NOT NULL,level TEXT NOT NULL,payload TEXT NOT NULL,created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS source_documents (id TEXT PRIMARY KEY,owner_id TEXT NOT NULL,filename TEXT NOT NULL,reference_kind TEXT NOT NULL,semantic INTEGER NOT NULL DEFAULT 0,created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS source_vectors (id TEXT PRIMARY KEY,source_id TEXT NOT NULL,chunk_id TEXT NOT NULL,page INTEGER NOT NULL,content TEXT NOT NULL,vector TEXT);
CREATE TABLE IF NOT EXISTS generated_assets (id TEXT PRIMARY KEY,owner_id TEXT NOT NULL,object_key TEXT NOT NULL,activity_id TEXT NOT NULL,created_at TEXT NOT NULL,image_data TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS reminder_preferences (user_id TEXT PRIMARY KEY,email TEXT NOT NULL,enabled INTEGER NOT NULL DEFAULT 0,cadence_days INTEGER NOT NULL DEFAULT 1);
CREATE TABLE IF NOT EXISTS email_deliveries (id TEXT PRIMARY KEY,user_id TEXT NOT NULL,status TEXT NOT NULL,created_at TEXT NOT NULL);
CREATE INDEX IF NOT EXISTS source_owner ON source_documents(owner_id);
CREATE INDEX IF NOT EXISTS vector_source ON source_vectors(source_id);
CREATE INDEX IF NOT EXISTS asset_owner_activity ON generated_assets(owner_id,activity_id);
CREATE INDEX IF NOT EXISTS delivery_user_date ON email_deliveries(user_id,created_at);
`;
export async function migrate(){await pool.query(SCHEMA);}
