import React, { useState } from "react";
import { Line } from "react-chartjs-2";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import "./KolmogorovSmirnov.css"; // Archivo CSS personalizado

// Función para calcular la estadística KS
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

// Función para calcular la significancia KS
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
   const [isModalOpen, setIsModalOpen] = useState(false);
   const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);

   const [cod] = useState(`
# Código Python para la prueba de Kolmogorov-Smirnov

import numpy as np
from math import sqrt, exp

def ks_statistic(obs_one, obs_two):
    # Implementación de cálculo KS
    pass

def ks_significance(alam):
    # Implementación de significancia KS
    pass

def ks_test(obs_one, obs_two):
    # Implementación de prueba KS
    pass
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
      setIsModalOpen(true);
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
         <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
            <Box className="modal-box">
               <h3>Resultados de la Prueba</h3>
               <p>
                  Estadístico KS: <b>{resultados?.estadistico.toFixed(4)}</b>
               </p>
               <p>
                  Significancia KS: <b>{resultados?.significancia.toFixed(4)}</b>
               </p>
            </Box>
         </Modal>
         <Modal open={isCodeModalOpen} onClose={() => setIsCodeModalOpen(false)}>
            <Box className="modal-box">
               <h3>Código Python para Kolmogorov-Smirnov:</h3>
               <pre>{cod}</pre>
            </Box>
         </Modal>
         <h3>Prueba de Kolmogorov-Smirnov</h3>
         <div className="inputs-container">
            <label>
               Agregar número a Muestra 1:
               <input type="number" value={nuevoValorUno} onChange={(e) => setNuevoValorUno(e.target.value)} />
            </label>
            <button onClick={() => handleAgregarValor(setObsOne, nuevoValorUno)}>Agregar a Muestra 1</button>
            <label>
               Agregar número a Muestra 2:
               <input type="number" value={nuevoValorDos} onChange={(e) => setNuevoValorDos(e.target.value)} />
            </label>
            <button onClick={() => handleAgregarValor(setObsTwo, nuevoValorDos)}>Agregar a Muestra 2</button>
            <button onClick={handleCalcular}>Calcular</button>
            <button onClick={() => setIsCodeModalOpen(true)}>Ver Código Python</button>
         </div>
         <div className="muestra-container">
            <h4>Muestra 1:</h4>
            <p>{obsOne.length > 0 ? obsOne.join(", ") : "No se han agregado valores."}</p>
            <h4>Muestra 2:</h4>
            <p>{obsTwo.length > 0 ? obsTwo.join(", ") : "No se han agregado valores."}</p>
         </div>
         <div className="chart-container">
            <h4>Gráfica de CDF</h4>
            <Line data={data} />
         </div>
      </div>
   );
}

export default KolmogorovSmirnov;
