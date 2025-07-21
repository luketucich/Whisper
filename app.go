package main

import (
	"context"
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

func (a *App) RegisterOrLogin(phone string) (*backend.User, error) {
	user, _, err := backend.RegisterOrLogin(phone)
	return user, err
}
