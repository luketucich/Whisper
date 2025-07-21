import { useState } from "react";
import "./App.css";
import AuthForm from "./components/AuthForm";

function App() {
  const [user, setUser] = useState(null);

  return (
    <div className="app-container">
      <h1>Whisper</h1>

      {!user ? (
        <AuthForm onLogin={setUser} />
      ) : (
        <div>
          <p>Welcome, user ID: {user.id}</p>
          {/* Add logout button or main app UI here */}
        </div>
      )}
    </div>
  );
}

export default App;
