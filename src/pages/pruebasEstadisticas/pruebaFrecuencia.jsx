import React, { useState } from "react";
import { Line } from "react-chartjs-2";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import "./PruebaFrecuencia.css"; // Archivo CSS personalizado

// Funciones para la Prueba de Frecuencias
function calcularFrecuenciasEsperadas(n, k) {
   const frecuenciaEsperada = n / k;
   return Array(k).fill(frecuenciaEsperada);
}

function calcularFrecuenciasObservadas(muestra, k) {
   const observados = Array(k).fill(0);
   const intervalo = 1.0 / k;

   muestra.forEach((valor) => {
      const indice = Math.min(Math.floor(valor / intervalo), k - 1);
      observados[indice]++;
   });

   return observados;
}

function calcularEstadisticoFrecuencias(observados, esperados) {
   return observados.reduce((acc, obs, i) => {
      const diferencia = obs - esperados[i];
      return acc + Math.pow(diferencia, 2) / esperados[i];
   }, 0);
}

function PruebaFrecuencia() {
   const [muestra, setMuestra] = useState([]);
   const [nuevoValor, setNuevoValor] = useState("");
   const [k, setK] = useState(5);
   const [nivelSignificancia, setNivelSignificancia] = useState(0.05);
   const [resultados, setResultados] = useState(null);
   const [isModalOpen, setIsModalOpen] = useState(false);
   const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);

   const [cod] = useState(`
// Código Java para Prueba de Frecuencias
import org.apache.commons.math3.distribution.ChiSquaredDistribution;

public class PruebaFrecuencia {
    public static void main(String[] args) {
        // Implementación de los cálculos
    }
}
  `);

   const handleAgregarValor = () => {
      const valor = parseFloat(nuevoValor);
      if (!isNaN(valor) && valor >= 0 && valor <= 1) {
         setMuestra([...muestra, valor]);
         setNuevoValor("");
      } else {
         alert("Por favor, ingresa un número entre 0 y 1.");
      }
   };

   const handleCalcular = () => {
      if (muestra.length === 0 || k <= 1) {
         alert("La muestra debe contener al menos un valor y k debe ser mayor a 1.");
         return;
      }

      const esperados = calcularFrecuenciasEsperadas(muestra.length, k);
      const observados = calcularFrecuenciasObservadas(muestra, k);
      const estadistico = calcularEstadisticoFrecuencias(observados, esperados);

      const gradosDeLibertad = k - 1;
      const valorCritico = 1 - nivelSignificancia; // Aproximación; usa librería estadística para más precisión

      setResultados({
         observados,
         esperados,
         estadistico,
         valorCritico,
         esUniforme: estadistico < valorCritico,
      });

      setIsModalOpen(true);
   };

   const data = resultados
      ? {
           labels: Array(k)
              .fill(0)
              .map((_, i) => `Intervalo ${i + 1}`),
           datasets: [
              {
                 label: "Frecuencias Observadas",
                 data: resultados.observados,
                 borderColor: "black",
                 backgroundColor: "rgba(0, 0, 0, 0.6)",
              },
              {
                 label: "Frecuencias Esperadas",
                 data: resultados.esperados,
                 borderColor: "gray",
                 backgroundColor: "rgba(128, 128, 128, 0.6)",
              },
           ],
        }
      : null;

   return (
      <div className="prueba-frecuencia-container">
         <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
            <Box className="modal-box">
               <h3>Resultados de la Prueba</h3>
               <p>
                  Estadístico: <b>{resultados?.estadistico.toFixed(4)}</b>
               </p>
               <p>
                  Valor Crítico: <b>{resultados?.valorCritico.toFixed(4)}</b>
               </p>
               <p>Resultado: {resultados?.esUniforme ? "Distribución Uniforme Verificada" : "Distribución No Uniforme"}</p>
            </Box>
         </Modal>
         <Modal open={isCodeModalOpen} onClose={() => setIsCodeModalOpen(false)}>
            <Box className="modal-box">
               <h3>Código Java para Prueba de Frecuencias:</h3>
               <pre>{cod}</pre>
            </Box>
         </Modal>
         <h3>Prueba de Frecuencias</h3>
         <div className="inputs-container">
            <label>
               Nivel de Significancia (α):
               <input
                  type="number"
                  step="0.01"
                  value={nivelSignificancia}
                  onChange={(e) => setNivelSignificancia(parseFloat(e.target.value))}
               />
            </label>
            <label>
               Número de Intervalos (k):
               <input type="number" value={k} onChange={(e) => setK(parseInt(e.target.value, 10))} />
            </label>
            <label>
               Agregar número a la muestra:
               <input type="number" value={nuevoValor} onChange={(e) => setNuevoValor(e.target.value)} />
            </label>
            <div className="button-group">
               <button onClick={handleAgregarValor}>Agregar Valor</button>
               <button onClick={handleCalcular}>Calcular</button>
               <button onClick={() => setIsCodeModalOpen(true)}>Ver Código Java</button>
            </div>
         </div>
         <div className="muestra-container">
            <h4>Muestra:</h4>
            <p>{muestra.length > 0 ? muestra.join(", ") : "No se han agregado valores."}</p>
         </div>
         {data && (
            <div className="chart-container">
               <h4>Gráfica de Frecuencias</h4>
               <Line data={data} />
            </div>
         )}
      </div>
   );
}

export default PruebaFrecuencia;
