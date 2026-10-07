import Workspace from '../workspace';
import {requireChatGPTUser} from '../chatgpt-auth';
export default async function Page(){await requireChatGPTUser('/learner');return <Workspace/>;}
