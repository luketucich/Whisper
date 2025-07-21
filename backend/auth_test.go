package backend

import (
	"testing"
)

func TestGenerateKeyPair(t *testing.T) {
	pub, priv, err := GenerateKeyPair()
	if err != nil {
		t.Fatalf("Failed to create key pair: %v", err)
	}

	if pub == "" || priv == "" {
		t.Fatal("Public or private key is empty")
	}

	t.Log("Public Key:", pub)
	t.Log("Private Key:", priv)
}

func TestGenerateUser(t *testing.T) {
	user, privKey, err := GenerateUser("5551234567")
	if err != nil {
		t.Fatalf("Failed to generate user: %v", err)
	}

	if user == nil {
		t.Fatal("Returned user is nil")
	}

	if user.PublicKey == "" {
		t.Error("User is missing a public key")
	}

	if privKey == "" {
		t.Error("Private key is empty")
	}

	t.Log("Generated User ID:", user.ID)
	t.Log("Phone:", user.Phone)
	t.Log("Public Key:", user.PublicKey)
	t.Log("Private Key:", privKey)
}

func TestRegisterOrLogin(t *testing.T) {
	// Init DB for test
	err := InitDatabase()
	if err != nil {
		t.Fatalf("Failed to init database: %v", err)
	}

	// Use a fake phone number
	phone := "+15551234567"

	// First call: should register user
	user, privateKey, err := RegisterOrLogin(phone)
	if err != nil {
		t.Fatalf("Register failed: %v", err)
	}
	if user == nil || privateKey == "" {
		t.Fatal("Expected new user and private key")
	}
	t.Logf("Registered user: %+v", user)

	// Second call: should log in user (no privateKey returned)
	user2, privateKey2, err := RegisterOrLogin(phone)
	if err != nil {
		t.Fatalf("Login failed: %v", err)
	}
	if user2 == nil || privateKey2 != "" {
		t.Fatal("Expected existing user and no private key")
	}
	t.Logf("Logged in user: %+v", user2)
}
