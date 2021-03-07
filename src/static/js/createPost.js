// Set a rating
function setRating(ratingType, value) {
  $(`#${ratingType}Rating`).val(value);
  showStars(ratingType, value, true);
}

// Show a number of stars
function showStars(ratingType, value, checked) {
  const className = checked ? "checked" : "hover-checked";

  $(`#rating-${ratingType} span`).each(function () {
    const el = $(this)[0];
    const elValue = parseInt(el.id[el.id.length - 1]);

    $(this).removeClass("checked");
    $(this).removeClass("hover-checked");

    if (elValue <= value) {
      $(this).addClass(className);
    } else {
      $(this).removeClass(className);
    }
  });
}

// Clear a rating
function clearRating(ratingType) {
  $(`#${ratingType}Rating`).val("0");
  $(`#rating-${ratingType} span`).removeClass("checked");
}

$(document).ready(() => {
  // Replace the file input label with the file names
  $("#images").on("change", function () {
    let fileNames = [];

    for (const file of this.files) {
      fileNames.push(file.name.replace("C:\\fakepath\\", ""));
    }

    $(this).next(".custom-file-label").html(fileNames.join(", "));
  });

  // Show stars preview on mouse over
  $(".rating span").mouseenter(function () {
    const el = $(this)[0];
    const ratingType = el.id.substr(7, el.id.length - 9);
    const value = el.id[el.id.length - 1];
    showStars(ratingType, value, false);
  });

  // Hide stars preview on mouse leave
  $(".rating span").mouseleave(function () {
    const el = $(this)[0];
    const ratingType = el.id.substr(7, el.id.length - 9);
    const value = $(`#${ratingType}Rating`).val();
    showStars(ratingType, value, true);
  });

  // Set rating value on click
  $(".rating span").click(function () {
    const el = $(this)[0];
    const ratingType = el.id.substr(7, el.id.length - 9);
    const value = el.id[el.id.length - 1];
    setRating(ratingType, value);
  });
});
