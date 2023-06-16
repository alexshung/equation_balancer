import React, { useState, useEffect } from "react";
import "./App.css";
import variableImage from "./images/cube.png";
import constantImage from "./images/bag.png";
import scaleLeftImage from "./images/scale_left.png";
import scaleRightImage from "./images/scale_right.png";
import scaleBalanceImage from "./images/scale_balance.png";
import negVariableImage from "./images/neg_cube.png";
import negConstantImage from "./images/neg_bag.png";

function App() {
  const [leftSide, setLeftSide] = useState({
    variable: 0,
    constant: 0,
  });

  const [rightSide, setRightSide] = useState({
    variable: 0,
    constant: 0,
  });

  const [showAnswer, setShowAnswer] = useState(false);
  const [weightValues, setWeightValues] = useState({
    variable: 1,
    constant: 1,
  });

  const [equation, setEquation] = useState(""); // New state for the equation input
  useEffect(() => {
    const parseEquationString = (equationString) => {
      const terms = equationString.split(/(?=[+-])/).map((term) => term.trim());
      const parsedTerms = {};

      for (const term of terms) {
        const coefficientMatch = term.match(/^([+-]?\d+)/);
        const coefficient = coefficientMatch ? parseInt(coefficientMatch[0]) : term.includes("-") ? -1 : 1;
        
        const variableMatch = term.match(/[a-zA-Z]+/);
        const variable = variableMatch ? variableMatch[0] : "constant";

        parsedTerms[variable] = parsedTerms[variable] || 0;
        parsedTerms[variable] += coefficient;
      }
      return parsedTerms;
    };
    const getLeftAndRightTerms = (equationStringWhole) => {
      const equationSides = equationStringWhole.replace(/ /g, "").split("=");
      const terms = {};
      if (equationSides.length !== 2) {
        return terms;
      }
      terms["left"] = parseEquationString(equationSides[0]);
      terms["right"] = parseEquationString(equationSides[1]);
      return terms;
    };
    const terms = getLeftAndRightTerms(equation);
    if (!terms["left"] || !terms["right"]) {
      // Clear the counts if the equation format is invalid
      setLeftSide({
        variable: 0,
        constant: 0,
      });

      setRightSide({
        variable: 0,
        constant: 0,
      });
      return;
    }

    const a = terms["left"]["x"] || 0;
    const b = terms["left"]["constant"] || 0;
    const c = terms["right"]["x"] || 0;
    const d = terms["right"]["constant"] || 0;

    setLeftSide({
      variable: a,
      constant: b,
    });
    setRightSide({
      variable: c,
      constant: d,
    });

    // Solve the equation to determine the value of x
    const x = (d - b) / (a - c);

    // Set the weightValues of box to the solved value of x
    setWeightValues((prevWeightValues) => ({
      ...prevWeightValues,
      variable: x,
    }));
  }, [equation]);

  const calculateTotalWeight = (side) => {
    const weights = side === "left" ? leftSide : rightSide;
    return Object.entries(weights).reduce(
      (sum, [type, count]) => sum + weightValues[type] * count,
      0
    ).toFixed(10);
  };

  const handleIncrement = (side, type) => {
    const updatedSide = side === "left" ? { ...leftSide } : { ...rightSide };
    updatedSide[type]++;
    side === "left" ? setLeftSide(updatedSide) : setRightSide(updatedSide);
  };

  const handleDecrement = (side, type) => {
    const updatedSide = side === "left" ? { ...leftSide } : { ...rightSide };
    updatedSide[type]--;
    side === "left" ? setLeftSide(updatedSide) : setRightSide(updatedSide);
  };

  const toggleShowAnswer = () => {
    setShowAnswer(!showAnswer);
  };
  const balanceState =
    calculateTotalWeight("left") === calculateTotalWeight("right")
      ? "balanced"
      : calculateTotalWeight("left") > calculateTotalWeight("right")
      ? "left_imbalanced"
      : "right_imbalanced";

  const handleWeightChange = (e, type) => {
    const updatedWeight = parseInt(e.target.value);
    if (!isNaN(updatedWeight)) {
      setWeightValues((prevWeightValues) => ({
        ...prevWeightValues,
        [type]: updatedWeight,
      }));
    }
  };

  const renderWeightImages = (side, type, count) => {
    const images = [];
    let isPos = true;
    if (count < 0) {
      count *= -1;
      isPos = false;
    }
    for (let i = 0; i < count; i++) {
      images.push(
        <img
          key={`${side}-${type}-${i}`}
          src={
            type === "variable"
              ? (isPos ? variableImage : negVariableImage)
              : (isPos ? constantImage : negConstantImage)
          }
          alt={type}
        />
      );
    }

    return images;
  };

  const handleEquationChange = (e) => {
    const newEquation = e.target.value;
    setEquation(newEquation);
  };

  return (
    <div className="app">
      <div className="equation-input">
        <input
          type="text"
          value={equation}
          onChange={handleEquationChange}
          placeholder="Enter equation"
        />
      </div>
      <div className="balance">
        <div
          className={`side left ${
            balanceState === "left_imbalanced" ? "highlighted" : ""
          }`}
        >
          <h2>Left Side</h2>
          <div className="weights">
            {Object.entries(leftSide).map(([type, count]) => (
              <div className="weight" key={type}>
                <div className="controls">
                  <button onClick={() => handleDecrement("left", type)}>
                    -
                  </button>
                </div>
                <div>
                  {type}: {count}
                </div>
                <div className="controls">
                  <button onClick={() => handleIncrement("left", type)}>
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="scale-visualization">
          <div className="weight-row">
            {Object.entries(leftSide).map(([type, count]) => (
              <div className="weight-image">
                {renderWeightImages("left", type, count)}
              </div>
            ))}
          </div>
          <div className="scale-image">
            {balanceState === "balanced" && (
              <img src={scaleBalanceImage} alt="Balanced" />
            )}
            {balanceState === "left_imbalanced" && (
              <img src={scaleLeftImage} alt="Left Heavier" />
            )}
            {balanceState === "right_imbalanced" && (
              <img src={scaleRightImage} alt="Right Heavier" />
            )}
          </div>
          <div className="weight-row">
            {Object.entries(rightSide).map(([type, count]) => (
              <div className="weight-image">
                {renderWeightImages("right", type, count)}
              </div>
            ))}
          </div>
        </div>
        <div
          className={`side right ${
            balanceState === "right_imbalanced" ? "highlighted" : ""
          }`}
        >
          <h2>Right Side</h2>
          <div className="weights">
            {Object.entries(rightSide).map(([type, count]) => (
              <div className="weight" key={type}>
                <div className="controls">
                  <button onClick={() => handleDecrement("right", type)}>
                    -
                  </button>
                </div>
                <div>
                  {type}: {count}
                </div>
                <div className="controls">
                  <button onClick={() => handleIncrement("right", type)}>
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>{" "}
        </div>
      </div>
      <div className={`balance-status ${balanceState}`}>
        <h2>
          {balanceState === "balanced"
            ? "Balanced"
            : balanceState === "left_imbalanced"
            ? "Left Heavier"
            : "Right Heavier"}
        </h2>
      </div>
      <button className="toggle-button" onClick={toggleShowAnswer}>
        {showAnswer ? "Hide Answer" : "Show Answer"}
      </button>
      {showAnswer && (
        <div className="weight-values">
          {Object.entries(weightValues).filter(([type, weight]) => type !== 'constant').map(([type, weight]) => (
            <div className="weight" key={type}>
              <div>
                {type}:{" "}
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => handleWeightChange(e, type)}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
