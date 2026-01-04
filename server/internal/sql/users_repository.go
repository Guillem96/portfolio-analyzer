package sql

import (
	"errors"
	"log/slog"

	"github.com/Guillem96/portfolio-analyzer-server/internal/domain"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type UsersRepository struct {
	db *gorm.DB
	l  *slog.Logger
}

func NewUsersRepository(db *gorm.DB, logger *slog.Logger) *UsersRepository {
	return &UsersRepository{db: db, l: logger}
}

func (r *UsersRepository) Create(user domain.User) (*domain.UserWithId, error) {
	id := uuid.New().String()

	preferredCurrency := domain.USD
	if user.PreferredCurrency != nil {
		preferredCurrency = *user.PreferredCurrency
	}

	dbUser := User{
		ID:                id,
		Email:             user.Email,
		Picture:           user.Picture,
		PreferredCurrency: preferredCurrency,
	}

	if err := r.db.Create(&dbUser).Error; err != nil {
		return nil, err
	}
	return &domain.UserWithId{
		Id:   id,
		User: user,
	}, nil
}

func (r *UsersRepository) FindByEmail(email string) (*domain.UserWithId, error) {
	dbUser := User{}
	if err := r.db.Where("email = ?", email).First(&dbUser).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &domain.UserWithId{
		Id: dbUser.ID,
		User: domain.User{
			Email:             dbUser.Email,
			Picture:           dbUser.Picture,
			PreferredCurrency: &dbUser.PreferredCurrency,
		},
	}, nil
}

func (r *UsersRepository) FindByID(id string) (*domain.UserWithId, error) {
	dbUser := User{}
	if err := r.db.Where("id = ?", id).First(&dbUser).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &domain.UserWithId{
		Id: dbUser.ID,
		User: domain.User{
			Email:             dbUser.Email,
			Picture:           dbUser.Picture,
			PreferredCurrency: &dbUser.PreferredCurrency,
		},
	}, nil
}

func (r *UsersRepository) UpdatePreferences(id string, preferredCurrency string) error {
	return r.db.Model(&User{}).Where("id = ?", id).Update("preferred_currency", preferredCurrency).Error
}
