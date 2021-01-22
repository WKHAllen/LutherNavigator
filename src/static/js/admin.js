const statsTimeout = 60 * 1000; // One minute
const registrationTimeout = 60 * 1000; // One minute

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

// Replace spaces in a variable name
function replaceSpaces(name) {
  while (name.includes(" ")) {
    name = name.replace(" ", "_");
  }
  return name;
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

// Set a variable
function setVariable(name, value) {
  $.ajax({
    url: "/api/setVariable",
    data: {
      name,
      value,
    },
    success: () => {
      hideError();
    },
    error: () => {
      showError("Failed to set variable");
    },
  });
}

// Reset a variable
function resetVariable(name) {
  $.ajax({
    url: "/api/resetVariable",
    data: {
      name,
    },
    success: (value) => {
      hideError();
      $(`#var-${replaceSpaces(name)}`).val(value);
    },
    error: () => {
      showError("Failed to reset variable");
    },
  });
}

// Create a new variable element
function createVariable(variable) {
  const varName = newElement("span").text(variable.name);
  const varNameDiv = newElement("div")
    .addClass("col-4 col-sm-3 col-md-2")
    .append(varName);
  const varValue = newElement("input")
    .addClass("form-control")
    .attr({
      type: "text",
      id: `var-${replaceSpaces(variable.name)}`,
      name: "value",
      value: variable.value,
    });
  const varValueDiv = newElement("div").addClass("col").append(varValue);
  const varSaveButton = newElement("button")
    .addClass("btn btn-primary mr-1")
    .attr({
      type: "submit",
    })
    .text("Save");
  const varResetButton = newElement("button")
    .addClass("btn btn-danger")
    .attr({
      type: "button",
    })
    .text("Reset")
    .click(() => {
      resetVariable(variable.name);
    });
  const varButtonDiv = newElement("div")
    .addClass("col-auto flex-end")
    .append(varSaveButton, varResetButton);
  const row = newElement("div")
    .addClass("row mt-3")
    .append(varNameDiv, varValueDiv, varButtonDiv);
  const form = newElement("form")
    .append(row)
    .submit((event) => {
      event.preventDefault();
      setVariable(variable.name, $(event.target.value).val());
    });
  return form;
}

// Populate data on the variables page
async function populateVariables() {
  const variablesURL = "/api/adminVariables";
  let variables = null;

  try {
    variables = await fetchJSON(variablesURL);
  } catch (err) {
    showError("Failed to update variables");
  }

  if (variables) {
    hideError();
    clearElement("variables");

    for (const variable of variables) {
      const newItem = createVariable(variable);
      appendTo("variables", newItem);
    }
  }
}

// Refresh all variables
async function refreshVariables() {
  clearElement("variables");
  appendTo("variables", "Fetching variables...");
  await populateVariables();
}

// Create a row in the unapproved users table
function createUserRow(user) {
  const userID = newElement("td").text(user.userID);
  const firstname = newElement("td").text(user.firstname);
  const lastname = newElement("td").text(user.lastname);
  const email = newElement("td").text(user.email);
  const status = newElement("td").text(user.status);
  const joinTime = newElement("td").text(
    new Date(parseInt(user.joinTime) * 1000).toLocaleString()
  );
  const row = newElement("tr").append(
    userID,
    firstname,
    lastname,
    email,
    status,
    joinTime
  );
  return row;
}

// Populate data on the registration approval page
async function populateRegistration() {
  const registrationURL = "/api/unapprovedUsers";
  let unapproved = null;

  try {
    unapproved = await fetchJSON(registrationURL);
  } catch (err) {
    showError("Failed to update users");
  }

  if (unapproved) {
    hideError();
    hideElement("registration-status");
    clearElement("unapproved");

    for (const user of unapproved) {
      const newItem = createUserRow(user);
      appendTo("unapproved", newItem);
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

// On variables page load
function variablesLoad() {
  populateVariables();
}

// On registration approval page load
function registrationLoad() {
  populateRegistration();

  setInterval(() => {
    populateRegistration();
  }, registrationTimeout);
}
