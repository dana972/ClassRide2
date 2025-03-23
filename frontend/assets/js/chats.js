const socket = io();
const currentUser = window.currentUser || {};
let activeChatUser = null;

// ✅ Join personal room on connection
socket.on("connect", () => {
  console.log("✅ Connected to Socket.IO server");
  if (currentUser.phone_number) {
    socket.emit("join", currentUser.phone_number);
    console.log("📲 Joined room:", currentUser.phone_number);
  }
});

// ✅ Receive real-time message
socket.on("privateMessage", ({ from, message }) => {
  const msg = document.createElement("p");
  msg.className = "chat-message received";
  msg.textContent = `${from}: ${message}`;

  // Main chat window
  const mainChat = document.getElementById("chatMessages");
  if (mainChat) {
    mainChat.appendChild(msg);
    mainChat.scrollTop = mainChat.scrollHeight;
  }

  // Modal overlay (owner side)
  const overlay = document.getElementById("chatOverlayMessages");
  if (overlay && window.activeOverlayChatUser === from) {
    overlay.appendChild(msg.cloneNode(true));
    overlay.scrollTop = overlay.scrollHeight;
  }
});

// ✅ Load chat history for selected contact
function loadChat(phone, name) {
  activeChatUser = phone;

  const header = document.getElementById("chatHeader");
  const messages = document.getElementById("chatMessages");
  if (header) header.textContent = `Chat with ${name}`;
  if (messages) messages.innerHTML = "";

  fetch(`/chats/${phone}`)
    .then(res => res.json())
    .then(data => {
      if (!Array.isArray(data)) return;

      data.forEach(msg => {
        const p = document.createElement("p");
        p.className = msg.sender_phone === currentUser.phone_number
          ? "chat-message sent"
          : "chat-message received";
        p.textContent = `${msg.sender_phone}: ${msg.message}`;
        messages.appendChild(p);
      });

      messages.scrollTop = messages.scrollHeight;
    })
    .catch(err => console.error("❌ Error fetching chat history:", err));
}

// ✅ Load chat history sidebar
function loadChatList() {
    const token = localStorage.getItem('token'); // Get JWT token
  
    if (!token) {
      console.error("No token found. User may not be authenticated.");
      return;
    }
  
    // Debug: print token to console
    console.log("JWT Token:", token);
  
    fetch('/chats/history', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json'
      }
    })
      .then(res => {
        if (!res.ok) {
          throw new Error("Failed to fetch chat history: " + res.status);
        }
        return res.json();
      })
      .then(data => {
        const list = document.getElementById("chatList");
        if (!list) return;
  
        list.innerHTML = ""; // Clear previous list
  
        if (Array.isArray(data)) {
          data.forEach((contact, index) => {
            const li = document.createElement("li");
            li.textContent = contact.name || contact.phone_number;
            li.classList.add("chat-contact");
            li.onclick = () => loadChat(contact.phone_number, contact.name || contact.phone_number);
            list.appendChild(li);
  
            // Auto-open first contact
            if (index === 0) {
              li.click();
            }
          });
        } else {
          console.warn("Unexpected response format:", data);
        }
      })
      .catch(err => {
        console.error("Error loading chat list:", err);
      });
  }
  
// ✅ Handle form submission to send messages
function setupChatForm() {
  const form = document.getElementById("chatForm");
  const input = document.getElementById("chatInput");
  const messages = document.getElementById("chatMessages");

  if (form && input && messages) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const message = input.value.trim();

      if (!message) {
        console.warn("⚠️ Cannot send: message is empty.");
        return;
      }
      if (!activeChatUser) {
        console.warn("⚠️ Cannot send: no chat selected (activeChatUser is null).");
        return;
      }

      socket.emit("privateMessage", {
        from: currentUser.phone_number,
        to: activeChatUser,
        message
      });

      const msg = document.createElement("p");
      msg.className = "chat-message sent";
      msg.textContent = `You: ${message}`;
      messages.appendChild(msg);
      messages.scrollTop = messages.scrollHeight;

      input.value = "";
    });
  }
}

// ✅ Init everything after DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  loadChatList();
  setupChatForm();
});

// ✅ Fix back button cache issue
window.addEventListener('pageshow', (event) => {
  if (event.persisted) {
    window.location.reload();
  }
});
