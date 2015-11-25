package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
)

//Catalog ...
type Catalog struct {
	Name     string
	Suffix   string
	Children []Catalog
}

func main() {
	http.Handle("/", http.StripPrefix("/", http.FileServer(http.Dir("static"))))
	http.HandleFunc("/api/catalog", getCatalog)
	log.Fatal(http.ListenAndServe(":8081", nil))
}

func getCatalog(w http.ResponseWriter, r *http.Request) {
	catalog := getFiles("./")
	json, _ := json.Marshal(catalog)
	w.Header().Set("Content-Type", "application/json")
	w.Write(json)
}

func getFiles(parent string) Catalog {
	catalog := Catalog{}
	catalog.Name = parent
	fmt.Println(parent)
	files, _ := ioutil.ReadDir(parent)
	for _, f := range files {
		subCatalog := Catalog{}
		subCatalog.Name = f.Name()
		if f.IsDir() {
			catalog.Children = append(catalog.Children, getFiles(f.Name()))
		} else {
			catalog.Children = append(catalog.Children, subCatalog)
		}
	}

	return catalog
}
