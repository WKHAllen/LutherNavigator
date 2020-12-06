// Improve timestamps on the page
function improveTimestamps() {
  const timestamps = document.getElementsByClassName("timestamp");
  for (const timestamp of timestamps) {
    timestamp.innerText = new Date(
      parseInt(timestamp.innerText) * 1000
    ).toLocaleString();
  }
}

// When page loads
window.addEventListener("load", () => {
  improveTimestamps();
});
