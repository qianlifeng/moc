package main

import (
	"encoding/json"
	"io/ioutil"
	"log"
	"net/http"
	"strings"
	"path/filepath"
)

//Catalog ...
type Catalog struct {
	Name     string
	Path     string
	IsDir    bool
	Suffix   string
	Children []Catalog
}

func main() {
	http.Handle("/", http.StripPrefix("/", http.FileServer(http.Dir("static"))))
	http.HandleFunc("/api/catalog", getCatalog)
	http.HandleFunc("/api/doc", getDoc)
	log.Fatal(http.ListenAndServe(":8081", nil))
}

func getCatalog(w http.ResponseWriter, r *http.Request) {
	catalog := getFiles("root", ".")
	json, _ := json.Marshal(catalog)
	w.Header().Set("Content-Type", "application/json")
	w.Write(json)
}

func getDoc(w http.ResponseWriter, r *http.Request) {
	r.ParseForm()
	path := r.Form["path"][0]
	dat, _ := ioutil.ReadFile(path)
	w.Write(dat)
}

func getFiles(name string, path string) Catalog {
	catalog := Catalog{}
	catalog.Name = name
	catalog.Path = path
	catalog.IsDir = true
	files, _ := ioutil.ReadDir(path)
	for _, f := range files {
		subCatalog := Catalog{}
		subCatalog.Name = strings.TrimSuffix(f.Name(), filepath.Ext(f.Name()))
		subCatalog.Path = path + "/" + f.Name()
		if f.IsDir() {
			subCatalog.IsDir = true
			subCatalogs := getFiles(subCatalog.Name, subCatalog.Path)
			catalog.Children = append(catalog.Children, subCatalogs)
		} else {
			if strings.HasSuffix(f.Name(), "md") {
				subCatalog.IsDir = false
				catalog.Children = append(catalog.Children, subCatalog)
			}
		}
	}

	return catalog
}

func checkCatalogHasFiles(catalog Catalog) bool {
	if !catalog.IsDir {
		return true
	} else {
		for _, c := range catalog.Children {
			checkCatalogHasFiles(c)
		}
	}

	return false
}
