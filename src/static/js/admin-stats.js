const statsTimeout = 60 * 1000; // One minute

// Create a row in the users table
function createUserRow(user) {
  const userID = newElement("td").text(user.userID);
  const firstname = newElement("td").text(user.firstname);
  const lastname = newElement("td").text(user.lastname);
  const email = newElement("td").text(user.email);
  const status = newElement("td").text(user.status);
  const verified = newElement("td").html(
    user.verified ? '<i class="fas fa-check"></i>' : ""
  );
  const approved = newElement("td").html(
    user.approved ? '<i class="fas fa-check"></i>' : ""
  );
  const admin = newElement("td").html(
    user.admin ? '<i class="fas fa-check"></i>' : ""
  );
  const joinTime = newElement("td").text(
    new Date(parseInt(user.joinTime) * 1000).toLocaleString()
  );
  const row = newElement("tr").append(
    userID,
    firstname,
    lastname,
    email,
    status,
    verified,
    approved,
    admin,
    joinTime
  );
  return row;
}

// Create a row in the posts table
function createPostRow(post) {
  const postLink = newElement("a")
    .attr({
      href: `/post/${post.postID}`,
    })
    .text(post.postID);
  const postID = newElement("td").append(postLink);
  const location = newElement("td").text(post.location);
  const postUser = newElement("td").text(`${post.postUser}`);
  const program = newElement("td").text(post.program);
  const rating = newElement("td").html(
    '<i class="fa fa-star checked"></i>'.repeat(post.rating) +
      '<i class="fa fa-star"></i>'.repeat(5 - post.rating)
  );
  const approved = newElement("td").html(
    post.approved ? '<i class="fas fa-check"></i>' : ""
  );
  const createTime = newElement("td").text(
    new Date(parseInt(post.createTime) * 1000).toLocaleString()
  );
  const row = newElement("tr").append(
    postID,
    location,
    postUser,
    program,
    rating,
    approved,
    createTime
  );
  return row;
}

// Populate statistics on the stats page
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
    hideElement("stats-status");

    for (const item in stats) {
      const statsLabel = newElement("div").addClass("stats-label").text(item);
      const statsValue = newElement("div")
        .addClass("stats-value")
        .text(stats[item].value);
      if (stats[item].id) {
        const newItemLink = newElement("a")
          .attr({ href: `#${stats[item].id}` })
          .append(statsLabel, statsValue);
        const newItemDiv = newElement("div").append(newItemLink);
        appendTo("stats", newItemDiv);
      } else {
        const newItemDiv = newElement("div").append(statsLabel, statsValue);
        appendTo("stats", newItemDiv);
      }
    }
  }
}

// Populate users on the stats page
async function populateUsers() {
  const usersURL = "/api/getUsers";
  let users = null;

  try {
    users = await fetchJSON(usersURL);
  } catch (err) {
    showError("Failed to update users");
  }

  if (users) {
    hideError();
    hideElement("users-status");
    clearElement("site-users");

    for (const user of users) {
      const newItem = createUserRow(user);
      appendTo("site-users", newItem);
    }
  }
}

// Populate posts on the stats page
async function populatePosts() {
  const postsURL = "/api/getPosts";
  let posts = null;

  try {
    posts = await fetchJSON(postsURL);
  } catch (err) {
    showError("Failed to update posts");
  }

  if (posts) {
    hideError();
    hideElement("posts-status");
    clearElement("site-posts");

    for (const post of posts) {
      const newItem = createPostRow(post);
      appendTo("site-posts", newItem);
    }
  }
}

// Refresh stats
function refreshStats() {
  updateNotifications();
  clearElement("stats");
  clearElement("site-users");
  clearElement("site-posts");
  showElement("stats-status");
  showElement("users-status");
  showElement("posts-status");
  populateStats();
  populateUsers();
  populatePosts();
}

// On stats page load
function statsLoad() {
  updateNotifications();
  populateStats();
  populateUsers();
  populatePosts();

  setInterval(() => {
    updateNotifications();
    populateStats();
    populateUsers();
    populatePosts();
  }, statsTimeout);
}
