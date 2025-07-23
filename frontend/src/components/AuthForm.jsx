import { useState } from "react";
import {
  RegisterOrLogin,
  Send2FACode,
  UpdateUsername,
} from "../../wailsjs/go/main/App";

const phoneRegex = /^\+\d{10,15}$/;

function AuthForm({ onLogin }) {
  const [step, setStep] = useState("phone"); // "phone" | "verify" | "username" | "privateKey"
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [username, setUsername] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState("");

  const handlePhoneSubmit = async (e) => {
    e.preventDefault();
    if (!phoneRegex.test(phone)) {
      setMessage("Invalid phone number. Use format: +12345678901");
      return;
    }
    try {
      await Send2FACode(phone);
      setStep("verify");
    } catch {
      setMessage("Failed to send verification code.");
    }
  };

  const handleCodeSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await RegisterOrLogin(phone);
      console.log("RegisterOrLogin result:", result);

      setUser(result.user);

      if (result.privateKey) {
        setPrivateKey(result.privateKey);
        setStep("username");
      } else {
        onLogin(result.user);
      }
    } catch {
      setMessage("Verification failed.");
    }
  };

  const handleUsernameSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim()) {
      setMessage("Username cannot be empty.");
      return;
    }
    try {
      await UpdateUsername(user.id, username);
      setUser({ ...user, username });
      setStep("privateKey");
    } catch {
      setMessage("Failed to set username.");
    }
  };

  if (step === "phone") {
    return (
      <form className="auth-form" onSubmit={handlePhoneSubmit}>
        <div className="prompt">Continue with your phone number:</div>
        <input
          className="phone-input"
          type="text"
          placeholder="+12345678901"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          maxLength={16}
          required
        />
        <button type="submit" className="submit-button">
          Continue
        </button>
        {message && <p className="message">{message}</p>}
      </form>
    );
  }

  if (step === "verify") {
    return (
      <form className="auth-form" onSubmit={handleCodeSubmit}>
        <div className="prompt">Enter the code sent to {phone}:</div>
        <input
          className="phone-input"
          type="text"
          placeholder="Verification code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          maxLength={10}
          required
        />
        <button type="submit" className="submit-button">
          Verify
        </button>
        <button
          type="button"
          className="submit-button"
          onClick={() => setStep("phone")}
        >
          Back
        </button>
        {message && <p className="message">{message}</p>}
      </form>
    );
  }

  if (step === "username") {
    return (
      <form className="auth-form" onSubmit={handleUsernameSubmit}>
        <div className="prompt">Choose a username:</div>
        <input
          className="phone-input"
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          maxLength={20}
          required
        />
        <button type="submit" className="submit-button">
          Continue
        </button>
        {message && <p className="message">{message}</p>}
      </form>
    );
  }

  if (step === "privateKey") {
    return (
      <div className="auth-form">
        <div className="prompt">Save your private key:</div>
        <textarea
          readOnly
          className="phone-input"
          value={privateKey}
          rows={4}
        />
        <p className="message">
          This key is required to access your account in the future. If lost,
          you will need to reset your account.
        </p>
        <button className="submit-button" onClick={() => onLogin(user)}>
          Done
        </button>
      </div>
    );
  }

  return null;
}

export default AuthForm;
