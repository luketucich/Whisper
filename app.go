package main

import (
	"context"
	"fmt"
	"whisper/backend"
)

type App struct {
	ctx context.Context
}

func NewApp() *App {
	return &App{}
}

func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

func (a *App) RegisterOrLogin(phone string) (*backend.AuthResult, error) {
	return backend.RegisterOrLogin(phone)
}

func (a *App) Send2FACode(phone string) error {
	err := backend.Send2FACode(phone)
	if err != nil {
		fmt.Println("Send2FACode error:", err)
		return fmt.Errorf("Send2FA failed: %v", err)
	}
	return nil
}

func (a *App) Check2FACode(phone, code string) (bool, error) {
	return backend.Check2FACode(phone, code)
}

func (a *App) UpdateUsername(userID, username string) error {
	return backend.UpdateUsername(userID, username)
}
