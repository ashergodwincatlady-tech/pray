const lessons = window.PYN_COURSE;

const projects = [
  {icon:'🎲',title:'Dice Roller',level:'Beginner',time:'15 min',concepts:['random','variables','print'],desc:'Build a six-sided dice that rolls a different number.'},
  {icon:'🧮',title:'Calculator',level:'Beginner',time:'25 min',concepts:['input','numbers','if'],desc:'Ask for two numbers and perform calculations.'},
  {icon:'❓',title:'Quiz Game',level:'Beginner',time:'35 min',concepts:['strings','if','score'],desc:'Create a quiz that tracks correct answers.'},
  {icon:'🔐',title:'Password Generator',level:'Beginner',time:'30 min',concepts:['random','strings','loops'],desc:'Generate a random password from letters and numbers.'},
  {icon:'✊',title:'Rock Paper Scissors',level:'Beginner',time:'35 min',concepts:['random','if','input'],desc:'Play against the computer.'},
  {icon:'⏱️',title:'Countdown Timer',level:'Intermediate',time:'45 min',concepts:['loops','time','functions'],desc:'Count down and trigger a message at zero.'},
  {icon:'⭕',title:'Tic-Tac-Toe',level:'Intermediate',time:'2 hr',concepts:['lists','functions','loops'],desc:'Build a complete two-player board game.'},
  {icon:'💬',title:'Mini Chatbot',level:'Intermediate',time:'1.5 hr',concepts:['input','functions','match'],desc:'Create a text chatbot with simple responses.'},
  {icon:'🌤️',title:'Weather App',level:'Intermediate',time:'2 hr',concepts:['APIs','JSON','requests'],desc:'Read live weather data from an API.'},
  {icon:'📝',title:'To-Do App',level:'Intermediate',time:'2 hr',concepts:['lists','files','functions'],desc:'Add, remove and save tasks.'},
  {icon:'🤖',title:'AI Chatbot',level:'Advanced',time:'4 hr',concepts:['APIs','JSON','functions'],desc:'Connect Python to an AI model API.'},
  {icon:'📊',title:'Data Dashboard',level:'Advanced',time:'5 hr',concepts:['pandas','charts','data'],desc:'Turn data into a simple interactive dashboard.'},
];

const starterCommunityVideos = [];
let communityTab='feed';

const avatars = ['🧑🏽‍💻','👩🏾‍💻','👨🏻‍💻','👩🏼‍🚀','🧑🏾‍🚀','👩🏿‍🔬','🧑🏻‍🎨','👨🏽‍🔬','👩🏻‍💻','🧑🏼‍💻'];

const defaultState = {username:'Coder',avatar:'🧑🏽‍💻',theme:'purple',avatarParts:{skin:'#b97850',hair:'#30241d',shirt:'#6c4df6',style:'short',accessory:'none'},myProjects:[],age:null,xp:0,streak:1,completedLessons:[],completedProjects:[],levelChoice:"I've never coded before",incomingRequests:[],communityVideos:[]};
let activeStorageKey='pynGuestState';
let connectedAccount=null;
let storedState;
try { storedState=JSON.parse(localStorage.getItem(activeStorageKey) || localStorage.getItem('pynState') || 'null'); } catch { storedState=null; }
let state = {...defaultState, ...(storedState || {})};

const legacyLessonSources=["python_intro.asp", "python_getstarted.asp", "python_syntax.asp", "python_user_input.asp", "python_comments.asp", "python_variables.asp", "python_datatypes.asp", "python_numbers.asp", "python_strings.asp", "python_casting.asp", "python_booleans.asp", "python_lists.asp", "python_tuples.asp", "python_sets.asp", "python_dictionaries.asp", "python_conditions.asp", "python_match.asp", "python_while_loops.asp", "python_for_loops.asp", "python_range.asp", "python_functions.asp", "python_modules.asp", "python_datetime.asp", "python_math.asp", "python_json.asp", "python_regex.asp", "python_pip.asp", "python_try_except.asp", "python_syntax.asp", "python_virtualenv.asp"];
const savedLessonIds=Array.isArray(state.completedLessonIds)?state.completedLessonIds:(state.completedLessons||[]).map(i=>legacyLessonSources[i]).filter(Boolean);
state.completedLessons=[...new Set(savedLessonIds)].map(id=>lessons.findIndex(l=>l.id===id)).filter(i=>i>=0);
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const save = () => {state.completedLessonIds=state.completedLessons.map(i=>lessons[i]?.id).filter(Boolean);state.courseVersion=2;localStorage.setItem(activeStorageKey, JSON.stringify(state));};

function boot(){
  // Google authentication decides when to open the app.
  renderAll();
}

function showApp(){
  $('#auth-screen').classList.add('hidden');
  $('#app').classList.remove('hidden');
}

