const statsTimeout = 60 * 1000; // One minute

async function fetchJSON(url, options) {
  const res = await fetch(url, options);
  const resJSON = await res.json();
  return resJSON;
}

function clearElement(elementID) {
  $(`#${elementID}`).html("");
}

function appendTo(elementID, content) {
  $(`#${elementID}`).append(content);
}

async function populateStats() {
  const statsURL = "/api/adminStats";
  const stats = await fetchJSON(statsURL);

  clearElement("stats");

  for (const item of Object.keys(stats)) {
    appendTo("stats", `<div>${item}: ${stats[item]}</div>`);
  }
}

function statsLoad() {
  populateStats();

  setInterval(() => {
    populateStats();
  }, statsTimeout);
}
