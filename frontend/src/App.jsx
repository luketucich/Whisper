import { useState } from "react";
import "./App.css";
import AccountPanel from "./components/AccountPanel";
import AuthForm from "./components/AuthForm";
import ChatView from "./components/ChatView";
import Sidebar from "./components/Sidebar";

function App() {
  const [user, setUser] = useState(null);
  const [selectedChat, setSelectedChat] = useState(null);
  const [showAccount, setShowAccount] = useState(false);

  if (!user) return <AuthForm onLogin={setUser} />;

  return (
    <div className="app-layout">
      <Sidebar
        user={user}
        selectedChat={selectedChat}
        setSelectedChat={setSelectedChat}
        onAccountClick={() => setShowAccount(true)}
      />

      <div className="main-view">
        {showAccount ? (
          <AccountPanel user={user} onClose={() => setShowAccount(false)} />
        ) : (
          <ChatView selectedChat={selectedChat} user={user} />
        )}
      </div>
    </div>
  );
}

export default App;
