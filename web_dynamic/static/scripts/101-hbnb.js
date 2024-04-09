$(document).ready(() => {
  // appends checked amenities to h4 amenities popover (css)
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

      appendAmenity();
    });
  });

  function appendAmenity () {
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

  // appends checked states to h4 locations popover (css)
  const states = {};

  $(".locations .popover ul li h2 input[type='checkbox']").each(function () {
    $(this).on('click', function () {
      const id = $(this).attr('data-id');
      const name = $(this).attr('data-name');

      if ($(this).prop('checked')) {
        if (!(id in states)) {
          states[id] = name;
        }
      } else {
        delete states[id];
      }
      appendState();
    });
  });

  function appendState() {
    let state_ids = Object.keys(states);

    for (state_id of state_ids) {
      $('.locations .popover ul li h2 input[type="checkbox"][data-id]').change(function() {
        // Check if the state checkbox is checked
        const isChecked = $(this).prop('checked');
    
        // Find the <ul> element containing cities for the current state
        const $cityList = $(this).closest('li').find('ul');
    
        // Find the checkboxes for cities within the city list
        const $cityCheckboxes = $cityList.find('input[type="checkbox"]');
    
        // Iterate over each city checkbox
        $cityCheckboxes.each(function() {
          // Set the checked state of the city checkbox to match the state checkbox
          $(this).prop('checked', isChecked);

          const city_id = $(this).attr('data-id');
          const city_name = $(this).attr('data-name');
    
          if (isChecked) {
            if (!(city_id in cities)) {
              cities[city_id] = city_name;
            }
          } else {
            delete states[state_id];
            delete cities[city_id];
          }
          appendCity();
        });
      });  

      $(".locations .popover ul ul li input[type='checkbox']").each(function () {
        $(this).on('click', function () {
          const $parent_state = $(this).parents('li').parents('ul').prev('h2').find(`input[type="checkbox"]`);
          const state_id = $parent_state.attr('data-id');

          if ($parent_state.prop('checked')) {
            $parent_state.prop('checked', false);
            delete states[state_id];
          }
  
        });
      });     
    }
    return state_ids;
  }


  // appends checked cities to h4 locations popover (css)
  const cities = {};

  // listen for city checkboxes
  $(".locations .popover ul ul li input[type='checkbox']").each(function () {
    $(this).on('click', function () {
      const id = $(this).attr('data-id');
      const name = $(this).attr('data-name');

      if ($(this).prop('checked')) {
        if (!(id in cities)) {
          cities[id] = name;
        }
      } else {
        delete cities[id];
      }
      appendState();
      appendCity();

    });
  });
  
  // append checked cities to eh h4 element
  function appendCity () {
    const keys = Object.keys(cities);

    $('.locations h4').empty();
  
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      let value = cities[key];
  
      if (i < keys.length - 1) {
        value += ', ';
      }
      $('.locations h4').append(value);
    }
    return keys;
  }



  // check if API is active
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


  // Retrive Places from api either every place or only places related to data
  function postData (data) {
    $.post({
      url: 'http://127.0.0.1:5001/api/v1/places_search',
      contentType: 'application/json', // Specify the content type here
      data: JSON.stringify(data),
      contentType: 'application/json',
      success: function (response) {
        $('section.places').empty();
        for (place of response) {
          get_amenity_review(place).then(response => {
            $('section.places').append(response);
            $('.reviews ul').hide();
          });
        }

        // if no place was found
        if (response.length === 0) {
          $('section.places').append("<h1 style='color: blue;'>No Places with your specifications found, try changing amenities or cities</h1>");
        }
      },
      error: function (xhr, status, error) {
        // Handle error
        console.error('Error:', error);
      }
    });
  }
  // defaultly display every place
  postData({});

  // arrange html for places section
  async function get_amenity_review(place) {
    try {
      // get amenities related to the place
        const amenity_response = await $.get(`http://127.0.0.1:5001/api/v1/places/${place.id}/amenities`);
        const amenitiesHtml = await amenity_response.map(amenity => `<li>${amenity.name}</li>`).join('\n');

      // get the owner of the place
      const place_response = await $.get(`http://127.0.0.1:5001/api/v1/places/${place.id}`);
      const place_owner_id = place_response['user_id'];
      const place_user = await $.get(`http://127.0.0.1:5001/api/v1/users/${place_owner_id}`);
      const place_owner_name = place_user['first_name'] + " " + place_user['last_name'];

      // get the reviews for that place
      const review_response = await $.get(`http://127.0.0.1:5001/api/v1/places/${place.id}/reviews`);
      const count = review_response.length;

      let reviewsHtml = "";
      //get name of the reviewer and ensure there are reviews first
      if (review_response.length > 0) {
        const user_id = review_response[0]['user_id'];
        const user = await $.get(`http://127.0.0.1:5001/api/v1/users/${user_id}`);
        const username = user.first_name;
          
        reviewsHtml = await review_response.map(review => 
          `<ul>
            <li><h3>From ${username}, Date: ${review.updated_at.split("T")[0]}</h3></li>
            <li><p>${review.text}</p></li>
          </ul>`).join('\n');
      }
      // construct the dynamic html
      html = await `<article>
              <div class="title_box">
                <h2>${place.name}</h2>
                <div class="price_by_night">$${place.price_by_night}</div>
              </div>
              <div class="information">
                <div class="max_guest">${place.max_guest} ${place.max_guest > 1 ? 'Guests' : 'Guest'}</div>
                <div class="number_rooms">${place.number_rooms} Bedroom${place.number_rooms !== 1 ? 's' : ''}</div>
                <div class="number_bathrooms">${place.number_bathrooms} Bathroom${place.number_bathrooms !== 1 ? 's' : ''}</div>
              </div>
              <div class="user">
                  <b>Owner:</b> ${place_owner_name}
              </div>
              <div class="description">${place.description}</div>
              <div class="amenities">
                <h2>Amenities</h2>
                <ul>
                  ${amenitiesHtml}
                </ul>
                <div class="reviews">
                  <h2>${count} Review${count !== 1 ? 's' : ''}<span class="hide">show</span></h2>
                  ${count > 0 ? reviewsHtml : '<ul>No reviews yet</ul>'}
                </div> 
              </div>
              </article>`;

      return html;
    } catch (error) {
        console.error('Error fetching amenities:', error);
    }
  }


  // if search button is clicked
  $('button').on('click', async function fetchPlaces () {
    const ameniList = await appendAmenity();
    const stateList = await appendState();
    const cityList = await appendCity();
    const data_dict = await { 'amenities': ameniList, 'states': stateList, 'cities': cityList };
    console.log("\n\nstates: ", stateList, " \n   cities: ", cityList, "\n      amenities: ", ameniList);
    postData(data_dict);
  });

  // Show or hide reviews
  $('.places').on('click', '.reviews h2 span', function() {
    var $ul = $(this).parent('h2').siblings('ul'); // Find sibling ul elements
    if ($(this).hasClass('show')) {
        $(this).removeClass('show').addClass('hide').text('show');
        $ul.hide(); // Hide the ul elements
    } else {
        $(this).removeClass('hide').addClass('show').text('hide');
        $ul.show(); // Show the ul elements
    }
  });
});
