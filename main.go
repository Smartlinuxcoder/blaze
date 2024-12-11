package main

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"os"
	"os/exec"
	"strings"
)

func randomString(length int) (string, error) {
	bytes := make([]byte, length)

	_, err := rand.Read(bytes)
	if err != nil {
		return "", err
	}

	return hex.EncodeToString(bytes)[:length], nil
}
func main() {
	fileName := "main.blaze"

	// Check for command-line arguments
	if len(os.Args) > 1 {
		command := os.Args[1]
		if command == "run" || command == "build" {
			if len(os.Args) > 2 {
				fileName = os.Args[2] // If a file is provided, use it
			}
			switch command {
			case "run":
				//run(fileName)
			case "build":
				build(fileName)
			}
		} else {
			fmt.Println("Invalid command. Use 'run' or 'build'.")
		}
	} else {
		// Fallback
		build(fileName)
	}

}

func build(fileName string) {
	content, err := os.ReadFile(fileName)
	if err != nil {
		fmt.Printf("Error reading file %s: %v\n", fileName, err)
		return
	}
	filestrings := strings.Split(fileName, ".")
	sourceCode := string(content)
	transpiler := NewTranspiler(sourceCode)
	result := transpiler.Transpile()
	fmt.Println("Transpiled Go code:")
	fmt.Println(result)
	randomString, err := randomString(10)
	if err != nil {
		fmt.Println("Error generating random string:", err)
		return
	}
	computedname := filestrings[0] + randomString
	err = os.WriteFile(fmt.Sprintf("%s.go", computedname), []byte(result), 0644)
	if err != nil {
		fmt.Printf("Error writing file: %v\n", err)
	}
	cmd := exec.Command("go", "build", "-o", filestrings[0], fmt.Sprintf("%s.go", computedname))
	err = cmd.Run()
	if err != nil {
		fmt.Printf("Error building executable: %v\n", err)
	}
	err = os.Remove(fmt.Sprintf("%s.go", computedname))
	if err != nil {
		fmt.Printf("Error removing temporary file: %v\n", err)
	}
}
