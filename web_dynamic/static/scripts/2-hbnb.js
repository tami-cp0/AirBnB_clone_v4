$(document).ready(() => {
  const amenities = {};

  $(".amenities .popover ul li input[type='checkbox']").each(function () {
    $(this).on('click change', function () {
      const id = $(this).attr('data-id');
      const name = $(this).attr('data-name');

      if ($(this).prop('checked')) {
        if (!(id in amenities)) {
          amenities[id] = name;
        }
      } else {
        delete amenities[id];
      }

      appendName();
    });
  });

  function appendName () {
    const keys = Object.keys(amenities);

    $('.amenities h4').empty();

    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      let value = amenities[key];

      if (i < keys.length - 1) {
        value += ', ';
      }
      $('.amenities h4').append(value);
    }
  }

  $.get('http://127.0.0.1:5001/api/v1/status/').done(function (response, statusText, xhr) {
    if (xhr.status === 200) {
      $('div#api_status').addClass('available');
    } else {
      $('div#api_status').removeClass('available');
    }
  })
    .fail(() => {
      $('div#api_status').removeClass('available');
    });
});
