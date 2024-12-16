package sql

import (
	"database/sql"
	"fmt"
	"log"
	"net/url"
	"os"
	"path/filepath"

	_ "github.com/tursodatabase/libsql-client-go/libsql"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func InitDB() {
	db := GetDB()
	db.AutoMigrate(&Buy{})
	db.AutoMigrate(&Dividend{})
	db.AutoMigrate(&User{})
	db.AutoMigrate(&ExchangeRate{})
	db.AutoMigrate(&PortfolioHistoric{})
}

func GetDB() *gorm.DB {
	dburl, isPresent := os.LookupEnv("DATABASE_URL")
	if !isPresent {
		log.Fatal("DATABASE_URL environment not found")
	}

	parsedDbUrl, err := url.Parse(dburl)
	if err != nil {
		log.Fatal("Failed to parse DATABASE_URL")
	}

	var db *gorm.DB
	if parsedDbUrl.Scheme == "file" {
		path := fmt.Sprintf("%v/%v", parsedDbUrl.Host, parsedDbUrl.Path)
		dirPath := filepath.Dir(path)
		os.MkdirAll(dirPath, os.ModePerm)
		db, err = gorm.Open(sqlite.Open(path), &gorm.Config{})
		if err != nil {
			log.Fatal("failed to connect database")
		}
		return db
	}

	conn, err := sql.Open("libsql", parsedDbUrl.String())
	if err != nil {
		log.Fatalf("Error connecting to database: %v", err)
	}

	db, err = gorm.Open(sqlite.New(sqlite.Config{
		Conn: conn,
	}), &gorm.Config{})
	if err != nil {
		log.Fatalf("Error connecting to database: %v", err)
	}

	return db
}
