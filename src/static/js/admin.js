const statsTimeout = 60 * 1000; // One minute
const registrationTimeout = 60 * 1000; // One minute
const postsTimeout = 60 * 1000; // One minute
const programsTimeout = 60 * 1000; // One minute

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

// Set the notification number for an admin page
function setNotificationNumber(page, value) {
  if (value === 0) {
    $(`#admin-${page}-notification`).addClass("hidden").text(value);
  } else {
    $(`#admin-${page}-notification`).removeClass("hidden").text(value);
  }
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
  updateNotifications();
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
  updateNotifications();
  clearElement("variables");
  appendTo("variables", "Fetching variables...");
  await populateVariables();
}

// Set a user's approved status
function approveUser(userID, approved, thisElement) {
  $.ajax({
    url: "/api/approveRegistration",
    data: {
      userID,
      approved,
    },
    success: () => {
      hideError();
      thisElement.closest("tr").remove();
    },
    error: () => {
      showError("Failed to approve user account");
    },
  });
  updateNotifications();
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
  const approveButton = newElement("button")
    .addClass("btn btn-light")
    .attr({
      type: "button",
    })
    .html('<i class="fas fa-check"></i>')
    .click(function () {
      approveUser(user.userID, true, $(this));
    });
  const disapproveButton = newElement("button")
    .addClass("btn btn-light")
    .attr({
      type: "button",
    })
    .html('<i class="fas fa-times"></i>')
    .click(function () {
      approveUser(user.userID, false, $(this));
    });
  const approve = newElement("td")
    .addClass("nowrap")
    .append(approveButton, disapproveButton);
  const row = newElement("tr").append(
    userID,
    firstname,
    lastname,
    email,
    status,
    joinTime,
    approve
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
    clearElement("unapproved-registration");

    for (const user of unapproved) {
      const newItem = createUserRow(user);
      appendTo("unapproved-registration", newItem);
    }
  }
}

// Refresh unapproved users
async function refreshRegistration() {
  updateNotifications();
  clearElement("unapproved-registration");
  showElement("registration-status");
  await populateRegistration();
}

// Set a post's approved status
function approvePost(postID, approved, thisElement) {
  $.ajax({
    url: "/api/approvePost",
    data: {
      postID,
      approved,
    },
    success: () => {
      hideError();
      thisElement.closest("tr").remove();
    },
    error: () => {
      showError("Failed to approve post");
    },
  });
  updateNotifications();
}

// Create a row in the unapproved posts table
function createPostRow(post) {
  const postLink = newElement("a")
    .attr({
      href: `/post/${post.postID}`,
    })
    .text(post.postID);
  const postID = newElement("td").append(postLink);
  const user = newElement("td").text(`${post.firstname} ${post.lastname}`);
  const location = newElement("td").text(post.location);
  const locationType = newElement("td").text(post.locationType);
  const program = newElement("td").text(post.program);
  const threeWords = newElement("td").text(post.threeWords);
  const content = newElement("td").text(post.content);
  const createTime = newElement("td").text(
    new Date(parseInt(post.createTime) * 1000).toLocaleString()
  );
  const approveButton = newElement("button")
    .addClass("btn btn-light")
    .attr({
      type: "button",
    })
    .html('<i class="fas fa-check"></i>')
    .click(function () {
      approvePost(post.postID, true, $(this));
    });
  const disapproveButton = newElement("button")
    .addClass("btn btn-light")
    .attr({
      type: "button",
    })
    .html('<i class="fas fa-times"></i>')
    .click(function () {
      approvePost(post.postID, false, $(this));
    });
  const approve = newElement("td")
    .addClass("nowrap")
    .append(approveButton, disapproveButton);
  const row = newElement("tr").append(
    postID,
    user,
    location,
    locationType,
    program,
    threeWords,
    content,
    createTime,
    approve
  );
  return row;
}

// Populate data on the post approval page
async function populatePosts() {
  const postsURL = "/api/unapprovedPosts";
  let unapproved = null;

  try {
    unapproved = await fetchJSON(postsURL);
  } catch (err) {
    showError("Failed to update posts");
  }

  if (unapproved) {
    hideError();
    hideElement("posts-status");
    clearElement("unapproved-posts");

    for (const post of unapproved) {
      const newItem = createPostRow(post);
      appendTo("unapproved-posts", newItem);
    }
  }
}

