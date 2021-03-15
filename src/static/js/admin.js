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

// Create a new element
function newElement(tag) {
  return $(`<${tag}></${tag}>`);
}

// Get an element's HTML
function elementHTML(element) {
  return element.wrap("<p/>").parent().html();
}

// Set an element's HTML
function setHTML(elementID, html) {
  $(`#${elementID}`).html(html);
}

// Replace spaces in a variable name
function replaceSpaces(name) {
  while (name.includes(" ")) {
    name = name.replace(" ", "_");
  }
  return name;
}

// Set the notification number for an admin page
function setNotificationNumber(page, value) {
  if (value === 0) {
    $(`#admin-${page}-notification`).addClass("hidden").text(value);
  } else {
    $(`#admin-${page}-notification`).removeClass("hidden").text(value);
  }
}

// Update admin notifications
async function updateNotifications() {
  const registrationURL = "/api/unapprovedUsers";
  const postsURL = "/api/unapprovedPosts";
  const statusesURL = "/api/statusChangeRequests";
  let unapprovedUsers = null;
  let unapprovedPosts = null;
  let statusChangeRequests = null;

  try {
    unapprovedUsers = await fetchJSON(registrationURL);
    unapprovedPosts = await fetchJSON(postsURL);
    statusChangeRequests = await fetchJSON(statusesURL);
  } catch (err) {
    return;
  }

  setNotificationNumber("registration", unapprovedUsers.length);
  setNotificationNumber("posts", unapprovedPosts.length);
  setNotificationNumber("status", statusChangeRequests.length);
}

// On all admin page load
async function main() {
  await updateNotifications();
}