$('#start-btn').onclick=()=>{
  const name=$('#username-input').value.trim();
  if(!name){$('#username-input').focus();return;}
  state.username=name; save(); localStorage.setItem('pynStarted','1'); showApp(); renderAll();
};
$('#demo-btn').onclick=()=>{localStorage.setItem('pynStarted','1');showApp();renderAll();};
$('#signout-btn').onclick=()=>{localStorage.removeItem('pynStarted');location.reload();};

function renderAll(){renderPeople();renderProjects();renderLessons();renderCommunity();renderProfile();renderStats();renderMyProjects();applyTheme();}

function renderPeople(){
 if(window.PYNCommunity){window.PYNCommunity.render();return;}
 $('#people-row').innerHTML='<p class="community-empty">No members to show yet. Real member activity will appear when community accounts are connected.</p>';
}

function projectCard(p,i){
 const done=state.completedProjects.includes(i);
 return `<article class="project-card" data-project="${i}"><div class="project-art">${p.icon}</div><div class="project-body"><span class="tag">${p.level}</span><h4>${p.title} ${done?'✓':''}</h4><p>${p.desc}</p><div class="project-meta"><span>${p.time}</span><span>${p.concepts.slice(0,2).join(' · ')}</span></div></div></article>`;
}
function renderProjects(filter='all'){
 $('#home-projects').innerHTML=projects.slice(0,4).map(projectCard).join('');
 const list=filter==='all'?projects:projects.filter(p=>p.level===filter);
 $('#project-grid').innerHTML=list.map(p=>projectCard(p,projects.indexOf(p))).join('');
 $$('[data-project]').forEach(el=>el.onclick=()=>openProject(+el.dataset.project));
}

function renderLessons(){
 const sections=[...new Set(lessons.map(l=>l.section))];
 $('#course-section').innerHTML='<option value="all">All sections</option>'+sections.map(section=>`<option value="${escapeHtml(section)}">${escapeHtml(section)}</option>`).join('');
 $('#course-section').value=courseSection;
 const visible=lessons.map((l,i)=>({l,i})).filter(({l})=>(courseSection==='all'||l.section===courseSection)&&(`${l.title} ${l.desc} ${l.section} ${l.chapter}`).toLowerCase().includes(courseSearch.toLowerCase()));
 $('#course-count').textContent=`${lessons.length} lessons and practice stops · ${state.completedLessons.length} completed · ${visible.length} shown`;
 let html='';
 for(const section of sections){
  const entries=visible.filter(({l})=>l.section===section);if(!entries.length)continue;
  const complete=entries.filter(({i})=>state.completedLessons.includes(i)).length;
  const next=lessons.findIndex((_,i)=>!state.completedLessons.includes(i));
  const opened=courseSection!=='all'||courseSearch||entries.some(({i})=>i===next);
  html+=`<details class="course-section" ${opened?'open':''}><summary>${escapeHtml(section)}<span>${complete}/${entries.length} complete</span></summary>`;
  let unit='';
  for(const {l,i} of entries){
   if(unit!==l.chapter){unit=l.chapter;html+=`<h4 class="chapter-label">${escapeHtml(unit)}</h4>`;}
   const done=state.completedLessons.includes(i);
   html+=`<button type="button" class="lesson-row ${done?'done':''}" data-lesson="${i}"><span class="lesson-number">${done?'✓':i+1}</span><span class="lesson-description"><strong>${escapeHtml(l.title)}</strong><small>${escapeHtml(l.desc)}</small></span><span class="lesson-status">${done?'Completed':'+20 XP'}</span></button>`;
  }
  html+='</details>';
 }
 $('#lesson-path').innerHTML=html||'<p class="community-empty">No matching lessons. Try a shorter word or choose all sections.</p>';
 $$('[data-lesson]').forEach(el=>el.onclick=()=>openLesson(+el.dataset.lesson));
 const resources=window.PYN_RESOURCES||[];
 $('#course-resources').innerHTML=resources.map(r=>`<a href="${escapeHtml(r.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(r.title)} ↗</a>`).join('');
}

function ageBand(age){
 if(age===null||age===undefined||age==='')return 'Not set';
 const n=Number(age);
 if(n<=12)return '6–12';
 if(n<=15)return '13–15';
 if(n<=17)return '16–17';
 if(n<=20)return '18–20';
 return '21+';
}

function communityVideos(){return [...starterCommunityVideos,...(state.communityVideos||[])];}

