package backend

import (
	"crypto/ed25519"
	"crypto/rand"
	"encoding/base64"
	"fmt"
	"regexp"
	"sync"

	"github.com/google/uuid"
)

var phoneRegex = regexp.MustCompile(`^\+\d{10,15}$`)
var loginChallenges = make(map[string]string)
var loginChallengesMutex sync.Mutex

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

func GenerateChallenge(userID string) (string, error) {
	user, err := FindUserByID(userID)

	if err != nil {
		return "", fmt.Errorf("failed to find user: %w", err)
	}

	if user == nil {
		return "", fmt.Errorf("user not found")
	}

	challenge := uuid.NewString()

	loginChallengesMutex.Lock()
	defer loginChallengesMutex.Unlock()
	loginChallenges[userID] = challenge

	return challenge, nil
}

func VerifySignature(userID, signature string) (bool, error) {
	// Ensure user exists
	user, err := FindUserByID(userID)

	if err != nil {
		return false, fmt.Errorf("failed to find user: %w", err)
	}

	if user == nil {
		return false, fmt.Errorf("user not found")
	}

	// Ensure challenge exists
	loginChallengesMutex.Lock()
	defer loginChallengesMutex.Unlock()
	challenge := loginChallenges[userID]

	if challenge == "" {
		return false, fmt.Errorf("no challenge found for user")
	}

	// Decode and verify signature + public key
	decodedSignature, err := base64.StdEncoding.DecodeString(signature)

	if err != nil {
		return false, fmt.Errorf("failed to decode signature: %w", err)
	}

	decodedPublicKey, err := base64.StdEncoding.DecodeString(user.PublicKey)

	if err != nil {
		return false, fmt.Errorf("failed to decode public key: %w", err)
	}

	// Verify the signature
	valid := ed25519.Verify(decodedPublicKey, []byte(challenge), decodedSignature)

	if !valid {
		return false, fmt.Errorf("invalid signature")
	}

	delete(loginChallenges, userID)

	return true, nil
}
