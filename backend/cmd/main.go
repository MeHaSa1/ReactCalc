package main

import (
	"calculator-app/handler"
	"calculator-app/service"
	"fmt"
	"net/http"
)

func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Set CORS headers
		w.Header().Set("Access-Control-Allow-Origin", "http://localhost:5173")
		w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		// Handle browser preflight OPTIONS request
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}

		// Proceed to the mux router
		next.ServeHTTP(w, r)
	})
}

func main() {
	svc := service.NewCalcService()
	hdl := handler.NewCalcHandler(svc)

	mux := http.NewServeMux()

	mux.HandleFunc("POST /calculate/{op}", hdl.Calculate)

	println("Server listening on port 8080...")

	if err := http.ListenAndServe(":8080", corsMiddleware(mux)); err != nil {
		fmt.Println("Server couldn't be started:", err)
	}
}