function renderCommunity(){
 if(window.PYNCommunity){window.PYNCommunity.render();return;}
 const ageLabel=$('#age-band-label');
 if(ageLabel) ageLabel.textContent=ageBand(state.age);
 const badge=$('#request-badge');
 if(badge) badge.textContent=(state.incomingRequests||[]).length||'';
 $$('.community-tab').forEach(b=>b.classList.toggle('active',b.dataset.communityTab===communityTab));
 const box=$('#community-content');
 if(!box)return;
 if(communityTab==='feed'){
   box.innerHTML='<div class="community-empty"><strong>No fake community activity.</strong>Real member activity will appear here when PYN is connected to its live database.</div>';
 } else if(communityTab==='videos'){
   const videos=communityVideos();
   box.innerHTML=videos.length?`<div class="community-video-list">${videos.map(v=>`<article class="community-video-card"><div class="community-video-thumb">▶</div><div><h4>${escapeHtml(v.title)}</h4><p>${escapeHtml(v.topic||'Python')} · Local draft</p><small>${escapeHtml(v.teacher||state.username)}</small></div></article>`).join('')}</div>`:'<div class="community-empty"><strong>No teaching videos yet.</strong>Approved community lessons will appear here.</div>';
 } else {
   box.innerHTML='<div class="community-empty"><strong>No real friend requests yet.</strong>When PYN has real accounts, requests from learners in your age group will appear here.</div>';
 }
}

function escapeHtml(value=''){return String(value).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));}

function openVideoForm(){
 $('#modal-content').innerHTML=`<p class="eyebrow">COMMUNITY TEACHING</p><h2>Share a mini lesson</h2><p>Save a teaching video draft on this device. Drafts are not published or reviewed.</p><div class="video-submit-form"><label>Video title</label><input id="new-video-title" placeholder="e.g. Lists explained simply"><label>Python topic</label><select id="new-video-topic">${lessons.map(l=>`<option>${escapeHtml(l.title)}</option>`).join('')}</select><label>Video link</label><input id="new-video-link" placeholder="YouTube or approved video link"><label>What will you explain?</label><textarea id="new-video-desc" placeholder="Describe the mini lesson..."></textarea><button id="submit-video" class="primary-btn" style="margin-top:14px;width:100%">Save draft</button></div>`;
 $('#modal').classList.remove('hidden');
 $('#submit-video').onclick=()=>{
   const title=$('#new-video-title').value.trim();
   if(!title){$('#new-video-title').focus();return;}
   state.communityVideos=state.communityVideos||[];
   state.communityVideos.push({title,topic:$('#new-video-topic').value,teacher:state.username,url:$('#new-video-link').value.trim()});
   save();
   communityTab='videos';
   $('#modal').classList.add('hidden');
   renderCommunity();
 };
}

function renderProfile(){
 if($('#profile-connection-label'))$('#profile-connection-label').textContent=connectedAccount?'Google account connected':'Local preview';
 const level=Math.floor(state.xp/100)+1;
 const rank=level>=10?'Python Builder':level>=5?'Python Explorer':'Python Starter';
 $('#sidebar-avatar').innerHTML=avatarSvg(); $('#big-avatar').innerHTML=avatarSvg();
 $('#sidebar-name').textContent=state.username; $('#sidebar-level').textContent=`Level ${level}`;
 $('#profile-name').textContent=state.username; $('#profile-rank').textContent=rank;
 $('#display-name-input').value=state.username;$('#display-name-input').readOnly=!!connectedAccount; $('#level-select').value=state.levelChoice;
 $('#profile-xp').textContent=state.xp; $('#profile-lessons').textContent=state.completedLessons.length; $('#profile-projects').textContent=state.completedProjects.length;
 renderAvatarEditor();
 $('#theme-select').value=state.theme||'purple';
}

function renderStats(){
 $('#xp-count').textContent=state.xp; $('#streak-count').textContent=state.streak;
 $('#welcome-title').textContent=`Ready to code, ${state.username}?`;
 const pct=Math.round((state.completedLessons.length/lessons.length)*100);
 $('#progress-label').textContent=pct+'%'; $('#progress-bar').style.width=pct+'%';
 const next=lessons.findIndex((_,i)=>!state.completedLessons.includes(i));
 $('#next-lesson-label').textContent=next<0?'All Python lessons complete!':`Next: ${lessons[next].title}`;
}

