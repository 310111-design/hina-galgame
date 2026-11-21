import fs from 'node:fs/promises';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
const run=promisify(execFile), root=await fs.realpath(process.cwd());
async function env(){for(const l of (await fs.readFile('.env','utf8')).split(/\r?\n/)){const m=l.match(/^\s*([\w]+)\s*=\s*(.*?)\s*$/);if(m&&!process.env[m[1]])process.env[m[1]]=m[2].replace(/^(["'])(.*)\1$/,'$2')}}
await env(); const base=process.env.IMAGE_API_BASE_URL?.replace(/\/+$/,''),key=process.env.IMAGE_API_KEY,model=process.env.IMAGE_MODEL;
if(!base||!key||!model)throw Error('Configure IMAGE_API_BASE_URL, IMAGE_API_KEY, IMAGE_MODEL in .env');
const task=process.argv.slice(2).join(' ')||'執行 plan.md 的下一個可獨立完成階段';
function file(p){if(typeof p!=='string'||path.isAbsolute(p)||p.replaceAll('\\','/').split('/').some(x=>['..','.env','.git'].includes(x)))throw Error('Blocked path');const f=path.resolve(root,p);if(!f.startsWith(root+path.sep))throw Error('Outside project');return f}
const specs=[
['list_files','List files in project directory',{path:{type:'string'}},[]],
['read_file','Read project UTF-8 file (cannot read secrets)',{path:{type:'string'}},['path']],
['write_file','Create or replace project UTF-8 file',{path:{type:'string'},content:{type:'string'}},['path','content']],
['validate','Run one fixed repository validator',{name:{type:'string',enum:['game-data','shells','routes']}},['name']],
['git_commit_push','Stage all nonignored project changes, commit, then push main',{message:{type:'string'}},['message']]
];
const tools=specs.map(([name,description,properties,required])=>({type:'function',function:{name,description,parameters:{type:'object',properties,required,additionalProperties:false}}}));
async function invoke(n,a){if(n==='list_files')return (await fs.readdir(file(a.path||'.'),{withFileTypes:true})).filter(x=>!['.env','.git'].includes(x.name)).map(x=>(x.isDirectory()?'dir ':'file ')+x.name).join('\n');if(n==='read_file')return fs.readFile(file(a.path),'utf8');if(n==='write_file'){if(a.path==='scripts/ai-agent.mjs')throw Error('Protected agent source');const f=file(a.path);await fs.mkdir(path.dirname(f),{recursive:true});await fs.writeFile(f,a.content);return 'Wrote '+a.path}if(n==='validate'){const s={ 'game-data':'scripts/validate-game-data.js',shells:'scripts/validate-game-shells.js',routes:'scripts/validate-route-drafts.js'}[a.name];return (await run(process.execPath,[s],{cwd:root,maxBuffer:2e6})).stdout}if(n==='git_commit_push'){await run('git',['add','-A'],{cwd:root});await run('git',['commit','-m',a.message||'chore: project iteration'],{cwd:root});return (await run('git',['push','origin','main'],{cwd:root})).stdout}throw Error('Unknown tool')}
const system=`You are a project iteration agent. First read knowledge/plan.md and knowledge/experience.md and decision.md. Choose the first unfinished nonblocked item, implement one coherent stage, run relevant fixed validators, record reusable experience and scope, update plan checkboxes only when done. Make reasonable decisions; document unresolved decisions with recommendation and continue independent work. Preserve .env and original art. No arbitrary shell. Commit and push only after stage/docs are complete. Report concise Chinese progress. If no work remains, say so.`;
let messages=[{role:'system',content:system},{role:'user',content:task}];
for(let i=0;i<24;i++){const r=await fetch(base+'/chat/completions',{method:'POST',headers:{Authorization:'Bearer '+key,'Content-Type':'application/json'},body:JSON.stringify({model,messages,tools,tool_choice:'auto'})});if(!r.ok)throw Error('API HTTP '+r.status);const m=(await r.json()).choices?.[0]?.message;if(!m)throw Error('Empty model response');messages.push(m);if(!m.tool_calls?.length){console.log(m.content);break}for(const c of m.tool_calls){let out;try{out=await invoke(c.function.name,JSON.parse(c.function.arguments||'{}'))}catch(e){out='ERROR '+e.message}messages.push({role:'tool',tool_call_id:c.id,content:String(out).slice(0,20000)})}}
