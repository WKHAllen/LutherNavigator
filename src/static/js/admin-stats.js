const statsTimeout = 60 * 1000; // One minute

// Populate data on the stats page
async function populateStats() {
  const statsURL = "/api/adminStats";
  let stats = null;

  try {
    stats = await fetchJSON(statsURL);
  } catch (err) {
    showError("Failed to update stats");
  }

  if (stats) {
    hideError();
    clearElement("stats");

    for (const item of Object.keys(stats)) {
      appendTo("stats", `<div>${item}: ${stats[item]}</div>`);
    }
  }
}

// On stats page load
function statsLoad() {
  updateNotifications();
  populateStats();

  setInterval(() => {
    updateNotifications();
    populateStats();
  }, statsTimeout);
}
