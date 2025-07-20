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
