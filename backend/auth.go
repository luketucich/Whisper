package backend

import (
	"crypto/ed25519"
	"crypto/rand"
	"encoding/base64"

	"github.com/google/uuid"
)

type User struct {
	ID        string `json:"id"`
	Username  string `json:"username"`
	Phone     string `json:"phone"`
	LastSeen  int64  `json:"lastSeen"`
	IsOnline  bool   `json:"isOnline"`
	PublicKey string `json:"publicKey"`
}

func GenerateKeyPair() (string, string, error) {
	pub, priv, err := ed25519.GenerateKey(rand.Reader)

	if err != nil {
		return "", "", err
	}

	publicKey := base64.StdEncoding.EncodeToString(pub)
	privateKey := base64.StdEncoding.EncodeToString(priv)

	return publicKey, privateKey, nil
}

func GenerateUser(phone string) (*User, string, error) {
	publicKey, privateKey, err := GenerateKeyPair()
	if err != nil {
		return nil, "", err
	}

	user := &User{
		ID:        uuid.NewString(),
		Phone:     phone,
		PublicKey: publicKey,
	}

	return user, privateKey, nil
}
