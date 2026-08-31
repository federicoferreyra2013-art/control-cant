const USERS = {
  admin:{pass:"admin123",role:"Administrador",name:"Administrador"},
  panol:{pass:"panol123",role:"Pañolero",name:"Pañolero"},
  comandero:{pass:"comandero123",role:"Comandero",name:"Comandero"},
  veedor1:{pass:"veedor1",role:"Veedor",name:"Veedor 1"},
  veedor2:{pass:"veedor2",role:"Veedor",name:"Veedor 2"},
  retrista1:{pass:"retrista1",role:"Maquinista",name:"Retrista 1"},
  retrista2:{pass:"retrista2",role:"Maquinista",name:"Retrista 2"},
  palero1:{pass:"palero1",role:"Maquinista",name:"Palero 1"},
  palero2:{pass:"palero2",role:"Maquinista",name:"Palero 2"},
  mecanico1:{pass:"mecanico1",role:"Mecánico",name:"Mecánico 1"},
  mecanico2:{pass:"mecanico2",role:"Mecánico",name:"Mecánico 2"},
  camionero1:{pass:"camionero1",role:"Camionero",name:"Camionero 1"}
};

const KEY="control_cant_data_v1";
const SESSION="control_cant_session";
let data=JSON.parse(localStorage.getItem(KEY)||'{"viajes":[],"planta":[],"combustible":[],"ordenes":[],"maquinas":[]}');
let session=JSON.parse(sessionStorage.getItem(SESSION)||"null");

const permissions={
  Administrador:["inicio","viajes","planta","combustible","ordenes","maquinas","usuarios"],
  Pañolero:["inicio","viajes","combustible","ordenes","maquinas"],
  Comandero:["inicio","viajes","planta"],
  Veedor:["inicio","viajes","planta","combustible","ordenes","maquinas"],
  Maquinista:["inicio","ordenes","maquinas"],
  "Mecánico":["inicio","ordenes","maquinas"],
  Camionero:["inicio","viajes"]
};