const simpleWords={"function": "A named helper: give it inputs, let it do a job, and sometimes get an answer back.", "argument": "An actual value you hand to a function when asking it to work.", "parameter": "A name in a function definition that will hold an input value.", "object": "One item in a running program. It can have its own information and actions.", "class": "A plan that describes how to make a kind of object.", "attribute": "A value attached to an object, such as the name of one pet.", "method": "A function attached to an object or class.", "collection": "A group of values kept together, like a box holding several toys.", "immutable": "Its own value or slots cannot be edited in place. Make a new value instead.", "mutable": "It can be changed after it is created.", "hashable": "A value Python can use reliably as a dictionary key or set member.", "index": "A numbered position. Python usually counts the first position as zero.", "boolean": "A yes-or-no value, written True or False.", "iteration": "One turn of a repeating job.", "iterator": "A helper that remembers the next value to give you.", "generator": "A helper that makes values one at a time when you ask.", "recursion": "Solving a job by calling the same helper on a smaller job until a stopping rule is reached.", "encoding": "A rule for turning saved bytes into readable characters and back again.", "module": "A Python file or built-in unit containing tools you can import.", "package": "A bundle of Python tools that can be installed or imported.", "library": "A collection of reusable tools made for particular jobs.", "feature": "One piece of information used by a prediction model, such as a measured height.", "prediction": "A model’s estimate. It can be wrong.", "training": "Letting a model learn patterns from examples.", "model": "A learned or chosen rule used to describe data or make guesses.", "probability": "A number describing how likely an event is, from zero for impossible to one for certain.", "regression": "A way to estimate a number from information. Logistic regression is commonly used to choose a class instead.", "classification": "Choosing which named group an example is predicted to belong to.", "cluster": "A group formed by comparing similarities, without necessarily using known labels.", "threshold": "A cutoff used to make a decision, such as how high a score must be to count as yes.", "distribution": "A description of how values are spread over possible outcomes.", "mean": "Add all the numbers, then divide by how many numbers there are.", "median": "The middle value after sorting, or the mean of the two middle values.", "mode": "A value that appears most often. There can be a tie.", "standard deviation": "A measure of how far values tend to spread from their mean.", "percentile": "A position in sorted measurements, expressed out of one hundred.", "algorithm": "A clear sequence of steps for doing a job.", "node": "One connected item in a tree or graph.", "edge": "A connection between two nodes.", "pivot": "A chosen value used to split other values into groups.", "database": "An organized place where a program saves information for later.", "table": "Records arranged into rows with named columns.", "document": "One MongoDB record made from named fields and values.", "cursor": "A helper for reading the results returned by a database query.", "query": "A request to a database, often asking which records match a rule.", "transaction": "A group of database changes managed together, with commit saving them.", "primary key": "A label that uniquely identifies one row in a table.", "projection": "A rule choosing which fields a database result includes."};
function openLesson(i){
 const l=lessons[i],done=state.completedLessons.includes(i);
 const sentences=l.explain.match(/[^.!?]+[.!?]+|[^.!?]+$/g)||[l.explain];
 const words=Object.entries(simpleWords).filter(([word])=>l.explain.toLowerCase().includes(word)).slice(0,4);
 const wordHelp=words.length?`<details class="simple-words"><summary>Words made simple</summary><dl>${words.map(([word,meaning])=>`<dt>${escapeHtml(word)}</dt><dd>${escapeHtml(meaning)}</dd>`).join('')}</dl></details>`:'';
 const paragraphs=[];for(let n=0;n<sentences.length;n+=2)paragraphs.push(sentences.slice(n,n+2).join('').trim());
 $('#modal-content').innerHTML=`<p class="eyebrow">${escapeHtml(l.section)} · ${i+1} of ${lessons.length}</p><h2>${escapeHtml(l.title)}</h2><div class="lesson-intro">${paragraphs.map(text=>`<p>${escapeHtml(text)}</p>`).join('')}</div>${wordHelp}${l.note?`<div class="lesson-note"><strong>Before you start</strong><p>${escapeHtml(l.note)}</p></div>`:''}<h3>One small example</h3><pre><code>${escapeHtml(l.code)}</code></pre><button id="download-lesson" class="secondary-btn">Download ${l.mode==='terminal'?'command notes':'example code'}</button><h3>Let’s take it slowly</h3><ol class="lesson-steps">${l.steps.map(step=>`<li>${escapeHtml(step)}</li>`).join('')}</ol>${l.expected!==null?`<h4>What appears on the screen</h4><pre class="expected-output"><code>${escapeHtml(l.expected||'(This example writes a file rather than printing a message.)')}</code></pre>`:''}<h3>Your turn</h3><p>${escapeHtml(l.challenge)}</p><label for="lesson-code">${l.mode==='terminal'?'Practice command (run in your terminal)':'Practice code (run in VS Code)'}</label><textarea id="lesson-code" spellcheck="false">${escapeHtml(l.code)}</textarea><h3>Check what you learned</h3><p>${escapeHtml(l.question)}</p><label for="lesson-answer">Your answer</label><input id="lesson-answer" autocomplete="off"><p id="lesson-feedback" role="status">Answer the question to unlock completion.</p><button id="check-lesson" class="secondary-btn">Check answer</button><div class="lesson-complete"><span>${done?'Lesson completed':'Correct answer required for +20 XP.'}</span><button class="primary-btn" id="complete-lesson" disabled>${done?'Completed':'Complete +20 XP'}</button></div><p class="lesson-grading-note">PYN checks your answer to the question. It does not run or grade the practice code.</p><div class="lesson-navigation"><button id="previous-lesson" class="secondary-btn" ${i===0?'disabled':''}>← Previous</button><button id="next-lesson" class="secondary-btn" ${i===lessons.length-1?'disabled':''}>Next lesson →</button></div><p class="lesson-source">Topic reference: <a href="${escapeHtml(l.url)}" target="_blank" rel="noopener noreferrer">W3Schools ↗</a> · Explanation and practice written by PYN.</p>`;
 $('#modal').classList.remove('hidden');$('#modal-content').parentElement.scrollTop=0;
 $('#download-lesson').onclick=()=>{if(l.mode==='terminal'){downloadText(l.title+'.txt',l.code);}else downloadCode(l.title,l.code);};
 $('#check-lesson').onclick=()=>{const answer=$('#lesson-answer').value.trim().toLowerCase().replace(/\s+/g,' ');const correct=l.answers.includes(answer);$('#lesson-feedback').textContent=correct?'Correct! Well done. You can complete this lesson.':'Not yet. Read the small example and the steps, then try again.';$('#complete-lesson').disabled=done||!correct;};
 $('#lesson-answer').oninput=()=>{$('#complete-lesson').disabled=true;};
 $('#complete-lesson').onclick=()=>{if($('#complete-lesson').disabled)return;if(!state.completedLessons.includes(i)){state.completedLessons.push(i);state.xp+=20;save();renderAll();}openLesson(i);$('#lesson-feedback').textContent='Completed! Use Next lesson when you are ready.';};
 $('#previous-lesson').onclick=()=>{if(i>0)openLesson(i-1);};$('#next-lesson').onclick=()=>{if(i<lessons.length-1)openLesson(i+1);};
}
function downloadText(filename,text){const url=URL.createObjectURL(new Blob([text],{type:'text/plain'}));const a=document.createElement('a');a.href=url;a.download=filename.replace(/[^a-zA-Z0-9._-]/g,'-');a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}

