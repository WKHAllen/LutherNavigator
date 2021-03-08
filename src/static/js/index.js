function basicSearch(event) {
  event.preventDefault();

  const query = $("#basic-search").val();
  window.location.href = `/query?search=${query}`;

  return false;
}
