// Improve timestamps on the page
function improveTimestamps() {
  const timestamps = document.getElementsByClassName("timestamp");
  for (const timestamp of timestamps) {
    timestamp.innerText = new Date(
      parseInt(timestamp.innerText) * 1000
    ).toLocaleString();
  }

  const timestampDates = document.getElementsByClassName("timestamp-date");
  for (var timestampDate of timestampDates) {
    timestampDate.innerText = new Date(
      parseInt(timestampDate.innerText) * 1000
    ).toDateString();
  }
}

// When page loads
window.addEventListener("load", () => {
  improveTimestamps();
});
