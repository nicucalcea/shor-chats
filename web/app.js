// Decode function to restore encoded sensitive data
function decodeSensitiveData(text) {
  if (!text) return text;
  
  // Pattern to match our encoded data
  const encodedPattern = /__ENCODED__([A-Za-z0-9+/=]+)__/g;
  
  return text.replace(encodedPattern, (match, encoded) => {
    try {
      return atob(encoded); // Base64 decode
    } catch (e) {
      return match; // Return original if decoding fails
    }
  });
}

// const fileSelect = document.getElementById('fileSelect');
// const loadBtn = document.getElementById('loadBtn');
const status = document.getElementById('status');
const summary = document.getElementById('summary');
const viewer = document.getElementById('viewer');
const chatList = document.getElementById('chatList');
const chatSearch = document.getElementById('chatSearch');
const sidebarToggle = document.getElementById('sidebarToggle');
const sidebar = document.getElementById('sidebar');

let manifestList = [];
async function loadManifest(){
  try{
    const res = await fetch('data/manifest.json');
    if(!res.ok) throw new Error('Manifest fetch failed: '+res.status);
    const list = await res.json();
    manifestList = Array.isArray(list)? list : [];
    chatList.innerHTML = '';
    if(manifestList.length===0){
      chatList.innerHTML = '<li class="muted">No files found</li>';
      status.textContent = 'No files listed in manifest.';
      return;
    }
    manifestList.forEach((f,i)=>{
      const li = document.createElement('li');
      li.className = 'chat-item';
      li.dataset.file = f;
      li.textContent = f.replace(/\.json$/i, '');
      li.addEventListener('click', ()=> selectChatItem(li));
      chatList.appendChild(li);
    });
    status.textContent = '';
  }catch(e){
    chatList.innerHTML = '<li class="muted">Error loading manifest</li>';
    status.textContent = e.message;
  }
}

function fmtBytes(n){
  if(n<1024) return n+' B';
  if(n<1024*1024) return (n/1024).toFixed(1)+' KB';
  return (n/1024/1024).toFixed(1)+' MB';
}

async function loadFile(){
  const filename = fileSelect.value;
  if(!filename) return;
  status.textContent = 'Loading '+filename+'...';
  summary.textContent=''; viewer.innerHTML='';
  try{
    const res = await fetch('data/'+encodeURIComponent(filename));
    if(!res.ok) throw new Error('Fetch failed: '+res.status+' '+res.statusText);
    const blob = await res.blob();
    const size = blob.size;
    const text = await blob.text();
    let data;
    try{ data = JSON.parse(text); }
    catch(err){
      summary.innerHTML = `<div class="meta">Parse error: ${err.message}</div><pre class="node">${escapeHtml(decodeSensitiveData(text.slice(0,5000)))}</pre>`;
      status.textContent = 'Parsed: error';
      return;
    }
    // summary
    const topType = Array.isArray(data)?'array':'object';
    const keys = topType==='object'?Object.keys(data).length: data.length;
    // clear previous summary on successful load
    // (we intentionally do not show size/type summary here)
    summary.textContent = '';
    // If this looks like a Mattermost export (has posts and channel), render chat UI
    if(data && data.posts && Array.isArray(data.posts)){
      renderChat(viewer, data);
    } else {
      // render generic tree viewer
      renderNode(viewer, data);
    }
  status.textContent = '';
  }catch(e){
    status.textContent = e.message;
    summary.innerHTML = `<div class="meta">Error loading file</div><pre class="node">${escapeHtml(e.toString())}</pre>`;
  }
}

function renderNode(container, data, keyName){
  const type = getType(data);
  if(type==='object' || type==='array'){
    const wrapper = document.createElement('div');
    wrapper.className='node';
    const header = document.createElement('div');
    header.className='collapsible';
    header.innerHTML = `<span class="key">${keyName?escapeHtml(keyName):''}</span> <span class="meta">(${type})</span>`;
    const content = document.createElement('div');
    content.style.paddingLeft='12px';
    content.style.display='none';
    header.addEventListener('click',()=>{
      content.style.display = content.style.display==='none'? 'block':'none';
    });
    wrapper.appendChild(header);
    wrapper.appendChild(content);
    container.appendChild(wrapper);
    if(type==='array'){
      data.forEach((item,i)=> renderNode(content, item, `[${i}]`));
    }else{
      Object.keys(data).slice(0,1000).forEach(k=> renderNode(content, data[k], k));
    }
  }else{
    const leaf = document.createElement('div');
    leaf.className='node';
    leaf.innerHTML = `<span class="key">${keyName?escapeHtml(keyName):''}</span>: <span class="value">${escapeHtml(decodeSensitiveData(String(data)))}</span> <span class="meta">(${type})</span>`;
    container.appendChild(leaf);
  }
}

