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
