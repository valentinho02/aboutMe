const $ = s => document.querySelector(s);
const external = a => { a.target = '_blank'; a.rel = 'noopener noreferrer'; return a; };
let posts = [], active = '전체';
const categories = ['전체', 'CUDA', 'Triton', 'PyTorch', 'AI / ML', 'Systems'];
function category(p) { const s = (p.title+' '+p.tags.join(' ')).toLowerCase(); if(s.includes('triton')) return 'Triton'; if(/cuda|gemm|pmpp|pybind|fused|coalescing/.test(s)) return 'CUDA'; if(/pytorch|pytroch/.test(s)) return 'PyTorch'; if(/network|네트워크|kubernetes|운영체제/.test(s)) return 'Systems'; return 'AI / ML'; }
function render() { const q=$('#search').value.trim().toLowerCase(); const selected=posts.filter(p=>(active==='전체'||category(p)===active)&&`${p.title} ${p.tags.join(' ')}`.toLowerCase().includes(q)).sort((a,b)=>$('#sort').value==='new'?b.date.localeCompare(a.date):a.date.localeCompare(b.date)); $('#post-list').replaceChildren(); for(const p of selected) { const a=external(document.createElement('a')); a.className='post'; a.href=p.url; const date=document.createElement('time');date.dateTime=p.date;date.textContent=p.date.replaceAll('-','.');const title=document.createElement('h3'); title.textContent=p.title.trim().replace(/\s+/g,' ');const tag=document.createElement('span');tag.className='post-tag';tag.textContent=category(p);const arrow=document.createElement('span');arrow.className='arrow';arrow.textContent='↗';a.append(date,title,tag,arrow);$('#post-list').append(a); } $('#count').textContent=`${selected.length} POSTS / 전체 ${posts.length}편`;$('#empty').hidden=selected.length!==0; }
for(const c of categories) { const b=document.createElement('button');b.textContent=c;b.setAttribute('aria-pressed',String(c===active));b.onclick=()=>{active=c;document.querySelectorAll('#filters button').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));render();};$('#filters').append(b); }
$('#search').oninput=render;$('#sort').onchange=render;document.addEventListener('keydown',e=>{if(e.key==='/'&&!/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)){e.preventDefault();$('#search').focus();$('#writing').scrollIntoView();}});
let dark;try{dark=localStorage.getItem('inho-theme');}catch{}if(dark==='dark'||(!dark&&matchMedia('(prefers-color-scheme: dark)').matches))document.documentElement.dataset.theme='dark';
$('#theme').onclick=()=>{const next=document.documentElement.dataset.theme==='dark'?'light':'dark';document.documentElement.dataset.theme=next;try{localStorage.setItem('inho-theme',next);}catch{}$('#theme').setAttribute('aria-label',next==='dark'?'라이트 모드 전환':'다크 모드 전환');};
$('#year').textContent=new Date().getFullYear();
const projects=[{name:'sai-mbti',label:'03 / LLM APPLICATIONS',title:'SAI · 서술형 성향 탐색',description:'공개 루브릭으로 채점하는 API MVP. 폴더 구조와 단계별 오류 추적을 정리하고, 문항 점수 분류 모델의 파인튜닝을 준비합니다.',tags:['TypeScript','LLM API','Fine-tuning 계획'],art:'matrix'},{name:'cuda-gemm-optim',label:'01 / GPU COMPUTING',title:'CUDA GEMM Optimization',description:'Naive 커널에서 tiling과 register blocking까지. 행렬 곱셈을 단계적으로 최적화하고 cuBLAS와 성능을 비교합니다.',tags:['CUDA','C++','Benchmark'],art:'matrix'},{name:'OS',label:'02 / SYSTEM FUNDAMENTALS',title:'Operating Systems',description:'운영체제 프로젝트를 통해 시스템의 동작 원리를 코드로 살펴봅니다.',tags:['C','Operating Systems'],art:'system'}];
for(const p of projects){const a=external(document.createElement('a'));a.className='project';a.href=`https://github.com/valentinho02/${p.name}`;const art=document.createElement('div');art.className='project-art '+p.art;art.setAttribute('aria-hidden','true');for(let i=0;i<36;i++){const el=document.createElement('i');el.style.setProperty('--i',i);art.append(el);}const body=document.createElement('div');body.className='project-body';const label=document.createElement('small');label.textContent=p.label;const h=document.createElement('h3');h.textContent=p.title+' ↗';const desc=document.createElement('p');desc.textContent=p.description;const tags=document.createElement('div');tags.className='tags';p.tags.forEach(t=>{const s=document.createElement('span');s.textContent=t;tags.append(s);});body.append(label,h,desc,tags);a.append(art,body);$('#project-list').append(a);}
// Read the newest published snapshot without reusing the browser cache.
let refreshing = false;
async function refreshPosts(manual = false) {
  if (refreshing) return;
  refreshing = true;
  const button = $('#refresh-posts');
  button.disabled = true;
  button.textContent = '↻ 불러오는 중…';
  $('#sync-status').textContent = '최근 수집된 글 목록을 확인하고 있습니다.';
  try {
    const stamp = Date.now();
    const response = await fetch(`data/posts.json?t=${stamp}`, {cache: 'no-store', signal: AbortSignal.timeout(15000)});
    if (!response.ok) throw Error('Could not load posts');
    const data = await response.json();
    if (!Array.isArray(data) || !data.length || data.some(p => typeof p.title !== 'string' || !Array.isArray(p.tags) || !/^\d{4}-\d{2}-\d{2}$/.test(p.date) || typeof p.url !== 'string' || !p.url.startsWith('https://velog.io/@valentinho/'))) throw Error('Invalid posts');
    const previous = new Set(posts.map(p => p.id));
    const added = data.filter(p => !previous.has(p.id)).length;
    posts = data;
    render();
    let collected = '';
    try {
      const meta = await fetch(`data/posts-meta.json?t=${stamp}`, {cache: 'no-store', signal: AbortSignal.timeout(5000)});
      if (meta.ok) {
        const value = await meta.json();
        const date = new Date(value.collected_at);
        if (!Number.isNaN(date.getTime())) collected = ` · 수집: ${date.toLocaleString('ko-KR', {month:'numeric', day:'numeric', hour:'2-digit', minute:'2-digit'})}`;
      }
    } catch { /* A missing timestamp must not hide a successfully loaded list. */ }
    $('#sync-status').textContent = (manual ? (added ? `새 글 ${added}편을 불러왔습니다.` : '최근 수집된 목록입니다. 새 글이 없다면 다음 자동 수집을 기다려주세요.') : `Velog 글 ${posts.length}편`) + collected;
  } catch {
    $('#sync-status').textContent = '목록을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.';
    if (!posts.length) $('#count').textContent = '글 목록 연결을 확인해주세요. Velog에서 원문을 볼 수 있습니다.';
  } finally {
    refreshing = false;
    button.disabled = false;
    button.textContent = '↻ 글 목록 새로고침';
  }
}
$('#refresh-posts').onclick = () => refreshPosts(true);
refreshPosts();
