package domain

import (
	"fmt"
	"strings"
	"time"
)

type Date time.Time

const ctLayout = "2006-01-02"

// UnmarshalJSON Parses the json string in the custom format
func (ct *Date) UnmarshalJSON(b []byte) (err error) {
	s := strings.Trim(string(b), `"`)
	nt, err := time.Parse(ctLayout, s)
	*ct = Date(nt)
	return
}

// MarshalJSON writes a quoted string in the custom format
func (ct Date) MarshalJSON() ([]byte, error) {
	return []byte(fmt.Sprintf(`"%s"`, ct.String())), nil
}

// String returns the time in the custom format
func (ct *Date) String() string {
	t := time.Time(*ct)
	return t.Format(ctLayout)
}

type DateWithTime time.Time

const ctLayoutWithTime = "2006-01-02T15:04:05"

// UnmarshalJSON Parses the json string in the custom format
func (ct *DateWithTime) UnmarshalJSON(b []byte) (err error) {
	s := strings.Trim(string(b), `"`)
	nt, err := time.Parse(ctLayoutWithTime, s)
	*ct = DateWithTime(nt)
	return
}

// MarshalJSON writes a quoted string in the custom format
func (ct DateWithTime) MarshalJSON() ([]byte, error) {
	return []byte(fmt.Sprintf(`"%s"`, ct.String())), nil
}

// String returns the time in the custom format
func (ct *DateWithTime) String() string {
	t := time.Time(*ct)
	return t.Format(ctLayoutWithTime)
}
