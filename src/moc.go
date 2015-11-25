package main

import (
	"fmt"
	"html"
	"log"
	"net/http"
)

func main() {
	http.HandleFunc("/api", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintf(w, "Hello, %q", html.EscapeString(r.URL.Path))
	})

	fs := http.FileServer(http.Dir("static"))
	http.Handle("/", http.StripPrefix("/", fs))

	GetMarkdownFiles()
	log.Fatal(http.ListenAndServe(":8081", nil))
}