function openProject(i){
 const p=projects[i],done=state.completedProjects.includes(i);
 $('#modal-content').innerHTML=`<p class="eyebrow">${p.level.toUpperCase()} PROJECT · CODE OPEN TO EVERYONE</p><h2>${p.icon} ${p.title}</h2><p>${p.desc}</p><p>Save this code as a .py file and run it with Python in VS Code. ${escapeHtml(projectNotes[i]||'No extra packages required.')}</p><pre><code>${escapeHtml(projectCodes[i])}</code></pre><button id="download-project" class="secondary-btn">Download Python code</button><button id="use-project" class="primary-btn">Create my version</button><div class="lesson-complete"><label><input type="checkbox" id="project-tested"> I ran and tested my project in VS Code.</label><button class="primary-btn" id="complete-project" disabled>${done?'Completed':'Mark project complete +50 XP'}</button></div><p>Project completion is self-reported.</p>`;
 $('#modal').classList.remove('hidden');
 $('#download-project').onclick=()=>downloadCode(p.title,projectCodes[i]);
 $('#use-project').onclick=()=>openProjectEditor({title:p.title,code:projectCodes[i]});
 $('#project-tested').onchange=e=>$('#complete-project').disabled=done||!e.target.checked;
 $('#complete-project').onclick=()=>{if($('#complete-project').disabled)return;if(!state.completedProjects.includes(i)){state.completedProjects.push(i);state.xp+=50;save();renderAll();}$('#modal').classList.add('hidden');};
}

$('#close-modal').onclick=()=>$('#modal').classList.add('hidden');
$('#modal').onclick=e=>{if(e.target.id==='modal')$('#modal').classList.add('hidden');};

$$('.nav-item').forEach(btn=>btn.onclick=()=>go(btn.dataset.page));
$$('[data-go]').forEach(btn=>btn.onclick=()=>go(btn.dataset.go));
function go(page){
 $$('.nav-item').forEach(b=>b.classList.toggle('active',b.dataset.page===page));
 $$('.page').forEach(p=>p.classList.remove('active-page')); $('#'+page).classList.add('active-page');
 const names={home:['PYN COMMUNITY','Home'],learn:['LEARNING PATH','Learn Python'],projects:['BUILD SOMETHING','Projects'],community:['LEARN TOGETHER','Community'],profile:['YOUR SPACE','Profile']};
 $('#page-eyebrow').textContent=names[page][0]; $('#page-title').textContent=names[page][1]; if(page==='community')renderCommunity(); window.scrollTo({top:0,behavior:'smooth'});
}

$$('.filter').forEach(b=>b.onclick=()=>{$$('.filter').forEach(x=>x.classList.remove('active'));b.classList.add('active');renderProjects(b.dataset.filter);});

$('#save-profile-btn').onclick=()=>{if(!connectedAccount)state.username=$('#display-name-input').value.trim()||state.username;state.levelChoice=$('#level-select').value;state.theme=$('#theme-select').value;save();renderAll();$('#save-profile-btn').textContent='Saved ✓';setTimeout(()=>$('#save-profile-btn').textContent='Save changes',1200);};

