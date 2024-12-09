import React, { useState } from 'react';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';
import './GeneradorCongruencialMixto.css';

function LCG(seed, a, c, m) {
  let X = seed;
  return function () {
    X = (a * X + c) % m;
    return X;
  };
}

function GeneradorCongruencialMixto() {
  const [seed, setSeed] = useState('');
  const [a, setA] = useState('');
  const [c, setC] = useState('');
  const [m, setM] = useState('');
  const [numbers, setNumbers] = useState([]);
  const [periodLength, setPeriodLength] = useState(null);
  const [extendedTable, setExtendedTable] = useState([]);
  const [error, setError] = useState('');

  const generateNumbers = () => {
    if (seed === '' || a === '' || c === '' || m === '') {
      alert('Por favor, complete todos los campos antes de generar la secuencia.');
      return;
    }

    const numSeed = Number(seed);
    const numA = Number(a);
    const numC = Number(c);
    const numM = Number(m);

    // Validaciones para asegurarse de que los valores cumplen con las propiedades necesarias
    if (numM <= 0 || numA <= 0 || numC < 0 || numC >= numM || gcd(numA, numM) !== 1) {
      setError('Los valores ingresados no cumplen con las propiedades necesarias.');
      return;
    }

    setError(''); // Limpiar el mensaje de error

    const generator = LCG(numSeed, numA, numC, numM);
    const values = [];
    const tableData = [];
    const seen = new Set();
    let current = numSeed;
    let repeated = false;

    while (!repeated) {
      const aXn = numA * current;
      const next = generator();
      const aXnPlusC = aXn + numC;
      const Un = next / numM;

      tableData.push({
        n: values.length,
        Xn: current,
        aXn: aXn,
        aXnPlusC: aXnPlusC,
        XnPlus1: next,
        Un: Un.toFixed(4), // Limitar a 4 decimales
      });

      if (seen.has(next)) {
        repeated = true;
        break;
      }

      seen.add(next);
      values.push(next);
      current = next;
    }

    if (!repeated) {
      setError('Se alcanzó el límite de iteraciones sin repetir un valor de Xn.');
    }

    setNumbers(values);
    setPeriodLength(values.length);
    setExtendedTable(tableData);
  };

  const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));

  const chartData = {
    labels: numbers.map((_, index) => index),
    datasets: [
      {
        label: 'Secuencia de numeros generados',
        data: numbers,
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderWidth: 2,
      },
    ],
  };

  return (
    <div className="lcg-container">
      <div className="top-section">
        <div className="input-section-container">
          <h2>Datos de Entrada</h2>
          <div className="input-section">
            <div>
              <label>Semilla (X0):</label>
              <input
                type="number"
                value={seed}
                onChange={(e) => setSeed(e.target.value)}
                placeholder="Ingrese la semilla"
              />
            </div>
            <div>
              <label>Multiplicador (a):</label>
              <input
                type="number"
                value={a}
                onChange={(e) => setA(e.target.value)}
                placeholder="Ingrese el multiplicador"
              />
            </div>
            <div>
              <label>Constante aditiva (c):</label>
              <input
                type="number"
                value={c}
                onChange={(e) => setC(e.target.value)}
                placeholder="Ingrese la constante aditiva"
              />
            </div>
            <div>
              <label>Módulo (m):</label>
              <input
                type="number"
                value={m}
                onChange={(e) => setM(e.target.value)}
                placeholder="Ingrese el módulo"
              />
            </div>
          </div>
          <button onClick={generateNumbers} className="button">
            Generar numeros aleatorios
          </button>
        </div>

        <div className="results-section-container">
          <h2>Tabla de Resultados</h2>
          {error ? (
            <p className="error-message">{error}</p>
          ) : (
            numbers.length > 0 && (
              <div>
                <p>Longitud del período: {periodLength}</p>
                <table>
                  <thead>
                    <tr>
                      <th>n</th>
                      <th>Xn</th>
                      <th>a*Xn</th>
                      <th>a*Xn+c</th>
                      <th>Xn+1</th>
                      <th>Un</th>
                    </tr>
                  </thead>
                  <tbody>
                    {extendedTable.map((row, index) => (
                      <tr key={index}>
                        <td>{row.n}</td>
                        <td>{row.Xn}</td>
                        <td>{row.aXn}</td>
                        <td>{row.aXnPlusC}</td>
                        <td>{row.XnPlus1}</td>
                        <td>{row.Un}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}
        </div>
        <div className="chart-section">
          <h2>Gráfico</h2>
          {numbers.length > 0 && <Line data={chartData} />}
        </div>
      </div>
    </div>
  );
}

export default GeneradorCongruencialMixto;
