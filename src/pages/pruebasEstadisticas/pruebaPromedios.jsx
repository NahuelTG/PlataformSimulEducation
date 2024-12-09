import React, { useState } from "react";
import { Line } from "react-chartjs-2";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import "./PruebaPromedios.css"; // Archivo CSS personalizado

// Función para calcular la Prueba de Promedios
function calcularPruebaPromedios(valores, gradosDeLibertad) {
   const n = valores.length;
   if (n === 0) throw new Error("La muestra debe contener al menos un valor.");

   const suma = valores.reduce((acc, val) => acc + val, 0);
   const promedio = suma / n;

   const valorEstadistico = ((promedio - 0.5) * Math.sqrt(n)) / Math.sqrt(1.0 / 12.0);
   const valorCritico = (1 - gradosDeLibertad) / 2;

   return { promedio, valorEstadistico, valorCritico };
}

function PruebaPromedios() {
   const [valores, setValores] = useState([]);
   const [nuevoValor, setNuevoValor] = useState("");
   const [gradosDeLibertad, setGradosDeLibertad] = useState(0.05);
   const [resultados, setResultados] = useState(null);
   const [isModalOpen, setIsModalOpen] = useState(false);
   const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);

   const [cod] = useState(`
// Código Java para Prueba de Promedios
import org.apache.commons.math3.distribution.NormalDistribution;
import java.util.ArrayList;
import java.util.Scanner;

public class PruebaPromedios {
    public static void main(String[] args) {
        // Implementación de los cálculos
    }
}
  `);

   const handleAgregarValor = () => {
      const valor = parseFloat(nuevoValor);
      if (!isNaN(valor) && valor >= 0 && valor <= 1) {
         setValores([...valores, valor]);
         setNuevoValor("");
      } else {
         alert("Por favor, ingresa un número entre 0 y 1.");
      }
   };

   const handleCalcular = () => {
      if (valores.length === 0) {
         alert("La muestra debe contener al menos un valor.");
         return;
      }

      try {
         const resultado = calcularPruebaPromedios(valores, gradosDeLibertad);
         setResultados(resultado);
         setIsModalOpen(true);
      } catch (error) {
         alert(error.message);
      }
   };

   const data = {
      labels: valores.map((_, i) => `Valor ${i + 1}`),
      datasets: [
         {
            label: "Valores Ingresados",
            data: valores,
            fill: false,
            borderColor: "black",
            backgroundColor: "black",
            tension: 0.1,
         },
      ],
   };

   return (
      <div className="prueba-promedios-container">
         <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
            <Box className="modal-box">
               <h3>Resultados de la Prueba</h3>
               <p>
                  Promedio: <b>{resultados?.promedio.toFixed(4)}</b>
               </p>
               <p>
                  Valor Estadístico: <b>{resultados?.valorEstadistico.toFixed(4)}</b>
               </p>
               <p>
                  Valor Crítico: <b>{resultados?.valorCritico.toFixed(4)}</b>
               </p>
               <p>
                  Resultado:{" "}
                  {Math.abs(resultados?.valorEstadistico) < resultados?.valorCritico
                     ? "Distribución Uniforme Verificada"
                     : "Distribución No Uniforme"}
               </p>
            </Box>
         </Modal>
         <Modal open={isCodeModalOpen} onClose={() => setIsCodeModalOpen(false)}>
            <Box className="modal-box">
               <h3>Código Java para Prueba de Promedios:</h3>
               <pre>{cod}</pre>
            </Box>
         </Modal>
         <h3>Prueba de Promedios</h3>
         <div className="inputs-container">
            <label>
               Grado de Libertad (α):
               <input
                  type="number"
                  step="0.01"
                  value={gradosDeLibertad}
                  onChange={(e) => setGradosDeLibertad(parseFloat(e.target.value))}
               />
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
            <p>{valores.length > 0 ? valores.join(", ") : "No se han agregado valores."}</p>
         </div>
         <div className="chart-container">
            <h4>Gráfica de Valores</h4>
            <Line data={data} />
         </div>
      </div>
   );
}

export default PruebaPromedios;
