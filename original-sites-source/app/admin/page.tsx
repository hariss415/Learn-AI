import {requireChatGPTUser} from '../chatgpt-auth';
import {identity} from '@/lib/admin';
import AdminPortal from './portal';
export default async function Page(){const user=await requireChatGPTUser('/admin');const role=await identity(user);if(role==='learner')return <main><h1>Management access required</h1><p>Your learner account does not have permission to view management data.</p><a href="/learner">Open learner portal</a></main>;return <AdminPortal/>;}
