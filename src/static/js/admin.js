const statsTimeout = 60 * 1000; // One minute

// Get the JSON response from a URL
async function fetchJSON(url, options) {
  const res = await fetch(url, options);
  const resJSON = await res.json();
  return resJSON;
}

// Remove the content from an element
function clearElement(elementID) {
  $(`#${elementID}`).html("");
}

// Append content to an element
function appendTo(elementID, content) {
  $(`#${elementID}`).append(content);
}

// Set an error message
function setError(message) {
  $("#admin-error").html(message);
}

// Show the error message
function showError(message) {
  if (message) {
    setError(message);
  }

  $("#admin-error").removeClass("hidden");
}

// Hide the error message
function hideError() {
  $("#admin-error").addClass("hidden");
}

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
  populateStats();

  setInterval(() => {
    populateStats();
  }, statsTimeout);
}
