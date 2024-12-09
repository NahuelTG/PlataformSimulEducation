import React, { useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import './GeneradorCongruencialMixto.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const GeneradorCongruencialMultiplicativo = () => {
  const [seed, setSeed] = useState('');
  const [multiplier, setMultiplier] = useState('');
  const [modulus, setModulus] = useState('');
  const [results, setResults] = useState([]);
  const [periodLength, setPeriodLength] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const handleGenerate = () => {
    const seedNum = parseInt(seed, 10);
    const multiplierNum = parseInt(multiplier, 10);
    const modulusNum = parseInt(modulus, 10);

    if (
      isNaN(seedNum) ||
      isNaN(multiplierNum) ||
      isNaN(modulusNum) ||
      modulusNum <= 0 ||
      gcd(multiplierNum, modulusNum) !== 1
    ) {
      setErrorMessage('Los valores ingresados no cumplen con las propiedades necesarias.');
      setResults([]);
      setPeriodLength(null);
      return;
    }

    setErrorMessage('');

    const values = [];
    const generated = new Set();
    let current = seedNum;
    let period = 0;
    let repeated = false;

    while (!repeated) {
      const next = (multiplierNum * current) % modulusNum;
      const un = next / modulusNum;

      values.push({
        iteration: period,
        xn: current,
        axn: multiplierNum * current,
        xn1: next,
        un: un.toFixed(4),
      });

      if (generated.has(next)) {
        repeated = true;
        setPeriodLength(period);
      } else {
        generated.add(next);
        current = next;
        period++;
      }
    }

    setResults(values);
  };

  const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));

  const chartData = {
    labels: results.map((r) => r.iteration),
    datasets: [
      {
        label: 'Secuencia de nuemros generados',
        data: results.map((r) => r.un),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
      },
    ],
  };

  const handleInputChange = (setter) => (e) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      setter(value); // Solo permite valores numéricos
    }
  };

  return (
    <div className="lcg-container">
      <div className="top-section">
        <div className="input-section-container">
          <h2>Datos de entrada</h2>
          <div className="input-section">
            <label>
              Semilla (x0):
              <input
                type="text"
                value={seed}
                onInput={handleInputChange(setSeed)}
                placeholder="Ingrese la semilla"
              />
            </label>
            <label>
              Multiplicador (a):
              <input
                type="text"
                value={multiplier}
                onInput={handleInputChange(setMultiplier)}
                placeholder="Ingrese el multiplicador"
              />
            </label>
            <label>
              Módulo (m):
              <input
                type="text"
                value={modulus}
                onInput={handleInputChange(setModulus)}
                placeholder="Ingrese el módulo"
              />
            </label>
            <button className="button" onClick={handleGenerate}>
              Generar nuemero aleatorios
            </button>
          </div>
        </div>

        <div className="results-section-container">
          <h2>Tabla de Resultados</h2>
          {errorMessage ? (
            <p className="error-message">{errorMessage}</p>
          ) : (
            results.length > 0 && (
              <>
                <h3>Longitud del período: {periodLength}</h3>
                <table>
                  <thead>
                    <tr>
                      <th>n</th>
                      <th>Xn</th>
                      <th>a * Xn</th>
                      <th>Xn+1</th>
                      <th>Un</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((r, index) => (
                      <tr key={index}>
                        <td>{r.iteration}</td>
                        <td>{r.xn}</td>
                        <td>{r.axn}</td>
                        <td>{r.xn1}</td>
                        <td>{r.un}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )
          )}
        </div>

        <div className="chart-section">
          <h2>Gráfico</h2>
          {results.length > 0 && <Line data={chartData} />}
        </div>
      </div>
    </div>
  );
};

export default GeneradorCongruencialMultiplicativo;
