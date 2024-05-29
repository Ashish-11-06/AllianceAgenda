
// Retrieve the user's name from the query parameters or any other source
const urlParams = new URLSearchParams(window.location.search);
const firstName = urlParams.get('firstname');
const lastName = urlParams.get('lastname');
const userId = urlParams.get('id')
const designation = urlParams.get('designation')

const queryParams = new URLSearchParams({
    firstname: firstName,
    lastname: lastName,
    id: userId,
    designation: designation
}).toString();

// Store the user's name in a global variable
const userFullName = `${firstName} ${lastName}`;
document.getElementById("Gallery").addEventListener("click", function () {
    window.location.href = `/Gallery?${queryParams}`;
});

document.getElementById("communication").addEventListener("click", function () {
    window.location.href = `/communication?${queryParams}`;
});

document.getElementById("events").addEventListener("click", function () {
    window.location.href = `/events?${queryParams}`;
});
// Display the username on the page
document.getElementById('username').textContent = firstName;

// Set the "created by" field with the user's full name
document.getElementById('createdBy').value = userId;

const toggleButton = document.getElementById('toggleAnnouncementSection');
const announcementSection = document.getElementById('announcementSection');


toggleButton.addEventListener('click', function () {
    if (announcementSection.style.display === 'none') {
        announcementSection.style.display = 'block';
        fetchAndDisplayAnnouncements();
    } else {
        announcementSection.style.display = 'none';
    }
});

document.getElementById('showTaskSection').addEventListener('click', function () {
    var taskSection = document.getElementById('taskSection');
    if (taskSection.style.display === 'none') {
        taskSection.style.display = 'block';
    } else {
        taskSection.style.display = 'none';
    }
});

const announcementsDiv = document.getElementById('announcements');
const addAnnouncementForm = document.getElementById('addAnnouncementForm');

// Function to fetch and display announcements
function fetchAndDisplayAnnouncements() {
    fetch('/fetch-announcements') // 
        .then(response => response.json())
        .then(announcements => {
            announcementsDiv.innerHTML = ''; // Clear existing announcements
            announcements.forEach(announcement => {
                const announcementElement = document.createElement('div');
                announcementElement.innerHTML = `
                 <div class="announcement-container">
                <h6 class="announcement-title">${announcement.title}</h6>
                <p class="announcement-content">${announcement.content}</p>
                <p class="announcement-created-by">Created by: ${announcement.firstName} ${announcement.lastName}</p>

                <p class="announcement-created-at">Created at: ${new Date(announcement.createdAt).toLocaleString()}</p>
                <button class="announcement-delete-button" onclick="deleteAnnouncement('${announcement.id}')">Delete</button>
                <hr class="announcement-separator" />
                </div>
                 `;
                announcementsDiv.appendChild(announcementElement);
            });
        })
        .catch(error => console.error('Error fetching announcements:', error));
}

// Function to handle form submission and add an announcement
addAnnouncementForm.addEventListener('submit', function (event) {
    event.preventDefault();

    if (designation !== 'HOD' && designation !== 'Director') {
        alert(`You are not authorized to add announcement ${designation}`);
        return;
    }

    const formData = new FormData(addAnnouncementForm);

    const newAnnouncement = {
        title: formData.get('title'),
        content: formData.get('content'),
        createdBy: userId
    };

    fetch('/add-announcement', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(newAnnouncement),
    })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
            addAnnouncementForm.reset();
            fetchAndDisplayAnnouncements(); // Refresh the list of announcements
        })
        .catch((error) => {
            console.error('Error:', error);
        });
});

// Function to delete an announcement
function deleteAnnouncement(id) {
    // Fetch the announcement details to check createdBy
    fetch(`/fetch-announcements/${id}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch announcement details');
            }
            return response.json();
        })
        .then(announcement => {
            const createdBy = announcement.createdBy;


            // Compare createdBy and userId to check authorization
            if (`${createdBy}` !== `${userId}`) {
                // User is not authorized to delete this announcement
                alert(`You are not authorized to delete this announcement, its not created by you!`);
                return;
            }

            // Delete the announcement
            fetch(`/delete-announcement/${id}`, {
                method: 'DELETE',
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Failed to delete announcement');
                    }

                })
                .then(data => {
                    console.log('Success:', data);
                    fetchAndDisplayAnnouncements(); // Refresh the list of announcements
                })
                .catch(error => {
                    console.error('Error:', error);
                });
        })
        .catch(error => {
            console.error('Error fetching or deleting announcement:', error);
        });
}


