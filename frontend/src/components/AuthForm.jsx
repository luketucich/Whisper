import { Key, LoaderCircle, Phone, ShieldCheck, User } from "lucide-react";
import { useState } from "react";
import nacl from "tweetnacl";
import {
  GenerateChallenge,
  RegisterOrLogin,
  Send2FACode,
  UpdateUsername,
  VerifySignature,
} from "../../wailsjs/go/main/App";

const phoneRegex = /^\+\d{10,15}$/;

function AuthForm({ onLogin }) {
  const [step, setStep] = useState("phone");
  const [animating, setAnimating] = useState(false);

  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [username, setUsername] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const [inputKey, setInputKey] = useState("");

  const [verifying, setVerifying] = useState(false);
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState("");

  const transitionTo = (next) => {
    setAnimating(true);
    setTimeout(() => {
      setStep(next);
      setAnimating(false);
    }, 400);
  };

  const handlePhoneSubmit = async (e) => {
    e.preventDefault();
    if (!phoneRegex.test(phone)) {
      setMessage("Please enter a valid phone number.");
      return;
    }
    try {
      await Send2FACode(phone);
      transitionTo("verify");
    } catch {
      setMessage("Failed to send verification code.");
    }
  };

  const handleCodeSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await RegisterOrLogin(phone);
      setUser(result.user);
      if (result.privateKey) {
        setPrivateKey(result.privateKey);
        transitionTo("username");
      } else {
        transitionTo("signature");
      }
    } catch {
      setMessage("Verification failed.");
    }
  };

  const handleUsernameSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim()) {
      setMessage("Username is required.");
      return;
    }
    try {
      await UpdateUsername(user.id, username);
      setUser({ ...user, username });
      transitionTo("privateKey");
    } catch {
      setMessage("Failed to update username.");
    }
  };

  const handleVerifyKey = async () => {
    setVerifying(true);
    setMessage("");
    try {
      const challenge = await GenerateChallenge(user.id);
      const encoder = new TextEncoder();
      const messageBytes = encoder.encode(challenge);
      const keyBytes = Uint8Array.from(atob(inputKey), (c) => c.charCodeAt(0));
      const signatureBytes = nacl.sign.detached(messageBytes, keyBytes);
      const signature = btoa(String.fromCharCode(...signatureBytes));
      const verified = await VerifySignature(user.id, signature);
      if (!verified) {
        setMessage("Private key verification failed.");
        setVerifying(false);
        return;
      }
      localStorage.setItem("privateKey", inputKey);
      onLogin(user);
    } catch (err) {
      setMessage("Verification error. Please try again.");
      setVerifying(false);
    }
  };

  const formClass = `auth-form ${animating ? "fade-out" : "fade-in"}`;

  if (step === "phone") {
    return (
      <form className={formClass} onSubmit={handlePhoneSubmit}>
        <div className="prompt">
          <Phone size={16} style={{ marginRight: "0.5rem" }} />
          Enter your phone number
        </div>
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
      <form className={formClass} onSubmit={handleCodeSubmit}>
        <div className="prompt">
          <ShieldCheck size={16} style={{ marginRight: "0.5rem" }} />
          Enter the code sent to {phone}
        </div>
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
          onClick={() => transitionTo("phone")}
        >
          Back
        </button>
        {message && <p className="message">{message}</p>}
      </form>
    );
  }

  if (step === "username") {
    return (
      <form className={formClass} onSubmit={handleUsernameSubmit}>
        <div className="prompt">
          <User size={16} style={{ marginRight: "0.5rem" }} />
          Choose a username
        </div>
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
      <div className={formClass}>
        <div className="prompt">
          <Key size={16} style={{ marginRight: "0.5rem" }} />
          Save your private key securely
        </div>
        <textarea
          readOnly
          className="phone-input"
          value={privateKey}
          rows={4}
        />
        <p className="message">
          You’ll need this key to access your account. Store it safely.
        </p>
        <button
          className="submit-button"
          onClick={() => {
            localStorage.setItem("privateKey", privateKey);
            onLogin(user);
          }}
        >
          Done
        </button>
      </div>
    );
  }

  if (step === "signature") {
    return verifying ? (
      <div className="auth-form fade-in">
        <div className="message">Verifying private key...</div>
        <LoaderCircle
          style={{
            width: "2rem",
            height: "2rem",
            animation: "spin 1s linear infinite",
            margin: "0 auto",
          }}
        />
      </div>
    ) : (
      <div className={formClass}>
        <div className="prompt">
          <Key size={16} style={{ marginRight: "0.5rem" }} />
          Enter your private key
        </div>
        <textarea
          className="phone-input"
          value={inputKey}
          onChange={(e) => setInputKey(e.target.value)}
          rows={4}
        />
        <button className="submit-button" onClick={handleVerifyKey}>
          Verify
        </button>
        {message && <p className="message">{message}</p>}
      </div>
    );
  }

  return null;
}

export default AuthForm;