$('#challenge-btn').onclick=()=>{
 $('#modal-content').innerHTML=`<p class="eyebrow">DAILY CHALLENGE · +20 XP</p><h2>Make Python say hello</h2><p>Write one line of Python that prints <strong>Hello PYN!</strong></p><textarea id="challenge-code" spellcheck="false">print("Hello PYN!")</textarea><div class="lesson-complete"><span id="challenge-result">Run your answer when ready.</span><button class="primary-btn" id="run-challenge">Check answer</button></div>`;
 $('#modal').classList.remove('hidden');
 $('#run-challenge').onclick=()=>{const v=$('#challenge-code').value.trim();if(/^print\(\s*(["'])Hello PYN!\1\s*\)\s*;?$/.test(v)){$('#challenge-result').textContent='✅ Correct! +20 XP';if(localStorage.getItem('pynDailyDone')!==new Date().toISOString().slice(0,10)){state.xp+=20;save();localStorage.setItem('pynDailyDone',new Date().toISOString().slice(0,10));renderAll();}}else{$('#challenge-result').textContent='Not quite. Use print() and make the text say Hello PYN!';}};
};

$$('.community-tab').forEach(b=>b.onclick=()=>{communityTab=b.dataset.communityTab;renderCommunity();});
if($('#upload-video-btn')) $('#upload-video-btn').onclick=openVideoForm;



const checks = lessons.map(l=>[l.question,l.answers]);
let courseSection='all', courseSearch='';

const themes={purple:['#6c4df6','#8d74ff'],blue:['#225dcc','#528cf0'],green:['#157347','#35936b'],rose:['#b72e64','#d45b89'],orange:['#a94d12','#d47835']};
function applyTheme(){const t=themes[state.theme]||themes.purple;document.documentElement.style.setProperty('--purple',t[0]);document.documentElement.style.setProperty('--purple2',t[1]);}
function continueLearning(){go('learn');const i=lessons.findIndex((_,i)=>!state.completedLessons.includes(i));openLesson(i<0?0:i);}
$$('[data-continue]').forEach(b=>b.onclick=continueLearning);
function downloadCode(title,code){const url=URL.createObjectURL(new Blob([code],{type:'text/plain'}));const a=document.createElement('a');a.href=url;a.download=title.toLowerCase().replace(/[^a-z0-9]+/g,'-')+'.py';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
function renderMyProjects(){const list=state.myProjects||[];$('#my-projects').innerHTML=list.length?'<h3>My projects</h3>'+list.map((p,i)=>`<button class="secondary-btn" data-my-project="${i}">${escapeHtml(p.title)}</button>`).join(''):'';$$('[data-my-project]').forEach(b=>b.onclick=()=>openProjectEditor(state.myProjects[+b.dataset.myProject],+b.dataset.myProject));}
function openProjectEditor(project={title:'',code:''},index=-1){$('#modal-content').innerHTML=`<h2>${index<0?'Create a project':'Edit project'}</h2><p>Your project is saved on this device.</p><label for="project-title">Project name</label><input id="project-title" maxlength="80" value="${escapeHtml(project.title)}"><label for="project-code">Python code</label><textarea id="project-code" spellcheck="false">${escapeHtml(project.code)}</textarea><p id="project-message" role="status"></p><button id="save-project" class="primary-btn">Save project</button><button id="export-project" class="secondary-btn">Download code</button>`;$('#modal').classList.remove('hidden');$('#save-project').onclick=()=>{const p={title:$('#project-title').value.trim(),code:$('#project-code').value};if(!p.title||!p.code.trim()){$('#project-message').textContent='Add a name and some Python code.';return;}state.myProjects=state.myProjects||[];if(index<0){state.myProjects.push(p);index=state.myProjects.length-1;}else state.myProjects[index]=p;save();renderMyProjects();$('#project-message').textContent='Saved on this device.';};$('#export-project').onclick=()=>downloadCode($('#project-title').value||'my-project',$('#project-code').value);}
$('#create-project-btn').onclick=()=>openProjectEditor();
const accessories=[['none','No accessory',0],['glasses','Coder glasses',1],['cap','PYN cap',3],['headphones','Headphones',5],['star','Star badge',10],['crown','Builder crown',20],['snake','Golden snake',30]];
function avatarSvg(){const p=state.avatarParts||defaultState.avatarParts;const a=p.accessory;return `<svg viewBox="0 0 120 120" role="img" aria-label="Your custom PYN avatar"><circle cx="60" cy="60" r="59" fill="#eeeaff"/><path d="M18 120V100Q20 79 60 79Q100 79 102 100V120" fill="${p.shirt}"/><rect x="50" y="66" width="20" height="24" rx="8" fill="${p.skin}"/><ellipse cx="60" cy="48" rx="29" ry="34" fill="${p.skin}"/><path d="${p.style==='long'?'M28 70V35Q30 5 60 8Q94 6 94 40V75L83 69V35Q60 46 36 30V70Z':'M30 36Q25 5 61 8Q96 9 91 38Q65 24 30 36'}" fill="${p.hair}"/><circle cx="49" cy="48" r="3"/><circle cx="71" cy="48" r="3"/><path d="M48 63Q60 73 72 63" fill="none" stroke="#753d35" stroke-width="3"/>${a==='glasses'?'<g fill="none" stroke="#232334" stroke-width="3"><rect x="36" y="41" width="22" height="16" rx="5"/><rect x="62" y="41" width="22" height="16" rx="5"/><path d="M58 47H62"/></g>':a==='cap'?'<path d="M26 30Q27 4 60 4Q92 4 94 30Z" fill="#225dcc"/>':a==='headphones'?'<path d="M25 50V35Q25 1 60 1Q95 1 95 35V50" fill="none" stroke="#252536" stroke-width="9"/>':a==='crown'?'<path d="M34 22L29 3L48 13L60 0L72 13L91 3L86 22Z" fill="#ffb020"/>':a==='star'?'<text x="72" y="110" font-size="24">★</text>':a==='snake'?'<text x="70" y="112" font-size="28">🐍</text>':''}</svg>`;}
function renderAvatarEditor(){const p=state.avatarParts||defaultState.avatarParts;$('#avatar-options').innerHTML=[['skin','Skin tone',['#f5d0ad','#d99d70','#b97850','#75472f','#422b20']],['hair','Hair color',['#30241d','#77442d','#d3a34b','#e1dfe4']],['shirt','Shirt color',['#6c4df6','#225dcc','#157347','#b72e64']]].map(([key,label,colors])=>`<label>${label}</label><div class="swatches">${colors.map(c=>`<button aria-label="${label} ${c}" aria-pressed="${p[key]===c}" data-part="${key}" data-color="${c}" style="background:${c}"></button>`).join('')}</div>`).join('')+`<label for="hair-style">Hair style</label><select id="hair-style"><option value="short">Short</option><option value="long">Long</option></select>`;$('#hair-style').value=p.style;$('#hair-style').onchange=e=>{state.avatarParts={...p,style:e.target.value};save();renderProfile();};$$('[data-part]').forEach(b=>b.onclick=()=>{state.avatarParts={...p,[b.dataset.part]:b.dataset.color};save();renderProfile();});$('#accessory-options').innerHTML=accessories.map(([id,name,n])=>`<button class="secondary-btn" data-accessory="${id}" ${state.completedLessons.length<n?'disabled':''} aria-pressed="${p.accessory===id}">${name}<small>${n?'Complete '+n+' lessons':'Available now'}</small></button>`).join('');$$('[data-accessory]').forEach(b=>b.onclick=()=>{state.avatarParts={...p,accessory:b.dataset.accessory};save();renderProfile();});}

const projectCodes = ["import random\nprint(\"You rolled\", random.randint(1, 6))\n", "a = float(input(\"First number: \"))\nb = float(input(\"Second number: \"))\nop = input(\"Operation (+ - * /): \")\nif op == \"+\": print(a + b)\nelif op == \"-\": print(a - b)\nelif op == \"*\": print(a * b)\nelif op == \"/\" and b != 0: print(a / b)\nelse: print(\"Invalid operation or division by zero\")\n", "questions = [(\"Which function prints output?\", \"print\"), (\"What is 2 + 3?\", \"5\"), (\"Python file extension?\", \".py\")]\nscore = 0\nfor question, answer in questions:\n    if input(question + \" \").strip().lower() == answer:\n        score += 1\nprint(f\"Score: {score}/{len(questions)}\")\n", "import secrets\nimport string\nlength = int(input(\"Password length (12 or more): \"))\nif length < 12:\n    print(\"Choose at least 12 characters\")\nelse:\n    alphabet = string.ascii_letters + string.digits + \"!@#$%&*\"\n    print(\"\".join(secrets.choice(alphabet) for _ in range(length)))\n", "import random\nchoices = [\"rock\", \"paper\", \"scissors\"]\nyou = input(\"rock, paper, or scissors? \").strip().lower()\ncomputer = random.choice(choices)\nprint(\"Computer:\", computer)\nif you not in choices: print(\"Invalid choice\")\nelif you == computer: print(\"Draw\")\nelif (you, computer) in [(\"rock\", \"scissors\"), (\"paper\", \"rock\"), (\"scissors\", \"paper\")]: print(\"You win!\")\nelse: print(\"Computer wins\")\n", "import time\nseconds = int(input(\"Seconds: \"))\nfor remaining in range(seconds, 0, -1):\n    print(remaining)\n    time.sleep(1)\nprint(\"Time is up!\")\n", "board = [\" \"] * 9\nwins = [(0,1,2),(3,4,5),(6,7,8),(0,3,6),(1,4,7),(2,5,8),(0,4,8),(2,4,6)]\nplayer = \"X\"\nfor turn in range(9):\n    for row in range(0, 9, 3):\n        print(\" | \".join(board[row:row+3]))\n    while True:\n        try:\n            move = int(input(f\"{player}: choose 1-9: \")) - 1\n            if 0 <= move < 9 and board[move] == \" \": break\n        except ValueError:\n            pass\n        print(\"Choose an empty square between 1 and 9.\")\n    board[move] = player\n    if any(all(board[i] == player for i in line) for line in wins):\n        print(player, \"wins!\")\n        break\n    player = \"O\" if player == \"X\" else \"X\"\nelse:\n    print(\"Draw!\")\n", "responses = {\"hello\": \"Hi, coder!\", \"python\": \"Python is a programming language.\", \"help\": \"Try hello or python. Type quit to exit.\"}\nwhile True:\n    message = input(\"You: \").strip().lower()\n    if message == \"quit\": break\n    print(\"Bot:\", responses.get(message, \"I do not know that yet. Try help.\"))\n", "import json\nfrom urllib.request import urlopen\nfrom urllib.parse import urlencode\nlatitude = float(input(\"Latitude: \"))\nlongitude = float(input(\"Longitude: \"))\nquery = urlencode({\"latitude\": latitude, \"longitude\": longitude, \"current\": \"temperature_2m\"})\ntry:\n    with urlopen(\"https://api.open-meteo.com/v1/forecast?\" + query, timeout=15) as response:\n        data = json.load(response)\n    print(\"Temperature:\", data[\"current\"][\"temperature_2m\"], data[\"current_units\"][\"temperature_2m\"])\nexcept Exception as error:\n    print(\"Could not fetch weather:\", error)\n", "import json\nfrom pathlib import Path\npath = Path(\"tasks.json\")\ntry:\n    tasks = json.loads(path.read_text()) if path.exists() else []\nexcept (ValueError, OSError):\n    tasks = []\nwhile True:\n    print(\"\\n\".join(f\"{i+1}. {task}\" for i, task in enumerate(tasks)) or \"No tasks\")\n    action = input(\"add / remove / quit: \").strip().lower()\n    if action == \"quit\": break\n    if action == \"add\":\n        task = input(\"Task: \").strip()\n        if task: tasks.append(task)\n    elif action == \"remove\":\n        try:\n            number = int(input(\"Task number: \"))\n            if 1 <= number <= len(tasks): tasks.pop(number-1)\n        except ValueError: print(\"Enter a task number.\")\n    path.write_text(json.dumps(tasks))\n", "# Install first: python -m pip install openai\n# Set OPENAI_API_KEY and OPENAI_MODEL in your environment.\nimport os\nfrom openai import OpenAI\nclient = OpenAI()\nmodel = os.environ.get(\"OPENAI_MODEL\")\nif not model:\n    raise SystemExit(\"Set OPENAI_MODEL to a model available in your account.\")\nmessages = [{\"role\": \"system\", \"content\": \"You are a helpful Python tutor.\"}]\nwhile True:\n    text = input(\"You (quit to exit): \")\n    if text.lower() == \"quit\": break\n    messages.append({\"role\": \"user\", \"content\": text})\n    try:\n        response = client.chat.completions.create(model=model, messages=messages)\n        reply = response.choices[0].message.content or \"\"\n        print(reply)\n        messages.append({\"role\": \"assistant\", \"content\": reply})\n    except Exception as error:\n        print(\"Request failed:\", error)\n        messages.pop()\n", "# Install: python -m pip install streamlit pandas\n# Run: python -m streamlit run dashboard.py\nimport streamlit as st\nimport pandas as pd\nst.title(\"My data dashboard\")\nupload = st.file_uploader(\"Upload a CSV\", type=\"csv\")\nif upload:\n    try:\n        data = pd.read_csv(upload)\n        st.dataframe(data)\n        numbers = data.select_dtypes(include=\"number\").columns.tolist()\n        if numbers:\n            column = st.selectbox(\"Column to chart\", numbers)\n            st.bar_chart(data[column])\n        else:\n            st.info(\"Add a numeric column to draw a chart.\")\n    except Exception as error:\n        st.error(f\"Could not read CSV: {error}\")\n"];
const projectNotes = {"8": "Requires internet. Uses Open-Meteo.", "10": "Requires the openai package, your API key, and a model. API usage may cost money. Keep your key in your environment, never in shared code.", "11": "Requires streamlit and pandas. Run with python -m streamlit run dashboard.py."};
$('#course-section').onchange=e=>{courseSection=e.target.value;renderLessons();};
$('#course-search').oninput=e=>{courseSearch=e.target.value.trim();renderLessons();};
boot();

window.PYNApp={
 show:()=>{showApp();renderAll();},
 hide:()=>{$('#app').classList.add('hidden');$('#auth-screen').classList.remove('hidden');$('#modal').classList.add('hidden');},
 setAccount:account=>{
  connectedAccount=account;activeStorageKey=account?`pynState:${account.uid}`:'pynGuestState';
  let local;try{local=JSON.parse(localStorage.getItem(activeStorageKey)||(!account?localStorage.getItem('pynState'):null)||'null');}catch{local=null;}
  state={...JSON.parse(JSON.stringify(defaultState)),...(local||{})};
  if(account){state.username=account.username;state.age=account.age;}
  else state.age=null;
  if(Array.isArray(state.completedLessonIds))state.completedLessons=state.completedLessonIds.map(id=>lessons.findIndex(l=>l.id===id)).filter(i=>i>=0);
  save();renderAll();
 },
 getState:()=>state
};
