import React, { useState } from "react";
import { Line } from "react-chartjs-2";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import "./KolmogorovSmirnov.css";

function ksStatistic(obsOne, obsTwo) {
   const cdfOne = [...obsOne].sort((a, b) => a - b);
   const cdfTwo = [...obsTwo].sort((a, b) => a - b);

   let i = 0;
   let j = 0;
   let d = 0.0;
   let fn1 = 0.0;
   let fn2 = 0.0;

   while (i < cdfOne.length && j < cdfTwo.length) {
      const d1 = cdfOne[i];
      const d2 = cdfTwo[j];

      if (d1 <= d2) {
         i += 1;
         fn1 = i / cdfOne.length;
      }
      if (d2 <= d1) {
         j += 1;
         fn2 = j / cdfTwo.length;
      }

      const dist = Math.abs(fn2 - fn1);
      if (dist > d) {
         d = dist;
      }
   }

   return d;
}

function ksSignificance(alam) {
   const EPS1 = 0.001;
   const EPS2 = 1.0e-8;

   let fac = 2.0;
   let sum = 0.0;
   let term_bf = 0.0;

   const a2 = -2.0 * alam * alam;
   for (let j = 1; j < 100; j++) {
      const term = fac * Math.exp(a2 * j * j);
      sum += term;
      if (Math.abs(term) <= EPS1 * term_bf || Math.abs(term) <= EPS2 * sum) {
         return sum;
      }
      fac = -fac;
      term_bf = Math.abs(term);
   }

   return 1.0; // Falla en converger
}

function KolmogorovSmirnov() {
   const [obsOne, setObsOne] = useState([]);
   const [obsTwo, setObsTwo] = useState([]);
   const [nuevoValorUno, setNuevoValorUno] = useState("");
   const [nuevoValorDos, setNuevoValorDos] = useState("");
   const [resultados, setResultados] = useState(null);
   const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);

   const [cod] = useState(`
import numpy as np
from math import sqrt, exp

def ks_statistic(obs_one, obs_two):
    cdf_one = np.sort(obs_one)
    cdf_two = np.sort(obs_two)

    i = 0
    j = 0
    d = 0.0
    fn1 = 0.0
    fn2 = 0.0
    l1 = float(len(cdf_one))
    l2 = float(len(cdf_two))

    while (i < len(cdf_one) and j < len(cdf_two)):
        d1 = cdf_one[i]
        d2 = cdf_two[j]
        if d1 <= d2:
            i = i + 1
            fn1 = i/l1
        if d2 <= d1:
            j = j + 1
            fn2 = j/l2
        dist = abs(fn2 - fn1)
        if dist > d:
            d = dist

    return d

def ks_significance(alam):
    EPS1 = 0.001
    EPS2 = 1.0e-8

    fac = 2.0
    sum = 0.0
    term_bf = 0.0

    a2 = -2.0*alam*alam
    for j in range(1, 100):
        term = fac*exp(a2*j*j)
        sum = sum + term
        if abs(term) <= EPS1 * term_bf or abs(term) <= EPS2 * sum:
            return sum
        fac = -fac
        term_bf = abs(term)

    return 1.0 # failing to converge
    
"""
  from numerical recipies
"""
def ks_test(obs_one, obs_two):
    d = ks_statistic(obs_one, obs_two)
    l1 = len(obs_one)
    l2 = len(obs_two)

    en = sqrt(float(l1*l2)/(l1 + l2))
    return ks_significance(en + 0.12 + 0.11/en) # magic numbers
   `);

   const handleAgregarValor = (setObservaciones, nuevoValor) => {
      const valor = parseFloat(nuevoValor);
      if (!isNaN(valor)) {
         setObservaciones((prev) => [...prev, valor]);
      }
   };

   const handleCalcular = () => {
      if (obsOne.length === 0 || obsTwo.length === 0) {
         alert("Ambas muestras deben tener al menos un valor.");
         return;
      }

      const d = ksStatistic(obsOne, obsTwo);
      const en = Math.sqrt((obsOne.length * obsTwo.length) / (obsOne.length + obsTwo.length));
      const significancia = ksSignificance(en + 0.12 + 0.11 / en);

      setResultados({ estadistico: d, significancia });
   };

   const data = {
      labels: [...Array(Math.max(obsOne.length, obsTwo.length)).keys()],
      datasets: [
         {
            label: "CDF Muestra 1",
            data: [...obsOne].sort((a, b) => a - b),
            borderColor: "black",
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            tension: 0.1,
         },
         {
            label: "CDF Muestra 2",
            data: [...obsTwo].sort((a, b) => a - b),
            borderColor: "gray",
            backgroundColor: "rgba(128, 128, 128, 0.6)",
            tension: 0.1,
         },
      ],
   };

   return (
      <div className="kolmogorov-smirnov-container">
         {/* Gráfica siempre visible */}
         <div className="chart-container">
            <h4>Gráfica de CDF</h4>
            {obsOne.length > 0 || obsTwo.length > 0 ? <Line data={data} /> : <p>Aún no hay datos para mostrar la gráfica.</p>}
         </div>

         {/* Modal para el código */}
         <Modal open={isCodeModalOpen} onClose={() => setIsCodeModalOpen(false)}>
            <Box className="modal-box code-box">
               <h3>Código Python para Kolmogorov-Smirnov:</h3>
               <pre>{cod}</pre>
            </Box>
         </Modal>

         {/* Resultados */}
         <div className="resultados-container">
            <h3>Resultados de la Prueba</h3>
            {resultados ? (
               <>
                  <p>
                     Estadístico KS: <b>{resultados.estadistico.toFixed(4)}</b>
                  </p>
                  <p>
                     Significancia KS: <b>{resultados.significancia.toFixed(4)}</b>
                  </p>
               </>
            ) : (
               <p>Aún no se han calculado resultados.</p>
            )}
         </div>

         {/* Controles */}
         <div className="inputs-container">
            <div className="muestra-input">
               <label>
                  Agregar número a Muestra 1:
                  <input type="number" value={nuevoValorUno} onChange={(e) => setNuevoValorUno(e.target.value)} />
               </label>
               <button onClick={() => handleAgregarValor(setObsOne, nuevoValorUno)}>Agregar</button>
            </div>
            <div className="muestra-input">
               <label>
                  Agregar número a Muestra 2:
                  <input type="number" value={nuevoValorDos} onChange={(e) => setNuevoValorDos(e.target.value)} />
               </label>
               <button onClick={() => handleAgregarValor(setObsTwo, nuevoValorDos)}>Agregar</button>
            </div>
            <div className="button-group">
               <button onClick={handleCalcular}>Calcular</button>
               <button onClick={() => setIsCodeModalOpen(true)}>Ver Código Python</button>
            </div>
         </div>

         <div className="muestra-container">
            <h4>Muestra 1:</h4>
            <p>{obsOne.length > 0 ? obsOne.join(", ") : "No se han agregado valores."}</p>
            <h4>Muestra 2:</h4>
            <p>{obsTwo.length > 0 ? obsTwo.join(", ") : "No se han agregado valores."}</p>
         </div>
      </div>
   );
}

export default KolmogorovSmirnov;
