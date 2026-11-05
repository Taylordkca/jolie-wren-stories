(() => {
'use strict';
const $ = id => document.getElementById(id);
const note = s => { $('cloudStatus').textContent = s; };
if (!window.supabase || !window.JOLIE_SUPABASE_URL || !window.JOLIE_SUPABASE_PUBLISHABLE_KEY) { note('Cloud library failed to load. Local editing still works.'); return; }
const client = window.supabase.createClient(window.JOLIE_SUPABASE_URL, window.JOLIE_SUPABASE_PUBLISHABLE_KEY);
let currentUser = null;
function showLogin(user) { currentUser=user; $('cloudLoggedOut').hidden=!!user; $('cloudLoggedIn').hidden=!user; $('cloudIdentity').textContent=user ? `Signed in: ${user.email}` : ''; }
async function refresh() {
 const {data:{user},error} = await client.auth.getUser();
 if(error && error.name!=='AuthSessionMissingError') note(error.message);
 if (!user) { showLogin(null); return; }
 const {data,error:authError}=await client.from('authors').select('user_id').eq('user_id',user.id).maybeSingle();
 if(authError || !data) { await client.auth.signOut(); showLogin(null); note('This login is not authorized as an author.'); return; }
 showLogin(user);
}
$('cloudLogin').onclick=async()=>{note('Signing in…'); const {error}=await client.auth.signInWithPassword({email:$('cloudEmail').value.trim(),password:$('cloudPassword').value}); $('cloudPassword').value=''; if(error){note(error.message);return;}await refresh();note(currentUser?'Signed in. Your drafts can now be saved privately.':'Sign-in failed.');};
$('cloudLogout').onclick=async()=>{await client.auth.signOut();showLogin(null);note('Signed out.');};
async function upload(publish){
 if(!currentUser){note('Sign in first.');return;}
 sync();let data;
 try { data=build(); } catch(e) { note(e.message); return; }
 if(publish && state.access!=='free'){note('Premium publishing is disabled until protected reader access is implemented.');return;}
 if(publish && !confirm('Publish this FREE story and ALL its episodes immediately? They will be readable by everyone.'))return;
 $('cloudSave').disabled=$('cloudPublish').disabled=true;
 note(publish?'Publishing…':'Saving private draft…');
 try {
   const storySlug=data.id;
   const {data:found,error:lookupError}=await client.from('stories').select('id,status').eq('slug',storySlug).maybeSingle();
   if(lookupError)throw lookupError;
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
   note(publish?'Published! Open the Story Library in a new tab to test.':'Private draft saved in Supabase. It is not visible to readers.');
 } catch(e) { note('Cloud operation failed: '+e.message+' — Your local draft is still here.'); }
 finally {$('cloudSave').disabled=$('cloudPublish').disabled=false;}
}
$('cloudSave').onclick=()=>upload(false);
$('cloudPublish').onclick=()=>upload(true);
refresh();
})();
