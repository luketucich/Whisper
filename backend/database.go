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
