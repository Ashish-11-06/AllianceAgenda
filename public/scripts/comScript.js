
const urlParams = new URLSearchParams(window.location.search);
const userId = urlParams.get('id');
$("#userId").val(userId);  // Set userId to hidden input field

const firstName = urlParams.get('firstname');
const lastName = urlParams.get('lastname');
const userFullName = `${firstName} ${lastName}`;

document.getElementById('gg').textContent = userFullName;

const messagesDiv = $("#messages");
const messageForm = $("#message-form");
const messageInput = $("#message-input");

const socket = io("http://localhost:3000");

const scrollToBottom = () => {
    messagesDiv.scrollTop(messagesDiv[0].scrollHeight);
};

const adjustMessagesHeight = () => {
    const numMessages = messagesDiv.children().length;
    const baseHeight = 200;
    const heightPerMessage = 20;
    const maxDivHeight = 400;

    const newHeight = Math.min(baseHeight + numMessages * heightPerMessage, maxDivHeight);
    messagesDiv.css("height", `${newHeight}px`);
};

const sendMessage = () => {
    const message = messageInput.val().trim();
    const sender_id = $("#userId").val();

    if (sender_id && message) {
        // Emit the message to the server
        socket.emit("chat message", { sender_id, content: message });
    }
};

const convertToIST = (dateString) => {
    const date = new Date(dateString);
    const options = { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit" };
    return new Intl.DateTimeFormat("en-US", options).format(date);
};


socket.on("chat message", (data) => {
    const messageContainer = $("<div></div>").addClass(data.sender_id == userId ? 'sent' : 'received');
    const sentAtIST = convertToIST(data.sent_at);
    const usernameClass = `username-color-${data.sender_id % 6 + 1}`;

    const userIdDiv = $(`<div class="user-id">ID: ${data.sender_id}</div>`);
    const usernameDiv = $(`<div class="${usernameClass} username-class" id="username-id">${data.fullName}</div>`);
    const timeDiv = $(`<div class="time">${sentAtIST}</div>`);
    const contentDiv = $(`<div class="message-content">${data.content}</div>`);

    

    messageContainer.append(userIdDiv, usernameDiv, timeDiv, contentDiv);

    messagesDiv.append(messageContainer);
    scrollToBottom();
    adjustMessagesHeight();
});



const fetchOldMessages = () => {
    $.get('/messages', (data) => {
        data.forEach((message) => {
            const formattedTimestamp = convertToIST(message.sent_at);
            const messageContainer = $("<div></div>").addClass(message.sender_id == userId ? 'sent' : 'received');
            const usernameClass = `username-color-${message.sender_id % 4 + 1}`;

            const userIdDiv = $(`<div class="user-id">ID: ${message.sender_id}</div>`);
            const usernameDiv = $(`<div class="${usernameClass}">${message.fullName}</div>`);
            const timeDiv = $(`<div class="time">${formattedTimestamp}</div>`);
            const contentDiv = $(`<div class="message-content">${message.content}</div>`);

            messageContainer.append(userIdDiv, usernameDiv, timeDiv, contentDiv);

            messagesDiv.append(messageContainer);
        });

        adjustMessagesHeight();
        scrollToBottom();
    });
};



messageForm.on("submit", (e) => {
    e.preventDefault(); // Prevent form from submitting in the traditional way
    sendMessage();
    messageInput.val(''); // Clear the message input field after sending
});


$(document).ready(() => {
    fetchOldMessages();

    // Add event listener for form submission
    
});