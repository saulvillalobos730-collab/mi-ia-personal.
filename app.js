const $ = id => document.getElementById(id);
const KEY = "personal-ai-v1";
let state = JSON.parse(localStorage.getItem(KEY) || '{"name":"Elyr","persona":"","messages":[],"memories":[]}');
if (!state.persona) state.persona = $("personaInput").value;
$("nameInput").value = state.name;
$("personaInput").value = state.persona;
$("appName").textContent = state.name;
document.title = state.name;

function persist(){ localStorage.setItem(KEY, JSON.stringify(state)); }
function addMessage(role, text, save=true){
  const el=document.createElement("article");
  el.className="bubble "+role;
  el.textContent=text;
  $("messages").appendChild(el);
  $("messages").scrollTop=$("messages").scrollHeight;
  if(save){state.messages.push({role,text,at:new Date().toISOString()});persist();}
}
function render(){
  $("messages").innerHTML="";
  if(state.messages.length) state.messages.forEach(m=>addMessage(m.role,m.text,false));
  else addMessage("assistant","La memoria está lista. Falta conectar el modelo local para generar respuestas.",false);
}
$("saveIdentity").addEventListener("click",()=>{
  state.name=$("nameInput").value.trim()||"Mi IA";
  state.persona=$("personaInput").value.trim();
  persist();$("appName").textContent=state.name;document.title=state.name;
  $("status").textContent="Identidad guardada en este dispositivo";
  addMessage("assistant",`Identidad guardada como ${state.name}. Mi personalidad está configurada, pero el motor de IA todavía debe conectarse.`);
});
$("chatForm").addEventListener("submit",e=>{
  e.preventDefault(); const text=$("messageInput").value.trim(); if(!text)return;
  addMessage("user",text);$("messageInput").value="";
  addMessage("assistant","Este prototipo todavía no tiene conectado el motor de lenguaje. Tu mensaje sí quedó guardado localmente. El siguiente paso es integrar WebLLM y su modelo descargable.");
});
$("settingsBtn").addEventListener("click",()=>$("settings").showModal());
$("exportBtn").addEventListener("click",()=>{
  const blob=new Blob([JSON.stringify(state,null,2)],{type:"application/json"});
  const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="memoria-ia.json";a.click();URL.revokeObjectURL(a.href);
});
$("clearBtn").addEventListener("click",()=>{
  if(confirm("¿Borrar la conversación y todos los recuerdos guardados en este navegador?")){
    state.messages=[];state.memories=[];persist();render();
  }
});
render();
if("serviceWorker" in navigator && location.protocol.startsWith("http")){
  window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));
}
