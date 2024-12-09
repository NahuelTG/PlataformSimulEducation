import React, { useState } from "react";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import "./PruebaPoker.css"; // Archivo CSS personalizado

// Diccionario base para los tipos de manos
const DICCIONARIO_BASE = {
   TODOS_DIFERENTES: 0,
   PAR: 0,
   DOS_PARES: 0,
   TERCIA: 0,
   FULL: 0,
   POKER: 0,
   QUINTILLA: 0,
};

// Probabilidades predefinidas
const PROBABILIDADES = {
   TODOS_DIFERENTES: 0.3024,
   PAR: 0.504,
   DOS_PARES: 0.108,
   TERCIA: 0.072,
   FULL: 0.009,
   POKER: 0.0045,
   QUINTILLA: 0.0001,
};

// Función para calcular la frecuencia esperada
function calcularFrecuenciaEsperada(probabilidades, tamano) {
   const frecuenciasEsperadas = { ...DICCIONARIO_BASE };
   Object.keys(probabilidades).forEach((tipo) => {
      frecuenciasEsperadas[tipo] = tamano * probabilidades[tipo];
   });
   return frecuenciasEsperadas;
}

// Función para calcular el estadístico Chi-Cuadrado
function calcularChiCuadrado(frecuenciasEsperadas, frecuenciasObservadas) {
   return Object.keys(frecuenciasEsperadas).reduce((chiCuadrado, tipo) => {
      const esperada = frecuenciasEsperadas[tipo];
      const observada = frecuenciasObservadas[tipo];
      return chiCuadrado + Math.pow(observada - esperada, 2) / esperada;
   }, 0);
}

function PruebaPoker() {
   const [muestra, setMuestra] = useState([]);
   const [nuevoValor, setNuevoValor] = useState("");
   const [resultados, setResultados] = useState(null);
   const [isModalOpen, setIsModalOpen] = useState(false);
   const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);

   const [cod] = useState(`
# Código Python para Prueba de Póker

DICCIONARIO_BASE = {
    "TODOS_DIFERENTES": 0,
    "PAR": 0,
    "DOS_PARES": 0,
    "TERCIA": 0,
    "FULL": 0,
    "POKER": 0,
    "QUINTILLA": 0
}

# Implementación de las funciones
  `);

   const handleAgregarValor = () => {
      const valor = parseFloat(nuevoValor);
      if (!isNaN(valor)) {
         setMuestra([...muestra, valor]);
         setNuevoValor("");
      }
   };

   const handleCalcular = () => {
      if (muestra.length === 0) {
         alert("Debe agregar al menos un valor a la muestra.");
         return;
      }

      const frecuenciasObservadas = { ...DICCIONARIO_BASE };
      muestra.forEach((numero) => {
         const mano = determinarMano(numero);
         frecuenciasObservadas[mano]++;
      });

      const frecuenciasEsperadas = calcularFrecuenciaEsperada(PROBABILIDADES, muestra.length);

      const estadistico = calcularChiCuadrado(frecuenciasEsperadas, frecuenciasObservadas);

      setResultados({
         frecuenciasObservadas,
         frecuenciasEsperadas,
         estadistico,
      });

      setIsModalOpen(true);
   };

   const determinarMano = (numero) => {
      const digitos = ("" + numero).slice(2, 7).split("").sort();
      const conteos = digitos.reduce((acc, digito) => {
         acc[digito] = (acc[digito] || 0) + 1;
         return acc;
      }, {});

      const valores = Object.values(conteos);

      if (valores.includes(5)) return "QUINTILLA";
      if (valores.includes(4)) return "POKER";
      if (valores.includes(3) && valores.includes(2)) return "FULL";
      if (valores.includes(3)) return "TERCIA";
      if (valores.filter((v) => v === 2).length === 2) return "DOS_PARES";
      if (valores.includes(2)) return "PAR";
      return "TODOS_DIFERENTES";
   };

   return (
      <div className="prueba-poker-container">
         <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
            <Box className="modal-box">
               <h3>Resultados de la Prueba</h3>
               <p>
                  Estadístico Chi-Cuadrado: <b>{resultados?.estadistico.toFixed(4)}</b>
               </p>
               <p>Frecuencias Observadas:</p>
               <pre>{JSON.stringify(resultados?.frecuenciasObservadas, null, 2)}</pre>
               <p>Frecuencias Esperadas:</p>
               <pre>{JSON.stringify(resultados?.frecuenciasEsperadas, null, 2)}</pre>
            </Box>
         </Modal>
         <Modal open={isCodeModalOpen} onClose={() => setIsCodeModalOpen(false)}>
            <Box className="modal-box">
               <h3>Código Python para Prueba de Póker:</h3>
               <pre>{cod}</pre>
            </Box>
         </Modal>
         <h3>Prueba de Póker</h3>
         <div className="inputs-container">
            <label>
               Agregar número a la muestra:
               <input type="number" value={nuevoValor} onChange={(e) => setNuevoValor(e.target.value)} />
            </label>
            <div className="button-group">
               <button onClick={handleAgregarValor}>Agregar Valor</button>
               <button onClick={handleCalcular}>Calcular</button>
               <button onClick={() => setIsCodeModalOpen(true)}>Ver Código Python</button>
            </div>
         </div>
         <div className="muestra-container">
            <h4>Muestra:</h4>
            <p>{muestra.length > 0 ? muestra.join(", ") : "No se han agregado valores."}</p>
         </div>
      </div>
   );
}

export default PruebaPoker;
