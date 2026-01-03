package sql

import (
	"database/sql/driver"
	"errors"
	"strings"
	"time"
)

// CSVDates is a custom type for a slice of time.Time objects
type CSVDates []time.Time

// Value converts []time.Time to a CSV string (ISO format) for the DB
func (c CSVDates) Value() (driver.Value, error) {
	if len(c) == 0 {
		return nil, nil
	}

	var dateStrings []string
	for _, t := range c {
		// RFC3339 is the standard ISO 8601 format
		dateStrings = append(dateStrings, t.Format(time.RFC3339))
	}

	return strings.Join(dateStrings, ","), nil
}

// Scan converts the DB string back into []time.Time
func (c *CSVDates) Scan(value interface{}) error {
	if value == nil {
		*c = nil
		return nil
	}

	s, ok := value.(string)
	if !ok {
		b, ok := value.([]byte)
		if !ok {
			return errors.New("failed to scan CSVDates: invalid type")
		}
		s = string(b)
	}

	if s == "" {
		*c = []time.Time{} // or nil
		return nil
	}

	parts := strings.Split(s, ",")
	var dates []time.Time

	for _, p := range parts {
		t, err := time.Parse(time.RFC3339, p)
		if err != nil {
			return err
		}
		dates = append(dates, t)
	}

	*c = dates
	return nil
}
