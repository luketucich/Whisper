package backend

import (
	"crypto/ed25519"
	"crypto/rand"
	"encoding/base64"
	"fmt"
	"regexp"

	"github.com/google/uuid"
)

var phoneRegex = regexp.MustCompile(`^\+\d{10,15}$`)

type User struct {
	ID        string `json:"id"`
	Username  string `json:"username"`
	Phone     string `json:"phone"`
	LastSeen  int64  `json:"lastSeen"`
	IsOnline  bool   `json:"isOnline"`
	PublicKey string `json:"publicKey"`
}

type AuthResult struct {
	User       *User  `json:"user"`
	PrivateKey string `json:"privateKey"`
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

func RegisterOrLogin(phone string) (*AuthResult, error) {

	if !phoneRegex.MatchString(phone) {
		return nil, fmt.Errorf("invalid phone number")
	}

	user, err := FindUserByPhone(phone)
	if err != nil {

		return nil, err
	}

	if user != nil {

		return &AuthResult{
			User:       user,
			PrivateKey: "",
		}, nil
	}

	newUser, privateKey, err := CreateUser(phone)
	if err != nil {

		return nil, err
	}

	return &AuthResult{
		User:       newUser,
		PrivateKey: privateKey,
	}, nil
}