// Refresh unapproved posts
async function refreshPosts() {
  updateNotifications();
  clearElement("unapproved-posts");
  showElement("posts-status");
  await populatePosts();
}

// Create a new program
function createProgram(programName) {
  $.ajax({
    url: "/api/createProgram",
    data: {
      programName,
    },
    success: () => {
      hideError();
      populatePrograms();
    },
    error: () => {
      showError("Failed to create program");
    },
  });
}

// Set a program
function setProgram(programID, programName) {
  $.ajax({
    url: "/api/setProgram",
    data: {
      programID,
      programName,
    },
    success: (err) => {
      if (err) {
        showError(err);
      } else {
        hideError();
      }
    },
    error: () => {
      showError("Failed to set program");
    },
  });
}

// Delete a program
function deleteProgram(programID) {
  $.ajax({
    url: "/api/deleteProgram",
    data: {
      programID,
    },
    success: (err) => {
      if (err) {
        showError(err);
      } else {
        hideError();
        populatePrograms();
      }
    },
    error: () => {
      showError("Failed to delete program");
    },
  });
}

// Create a new program element
function createProgramRow(program) {
  const progName = newElement("input")
    .addClass("form-control")
    .attr({
      type: "text",
      id: `prog-${program.id}`,
      name: "value",
      value: program.name,
    });
  const progNameDiv = newElement("div").addClass("col").append(progName);
  const progSaveButton = newElement("button")
    .addClass("btn btn-primary mr-1")
    .attr({
      type: "submit",
    })
    .text("Save");
  const progDeleteButton = newElement("button")
    .addClass("btn btn-danger")
    .attr({
      type: "button",
    })
    .text("Delete")
    .click(() => {
      deleteProgram(program.id);
    });
  const progButtonDiv = newElement("div")
    .addClass("col-auto flex-end")
    .append(progSaveButton, progDeleteButton);
  const row = newElement("div")
    .addClass("row mt-3")
    .append(progNameDiv, progButtonDiv);
  const form = newElement("form")
    .append(row)
    .submit((event) => {
      event.preventDefault();
      setProgram(program.id, $(event.target.value).val());
    });
  return form;
}

// Populate data on the programs page
async function populatePrograms() {
  const programsURL = "/api/adminPrograms";
  let programs = null;

  try {
    programs = await fetchJSON(programsURL);
  } catch (err) {
    showError("Failed to update programs");
  }

  if (programs) {
    hideError();
    clearElement("programs");

    for (const program of programs) {
      const newItem = createProgramRow(program);
      appendTo("programs", newItem);
    }

    const newProgramButton = newElement("button")
      .addClass("btn btn-primary")
      .attr({
        type: "button",
      })
      .text("New Program")
      .click(() => {
        createProgram("");
      });
    const newProgramButtonDiv = newElement("div")
      .addClass("row mt-3")
      .append(newProgramButton);
    appendTo("programs", newProgramButtonDiv);
  }
}

// Refresh all programs
async function refreshPrograms() {
  updateNotifications();
  clearElement("programs");
  appendTo("programs", "Fetching programs...");
  await populatePrograms();
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

// On variables page load
function variablesLoad() {
  updateNotifications();
  populateVariables();
}

// On registration approval page load
function registrationLoad() {
  updateNotifications();
  populateRegistration();

  setInterval(() => {
    updateNotifications();
    populateRegistration();
  }, registrationTimeout);
}

// On post approval page load
function postsLoad() {
  populatePosts();

  setInterval(() => {
    populatePosts();
  }, postsTimeout);
}

// On programs page load
function programsLoad() {
  populatePrograms();

  setInterval(() => {
    populatePrograms();
  }, programsTimeout);
}

// Update admin notifications
async function updateNotifications() {
  const registrationURL = "/api/unapprovedUsers";
  const postsURL = "/api/unapprovedPosts";
  let unapprovedUsers = null;
  let unapprovedPosts = null;

  try {
    unapprovedUsers = await fetchJSON(registrationURL);
    unapprovedPosts = await fetchJSON(postsURL);
  } catch (err) {
    return;
  }

  setNotificationNumber("registration", unapprovedUsers.length);
  setNotificationNumber("posts", unapprovedPosts.length);
}

// On all admin page load
async function main() {
  await updateNotifications();
}
