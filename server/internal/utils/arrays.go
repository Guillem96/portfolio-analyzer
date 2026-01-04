package utils

func ArrayUnique[T comparable](input []T) []T {
	// Create a map to track seen elements
	keys := make(map[T]bool)
	list := []T{}

	for _, entry := range input {
		// If the value is not in the map, add it to the list and mark as seen
		if _, value := keys[entry]; !value {
			keys[entry] = true
			list = append(list, entry)
		}
	}
	return list
}
