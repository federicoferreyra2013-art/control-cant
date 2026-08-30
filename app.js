const KEY = "controlCantData";
const defaultPeople = ["Comandero", "Chofer 1", "Chofer 2", "Pañolero", "Mecánico"];

function loadData() {
  try { return JSON.parse(localStorage.getItem(KEY)) || { people: defaultPeople, days: {} }; }
  catch { return { people: defaultPeople, days: {} }; }
}
function saveData(data) { localStorage.setItem(KEY, JSON.stringify(data)); }

function today() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

function render() {
  const data = loadData();
  const date = document.getElementById("date");
  if (!date.value) date.value = today();

  const list = document.getElementById("people");
  list.innerHTML = "";
  const day = data.days[date.value] || {};
  data.people.forEach((name, i) => {
    const checked = !!day[name];
    const row = document.createElement("button");
    row.className = "person " + (checked ? "checked" : "");
    row.innerHTML = `<span>${name}</span><b>${checked ? "✓" : "MARCAR"}</b>`;
    row.onclick = () => {
      const fresh = loadData();
      fresh.days[date.value] ||= {};
      fresh.days[date.value][name] = !fresh.days[date.value][name];
      saveData(fresh);
      render();
    };
    list.appendChild(row);
  });
  const marked = Object.values(day).filter(Boolean).length;
  document.getElementById("summary").textContent = `${marked} de ${data.people.length} marcados`;
}

function addPerson() {
  const name = prompt("Nombre de la persona:");
  if (!name || !name.trim()) return;
  const data = loadData();
  if (!data.people.includes(name.trim())) data.people.push(name.trim());
  saveData(data);
  render();
}

function clearDay() {
  if (!confirm("¿Borrar las marcas de este día?")) return;
  const data = loadData();
  delete data.days[document.getElementById("date").value];
  saveData(data);
  render();
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("date").value = today();
  document.getElementById("date").addEventListener("change", render);
  document.getElementById("add").onclick = addPerson;
  document.getElementById("clear").onclick = clearDay;
  render();
});
