package main

import (
	"calculator-app/handler"
	"calculator-app/service"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestMainRouter(t *testing.T) {
	svc := service.NewCalcService()
	hdl := handler.NewCalcHandler(svc)

	mux := http.NewServeMux()

	mux.HandleFunc("POST /calculate/{op}", hdl.Calculate)

	println("Server listening on port 8080...")

	if err := http.ListenAndServe(":8080", corsMiddleware(mux)); err != nil {
		fmt.Println("Server couldn't be started:", err)
	}

	tests := []struct {
		name           string
		a              float64
		b              float64
		path           string
		expectedResult float64
	}{
		{
			name:           "addition",
			a:              5,
			b:              10,
			path:           "/calculate/add",
			expectedResult: 15,
		},
		{
			name:           "subtraction",
			a:              15,
			b:              10,
			path:           "/calculate/sub",
			expectedResult: 5,
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			req := httptest.NewRequest("POST", tc.path, nil)

			rec := httptest.NewRecorder()

			mux.ServeHTTP(rec, req)

			var response handler.CalculationResponse
			json.NewDecoder(rec.Body).Decode(&response)
			if response.Result != tc.expectedResult {
				t.Errorf("Expected %.1f, found %.1f", tc.expectedResult, response.Result)
			}
		})
	}
}
