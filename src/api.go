package main

import (
	"fmt"
	"io/ioutil"
)

//GetMarkdownFiles ss
func GetMarkdownFiles() {
	files, _ := ioutil.ReadDir("./")
	for _, f := range files {
		fmt.Println(f.Name())
	}
}
