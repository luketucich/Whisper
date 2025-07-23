package backend

import (
	"database/sql"

	_ "modernc.org/sqlite"
)

var DB *sql.DB

func InitDatabase() error {
	var err error

	DB, err = sql.Open("sqlite", "whisper.db")
	if err != nil {
		return err
	}

	return createTables()
}

func createTables() error {
	query := `
	CREATE TABLE IF NOT EXISTS users (
		id TEXT PRIMARY KEY,
		username TEXT,
		phone TEXT UNIQUE,
		public_key TEXT,
		last_seen INTEGER,
		is_online INTEGER
	);`

	_, err := DB.Exec(query)
	return err
}

func FindUserByPhone(phone string) (*User, error) {
	query := `
	SELECT id, username, phone, public_key, last_seen, is_online 
	FROM users 
	WHERE phone = ?
	`

	var user User
	err := DB.QueryRow(query, phone).Scan(
		&user.ID,
		&user.Username,
		&user.Phone,
		&user.PublicKey,
		&user.LastSeen,
		&user.IsOnline,
	)

	if err == sql.ErrNoRows {
		return nil, nil
	}

	if err != nil {
		return nil, err
	}

	return &user, nil
}

func CreateUser(phone string) (*User, string, error) {
	user, privateKey, err := GenerateUser(phone)

	if err != nil {
		return nil, "", err
	}

	query := `
	INSERT INTO users (id, username, phone, public_key, last_seen, is_online)
	VALUES (?, ?, ?, ?, ?, ?)
	`

	_, err = DB.Exec(query,
		user.ID,
		user.Username,
		user.Phone,
		user.PublicKey,
		user.LastSeen,
		user.IsOnline,
	)

	if err != nil {
		return nil, "", err
	}

	return user, privateKey, nil
}

func UpdateUsername(userID, username string) error {
	query := `
	UPDATE users
	SET username = ?
	WHERE id = ?
	`

	_, err := DB.Exec(query, username, userID)
	return err
}
