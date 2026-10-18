import { CreateMLCEngine } from "https://esm.run/@mlc-ai/web-llm";

const $ = id => document.getElementById(id);
const KEY = "personal-ai-v1";
const MODEL_ID = "Qwen2.5-1.5B-Instruct-q4f16_1-MLC";
let engine = null;
let loading = false;
let state;
try {
  state = JSON.parse(localStorage.getItem(KEY) || '{"name":"Elyr","persona":"","messages":[],"memories":[]}');
} catch {
  state = {name:"Elyr", persona:"", messages:[], memories:[]};
}
if (!state.persona) state.persona = $("personaInput").value;
if (!Array.isArray(state.messages)) state.messages = [];
if (!Array.isArray(state.memories)) state.memories = [];
$("nameInput").value = state.name || "Elyr";
$("personaInput").value = state.persona;
$("appName").textContent = state.name || "Elyr";
document.title = state.name || "Elyr";

function persist() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); }
  catch { setModelStatus("No hay suficiente espacio para guardar la memoria del chat."); }
}
function setModelStatus(message) { $("modelStatus").textContent = message; }
function setStatus(message) { $("status").textContent = message; }
function addMessage(role, text, save=true) {
  const el = document.createElement("article");
  el.className = "bubble " + role;
  el.textContent = text;
  $("messages").appendChild(el);
  $("messages").scrollTop = $("messages").scrollHeight;
  if (save) {
    state.messages.push({role, text, at: new Date().toISOString()});
    // Avoid unbounded localStorage growth; retain the latest 100 messages.
    if (state.messages.length > 100) state.messages = state.messages.slice(-100);
    persist();
  }
}
function render() {
  $("messages").innerHTML = "";
  if (state.messages.length) {
    state.messages.forEach(m => {
      if (m && (m.role === "user" || m.role === "assistant") && typeof m.text === "string") addMessage(m.role, m.text, false);
    });
  } else {
    addMessage("assistant", "Hola, soy Elyr. Carga mi cerebro para empezar a conversar. La primera carga necesita internet y puede tardar.", false);
  }
}
function systemPrompt() {
  const memoryText = state.memories.length ? "\nRecuerdos que el usuario decidió guardar:\n" + state.memories.slice(-20).join("\n") : "";
  return `Tu nombre es ${state.name || "Elyr"}. Sigue esta personalidad: ${state.persona || "Sé curiosa, reflexiva y honesta."}${memoryText}\nResponde en español salvo que el usuario pida otro idioma. Sé natural, clara y respetuosa. No inventes recuerdos ni afirmes tener conciencia o sentimientos reales.`;
}
async function loadModel() {
  if (engine || loading) return;
  loading = true;
  $("loadModelBtn").disabled = true;
  setStatus("Preparando motor local…");
  setModelStatus("Comprobando compatibilidad y preparando el modelo. Mantén esta pestaña abierta.");
  try {
    if (!("gpu" in navigator)) {
      throw new Error("Este navegador no expone WebGPU. Prueba Chrome o Brave actualizado; si sigue igual, este dispositivo/navegador no es compatible con esta versión.");
    }
    engine = await CreateMLCEngine(MODEL_ID, {
      initProgressCallback: report => {
        const text = report && report.text ? report.text : "Descargando modelo…";
        setModelStatus(text);
        setStatus("Descargando/preparando modelo…");
      }
    });
    setStatus("Cerebro local listo");
    setModelStatus("Elyr está lista. El modelo quedó preparado en este navegador.");
    $("messageInput").placeholder = "Escribe un mensaje…";
    addMessage("assistant", "Ya cargué mi modelo local. Hablemos.");
  } catch (err) {
    engine = null;
    const message = err && err.message ? err.message : String(err);
    setStatus("No se pudo cargar el motor");
    setModelStatus("No se pudo cargar: " + message + " Comprueba internet, espacio libre y compatibilidad con WebGPU.");
  } finally {
    loading = false;
    $("loadModelBtn").disabled = false;
  }
}
$("saveIdentity").addEventListener("click", () => {
  state.name = $("nameInput").value.trim() || "Elyr";
  state.persona = $("personaInput").value.trim();
  persist();
  $("appName").textContent = state.name;
  document.title = state.name;
  setStatus(engine ? "Cerebro local listo · identidad guardada" : "Identidad guardada · motor local sin cargar");
  addMessage("assistant", `He guardado mi identidad como ${state.name}. ${engine ? "Usaré estas instrucciones en las próximas respuestas." : "Carga mi cerebro para poder responder con el modelo."}`);
});
$("loadModelBtn").addEventListener("click", loadModel);
$("chatForm").addEventListener("submit", async e => {
  e.preventDefault();
  const text = $("messageInput").value.trim();
  if (!text) return;
  if (!engine) {
    addMessage("user", text);
    $("messageInput").value = "";
    addMessage("assistant", "Todavía no he cargado mi cerebro. Pulsa «Cargar cerebro de Elyr» y espera a que termine la descarga.");
    return;
  }
  addMessage("user", text);
  $("messageInput").value = "";
  $("messageInput").disabled = true;
  const sendButton = $("chatForm").querySelector("button");
  sendButton.disabled = true;
  const thinking = document.createElement("article");
  thinking.className = "bubble assistant";
  thinking.textContent = "Estoy pensando…";
  $("messages").appendChild(thinking);
  try {
    const history = state.messages.slice(-16).filter(m => m.role === "user" || m.role === "assistant").map(m => ({role:m.role, content:m.text}));
    const response = await engine.chat.completions.create({
      messages: [{role:"system", content:systemPrompt()}, ...history],
      temperature: 0.75,
      top_p: 0.9,
      max_tokens: 450
    });
    const answer = response.choices?.[0]?.message?.content?.trim() || "No pude generar una respuesta esta vez.";
    thinking.remove();
    addMessage("assistant", answer);
  } catch (err) {
    thinking.remove();
    addMessage("assistant", "Tuve un problema al generar la respuesta: " + (err?.message || String(err)));
  } finally {
    $("messageInput").disabled = false;
    sendButton.disabled = false;
    $("messageInput").focus();
  }
});
$("settingsBtn").addEventListener("click", () => $("settings").showModal());
$("exportBtn").addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(state, null, 2)], {type:"application/json"});
  const a = document.createElement("a");
  const url = URL.createObjectURL(blob);
  a.href = url; a.download = "memoria-elyr.json"; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});
$("clearBtn").addEventListener("click", () => {
  if (confirm("¿Borrar la conversación y todos los recuerdos guardados en este navegador?")) {
    state.messages = []; state.memories = []; persist(); render();
  }
});
render();
if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
  window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js").catch(err => console.warn("Service worker:", err)));
}
