
const urlParams = new URLSearchParams(window.location.search);
const userId = urlParams.get('id');
$("#userId").val(userId);  // Set userId to hidden input field

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
    const messageElement = $("<p></p>").addClass(data.sender_id == userId ? 'sent' : 'received');
    const sentAtIST = convertToIST(data.sent_at);
    const usernameClass = `username-color-${data.sender_id % 6 + 1}`;
    // const usernameId = "username-id";

    if (data.sender_id == userId) {
        messageElement.html(`${data.content} <br><span>${sentAtIST}</span>`);
    } else {
        messageElement.html(`<strong class="${usernameClass} username-class" id="username-id">${data.fullName} (${sentAtIST}):</strong> ${data.content}`);
    }
    
    messagesDiv.append(messageElement);
    scrollToBottom();
    adjustMessagesHeight();
});

messageForm.on("submit", (e) => {
    e.preventDefault();
    sendMessage();
    messageInput.val("");
});

const fetchOldMessages = () => {
    $.get('/messages', (data) => {
        data.forEach((message) => {
            const formattedTimestamp = convertToIST(message.sent_at);
            const messageElement = $("<p></p>").addClass(message.sender_id == userId ? 'sent' : 'received');
            const usernameClass = `username-color-${message.sender_id % 4 + 1}`;
            
            if (message.sender_id == userId) {
                messageElement.html(`${message.content} <br><span>${formattedTimestamp}</span>`);
            } else {
                messageElement.html(`<strong class="${usernameClass}">${message.fullName} (${formattedTimestamp}):</strong> ${message.content}`);
            }
            
            messagesDiv.append(messageElement);
        });

        adjustMessagesHeight();
        scrollToBottom();
    });
};

$(document).ready(() => {
    fetchOldMessages();
});