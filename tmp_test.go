package main

import (
	"fmt"
	"strings"
	"golang.org/x/net/html"
)

func main() {
	kode := "P01"
	nama := "Depresi Sedang"
	
	kodeEscaped := html.EscapeString(strings.TrimSpace(kode))
	namaEscaped := html.EscapeString(strings.TrimSpace(nama))
	
	fmt.Printf("Kode: '%s', Nama: '%s'\n", kodeEscaped, namaEscaped)
}
