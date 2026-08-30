const KEY="controlCantDataV2";
const SESSION="controlCantSession";
const USERS={
  admin:{password:"1234",role:"Administrador",name:"Administrador"},
  comandero:{password:"1234",role:"Comandero",name:"Comandero"}
};
const defaultPeople=["Comandero","Chofer 1","Chofer 2","Pañolero","Mecánico"];

function load(){try{return JSON.parse(localStorage.getItem(KEY))||{people:[...defaultPeople],days:{}}}catch{return{people:[...defaultPeople],days:{}}}}
function save(d){localStorage.setItem(KEY,JSON.stringify(d))}
function today(){return new Date().toISOString().slice(0,10)}
function session(){try{return JSON.parse(sessionStorage.getItem(SESSION))}catch{return null}}
function setSession(u){sessionStorage.setItem(SESSION,JSON.stringify(u))}
function clearSession(){sessionStorage.removeItem(SESSION)}
function canAdmin(){return session()?.role==="Administrador"}

function showApp(){
 const s=session(); if(!s)return;
 document.getElementById("loginScreen").classList.add("hidden");
 document.getElementById("app").classList.remove("hidden");
 document.getElementById("userLabel").textContent=`Usuario: ${s.name} · ${s.role}`;
 document.querySelectorAll(".admin-only").forEach(x=>x.classList.toggle("hidden",!canAdmin()));
 render(); renderHistory(); renderAdmin();
}
function login(){
 const u=document.getElementById("username").value.trim().toLowerCase(), p=document.getElementById("password").value;
 if(USERS[u]&&USERS[u].password===p){setSession({user:u,...USERS[u]});document.getElementById("loginError").textContent="";showApp()}
 else document.getElementById("loginError").textContent="Usuario o contraseña incorrectos.";
}
function currentDay(){
 const d=load(), date=document.getElementById("fecha").value, shift=document.getElementById("turno").value;
 d.days[date]??={}; d.days[date][shift]??={}; return d.days[date][shift];
}
function render(){
 const d=load(), date=document.getElementById("fecha").value, day=currentDay(), list=document.getElementById("people");
 list.innerHTML="";
 d.people.forEach(name=>{
  const checked=!!day[name], b=document.createElement("button");
  b.className="person "+(checked?"checked":"");
  b.innerHTML=`<span>${escapeHtml(name)}</span><b>${checked?"✓ MARCADO":"MARCAR"}</b>`;
  b.onclick=()=>{const fresh=load();fresh.days[date]??={};fresh.days[date][document.getElementById("turno").value]??={};fresh.days[date][document.getElementById("turno").value][name]=!fresh.days[date][document.getElementById("turno").value][name];save(fresh);render()};
  list.appendChild(b);
 });
 const marked=Object.values(day).filter(Boolean).length;
 document.getElementById("total").textContent=d.people.length;
 document.getElementById("presentes").textContent=marked;
 document.getElementById("faltan").textContent=d.people.length-marked;
}
function markAll(){const d=load(),date=document.getElementById("fecha").value,shift=document.getElementById("turno").value;d.days[date]??={};d.days[date][shift]={};d.people.forEach(n=>d.days[date][shift][n]=true);save(d);render()}
function saveDay(){document.getElementById("status").textContent="✓ Control guardado correctamente.";setTimeout(()=>document.getElementById("status").textContent="",2200);renderHistory()}
function renderHistory(){
 const d=load(), box=document.getElementById("history");box.innerHTML="";
 const dates=Object.keys(d.days).sort().reverse();
 if(!dates.length){box.innerHTML="<p class='hint'>Todavía no hay registros.</p>";return}
 dates.forEach(date=>Object.keys(d.days[date]).forEach(shift=>{
  const marked=Object.values(d.days[date][shift]).filter(Boolean).length;
  const row=document.createElement("div");row.className="history-row";
  row.innerHTML=`<b>${date}</b><span>${shift}</span><strong>${marked}/${d.people.length} marcados</strong>`;
  box.appendChild(row);
 }))
}
function renderAdmin(){
 const box=document.getElementById("adminPeople");if(!box)return;
 const d=load();box.innerHTML="";
 d.people.forEach((n,i)=>{const row=document.createElement("div");row.className="admin-row";row.innerHTML=`<span>${escapeHtml(n)}</span><button class="danger small" data-i="${i}">Eliminar</button>`;box.appendChild(row)});
 box.querySelectorAll("button").forEach(btn=>btn.onclick=()=>{const d=load();d.people.splice(Number(btn.dataset.i),1);save(d);render();renderAdmin()})
}
function addPerson(){
 const input=document.getElementById("personName"); if(!input.value.trim())return;
 const d=load(),name=input.value.trim();if(!d.people.includes(name))d.people.push(name);save(d);input.value="";document.getElementById("personDialog").close();render();renderAdmin()
}
function exportData(){
 const d=load(),blob=new Blob([JSON.stringify(d,null,2)],{type:"application/json"}),a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="control-cant-respaldo.json";a.click();URL.revokeObjectURL(a.href)
}
function escapeHtml(s){return s.replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}

document.addEventListener("DOMContentLoaded",()=>{
 document.getElementById("fecha").value=today();
 document.getElementById("loginBtn").onclick=login;
 ["username","password"].forEach(id=>document.getElementById(id).addEventListener("keydown",e=>{if(e.key==="Enter")login()}));
 document.getElementById("logoutBtn").onclick=()=>{clearSession();location.reload()};
 document.getElementById("fecha").onchange=render;
 document.getElementById("turno").onchange=render;
 document.getElementById("markAllBtn").onclick=markAll;
 document.getElementById("saveBtn").onclick=saveDay;
 document.getElementById("exportBtn").onclick=exportData;
 document.getElementById("addPersonBtn").onclick=()=>document.getElementById("personDialog").showModal();
 document.getElementById("confirmPerson").onclick=addPerson;
 document.querySelectorAll(".tab").forEach(t=>t.onclick=()=>{document.querySelectorAll(".tab").forEach(x=>x.classList.remove("active"));t.classList.add("active");document.querySelectorAll(".view").forEach(x=>x.classList.add("hidden"));document.getElementById("view-"+t.dataset.view).classList.remove("hidden");});
 if(session())showApp();
});