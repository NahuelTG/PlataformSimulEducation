import React, { useState } from "react";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import "./PruebaPoker.css";

const DICCIONARIO_BASE = {
   TODOS_DIFERENTES: 0,
   PAR: 0,
   DOS_PARES: 0,
   TERCIA: 0,
   FULL: 0,
   POKER: 0,
   QUINTILLA: 0,
};

const PROBABILIDADES = {
   TODOS_DIFERENTES: 0.3024,
   PAR: 0.504,
   DOS_PARES: 0.108,
   TERCIA: 0.072,
   FULL: 0.009,
   POKER: 0.0045,
   QUINTILLA: 0.0001,
};

function calcularFrecuenciaEsperada(probabilidades, tamano) {
   const frecuenciasEsperadas = { ...DICCIONARIO_BASE };
   Object.keys(probabilidades).forEach((tipo) => {
      frecuenciasEsperadas[tipo] = tamano * probabilidades[tipo];
   });
   return frecuenciasEsperadas;
}

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
   const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);

   const [cod] = useState(`
from operaciones import coeficiente_binomial
from operaciones.frecuencia import DICCIONARIO_BASE
from operaciones.mano import TipoMano


class Probabilidad:
    '''
    Clase para calcular la probabilidad de la mano (5 cartas) de un Póker
    '''
    def __init__(self) -> None:
        self._divisor: int = 10**5

    
    def _round(self, value: float) -> float:
        return float(f'{value:.5f}')


    def todos_diferentes(self) -> float:
        '''
        Calcular la probabilidad de sacar todas las carta diferentes.

        Returns
        -------
        float
            Probabilidad calculada.
        '''
        return self._round((10*9*8*7*6)/self._divisor)


    def un_par(self) -> float:
        '''
        Calcular la probabilidad de sacar 1 par.

        Returns
        -------
        float
            Probabilidad calculada.
        '''
        resultado: float = ((10*9*8*7*1)/self._divisor) * coeficiente_binomial(5, 2)
        return self._round(resultado)


    def dos_pares(self) -> float:
        '''
        Calcular la probabilidad de sacar 2 pares.

        Returns
        -------
        float
            Probabilidad calculada.
        '''
        resultado: float = (((10*9*8*1*1)/self._divisor) * coeficiente_binomial(5, 2) * coeficiente_binomial(3, 2)) * (1/2)
        return self._round(resultado)


    def tercia(self) -> float:
        '''
        Calcular la probabilidad de sacar 3 cartas iguales.

        Returns
        -------
        float
            Probabilidad calculada.
        '''
        resultado: float = ((10*9*8*1*1)/self._divisor) * coeficiente_binomial(5, 3)
        return self._round(resultado)

    
    def full(self) -> float:
        '''
        Calcular la probabilidad de sacar 3 (tercia) y 2 (par) cartas iguales.

        Returns
        -------
        float
            Probabilidad calculada.
        '''
        resultado: float = ((10*9*1*1*1)/self._divisor) * coeficiente_binomial(5, 3) * coeficiente_binomial(2, 2)
        return self._round(resultado)

    
    def poker(self) -> float:
        '''
        Calcular la probabilidad de sacar 4 cartas iguales.

        Returns
        -------
        float
            Probabilidad calculada.
        '''
        resultado: float = ((10*9*1*1*1)/self._divisor) * coeficiente_binomial(5, 4)
        return self._round(resultado)


    def quintilla(self) -> float:
        '''
        Calcular la probabilidad de sacar 5 cartas iguales.

        Returns
        -------
        float
            Probabilidad calculada.
        '''
        resultado: float = ((10*1*1*1*1)/self._divisor) * coeficiente_binomial(5, 5)
        return self._round(resultado)


    def obtener(self) -> dict:
        '''
        Devuelve un diccionario con las probabilidades.

        Returns
        -------
        dict
            Diccionario con las probabilidades calculadas.
        '''
        diccionario = DICCIONARIO_BASE.copy()
        
        diccionario[TipoMano.TODOS_DIFERENTES.name] = self.todos_diferentes()
        diccionario[TipoMano.PAR.name] = self.un_par()
        diccionario[TipoMano.DOS_PARES.name] = self.dos_pares()
        diccionario[TipoMano.TERCIA.name] = self.tercia()
        diccionario[TipoMano.FULL.name] = self.full()
        diccionario[TipoMano.POKER.name] = self.poker()
        diccionario[TipoMano.QUINTILLA.name] = self.quintilla()

        return diccionario
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
         {/* Resultados siempre visibles */}
         <div className="resultados-container">
            <h3>Resultados de la Prueba</h3>
            {resultados ? (
               <>
                  <p>
                     Estadístico Chi-Cuadrado: <b>{resultados.estadistico.toFixed(4)}</b>
                  </p>
                  <p>Frecuencias Observadas:</p>
                  <pre>{JSON.stringify(resultados.frecuenciasObservadas, null, 2)}</pre>
                  <p>Frecuencias Esperadas:</p>
                  <pre>{JSON.stringify(resultados.frecuenciasEsperadas, null, 2)}</pre>
               </>
            ) : (
               <p>Aún no se han calculado resultados.</p>
            )}
         </div>

         {/* Modal para el código */}
         <Modal open={isCodeModalOpen} onClose={() => setIsCodeModalOpen(false)}>
            <Box className="modal-box code-box">
               <h3>Código Python para Prueba de Póker:</h3>
               <pre>{cod}</pre>
            </Box>
         </Modal>

         {/* Controles */}
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
