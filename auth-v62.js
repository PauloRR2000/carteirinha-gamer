(function(){
  'use strict';
  const API='https://carteirinha-gamer-api.pauloricardo59143.workers.dev';
  const TOKEN_KEY='cg_auth_token';
  const USER_KEY='cg_auth_user';
  const SYNC_KEYS=['cg_perfil','cg_jogos','cg_historico','cg_perfil_publico'];
  let syncTimer=null, applyingCloud=false;
  function getToken(){return localStorage.getItem(TOKEN_KEY)||'';}
  function getUser(){try{return JSON.parse(localStorage.getItem(USER_KEY)||'null')}catch{return null}}
  function setSession(token,user){localStorage.setItem(TOKEN_KEY,token);localStorage.setItem(USER_KEY,JSON.stringify(user));renderAccountChip();}
  function clearSession(){localStorage.removeItem(TOKEN_KEY);localStorage.removeItem(USER_KEY);renderAccountChip();}
  async function api(path,options={}){const headers={...(options.headers||{})};if(options.body&&!headers['Content-Type'])headers['Content-Type']='application/json';const token=getToken();if(token)headers.Authorization=`Bearer ${token}`;const r=await fetch(API+path,{...options,headers});let data={};try{data=await r.json()}catch{}if(!r.ok)throw new Error(data.mensagem||`Erro ${r.status}`);return data;}
  function snapshot(){const out={};for(const key of SYNC_KEYS){try{out[key]=JSON.parse(localStorage.getItem(key)||'null')}catch{out[key]=null}}return out;}
  function hasLocalData(){const s=snapshot();return Boolean((s.cg_jogos&&s.cg_jogos.length)||(s.cg_perfil&&s.cg_perfil.nome&&s.cg_perfil.nome!=='Visitante')||(s.cg_historico&&s.cg_historico.length));}
  function applySnapshot(payload){if(!payload||typeof payload!=='object')return;applyingCloud=true;for(const key of SYNC_KEYS){if(Object.prototype.hasOwnProperty.call(payload,key)){const value=payload[key];if(value===null||value===undefined)localStorage.removeItem(key);else localStorage.setItem(key,JSON.stringify(value));}}applyingCloud=false;}
  async function uploadNow(){if(!getToken())return{sucesso:false};const data=await api('/save',{method:'PUT',body:JSON.stringify({payload:snapshot()})});document.dispatchEvent(new CustomEvent('cg:cloud-synced',{detail:data}));return data;}
  async function downloadNow({ask=true,reload=true}={}){if(!getToken())return{sucesso:false};const data=await api('/save');if(!data.encontrado)return data;if(ask&&!confirm('Existe um save na nuvem. Deseja carregar esse save neste navegador?'))return data;applySnapshot(data.payload||{});if(reload)location.reload();return data;}
  function schedule(){if(applyingCloud||!getToken())return;clearTimeout(syncTimer);syncTimer=setTimeout(()=>uploadNow().catch(err=>console.warn('Sync nuvem:',err)),1200);}
  async function afterLogin(){let cloud;try{cloud=await api('/save')}catch{return}if(cloud.encontrado){if(confirm('Encontramos um save da sua conta na nuvem. Deseja carregá-lo neste navegador?')){applySnapshot(cloud.payload||{});location.href='index.html';return}}else if(hasLocalData()){if(confirm('Encontramos uma Carteirinha salva neste navegador. Deseja vincular esses dados à sua nova conta?'))await uploadNow()}location.href='index.html';}
  function avatarSrc(user){let perfil={};try{perfil=JSON.parse(localStorage.getItem('cg_perfil')||'{}')}catch{}const code=(perfil.avatar||user?.avatar||'avatar-01');return /^avatar-\d{2}$/.test(code)?`assets/avatars/${code}.png`:'assets/avatars/avatar-01.png';}
  function escapeHtml(v){return String(v||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  function renderAccountChip(){const user=getUser();let target=document.querySelector('#botaoLogin');if(!target){const header=document.querySelector('header.topo');if(!header)return;target=document.createElement('a');target.id='botaoContaV62';header.appendChild(target);}const replacement=document.createElement('a');replacement.className='auth-chip-v62'+(user?'':' is-guest');replacement.id=target.id;replacement.href=user?'conta.html':'login.html';replacement.innerHTML=user?`<img src="${avatarSrc(user)}" alt=""><span>${escapeHtml(user.nome||user.email||'Minha conta')}</span>`:'<span>Entrar</span>';target.replaceWith(replacement);}
  async function validateSession(){if(!getToken()){renderAccountChip();return}try{const d=await api('/auth/me');localStorage.setItem(USER_KEY,JSON.stringify(d.usuario));}catch{clearSession()}renderAccountChip();}
  async function register(nome,email,senha){const d=await api('/auth/register',{method:'POST',body:JSON.stringify({nome,email,senha})});setSession(d.token,d.usuario);return d}
  async function login(email,senha){const d=await api('/auth/login',{method:'POST',body:JSON.stringify({email,senha})});setSession(d.token,d.usuario);return d}
  async function logout(){try{await api('/auth/logout',{method:'POST'})}catch{}clearSession();location.href='index.html'}
  window.CGAuth={api,getToken,getUser,register,login,logout,afterLogin,uploadNow,downloadNow,schedule,snapshot,hasLocalData};
  window.CGCloudSync={schedule,uploadNow,downloadNow};
  document.addEventListener('DOMContentLoaded',validateSession);
})();
