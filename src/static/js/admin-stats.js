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

    for (const item in stats) {
      const statsLabel = newElement("div").addClass("stats-label").text(item);
      const statsValue = newElement("div")
        .addClass("stats-value")
        .text(stats[item]);
      const newItemDiv = newElement("div").append(statsLabel, statsValue);
      appendTo("stats", newItemDiv);
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
