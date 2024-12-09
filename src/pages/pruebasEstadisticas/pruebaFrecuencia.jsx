import React, { useState } from "react";
import { Line } from "react-chartjs-2";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import "./PruebaFrecuencia.css";

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
   const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);

   const [cod] = useState(`
import org.apache.commons.math3.distribution.ChiSquaredDistribution;
import java.util.Scanner;

public class PruebaUniformidadFrecuencias {

    public static void main(String[] args) {
        try (Scanner sc = new Scanner(System.in)) {
            System.out.print("Ingrese el tamanio de la muestra (n): ");
            int n = sc.nextInt();
            double[] muestra = obtenerMuestraDesdeUsuario(sc, n);

            System.out.print("Ingrese el valor de nivel de significancia: ");
            double nivelSignificancia = sc.nextDouble();

            System.out.print("Ingrese el valor de K (numero de intervalos): ");
            int k = sc.nextInt();

            // Calcular frecuencias esperadas y observadas
            double[] esperados = calcularFrecuenciasEsperadas(n, k);
            int[] observados = calcularFrecuenciasObservadas(muestra, k);

            double estadistico = calcularEstadisticoFrecuencias(observados, esperados);
            double valorCritico = obtenerValorCriticoChiCuadrado(nivelSignificancia, k - 1);
            System.out.printf("Valor estadistico: %.4f%n", estadistico);
            System.out.printf("Valor critico (Chi-Cuadrado): %.4f%n", valorCritico);

            if (estadistico < valorCritico) {
                System.out.println("La muestra sigue una distribucion uniforme.");
            } else {
                System.out.println("La muestra NO sigue una distribucion uniforme.");
            }
        }
    }

    private static double[] obtenerMuestraDesdeUsuario(Scanner sc, int n) {
        double[] muestra = new double[n];
        System.out.println("Ingrese los valores de la muestra uno por uno:");
        for (int i = 0; i < n; i++) {
            muestra[i] = sc.nextDouble();
        }
        return muestra;
    }

    private static double[] calcularFrecuenciasEsperadas(int n, int k) {
        double frecuenciaEsperada = (double) n / k;
        double[] esperados = new double[k];
        for (int i = 0; i < k; i++) {
            esperados[i] = frecuenciaEsperada;
        }
        return esperados;
    }

    private static int[] calcularFrecuenciasObservadas(double[] muestra, int k) {
        int[] observados = new int[k];
        double intervalo = 1.0 / k;

        for (double valor : muestra) {
            int indice = Math.min((int) (valor / intervalo), k - 1);
            observados[indice]++;
        }
        return observados;
    }

    private static double calcularEstadisticoFrecuencias(int[] observados, double[] esperados) {
        double estadistico = 0;
        for (int i = 0; i < observados.length; i++) {
            double diferencia = observados[i] - esperados[i];
            estadistico += Math.pow(diferencia, 2) / esperados[i];
        }
        return estadistico;
    }

    private static double obtenerValorCriticoChiCuadrado(double alpha, int gradosLibertad) {
        ChiSquaredDistribution chiSquaredDist = new ChiSquaredDistribution(gradosLibertad);
        return chiSquaredDist.inverseCumulativeProbability(1 - alpha);
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
         {/* Gráfica siempre visible */}
         <div className="chart-container">
            <h4>Gráfica de Frecuencias</h4>
            {data ? <Line data={data} /> : <p>Aún no hay datos para la gráfica.</p>}
         </div>

         {/* Modal para el código */}
         <Modal open={isCodeModalOpen} onClose={() => setIsCodeModalOpen(false)}>
            <Box className="modal-box code-box">
               <h3>Código Java para Prueba de Frecuencias:</h3>
               <pre>{cod}</pre>
            </Box>
         </Modal>

         {/* Controles */}
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
      </div>
   );
}

export default PruebaFrecuencia;
