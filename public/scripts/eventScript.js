
function showCreateForm() {
    document.getElementById('eventForm').reset(); // Reset the form fields
    document.getElementById('form-title').textContent = 'Create Event';
    document.getElementById('eventForm').setAttribute('action', '/events');
    document.getElementById('eventId').value = '';
    document.getElementById('submitButton').style.display = 'inline-block';
    document.getElementById('updateButton').style.display = 'none';
    document.getElementById('event-form').style.opacity = 1;
    document.getElementById('event-form').style.display = 'block';
    document.getElementById('event-details').style.display = 'none';
    document.querySelector('.create-event').style.display = 'none'; // Hide the "Create Event" button
  }

  function cancelForm() {
    document.getElementById('event-form').style.opacity = 0;
    setTimeout(() => {
      document.getElementById('event-form').style.display = 'none';
      document.querySelector('.create-event').style.display = 'block'; // Show the "Create Event" button
    }, 300);
  }

  function confirmDeleteEvent(eventId) {
    if (confirm('Are you sure you want to delete this event?')) {
      deleteEvent(eventId);
    }
  }

  function deleteEvent(eventId) {
    fetch(`/events/${eventId}`, {
      method: 'DELETE',
    })
    .then(response => {
      if (response.ok) {
        document.getElementById(`event-${eventId}`).remove(); // Remove the event from the list
        hideEventDetails(); // Hide event details after deletion
        showMessage('Event deleted successfully.');
      } else {
        console.error('Failed to delete event.');
      }
    })
    .catch(error => console.error('Error:', error));
  }

  function showMessage(message) {
    const messageDiv = document.getElementById('successMessage');
    messageDiv.textContent = message;
    messageDiv.style.display = 'block';

    // Hide the message after 10 seconds
    setTimeout(() => {
      messageDiv.style.display = 'none';
    }, 5000);
  }

  function loadEventDetails(eventId) {
    fetch(`/events/${eventId}`)
      .then(response => response.json())
      .then(data => {
        const eventDetails = document.getElementById('event-details');
        eventDetails.innerHTML = `
          <h2>${data.e_title}</h2>
          <p><strong>Description:</strong> ${data.e_description}</p>
          <p><strong>Location:</strong> ${data.location}</p>
          <p><strong>Start Time:</strong> ${data.startTime}</p>
          <p><strong>Created At:</strong> ${data.created_at}</p>
          <p><strong>Created By:</strong> ${data.created_by_name}</p>
          <button onclick="editEvent('${eventId}')"  style="display:none;">Edit Event</button>
          <button onclick="confirmDeleteEvent('${eventId}')">Delete Event</button>
          <button onclick="cancelDetails()">Close</button>
        `;
        eventDetails.style.display = 'block';
        eventDetails.style.opacity = 1;
        document.getElementById('event-form').style.display = 'none';
      })
      .catch(error => console.error('Error loading event details:', error));
  }

  function editEvent(eventId) {
    fetch(`/events/${eventId}`)
      .then(response => response.json())
      .then(data => {
        document.getElementById('form-title').textContent = 'Edit Event';
        document.getElementById('eventForm').setAttribute('action', `/events/${eventId}?_method=PUT`);
        document.getElementById('eventId').value = eventId;
        document.getElementById('title').value = data.e_title;
        document.getElementById('description').value = data.e_description;
        document.getElementById('location').value = data.location;
        document.getElementById('startTime').value = data.startTime;
        // document.getElementById('createdBy').value = data.created_by_name;
        document.getElementById('submitButton').style.display = 'none';
        document.getElementById('updateButton').style.display = 'inline-block';
        document.getElementById('event-form').style.opacity = 1;
        document.getElementById('event-form').style.display = 'block';
        document.getElementById('event-details').style.display = 'none';
        document.querySelector('.create-event').style.display = 'none'; // Hide the "Create Event" button
      })
      .catch(error => console.error('Error editing event:', error));
  }

  function cancelDetails() {
    hideEventDetails();
  }

  function hideEventDetails() {
    document.getElementById('event-details').style.opacity = 0;
    setTimeout(() => {
      document.getElementById('event-details').style.display = 'none';
    }, 300);
  }

  function hideCreateEventButton() {
    document.querySelector('.create-event').style.display = 'none';
  }

  // Set userId to hidden input field
  const urlParams = new URLSearchParams(window.location.search);
  const userId = urlParams.get('id');
  document.getElementById('createdBy').value = userId;
