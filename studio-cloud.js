(() => {
'use strict';
const $ = id => document.getElementById(id);
const note = s => { $('cloudStatus').textContent = s; };
if (!window.supabase || !window.JOLIE_SUPABASE_URL || !window.JOLIE_SUPABASE_PUBLISHABLE_KEY) { note('Cloud library failed to load. Local editing still works.'); return; }
const client = window.supabase.createClient(window.JOLIE_SUPABASE_URL, window.JOLIE_SUPABASE_PUBLISHABLE_KEY);
let currentUser = null;
let loadedStoryId = null;
let loadedStatus = null;
let libraryCache=[];
let episodeRows=[];
function showLogin(user) { currentUser=user; $('cloudLoggedOut').hidden=!!user; $('cloudLoggedIn').hidden=!user; $('cloudIdentity').textContent=user ? `Signed in: ${user.email}` : ''; }
async function refresh() {
 const {data:{user},error} = await client.auth.getUser();
 if(error && error.name!=='AuthSessionMissingError') note(error.message);
 if (!user) { showLogin(null); return; }
 const {data,error:authError}=await client.from('authors').select('user_id').eq('user_id',user.id).maybeSingle();
 if(authError || !data) { await client.auth.signOut(); showLogin(null); note('This login is not authorized as an author.'); return; }
 showLogin(user);
 await loadLibrary();
}
$('cloudLogin').onclick=async()=>{note('Signing in…'); const {error}=await client.auth.signInWithPassword({email:$('cloudEmail').value.trim(),password:$('cloudPassword').value}); $('cloudPassword').value=''; if(error){note(error.message);return;}await refresh();note(currentUser?'Signed in. Your drafts can now be saved privately.':'Sign-in failed.');};
$('cloudLogout').onclick=async()=>{await client.auth.signOut();showLogin(null);loadedStoryId=null;loadedStatus=null;$('cloudLibraryList').replaceChildren();note('Signed out.');};

function manuscriptFromBlocks(blocks){
 return (Array.isArray(blocks)?blocks:[]).map(b=>{
  if(b.type==='chapter')return `[CHAPTER: ${b.title||'New Chapter'}]`;
  if(b.type==='spicy')return `[SPICY START: ${b.label||'Explicit scene'}]\n\n${b.text||''}\n\n[SPICY RECAP]\n\n${b.recap||''}\n\n[SPICY END]`;
  return b.text||'';
 }).join('\n\n');
}
async function loadLibrary(){
 const root=$('cloudLibraryList');root.replaceChildren();
 if(!currentUser)return;
 const {data,error}=await client.from('stories').select('id,slug,title,status,updated_at').eq('owner_id',currentUser.id).order('updated_at',{ascending:false});
 if(error){note('Could not load library: '+error.message);return;}
 libraryCache=data||[];renderLibrary();
}
function renderLibrary(){
 const root=$('cloudLibraryList');root.replaceChildren();
 const term=($('cloudSearch')?.value||'').toLowerCase().trim(),filter=$('cloudFilter')?.value||'all',sort=$('cloudSort')?.value||'updated';
 let rows=libraryCache.filter(x=>(!term||`${x.title} ${x.slug}`.toLowerCase().includes(term))&&(filter==='all'||x.status===filter));
 if(sort==='az')rows.sort((a,b)=>a.title.localeCompare(b.title));
 else if(sort==='za')rows.sort((a,b)=>b.title.localeCompare(a.title));
 else rows.sort((a,b)=>String(b.updated_at||'').localeCompare(String(a.updated_at||'')));
 $('cloudCount').textContent=`${rows.length} of ${libraryCache.length} stories`;
 if(!rows.length){root.textContent=libraryCache.length?'No matching stories.':'No cloud stories yet.';return;}
 for(const story of rows){const row=document.createElement('div');row.className='cloud-story-row';const b=document.createElement('button');b.type='button';b.className='secondary';b.textContent=`Open · ${story.title} (${story.status})`;b.onclick=()=>openStory(story);row.append(b);root.append(row);}

}
async function openStory(story){
 if(!currentUser)return;
 if(!confirm(`Open "${story.title}" from Supabase? This replaces the current local editor contents. Save or export any unsaved changes first.`))return;
 note('Loading cloud story…');
 const {data:detail,error:storyError}=await client.from('stories').select('*').eq('id',story.id).single();
 if(storyError){note(storyError.message);return;}
 const {data:eps,error:epError}=await client.from('episodes').select('*').eq('story_id',story.id).order('episode_number',{ascending:true});
 if(epError){note(epError.message);return;}
 state={...blank(),storyTitle:detail.title,storyId:detail.slug,description:detail.description||'',storyType:detail.type,access:detail.access,storySpice:String(detail.typical_spice),tags:(detail.tags||[]).join(', '),episodes:(eps||[]).map((e,i)=>({...blankEpisode(i+1),title:e.title,spice:e.spice,warnings:(e.warnings||[]).join(', '),manuscript:manuscriptFromBlocks(e.content),notes:e.author_note||'',publishAt:e.scheduled_for?new Date(e.scheduled_for).toLocaleString('sv-SE',{timeZone:'America/New_York',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'}).replace(' ','T'):'',pollQuestion:e.poll_data?.question||'',pollOptions:(e.poll_data?.options||[]).join('\n'),fallback:e.poll_data?.authorFallback==null?'':String(e.poll_data.authorFallback),pollClose:e.poll_data?.closesAtEastern||'',pollStatus:e.poll_data?.status||'draft'})),selected:0};
 if(!state.episodes.length)state.episodes=[blankEpisode(1)];
 loadedStoryId=detail.id;loadedStatus=detail.status;episodeRows=eps||[];
 render();renderEpisodeDashboard();scheduleSave();note(`Opened "${detail.title}" (${detail.status}). Poll and scheduling metadata restored when present. Scheduling is metadata only, not automatic publication.`);
}
$('cloudRefresh').onclick=loadLibrary;
for(const id of ['cloudSearch','cloudFilter','cloudSort'])$(id).addEventListener(id==='cloudSearch'?'input':'change',renderLibrary);
$('cloudNew').onclick=()=>{if(!confirm('Start a new story? Save or export current changes first.'))return;state=blank();loadedStoryId=null;loadedStatus=null;episodeRows=[];render();renderEpisodeDashboard();scheduleSave();note('New story started.');};

// Interpret author-entered wall-clock time as America/New_York, including DST.
function easternToUTC(local){
 const m=String(local).match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/);
 if(!m)throw Error('Invalid Eastern scheduling date/time.');
 const [y,mo,d,h,mi]=m.slice(1).map(Number);
 const target=Date.UTC(y,mo-1,d,h,mi);
 const fmt=new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'});
 function parts(ms){const p=Object.fromEntries(fmt.formatToParts(ms).map(x=>[x.type,Number(x.value)]));return Date.UTC(p.year,p.month-1,p.day,p.hour,p.minute)}
 const matches=[];
 for(let offset=-300;offset<=-240;offset+=60){const candidate=target-offset*60000;if(parts(candidate)===target)matches.push(candidate)}
 if(matches.length!==1)throw Error('Eastern scheduling time is ambiguous or nonexistent due to daylight saving time. Choose a different time.');
 return new Date(matches[0]).toISOString();
}
// V0.9: individual episode operations, without changing previously published rows.
function renderEpisodeDashboard(){
 const root=$('cloudEpisodeDashboard');if(!root)return;root.replaceChildren();
 state.episodes.forEach((ep,i)=>{
  const row=episodeRows.find(x=>x.episode_number===i+1);
  const status=row?.status||'unsaved';
  const div=document.createElement('div');div.className='cloud-story-row episode-status-row';
  const b=document.createElement('button');b.type='button';b.className='secondary';
  b.textContent=`${i+1}. ${ep.title||'Untitled'} — ${status}${row?.scheduled_for?' · planned '+new Date(row.scheduled_for).toLocaleString('en-US',{timeZone:'America/New_York',dateStyle:'medium',timeStyle:'short'})+' ET':''}`;
  b.onclick=()=>{sync();state.selected=i;renderEpisode();};div.append(b);root.append(div);
 });
}
document.addEventListener('jolie-episode-changed',renderEpisodeDashboard);
function selectedPayload(requireText){
 sync();if(!state.storyTitle.trim())throw Error('Enter a story title.');
 const i=state.selected,e=state.episodes[i];if(!e?.title.trim())throw Error('Enter an episode title.');
 const blocks=parseManuscript(e.manuscript);
 if(requireText&&!blocks.length)throw Error('The selected episode needs manuscript text before publishing.');
 const choices=e.pollOptions.split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
 let poll=null;
 if(e.pollQuestion.trim()||choices.length){
  if(!e.pollQuestion.trim()||choices.length<2)throw Error('A poll needs a question and two options.');
  if(e.fallback===''||Number(e.fallback)>=choices.length)throw Error('Select an author fallback choice.');
  poll={question:e.pollQuestion.trim(),options:choices,authorFallback:Number(e.fallback),status:e.pollStatus||'draft'};
  if(e.pollClose)poll.closesAtEastern=e.pollClose;
 }
 return {number:i+1,title:e.title,content:blocks,warnings:split(e.warnings),spice:Math.max(0,Math.min(5,Number(e.spice)||0)),author_note:e.notes||'',poll_data:poll,scheduled_for:e.publishAt?easternToUTC(e.publishAt):null};
}
async function saveCloud(mode){
 if(!currentUser){note('Sign in first.');return;}
 if(state.access!=='free'&&mode==='publish'){note('Premium publishing is disabled until reader access is secured.');return;}
 let payload;
 try{payload=selectedPayload(mode==='publish');}catch(e){note(e.message);return;}
 const selectedExisting=episodeRows.find(e=>e.episode_number===payload.number);
 if(mode==='draft'&&selectedExisting?.status==='published'){
  note('This episode is already published. Use Publish selected episode to update its live text. Other draft episodes can be saved normally.');return;
 }
 if(mode==='publish'&&!confirm(`Publish episode ${payload.number} (${payload.title}) NOW? Only this episode will become public. This is not scheduled publishing.`))return;
 const buttons=['cloudSave','cloudPublish','cloudSaveEpisode','cloudPublishEpisode'].map($).filter(Boolean);
 buttons.forEach(b=>b.disabled=true);note(mode==='publish'?'Publishing selected episode…':'Saving selected draft episode…');
 try{
  const slugValue=slug(state.storyId||state.storyTitle);
  const {data:found,error:fe}=await client.from('stories').select('id,status,owner_id,published_at').eq('slug',slugValue).maybeSingle();if(fe)throw fe;
  if(found&&found.owner_id!==currentUser.id)throw Error('This story ID belongs to another author.');
  if(loadedStoryId&&found?.id!==loadedStoryId)throw Error('Story ID changed. Restore the original ID before saving.');
  const now=new Date().toISOString();
  const storyRow={slug:slugValue,title:state.storyTitle.trim(),description:state.description.trim(),tags:split(state.tags),type:state.storyType,typical_spice:Math.max(0,Math.min(5,Number(state.storySpice)||0)),access:state.access,owner_id:currentUser.id,updated_at:now};
  let id=found?.id;
  if(id){const {error}=await client.from('stories').update({...storyRow,status:mode==='publish'?'published':found.status,published_at:found.published_at||(mode==='publish'?now:null)}).eq('id',id);if(error)throw error;}
  else{const {data,error}=await client.from('stories').insert({...storyRow,status:mode==='publish'?'published':'draft',published_at:mode==='publish'?now:null}).select('id').single();if(error)throw error;id=data.id;}
  const row={...payload,story_id:id,episode_number:payload.number,status:mode==='publish'?'published':'draft',access:'free',updated_at:now};
  // Retain original publication timestamp on revisions.
  if(mode==='publish')row.published_at=selectedExisting?.published_at||now;
  else row.published_at=null;
  const {error:ee}=await client.from('episodes').upsert(row,{onConflict:'story_id,episode_number'});if(ee)throw ee;
  loadedStoryId=id;loadedStatus=mode==='publish'?'published':(found?.status||'draft');
  const {data:eps,error:re}=await client.from('episodes').select('*').eq('story_id',id).order('episode_number');if(re)throw re;
  episodeRows=eps||[];renderEpisodeDashboard();await loadLibrary();
  note(mode==='publish'?`Episode ${payload.number} is published! Other episodes were not published.`:`Episode ${payload.number} saved privately. Previously published episodes remain live.`);
 }catch(e){note('Cloud operation failed: '+e.message+' — Your local editor contents are still here.');}
 finally{buttons.forEach(b=>b.disabled=false);}
}
$('cloudSave').onclick=()=>saveCloud('draft');
$('cloudPublish').onclick=()=>saveCloud('publish');
$('cloudSaveEpisode').onclick=()=>saveCloud('draft');
$('cloudPublishEpisode').onclick=()=>saveCloud('publish');
refresh();
})();
