package service

import (
	"math"
)

type CalcService struct{}

func NewCalcService() *CalcService {
	return &CalcService{}
}

func (s *CalcService) Add(a float64, b float64) float64 {
	return a + b
}

func (s *CalcService) Subtract(a float64, b float64) float64 {
	return a - b
}

func (s *CalcService) Multiply(a float64, b float64) float64 {
	return a * b
}

func (s *CalcService) Divide(a float64, b float64) float64 {
	return a / b
}

func (s *CalcService) Exponentiate(a float64, b float64) float64 {
	return math.Pow(a, b)
}

func (s *CalcService) SquareRoot(a float64) float64 {
	return math.Sqrt(a)
}
