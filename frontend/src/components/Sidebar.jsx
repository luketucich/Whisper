import { MessageSquarePlus } from "lucide-react";
import { useState } from "react";

function Sidebar({ user, selectedChat, setSelectedChat, onAccountClick }) {
  const [chats, setChats] = useState([]); // placeholder for now

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-title">Whisper</div>
      </div>

      <div className="chat-list">
        {chats.length === 0 && <div className="empty-state">No chats yet</div>}
        {chats.map((chat) => (
          <button
            key={chat.id}
            className={`chat-item ${
              selectedChat?.id === chat.id ? "active" : ""
            }`}
            onClick={() => setSelectedChat(chat)}
          >
            {chat.name || "Unnamed"}
          </button>
        ))}
      </div>

      <button className="new-chat-button">
        <MessageSquarePlus size={16} /> New Chat
      </button>
    </div>
  );
}

export default Sidebar;
