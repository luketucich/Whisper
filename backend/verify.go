package backend

import (
	"fmt"
	"os"

	"github.com/twilio/twilio-go"
	openapi "github.com/twilio/twilio-go/rest/verify/v2"
)

var (
	TWILIO_ACCOUNT_SID string
	TWILIO_AUTH_TOKEN  string
	VERIFY_SERVICE_SID string
	client             *twilio.RestClient
)

func InitTwilio() {
	TWILIO_ACCOUNT_SID = os.Getenv("TWILIO_ACCOUNT_SID")
	TWILIO_AUTH_TOKEN = os.Getenv("TWILIO_AUTH_TOKEN")
	VERIFY_SERVICE_SID = os.Getenv("VERIFY_SERVICE_SID")

	client = twilio.NewRestClientWithParams(twilio.ClientParams{
		Username: TWILIO_ACCOUNT_SID,
		Password: TWILIO_AUTH_TOKEN,
	})
}

func Send2FACode(phone string) error {
	params := &openapi.CreateVerificationParams{}
	params.SetTo(phone)
	params.SetChannel("sms")

	_, err := client.VerifyV2.CreateVerification(VERIFY_SERVICE_SID, params)
	if err != nil {
		return fmt.Errorf("failed to send verification code: %w", err)
	}
	return nil
}

func Check2FACode(phone, code string) (bool, error) {
	params := &openapi.CreateVerificationCheckParams{}
	params.SetTo(phone)
	params.SetCode(code)

	resp, err := client.VerifyV2.CreateVerificationCheck(VERIFY_SERVICE_SID, params)
	if err != nil {
		return false, fmt.Errorf("failed to check verification code: %w", err)
	}

	return *resp.Status == "approved", nil
}
