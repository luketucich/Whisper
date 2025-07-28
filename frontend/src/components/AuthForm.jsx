import { LoaderCircle } from "lucide-react";
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
  const [step, setStep] = useState("phone"); // "phone" | "verify" | "username" | "privateKey" | "signature"
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [username, setUsername] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const [inputKey, setInputKey] = useState(""); // for manual entry
  const [verifying, setVerifying] = useState(false);
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
        setStep("signature");
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
        setMessage("Signature verification failed. Check your private key.");
        setVerifying(false);
        return;
      }

      localStorage.setItem("privateKey", inputKey);
      onLogin(user);
    } catch (err) {
      console.error("Challenge verification error:", err);
      setMessage("Verification error. Try again.");
      setVerifying(false);
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
    return (
      <div>
        {verifying ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "1rem",
            }}
          >
            <div className="message">Verifying your private key...</div>
            <LoaderCircle
              style={{
                width: "2rem",
                height: "2rem",
                animation: "spin 1s linear infinite",
              }}
            />
          </div>
        ) : (
          <div className="auth-form">
            <div className="prompt">Enter your private key:</div>
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
        )}
      </div>
    );
  }

  return null;
}

export default AuthForm;
