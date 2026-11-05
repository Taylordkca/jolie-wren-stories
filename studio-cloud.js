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
 state={...blank(),storyTitle:detail.title,storyId:detail.slug,description:detail.description||'',storyType:detail.type,access:detail.access,storySpice:String(detail.typical_spice),tags:(detail.tags||[]).join(', '),episodes:(eps||[]).map((e,i)=>({...blankEpisode(i+1),title:e.title,spice:e.spice,warnings:(e.warnings||[]).join(', '),manuscript:manuscriptFromBlocks(e.content),notes:e.author_note||''})),selected:0};
 if(!state.episodes.length)state.episodes=[blankEpisode(1)];
 loadedStoryId=detail.id;loadedStatus=detail.status;
 render();scheduleSave();note(`Opened "${detail.title}" (${detail.status}). Poll and scheduling metadata are not yet restored by this version; check your manuscript backup.`);
}
$('cloudRefresh').onclick=loadLibrary;
for(const id of ['cloudSearch','cloudFilter','cloudSort'])$(id).addEventListener(id==='cloudSearch'?'input':'change',renderLibrary);
$('cloudNew').onclick=()=>{if(!confirm('Start a new story? Save or export current changes first.'))return;state=blank();loadedStoryId=null;loadedStatus=null;render();scheduleSave();note('New story started.');};

async function upload(publish){
 if(!currentUser){note('Sign in first.');return;}
 sync();let data;
 try { data=build(!publish); } catch(e) { note(e.message); return; }
 if(!publish && loadedStatus==='published'){note('This story is published. Save Draft would unpublish it, so the operation was blocked. Use Publish to update public content, or create a new story.');return;}
 if(publish && data.episodes.some(e=>!e.blocks.length)){note('Finish every episode before publishing. Empty episodes are allowed in drafts.');return;}
 if(publish && state.access!=='free'){note('Premium publishing is disabled until protected reader access is implemented.');return;}
 if(publish && !confirm('Publish this FREE story and ALL its episodes immediately? They will be readable by everyone.'))return;
 $('cloudSave').disabled=$('cloudPublish').disabled=true;
 note(publish?'Publishing…':'Saving private draft…');
 try {
   const storySlug=data.id;
   const {data:found,error:lookupError}=await client.from('stories').select('id,status').eq('slug',storySlug).maybeSingle();
   if(lookupError)throw lookupError;
   if(loadedStoryId && found?.id!==loadedStoryId)throw Error('Story ID changed since opening this story. Restore the original ID or start a new story.');
   if(found && found.status==='published' && !publish)throw Error('Cannot turn a published story back into a draft with Save Draft.');
   const now=new Date().toISOString();
   const storyRow={slug:storySlug,title:data.title,description:data.description,tags:data.tags,type:state.storyType,typical_spice:Number(state.storySpice)||0,access:state.access,owner_id:currentUser.id,status:publish?'published':'draft',published_at:publish?now:null,updated_at:now};
   let storyId=found?.id;
   if(storyId){const {error}=await client.from('stories').update(storyRow).eq('id',storyId);if(error)throw error;}
   else {const {data:inserted,error}=await client.from('stories').insert(storyRow).select('id').single();if(error)throw error;storyId=inserted.id;}
   // Only edit matching episode numbers. Never delete other saved episodes automatically.
   for(let i=0;i<data.episodes.length;i++){
     const ep=data.episodes[i];
     const row={story_id:storyId,episode_number:i+1,title:ep.title,content:ep.blocks,warnings:ep.warnings||[],spice:ep.spice,author_note:ep.notes||'',access:'free',status:publish?'published':'draft',published_at:publish?now:null,updated_at:now};
     const {error}=await client.from('episodes').upsert(row,{onConflict:'story_id,episode_number'});
     if(error)throw error;
   }
   loadedStoryId=storyId;loadedStatus=publish?'published':'draft';
   await loadLibrary();
   note(publish?'Published! Open the Story Library in a new tab to test.':'Private draft saved in Supabase. It is not visible to readers.');
 } catch(e) { note('Cloud operation failed: '+e.message+' — Your local draft is still here.'); }
 finally {$('cloudSave').disabled=$('cloudPublish').disabled=false;}
}
$('cloudSave').onclick=()=>upload(false);
$('cloudPublish').onclick=()=>upload(true);
refresh();
})();
