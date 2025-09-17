import { Card, Typography, Button } from "sud-ui";
import WidgetCard from "./WidgetCard";
import { FaCalculator } from "react-icons/fa6";
import { useState } from "react";

export default function Calculator({ dragHandleProps }) {
  const [display, setDisplay] = useState("0");
  const [firstOperand, setFirstOperand] = useState(null);
  const [operator, setOperator] = useState(null);
  const [waitingForSecondOperand, setWaitingForSecondOperand] = useState(false);

  const inputDigit = (digit) => {
    if (waitingForSecondOperand) {
      setDisplay(String(digit));
      setWaitingForSecondOperand(false);
    } else {
      setDisplay(display === "0" ? String(digit) : display + digit);
    }
  };

  const inputDecimal = () => {
    if (waitingForSecondOperand) {
      setDisplay("0.");
      setWaitingForSecondOperand(false);
      return;
    }
    if (!display.includes(".")) {
      setDisplay(display + ".");
    }
  };

  const clearDisplay = () => {
    setDisplay("0");
    setFirstOperand(null);
    setOperator(null);
    setWaitingForSecondOperand(false);
  };

  const handleOperator = (nextOperator) => {
    const inputValue = parseFloat(display);

    if (firstOperand === null) {
      setFirstOperand(inputValue);
    } else if (operator) {
      const result = calculate(firstOperand, inputValue, operator);
      setDisplay(String(result));
      setFirstOperand(result);
    }

    setWaitingForSecondOperand(true);
    setOperator(nextOperator);
  };

  const calculate = (firstOperand, secondOperand, operator) => {
    switch (operator) {
      case "+":
        return firstOperand + secondOperand;
      case "-":
        return firstOperand - secondOperand;
      case "*":
        return firstOperand * secondOperand;
      case "/":
        return firstOperand / secondOperand;
      default:
        return secondOperand;
    }
  };

  const performCalculation = () => {
    if (!operator || firstOperand === null) return;

    const inputValue = parseFloat(display);
    const result = calculate(firstOperand, inputValue, operator);
    setDisplay(String(result));
    setFirstOperand(null);
    setOperator(null);
    setWaitingForSecondOperand(false);
  };

  const renderButton = (label, onClick, style = {}) => {
    return (
      <Button key={label} shadow="none" onClick={onClick} style={style}>
        {label}
      </Button>
    );
  };

  const btnList = [
    { label: "C", onClick: () => clearDisplay() },
    { label: "÷", onClick: () => handleOperator("/") },
    { label: "×", onClick: () => handleOperator("*") },
    { label: "-", onClick: () => handleOperator("-") },
    { label: "7", onClick: () => inputDigit(7) },
    { label: "8", onClick: () => inputDigit(8) },
    { label: "9", onClick: () => inputDigit(9) },
    { label: "+", onClick: () => handleOperator("+") },
    { label: "4", onClick: () => inputDigit(4) },
    { label: "5", onClick: () => inputDigit(5) },
    { label: "6", onClick: () => inputDigit(6) },
    {
      label: "=",
      onClick: () => performCalculation(),
      style: { gridRow: "span 2" }
    },
    { label: "1", onClick: () => inputDigit(1) },
    { label: "2", onClick: () => inputDigit(2) },
    { label: "3", onClick: () => inputDigit(3) },
    { label: ".", onClick: () => inputDecimal() },
    {
      label: "0",
      onClick: () => inputDigit(0),
      style: { gridColumn: "span 2" }
    }
  ];

  return (
    <WidgetCard
      icon={FaCalculator}
      title="계산기"
      dragHandleProps={dragHandleProps}
    >
      <div className="w-100 flex flex-col gap-10">
        <Card shadow="none" width="100%" className="mb-2">
          <Typography
            as="div"
            size="xl"
            pretendard="B"
            className="flex jus-end h-10 items-center px-2"
          >
            {display}
          </Typography>
        </Card>

        <div className="grid col-4 gap-10">
          {btnList.map((btn, index) =>
            renderButton(btn.label, btn.onClick, btn.style)
          )}
        </div>
      </div>
    </WidgetCard>
  );
}
