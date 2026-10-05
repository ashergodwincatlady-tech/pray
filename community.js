/* Real Google accounts and Firestore community. No simulated member data. */
const ui = window.PYNApp;
const $ = selector => document.querySelector(selector);
const escape = value => String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
let sdk,auth,db,user=null,profile=null,members=[],messages=[],unsubscribers=[],epoch=0,busy=false;
let blocked = new Set();
const status = (text,error=false) => {$('#account-status').textContent=text;$('#account-status').classList.toggle('error',error);};
const band = age => age<=12?'6–12':age<=15?'13–15':age<=17?'16–17':age<=20?'18–20':'21+';
const validAge = age => Number.isInteger(age)&&age>=6&&age<=120;
function stop(){unsubscribers.forEach(unsubscribe=>unsubscribe());unsubscribers=[];members=[];messages=[];}
function accountError(error){const code=error?.code||'';return ({'auth/popup-blocked':'Allow the Google sign-in popup, then try again.','auth/popup-closed-by-user':'The Google sign-in window was closed. You can try again.','auth/unauthorized-domain':'Add this website domain to Firebase Authentication’s authorized domains.','auth/operation-not-allowed':'Enable Google in Firebase Authentication > Sign-in method.','permission-denied':'Database access was denied. Publish the supplied Firestore rules and check your setup.','unavailable':'The connection is unavailable. Check your internet connection.'})[code]||error?.message||'Something went wrong. Please try again.';}
function render(){
 const group=profile?.ageBand||'';
 $('#age-band-label').textContent=group||'Not set';
 const others=members.filter(member=>member.uid!==user?.uid&&!blocked.has(member.uid));
 $('#people-row').innerHTML=others.length?others.map(member=>`<div class="person"><div class="avatar medium">🐍</div><strong>${escape(member.username)}</strong><small>PYN member</small></div>`).join(''):`<p class="community-empty">${profile?'No other members in your age group yet.':'Sign in and enter your age to find your group.'}</p>`;
 $('#online-list').innerHTML='<p>Member availability is not tracked. See the live member list below.</p>';
 $('#live-member-list').innerHTML=others.length?others.map(member=>`<div class="live-member"><strong>${escape(member.username)}</strong><span>${escape(member.ageBand)}</span><button class="text-btn" data-block="${escape(member.uid)}">Block</button></div>`).join(''):'<p>No other members in this age group yet. Another Google account with a completed profile in this group will appear here.</p>';
 $('#group-chat-title').textContent=group?`${group} group chat`:'Age-group chat';
 $('#chat-messages').innerHTML=messages.filter(message=>!blocked.has(message.uid)).map(message=>`<article class="chat-message"><strong>${escape(message.username)}${message.uid===user?.uid?' · You':''}</strong><p>${escape(message.text)}</p><small>${message.createdAt?.toDate?escape(message.createdAt.toDate().toLocaleString()):'Sending…'}</small>${message.uid===user?.uid?`<button class="text-btn" data-delete-message="${escape(message.id)}">Delete</button>`:`<button class="text-btn" data-report-message="${escape(message.id)}">Report</button>`}</article>`).join('')||'<p class="community-empty">No messages yet. Say hello when your account is connected.</p>';
 $('#chat-text').disabled=!profile||!user;$('#send-chat').disabled=!profile||!user;
 $('#unblock-all').hidden=!blocked.size;
 document.querySelectorAll('[data-block]').forEach(button=>button.onclick=()=>{blocked.add(button.dataset.block);localStorage.setItem(`pynBlocked:${user.uid}`,JSON.stringify([...blocked]));render();});
 document.querySelectorAll('[data-delete-message]').forEach(button=>button.onclick=async()=>{button.disabled=true;try{await sdk.deleteDoc(sdk.doc(db,'rooms',group,'messages',button.dataset.deleteMessage));}catch(error){$('#chat-status').textContent=accountError(error);button.disabled=false;}});
 document.querySelectorAll('[data-report-message]').forEach(button=>button.onclick=async()=>{button.disabled=true;try{await sdk.addDoc(sdk.collection(db,'reports'),{reporterUid:user.uid,room:group,messageId:button.dataset.reportMessage,reason:'Member requested review',createdAt:sdk.serverTimestamp()});button.textContent='Reported';$('#chat-status').textContent='Report saved for the app owner to review.';}catch(error){$('#chat-status').textContent=accountError(error);button.disabled=false;}});
}
function subscribe(){
 stop();const generation=epoch;
 unsubscribers.push(sdk.onSnapshot(sdk.query(sdk.collection(db,'members'),sdk.where('ageBand','==',profile.ageBand),sdk.limit(100)),snapshot=>{if(generation!==epoch)return;members=snapshot.docs.map(doc=>({uid:doc.id,...doc.data()}));render();},error=>{$('#chat-status').textContent=accountError(error);}));
 unsubscribers.push(sdk.onSnapshot(sdk.query(sdk.collection(db,'rooms',profile.ageBand,'messages'),sdk.orderBy('createdAt','desc'),sdk.limit(100)),snapshot=>{if(generation!==epoch)return;messages=snapshot.docs.map(doc=>({id:doc.id,...doc.data()})).reverse();render();},error=>{$('#chat-status').textContent=accountError(error);}));
}
async function loadAccount(account){
 const generation=++epoch;stop();user=account;profile=null;ui.hide();render();
 if(!account){$('#profile-setup').classList.add('hidden');$('#google-signin').classList.remove('hidden');$('#google-account').textContent='';status('Sign in with Google to create or return to your PYN account.');ui.setAccount(null);return;}
 $('#google-account').textContent=`Signed in with Google: ${account.email||account.displayName||'your account'}`;
 $('#google-signin').classList.add('hidden');status('Loading your profile…');
 try{
  const snapshot=await sdk.getDoc(sdk.doc(db,'profiles',account.uid));if(generation!==epoch)return;
  if(!snapshot.exists()){$('#profile-setup').classList.remove('hidden');status('Choose your PYN username and enter your age.');return;}
  profile=snapshot.data();$('#profile-setup').classList.add('hidden');
  try{blocked=new Set(JSON.parse(localStorage.getItem(`pynBlocked:${account.uid}`)||'[]'));}catch{blocked=new Set();}
  ui.setAccount({...profile,uid:account.uid});ui.show();status('Connected.');$('#chat-status').textContent='You can talk with members in your age group.';subscribe();
 }catch(error){if(generation!==epoch)return;status(accountError(error),true);$('#google-signin').classList.remove('hidden');$('#google-signin').textContent='Retry / switch Google account';}
}
$('#google-signin').onclick=async()=>{if(!auth||busy)return;busy=true;$('#google-signin').disabled=true;status('Opening Google sign-in…');try{const provider=new sdk.GoogleAuthProvider();provider.setCustomParameters({prompt:'select_account'});const result=await sdk.signInWithPopup(auth,provider);if(user?.uid===result.user.uid)await loadAccount(result.user);}catch(error){status(accountError(error),true);}finally{busy=false;$('#google-signin').disabled=false;}};
$('#start-btn').onclick=async()=>{
 if(!user||!db||busy)return;
 const username=$('#username-input').value.trim();const age=Number($('#age-input').value);
 if(!/^[A-Za-z0-9_]{3,18}$/.test(username)){status('Use 3–18 letters, numbers, or underscores for your username.',true);return;}
 if(!validAge(age)){status('Enter your age as a whole number from 6 to 120.',true);return;}
 busy=true;$('#start-btn').disabled=true;status('Saving your profile…');
 const current=user,generation=epoch;
 try{
  await sdk.runTransaction(db,async transaction=>{
   const privateRef=sdk.doc(db,'profiles',current.uid),nameRef=sdk.doc(db,'usernames',username.toLowerCase());
   const existing=await transaction.get(privateRef),reserved=await transaction.get(nameRef);
   if(existing.exists())throw new Error('A profile already exists. Sign out and sign in again.');
   if(reserved.exists())throw new Error('That username is already taken. Try another.');
   const details={username,usernameKey:username.toLowerCase(),age,ageBand:band(age),createdAt:sdk.serverTimestamp()};
   transaction.set(privateRef,details);transaction.set(nameRef,{uid:current.uid});transaction.set(sdk.doc(db,'members',current.uid),{username,ageBand:band(age),createdAt:sdk.serverTimestamp()});
  });
  if(generation===epoch)await loadAccount(current);
 }catch(error){status(accountError(error),true);}finally{busy=false;$('#start-btn').disabled=false;}
};
$('#signout-btn').onclick=async()=>{++epoch;stop();if(auth&&user){try{await sdk.signOut(auth);}catch(error){status(accountError(error),true);}}user=null;profile=null;ui.setAccount(null);ui.hide();$('#profile-setup').classList.add('hidden');$('#google-signin').classList.remove('hidden');$('#google-account').textContent='';render();};
$('#demo-btn').onclick=()=>{if(user){status('Sign out first to open the local preview.',true);return;}ui.setAccount(null);ui.show();$('#chat-status').textContent='Preview only. Google sign-in is required for member discovery and chat.';render();};
$('#chat-form').onsubmit=async event=>{
 event.preventDefault();if(!profile||!user||busy)return;
 const text=$('#chat-text').value.trim();if(!text||text.length>500){$('#chat-status').textContent='Write a message with 1–500 characters.';return;}
 busy=true;$('#send-chat').disabled=true;const current=user,currentProfile=profile;
 try{
  await sdk.runTransaction(db,async transaction=>{
   const rateRef=sdk.doc(db,'rates',current.uid);await transaction.get(rateRef);
   const messageRef=sdk.doc(sdk.collection(db,'rooms',currentProfile.ageBand,'messages'));
   transaction.set(rateRef,{lastSent:sdk.serverTimestamp(),messageId:messageRef.id});
   transaction.set(messageRef,{uid:current.uid,username:currentProfile.username,text,createdAt:sdk.serverTimestamp()});
  });
  $('#chat-text').value='';$('#chat-status').textContent='Sent.';
 }catch(error){$('#chat-status').textContent=error.code==='permission-denied'?'Message not sent. Wait at least 3 seconds between messages and check your connection setup.':accountError(error);}finally{busy=false;$('#send-chat').disabled=!profile;}
};
$('#auth-signout').onclick=()=>$('#signout-btn').onclick();
$('#unblock-all').onclick=()=>{blocked.clear();if(user)localStorage.removeItem(`pynBlocked:${user.uid}`);render();};
window.PYNCommunity={render,isConnected:()=>!!profile,band,validAge};
const config=window.PYN_FIREBASE_CONFIG||{};
if(!['apiKey','authDomain','projectId','appId'].every(key=>typeof config[key]==='string'&&config[key].trim())){
 $('#google-signin').disabled=true;status('Google sign-in is not connected yet. Fill firebase-config.js and follow SETUP.md. You can preview the lessons below.');render();
}else{
 try{
  const version='12.19.0';
  const [appSDK,authSDK,storeSDK]=await Promise.all([import(`https://www.gstatic.com/firebasejs/${version}/firebase-app.js`),import(`https://www.gstatic.com/firebasejs/${version}/firebase-auth.js`),import(`https://www.gstatic.com/firebasejs/${version}/firebase-firestore.js`)]);
  sdk={...appSDK,...authSDK,...storeSDK};const app=sdk.initializeApp(config);auth=sdk.getAuth(app);db=sdk.getFirestore(app);sdk.onAuthStateChanged(auth,loadAccount);
 }catch(error){status('Could not connect Google sign-in: '+accountError(error),true);$('#google-signin').disabled=true;}
}
