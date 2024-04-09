$(document).ready(() => {
  const amenities = {};

  $(".amenities .popover ul li input[type='checkbox']").each(function () {
    $(this).on('click', function () {
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

    return keys;
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

  function postData (data) {
    $.post({
      url: 'http://127.0.0.1:5001/api/v1/places_search',
      contentType: 'application/json', // Specify the content type here
      data: JSON.stringify(data),
      contentType: 'application/json',
      success: function (response) {
        $('section.places').empty();
        for (place of response) {
          const html = `<article>
            <div class="title_box">
              <h2>${place.name}</h2>
              <div class="price_by_night">${place.price_by_night}</div>
            </div>
            <div class="information">
              <div class="max_guest">${place.max_guest} ${place.max_guest > 1 ? 'Guests' : 'Guest'}</div>
              <div class="number_rooms">${place.number_rooms} Bedroom${place.number_rooms !== 1 ? 's' : ''}</div>
              <div class="number_bathrooms">${place.number_bathrooms} Bathroom${place.number_bathrooms !== 1 ? 's' : ''}</div>
            </div>
            <div class="description">${place.description}</div>
          </article>`;

          $('section.places').append(html);
        }

        // if no place was found
        if (response.length === 0) {
          $('section.places').append("<h1 style='color: blue;'>Are you looking for Heaven?</h1>");
        }
      },
      error: function (xhr, status, error) {
        // Handle error
        console.error('Error:', error);
      }
    });
  }
  postData({});

  // if search is clicked
  $('button').on('click', async function fetchPlaces () {
    ameniList = await appendName();
    data_dict = await { amenities: ameniList };
    postData(data_dict);
  });
});
