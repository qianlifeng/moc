package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/codegangsta/cli"
)

var source string

//Catalog ...
type Catalog struct {
	Name     string
	Path     string
	IsDir    bool
	Suffix   string
	Children []Catalog
}

func main() {
	app := cli.NewApp()
	app.Name = "moc"
	app.Usage = "markdown doc page"
	app.Version = "0.1.0"
	app.Flags = []cli.Flag{
		cli.StringFlag{
			Name:  "port,p",
			Value: "8989",
			Usage: "server port for moc",
		},
		cli.StringFlag{
			Name:        "source,s",
			Value:       ".",
			Usage:       "source folder that moc will serve, default is moc running folder",
			Destination: &source,
		},
	}
	app.Action = func(c *cli.Context) {
		http.HandleFunc("/", getStaticFile)
		http.HandleFunc("/api/catalog", getCatalog)
		http.HandleFunc("/api/doc", getDoc)
		fmt.Println("started moc on port " + c.String("port") + "...")
		log.Fatal(http.ListenAndServe(":"+c.String("port"), nil))
	}

	app.Run(os.Args)
}

func getStaticFile(w http.ResponseWriter, r *http.Request) {
	url := r.URL.Path
	if url == "/" {
		url = "/index.html"
	}
	data, _ := Asset("static" + url)

	if strings.HasSuffix(url, ".css") {
		w.Header().Set("Content-Type", "text/css")
	}
	if strings.HasSuffix(url, ".html") {
		w.Header().Set("Content-Type", "text/html")
	}
	w.Write(data)
}

func getCatalog(w http.ResponseWriter, r *http.Request) {
	catalog := getFiles("root", source)
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
	}

	for _, c := range catalog.Children {
		checkCatalogHasFiles(c)
	}

	return false
}
