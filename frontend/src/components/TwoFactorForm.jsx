import { useState } from "react";
import { Check2FACode, RegisterOrLogin } from "../../wailsjs/go/main/App";

function TwoFactorForm({ phone, onBack, onLogin }) {
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");

  const handleVerify = async (e) => {
    e.preventDefault();

    try {
      const isValid = await Check2FACode(phone, code);
      if (!isValid) {
        setMessage("Incorrect code.");
        return;
      }

      const user = await RegisterOrLogin(phone);
      onLogin(user);
    } catch (err) {
      setMessage("Verification failed.");
    }
  };

  return (
    <form className="auth-form" onSubmit={handleVerify}>
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

      <button type="button" className="submit-button" onClick={onBack}>
        Back
      </button>

      {message && <p className="message">{message}</p>}
    </form>
  );
}

export default TwoFactorForm;
