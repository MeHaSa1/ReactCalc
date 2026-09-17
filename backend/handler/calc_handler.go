package handler

import (
	"calculator-app/service"
	"encoding/json"
	"net/http"
)

type CalculationRequest struct {
	A float64 `json:"a"`
	B float64 `json:"b,omitempty"`
}

type CalculationResponse struct {
	Result float64 `json:"result,omitempty"`
	Error  string  `json:"error,omitempty"`
}

type CalcHandler struct {
	service *service.CalcService
}

func NewCalcHandler(s *service.CalcService) *CalcHandler {
	return &CalcHandler{service: s}
}

func (h *CalcHandler) Calculate(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	op := r.PathValue("op")

	var req CalculationRequest
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(CalculationResponse{Error: "JSON couldn't be read!"})
		return
	}

	var result float64

	switch op {
	case "add":
		result = h.service.Add(req.A, req.B)
	case "sub":
		result = h.service.Subtract(req.A, req.B)
	case "mul":
		result = h.service.Multiply(req.A, req.B)
	case "div":
		if req.B == 0 {
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(CalculationResponse{Error: "Can't divide by zero!"})
			return
		}
		result = h.service.Divide(req.A, req.B)
	case "exp":
		result = h.service.Exponentiate(req.A, req.B)
	case "sqr":
		result = h.service.SquareRoot(req.A)
	case "per":
		result = h.service.Divide(req.A, 100)
	default:
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(CalculationResponse{Error: "Operation not found!"})
		return
	}
	response := CalculationResponse{
		Result: result,
	}
	json.NewEncoder(w).Encode(response)
}