function save(){localStorage.setItem(KEY,JSON.stringify(data));}
function can(p){return !!session && permissions[session.role]?.includes(p)}
function esc(s){return String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
function fmtDate(v){return v?new Date(v+"T00:00:00").toLocaleDateString("es-AR"):""}

function loginView(err=""){
  document.getElementById("app").innerHTML=`
  <div class="login"><div class="login-card">
    <img class="logo" src="logo.png" alt="CANTECOR S.A.">
    <h1>Control-CANT</h1><p class="muted">Sistema de control de cantera</p>
    ${err?`<div class="error">${esc(err)}</div>`:""}
    <form id="loginForm">
      <div class="field"><label>Usuario</label><input id="user" autocomplete="username" required></div>
      <div class="field"><label>Contraseña</label><input id="pass" type="password" autocomplete="current-password" required></div>
      <button class="primary">Ingresar</button>
    </form>
    
  </div></div>`;
  document.getElementById("loginForm").onsubmit=e=>{
    e.preventDefault(); const u=document.getElementById("user").value.trim().toLowerCase(), p=document.getElementById("pass").value;
    if(!USERS[u]||USERS[u].pass!==p){loginView("Usuario o contraseña incorrectos.");return}
    session={user:u,...USERS[u]};sessionStorage.setItem(SESSION,JSON.stringify(session));render();
  };
}

function shell(){
  const items=[["inicio","Inicio"],["viajes","Viajes / Producción"],["planta","Planta"],["combustible","Combustible"],["ordenes","Órdenes de trabajo"],["maquinas","Máquinas"]];
  if(session.role==="Administrador")items.push(["usuarios","Usuarios"]);
  return `<div class="top"><div class="brand"><img src="logo.png"><span>Control-CANT · ${esc(session.name)}</span></div><button id="logout">Salir</button></div>
  <div class="layout"><aside class="sidebar">${items.filter(x=>can(x[0])).map(x=>`<button data-page="${x[0]}" class="nav">${x[1]}</button>`).join("")}</aside><main class="main" id="main"></main></div>`;
}

function render(){
  if(!session){loginView();return}
  document.getElementById("app").innerHTML=shell();
  document.getElementById("logout").onclick=()=>{session=null;sessionStorage.removeItem(SESSION);render()};
  document.querySelectorAll(".nav").forEach(b=>b.onclick=()=>show(b.dataset.page));
  show("inicio");
}

function show(page){
  document.querySelectorAll(".nav").forEach(b=>b.classList.toggle("active",b.dataset.page===page));
  const main=document.getElementById("main");
  if(page==="inicio")home(main);
  if(page==="viajes")viajes(main);
  if(page==="planta")planta(main);
  if(page==="combustible")combustible(main);
  if(page==="ordenes")ordenes(main);
  if(page==="maquinas")maquinas(main);
  if(page==="usuarios")usuarios(main);
}

function home(el){
  const t=data.viajes.reduce((a,x)=>a+Number(x.viajes||0),0), ton=data.viajes.reduce((a,x)=>a+Number(x.toneladas||0),0);
  el.innerHTML=`<div class="title-row"><h2>Panel principal</h2><button class="btn" id="downloadReport">📄 Descargar informe</button></div>
  <div class="notice">Cada usuario ve solamente los módulos que le corresponden. El Administrador puede corregir todo.</div>
  <div class="grid">
    <div class="card">Viajes registrados<div class="stat">${t}</div></div>
    <div class="card">Toneladas registradas<div class="stat">${ton}</div></div>
    <div class="card">Registros de planta<div class="stat">${data.planta.length}</div></div>
    <div class="card">Órdenes de trabajo<div class="stat">${data.ordenes.length}</div></div>
    <div class="card">Movimientos de combustible<div class="stat">${data.combustible.length}</div></div>
  </div>
  <div class="card section" style="margin-top:16px"><b>Rol:</b> ${esc(session.role)}<br><span style="color:#6b7280">Usuario: ${esc(session.user)}</span></div>`;
  document.getElementById("downloadReport").onclick=downloadReport;
}

function downloadReport(){
  if(typeof window.jspdf==="undefined"){alert("No se pudo cargar el generador de PDF. Verifique su conexión a Internet e inténtelo nuevamente.");return}
  const {jsPDF}=window.jspdf, pdf=new jsPDF({unit:"mm",format:"a4"});
  const margin=14; let y=18;
  pdf.setFontSize(18); pdf.text("CONTROL-CANT",margin,y); y+=8;
  pdf.setFontSize(12); pdf.text("Informe de control de cantera · CANTECOR S.A.",margin,y); y+=7;
  pdf.setFontSize(10); pdf.text("Generado: "+new Date().toLocaleString("es-AR"),margin,y); y+=8;
  pdf.text("Usuario: "+session.name+" · "+session.role,margin,y); y+=10;
  const sections=[
    ["VIAJES / PRODUCCIÓN",data.viajes.map(x=>`${fmtDate(x.fecha)} | ${x.camion||""} | ${x.chofer||""} | ${x.viajes||0} viajes | ${x.toneladas||0} t`)],
    ["PLANTA",data.planta.map(x=>`${fmtDate(x.fecha)} | Arranque ${x.arranque||"-"} | Parada ${x.parada||"-"} | ${x.horas||0} h | ${x.produccion||0} t | ${x.viajes||0} viajes`)],
    ["COMBUSTIBLE",data.combustible.map(x=>`${fmtDate(x.fecha)} | ${x.tipo||""} | ${x.combustible||""} | ${x.litros||0} L | ${x.unidad||""}`)],
    ["ÓRDENES DE TRABAJO",data.ordenes.map(x=>`${fmtDate(x.fecha)} | ${x.maquina||""} | ${x.responsable||""} | ${x.prioridad||""} | ${x.estado||""}`)],
    ["MÁQUINAS",data.maquinas.map(x=>`${fmtDate(x.fecha)} | ${x.maquina||""} | ${x.operador||""} | ${(Number(x.fin||0)-Number(x.inicio||0)).toFixed(1)} h`)]
  ];
  sections.forEach(([title,rows])=>{
    if(y>275){pdf.addPage();y=18}
    pdf.setFontSize(12);pdf.text(title,margin,y);y+=6;pdf.setFontSize(8);
    if(!rows.length){pdf.text("Sin registros.",margin,y);y+=6;return}
    rows.forEach(row=>{
      const lines=pdf.splitTextToSize(row,182);
      if(y+lines.length*4.2>285){pdf.addPage();y=18;pdf.setFontSize(8)}
      pdf.text(lines,margin,y);y+=lines.length*4.2+1;
    }); y+=3;
  });
  pdf.save("informe-control-cant-"+new Date().toISOString().slice(0,10)+".pdf");
}

function viajes(el){
  const editable=["Administrador","Comandero","Pañolero"].includes(session.role);
  el.innerHTML=`<div class="title-row"><h2>Viajes y producción</h2>${editable?`<button class="btn" id="newViaje">+ Cargar viajes</button>`:""}</div>
  <div class="notice">Los viajes de camiones los carga el <b>Comandero</b>. El <b>Pañolero</b> también puede cargarlos. Los camioneros no cargan viajes.</div>
  ${editable?`<div id="viajeForm" class="card hidden section"><form id="vf"><div class="form-grid">
    <div class="field"><label>Fecha</label><input type="date" name="fecha" required></div>
    <div class="field"><label>Camión</label><input name="camion" placeholder="Ej. Camión 01" required></div>
    <div class="field"><label>Chofer</label><input name="chofer"></div>
    <div class="field"><label>Origen</label><input name="origen" value="Pozo"></div>
    <div class="field"><label>Destino</label><input name="destino" value="Playa CANTECOR"></div>
    <div class="field"><label>Material</label><input name="material" value="Piedra volada"></div>
    <div class="field"><label>Viajes</label><input type="number" min="0" name="viajes" required></div>
    <div class="field"><label>Toneladas por viaje</label><input type="number" min="0" step="0.1" name="tpp" value="28"></div>
  </div><div class="actions"><button class="btn">Guardar</button><button type="button" class="btn secondary" id="cancelV">Cancelar</button></div></form></div>`:""}
  <div class="table-wrap"><table class="table"><thead><tr><th>Fecha</th><th>Camión</th><th>Chofer</th><th>Viajes</th><th>Toneladas</th><th>Origen</th><th>Destino</th>${session.role==="Administrador"?`<th>Acción</th>`:""}</tr></thead><tbody>
  ${data.viajes.map((x,i)=>`<tr><td>${fmtDate(x.fecha)}</td><td>${esc(x.camion)}</td><td>${esc(x.chofer)}</td><td>${x.viajes}</td><td>${x.toneladas}</td><td>${esc(x.origen)}</td><td>${esc(x.destino)}</td>${session.role==="Administrador"?`<td><button class="btn danger" onclick="del('viajes',${i})">Eliminar</button></td>`:""}</tr>`).join("")||`<tr><td colspan="8">Sin registros.</td></tr>`}
  </tbody></table></div>`;
  if(editable){
    document.getElementById("newViaje").onclick=()=>document.getElementById("viajeForm").classList.toggle("hidden");
    document.getElementById("cancelV").onclick=()=>document.getElementById("viajeForm").classList.add("hidden");
    document.getElementById("vf").onsubmit=e=>{e.preventDefault();let f=new FormData(e.target),v=Number(f.get("viajes")),t=Number(f.get("tpp"));data.viajes.push({fecha:f.get("fecha"),camion:f.get("camion"),chofer:f.get("chofer"),origen:f.get("origen"),destino:f.get("destino"),material:f.get("material"),viajes:v,toneladas:v*t});save();show("viajes")};
  }
}

function planta(el){
  const editable=["Administrador","Comandero"].includes(session.role);
  el.innerHTML=`<div class="title-row"><h2>Planta</h2>${editable?`<button class="btn" id="newPlanta">+ Cargar turno</button>`:""}</div>
  <div class="notice">El Comandero registra arranque, parada, horas, producción y viajes observados de la planta.</div>
  ${editable?`<div id="pf" class="card hidden section"><form id="plantForm"><div class="form-grid">
    <div class="field"><label>Fecha</label><input type="date" name="fecha" required></div>
    <div class="field"><label>Hora de arranque</label><input type="time" name="arranque"></div>
    <div class="field"><label>Hora de parada</label><input type="time" name="parada"></div>
    <div class="field"><label>Horas trabajadas</label><input type="number" step="0.1" name="horas"></div>
    <div class="field"><label>Producción (t)</label><input type="number" step="0.1" name="produccion"></div>
    <div class="field"><label>Viajes de camiones</label><input type="number" name="viajes"></div>
    <div class="field"><label>Observaciones</label><textarea name="obs"></textarea></div>
  </div><button class="btn">Guardar</button></form></div>`:""}
  <div class="table-wrap"><table class="table"><thead><tr><th>Fecha</th><th>Arranque</th><th>Parada</th><th>Horas</th><th>Producción</th><th>Viajes</th><th>Observaciones</th>${session.role==="Administrador"?`<th>Acción</th>`:""}</tr></thead><tbody>${data.planta.map((x,i)=>`<tr><td>${fmtDate(x.fecha)}</td><td>${x.arranque||""}</td><td>${x.parada||""}</td><td>${x.horas||""}</td><td>${x.produccion||""}</td><td>${x.viajes||""}</td><td>${esc(x.obs)}</td>${session.role==="Administrador"?`<td><button class="btn danger" onclick="del('planta',${i})">Eliminar</button></td>`:""}</tr>`).join("")||`<tr><td colspan="8">Sin registros.</td></tr>`}</tbody></table></div>`;
  if(editable){document.getElementById("newPlanta").onclick=()=>document.getElementById("pf").classList.toggle("hidden");document.getElementById("plantForm").onsubmit=e=>{e.preventDefault();let f=new FormData(e.target);data.planta.push(Object.fromEntries(f));save();show("planta")}}
}

function combustible(el){
  const editable=["Administrador","Pañolero"].includes(session.role);
  el.innerHTML=`<div class="title-row"><h2>Combustible · Entrada y salida</h2>${editable?`<button class="btn" id="newComb">+ Movimiento</button>`:""}</div>
  ${editable?`<div id="cf" class="card hidden section"><form id="combForm"><div class="form-grid">
    <div class="field"><label>Fecha</label><input type="date" name="fecha" required></div>
    <div class="field"><label>Tipo</label><select name="tipo"><option>Entrada</option><option>Salida</option></select></div>
    <div class="field"><label>Combustible</label><input name="combustible" value="Gasoil"></div>
    <div class="field"><label>Litros</label><input type="number" step="0.1" name="litros" required></div>
    <div class="field"><label>Máquina / vehículo</label><input name="unidad"></div>
    <div class="field"><label>Observaciones</label><input name="obs"></div>
  </div><button class="btn">Guardar</button></form></div>`:""}
  <div class="table-wrap"><table class="table"><thead><tr><th>Fecha</th><th>Tipo</th><th>Combustible</th><th>Litros</th><th>Unidad</th><th>Observaciones</th>${session.role==="Administrador"?`<th>Acción</th>`:""}</tr></thead><tbody>${data.combustible.map((x,i)=>`<tr><td>${fmtDate(x.fecha)}</td><td>${esc(x.tipo)}</td><td>${esc(x.combustible)}</td><td>${x.litros}</td><td>${esc(x.unidad)}</td><td>${esc(x.obs)}</td>${session.role==="Administrador"?`<td><button class="btn danger" onclick="del('combustible',${i})">Eliminar</button></td>`:""}</tr>`).join("")||`<tr><td colspan="7">Sin movimientos.</td></tr>`}</tbody></table></div>`;
  if(editable){document.getElementById("newComb").onclick=()=>document.getElementById("cf").classList.toggle("hidden");document.getElementById("combForm").onsubmit=e=>{e.preventDefault();let f=new FormData(e.target);data.combustible.push(Object.fromEntries(f));save();show("combustible")}}
}

function ordenes(el){
  const editable=["Administrador","Mecánico","Pañolero"].includes(session.role);
  el.innerHTML=`<div class="title-row"><h2>Órdenes de trabajo</h2>${editable?`<button class="btn" id="newOT">+ Nueva orden</button>`:""}</div>
  <div class="notice">Los mecánicos cargan su orden de trabajo. El Administrador puede corregir y controlar todo; el Pañolero puede registrar las órdenes necesarias para el pañol.</div>
  ${editable?`<div id="otf" class="card hidden section"><form id="otForm"><div class="form-grid">
    <div class="field"><label>Fecha</label><input type="date" name="fecha" required></div>
    <div class="field"><label>Máquina</label><input name="maquina" placeholder="PC350, pala, etc." required></div>
    <div class="field"><label>Responsable</label><input name="responsable" value="${esc(session.name)}"></div>
    <div class="field"><label>Prioridad</label><select name="prioridad"><option>Normal</option><option>Urgente</option></select></div>
    <div class="field"><label>Trabajo realizado / solicitado</label><textarea name="trabajo" required></textarea></div>
    <div class="field"><label>Repuestos / materiales</label><textarea name="repuestos"></textarea></div>
    <div class="field"><label>Estado</label><select name="estado"><option>Abierta</option><option>En proceso</option><option>Finalizada</option></select></div>
  </div><button class="btn">Guardar orden</button></form></div>`:""}
  <div class="table-wrap"><table class="table"><thead><tr><th>Fecha</th><th>Máquina</th><th>Responsable</th><th>Prioridad</th><th>Trabajo</th><th>Estado</th>${session.role==="Administrador"?`<th>Acción</th>`:""}</tr></thead><tbody>${data.ordenes.map((x,i)=>`<tr><td>${fmtDate(x.fecha)}</td><td>${esc(x.maquina)}</td><td>${esc(x.responsable)}</td><td>${esc(x.prioridad)}</td><td>${esc(x.trabajo)}</td><td>${esc(x.estado)}</td>${session.role==="Administrador"?`<td><button class="btn danger" onclick="del('ordenes',${i})">Eliminar</button></td>`:""}</tr>`).join("")||`<tr><td colspan="7">Sin órdenes.</td></tr>`}</tbody></table></div>`;
  if(editable){document.getElementById("newOT").onclick=()=>document.getElementById("otf").classList.toggle("hidden");document.getElementById("otForm").onsubmit=e=>{e.preventDefault();let f=new FormData(e.target);data.ordenes.push(Object.fromEntries(f));save();show("ordenes")}}
}

function maquinas(el){
  const editable=["Administrador","Maquinista","Mecánico","Pañolero"].includes(session.role);
  el.innerHTML=`<div class="title-row"><h2>Máquinas</h2>${editable?`<button class="btn" id="newM">+ Registrar parte</button>`:""}</div>
  <div class="notice">Maquinistas registran el parte de su máquina. Aquí no se cargan viajes de camiones.</div>
  ${editable?`<div id="mf" class="card hidden section"><form id="mForm"><div class="form-grid">
    <div class="field"><label>Fecha</label><input type="date" name="fecha" required></div>
    <div class="field"><label>Máquina</label><input name="maquina" placeholder="Retrista / Palero" required></div>
    <div class="field"><label>Operador</label><input name="operador" value="${esc(session.name)}"></div>
    <div class="field"><label>Horómetro inicial</label><input type="number" step="0.1" name="inicio"></div>
    <div class="field"><label>Horómetro final</label><input type="number" step="0.1" name="fin"></div>
    <div class="field"><label>Observaciones</label><textarea name="obs"></textarea></div>
  </div><button class="btn">Guardar</button></form></div>`:""}
  <div class="table-wrap"><table class="table"><thead><tr><th>Fecha</th><th>Máquina</th><th>Operador</th><th>Inicio</th><th>Final</th><th>Horas</th><th>Observaciones</th>${session.role==="Administrador"?`<th>Acción</th>`:""}</tr></thead><tbody>${data.maquinas.map((x,i)=>`<tr><td>${fmtDate(x.fecha)}</td><td>${esc(x.maquina)}</td><td>${esc(x.operador)}</td><td>${x.inicio||""}</td><td>${x.fin||""}</td><td>${(Number(x.fin||0)-Number(x.inicio||0)).toFixed(1)}</td><td>${esc(x.obs)}</td>${session.role==="Administrador"?`<td><button class="btn danger" onclick="del('maquinas',${i})">Eliminar</button></td>`:""}</tr>`).join("")||`<tr><td colspan="8">Sin partes.</td></tr>`}</tbody></table></div>`;
  if(editable){document.getElementById("newM").onclick=()=>document.getElementById("mf").classList.toggle("hidden");document.getElementById("mForm").onsubmit=e=>{e.preventDefault();let f=new FormData(e.target);data.maquinas.push(Object.fromEntries(f));save();show("maquinas")}}
}

function usuarios(el){
  el.innerHTML=`<div class="title-row"><h2>Usuarios y roles</h2></div>
  <div class="notice">Esta pantalla es exclusiva del Administrador. Para una versión definitiva con usuarios reales y datos compartidos entre celulares/computadoras necesitaremos una base de datos y autenticación de servidor.</div>
  <div class="table-wrap"><table class="table"><thead><tr><th>Usuario</th><th>Nombre</th><th>Rol</th><th>Permisos principales</th></tr></thead><tbody>${Object.entries(USERS).map(([u,x])=>`<tr><td>${u}</td><td>${x.name}</td><td>${x.role}</td><td>${(permissions[x.role]||[]).join(", ")}</td></tr>`).join("")}</tbody></table></div>`;
}

window.del=(tipo,i)=>{
  if(session.role!=="Administrador")return;
  if(confirm("¿Está seguro de eliminar este registro? Esta acción no se puede deshacer.")){
    data[tipo].splice(i,1);save();
    const pages={viajes:"viajes",planta:"planta",combustible:"combustible",ordenes:"ordenes",maquinas:"maquinas"};
    show(pages[tipo]||"inicio");
  }
};

render();