function renderChat(container, data){
  container.innerHTML = '';
  const header = document.createElement('div');
  header.className = 'chat-header';
  const channelName = data.channel && (data.channel.display_name || data.channel.name) || 'Chat';
  header.innerHTML = `<strong>${escapeHtml(channelName)}</strong> <span class="meta">(${data.posts.length} posts)</span>`;
  container.appendChild(header);

  const chat = document.createElement('div');
  chat.className = 'chat';
  container.appendChild(chat);

  // posts may have idx ordering; sort by idx or created
  const posts = Array.from(data.posts).sort((a,b)=>{
    if(typeof a.idx==='number' && typeof b.idx==='number') return a.idx - b.idx;
    return new Date(a.created) - new Date(b.created);
  });

  posts.forEach(p=>{
    const isSystem = !p.username || /joined the team|left the team|added|removed/i.test(p.message||'');
    const msg = document.createElement('div');
    msg.className = 'message'+(isSystem? ' system':'');

    if(isSystem){
      const s = document.createElement('div');
      s.className = 'system-text';
      s.textContent = p.message || '[system]';
      msg.appendChild(s);
    } else {
      const avatar = document.createElement('div');
      avatar.className = 'avatar';
      avatar.textContent = (p.username||'?').slice(0,1).toUpperCase();
      const body = document.createElement('div');
      body.className = 'body';
      const top = document.createElement('div');
      top.className = 'top';
      const userSpan = document.createElement('span');
      userSpan.className = 'username';
      userSpan.textContent = p.username;
      const timeSpan = document.createElement('span');
      timeSpan.className = 'time';
      timeSpan.textContent = formatTime(p.created);
      top.appendChild(userSpan);
      top.appendChild(timeSpan);
      const bubble = document.createElement('div');
      bubble.className = 'bubble';
      bubble.innerHTML = escapeHtml(p.message || '');
      body.appendChild(top);
      body.appendChild(bubble);
      msg.appendChild(avatar);
      msg.appendChild(body);
    }

    chat.appendChild(msg);
  });

  // scroll to top when chat loads
  setTimeout(() => {
    viewer.scrollTop = 0;
  }, 50);
}

function formatTime(iso){
  try{
    const d = new Date(iso);
    return d.toLocaleString();
  }catch(e){ return iso || '' }
}

function getType(v){
  if(Array.isArray(v)) return 'array';
  if(v===null) return 'null';
  return typeof v==='object'? 'object' : typeof v;
}

function escapeHtml(s){
  return s.replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[ch]));
}

// Search filter for sidebar
chatSearch && chatSearch.addEventListener('input', ()=>{
  const q = chatSearch.value.toLowerCase().trim();
  Array.from(chatList.children).forEach(li=>{
    const t = li.dataset.file && li.dataset.file.toLowerCase();
    li.style.display = (!q || (t && t.includes(q))) ? '' : 'none';
  });
});

function selectChatItem(li){
  Array.from(chatList.children).forEach(n=>n.classList.remove('active'));
  li.classList.add('active');
  loadFileByName(li.dataset.file);
  
  // Auto-close sidebar on mobile after selection
  if(window.innerWidth <= 768) {
    sidebar.classList.remove('open');
  }
}

function loadFileByName(filename){
  if(!filename) return;
  status.textContent = 'Loading '+filename+'...';
  summary.textContent=''; viewer.innerHTML='';
  (async ()=>{
    try{
      const res = await fetch('../mattermost json/'+encodeURIComponent(filename));
      if(!res.ok) throw new Error('Fetch failed: '+res.status+' '+res.statusText);
      const blob = await res.blob();
      const size = blob.size;
      const text = await blob.text();
      let data;
      try{ data = JSON.parse(text); }
      catch(err){
        summary.innerHTML = `<div class="meta">Parse error: ${err.message}</div><pre class="node">${escapeHtml(text.slice(0,5000))}</pre>`;
        status.textContent = 'Parsed: error';
        return;
      }
      const topType = Array.isArray(data)?'array':'object';
      const keys = topType==='object'?Object.keys(data).length: data.length;
    // clear previous summary on successful load
    summary.textContent = '';
      if(data && data.posts && Array.isArray(data.posts)){
        renderChat(viewer, data);
      } else {
        renderNode(viewer, data);
      }
  status.textContent = '';
    }catch(e){
      status.textContent = e.message;
      summary.innerHTML = `<div class="meta">Error loading file</div><pre class="node">${escapeHtml(e.toString())}</pre>`;
    }
  })();
}

// Mobile sidebar toggle
sidebarToggle && sidebarToggle.addEventListener('click', () => {
  sidebar.classList.toggle('open');
});

// Close sidebar when clicking outside on mobile
document.addEventListener('click', (e) => {
  if(window.innerWidth <= 768 && sidebar.classList.contains('open')) {
    if(!sidebar.contains(e.target) && !sidebarToggle.contains(e.target)) {
      sidebar.classList.remove('open');
    }
  }
});

// Handle window resize
window.addEventListener('resize', () => {
  if(window.innerWidth > 768) {
    sidebar.classList.remove('open');
  }
});

window.addEventListener('DOMContentLoaded', loadManifest);
