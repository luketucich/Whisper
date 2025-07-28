function ChatView({ selectedChat, user }) {
  if (!selectedChat) {
    return (
      <div className="chat-placeholder">
        Select a conversation to start chatting.
      </div>
    );
  }

  return (
    <div className="chat-view">
      <div className="chat-header">
        <h2>{selectedChat.name || "Chat"}</h2>
      </div>
      <div className="chat-messages">{/* Message bubbles will go here */}</div>
      <div className="chat-input-area">
        <input
          type="text"
          className="chat-input"
          placeholder="Type a message..."
        />
        <button className="submit-button">Send</button>
      </div>
    </div>
  );
}

export default ChatView;
