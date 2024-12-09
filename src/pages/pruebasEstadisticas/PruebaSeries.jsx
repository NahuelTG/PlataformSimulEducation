import React, { useState } from "react";
import { Line } from "react-chartjs-2";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import "./PruebaSeries.css"; // Archivo CSS personalizado

function calcularPruebaSeries(muestra, k, alpha) {
   const nPares = muestra.length - 1;
   const gradosDeLibertad = Math.pow(k, 2) - 1;

   const conteoSeries = Array.from({ length: k }, () => Array(k).fill(0));

   for (let i = 0; i < nPares; i++) {
      const primerDigito = Math.floor(muestra[i] * k);
      const segundoDigito = Math.floor(muestra[i + 1] * k);

      if (primerDigito >= 0 && primerDigito < k && segundoDigito >= 0 && segundoDigito < k) {
         conteoSeries[primerDigito][segundoDigito]++;
      } else {
         console.warn(`Valores fuera de rango: ${primerDigito}, ${segundoDigito}`);
      }
   }

   const frecuenciaEsperada = nPares / (k * k);
   let chiCuadrado = 0;

   for (let i = 0; i < k; i++) {
      for (let j = 0; j < k; j++) {
         const frecuenciaObservada = conteoSeries[i][j];
         chiCuadrado += Math.pow(frecuenciaObservada - frecuenciaEsperada, 2);
      }
   }
   chiCuadrado *= (k * k) / nPares;

   const valorCritico = 1.0 - alpha;

   return { chiCuadrado, gradosDeLibertad, valorCritico, conteoSeries };
}

function PruebaSeries() {
   const [muestra, setMuestra] = useState([]);
   const [nuevoNumero, setNuevoNumero] = useState("");
   const [k, setK] = useState(2);
   const [alpha, setAlpha] = useState(0.05);
   const [resultados, setResultados] = useState(null);
   const [isModalOpen, setIsModalOpen] = useState(false);
   const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);

   const [cod] = useState(`import java.util.Scanner;
import org.apache.commons.math3.distribution.ChiSquaredDistribution;

public class PruebaSeries {

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);

        System.out.print("Ingrese el tamanio de la muestra (n): ");
        int n = sc.nextInt();
        System.out.print("Ingrese el nivel de significancia (por ejemplo 0,05): ");
        double alpha = sc.nextDouble();

        int nPares = n - 1;

        int k = obtenerKDesdeUsuario();
        double[] muestra = obtenerMuestraDesdeUsuario(n);

        int gradosDeLibertad = (int) Math.pow(k, 2) - 1;
        realizarPruebaSeries(muestra, k, nPares, alpha, gradosDeLibertad);
        sc.close();
    }

    public static int obtenerKDesdeUsuario() {
        Scanner sc = new Scanner(System.in);
        System.out.print("Ingrese el valor de k (longitud de las series): ");
        return sc.nextInt();
    }

    public static double[] obtenerMuestraDesdeUsuario(int n) {
        Scanner sc = new Scanner(System.in);
        double[] muestra = new double[n];
        System.out.println("Ingrese los valores de la muestra uno por uno:");
        for (int i = 0; i < n; i++) {
            muestra[i] = sc.nextDouble();
        }
        return muestra;
    }

    public static void realizarPruebaSeries(double[] muestra, int k, int nPares, double alpha, int gradosDeLibertad) {
        int numSeries = (int) Math.pow(10, k);
        int[][] conteoSeries = new int[k][k];

        for (int i = 0; i < nPares; i++) {
            int primerDigito = (int) (muestra[i] * k);
            int segundoDigito = (int) (muestra[i + 1] * k);
            conteoSeries[primerDigito][segundoDigito]++;
        }

        // Frecuencia esperada
        double frecuenciaEsperada = (double) nPares / (k * k);

        // Calcular el estadístico chi-cuadrado usando la fórmula proporcionada
        double chiCuadrado = 0;
        for (int i = 0; i < k; i++) {
            for (int j = 0; j < k; j++) {
                double frecuenciaObservada = conteoSeries[i][j];
                chiCuadrado += Math.pow((frecuenciaEsperada - frecuenciaObservada), 2);
            }
        }
        chiCuadrado *= (double) k * k / (nPares);

        double valorCritico = obtenerValorCriticoChiCuadrado(alpha, gradosDeLibertad);
        System.out.printf("Valor estadistico: %.2f%n", chiCuadrado);
        System.out.printf("Valor critico (chi-cuadrado): %.2f%n", valorCritico);

        if (chiCuadrado < valorCritico) {
            System.out.println("Los elementos de la muestra verifican el principio de INDEPENDENCIA.");
        } else {
            System.out.println("Los elementos de la muestra NO verifican el principio de INDEPENDENCIA.");
        }
    }

    public static double obtenerValorCriticoChiCuadrado(double alpha, int gradosLibertad) {
        ChiSquaredDistribution chi2Dist = new ChiSquaredDistribution(gradosLibertad);
        return chi2Dist.inverseCumulativeProbability(1 - alpha);
    }
}

   `);

   const handleAgregarNumero = () => {
      const numero = parseFloat(nuevoNumero);
      if (!isNaN(numero) && numero >= 0 && numero <= 1) {
         setMuestra([...muestra, numero]);
         setNuevoNumero("");
      } else {
         alert("Por favor, ingresa un número entre 0 y 1.");
      }
   };

   const handleCalcular = () => {
      if (muestra.length < 2 || k <= 1) {
         alert("La muestra debe contener al menos dos valores y k debe ser mayor a 1.");
         return;
      }

      const resultado = calcularPruebaSeries(muestra, k, alpha);
      setResultados(resultado);
      setIsModalOpen(true);
   };

   const data = resultados
      ? {
           labels: resultados.conteoSeries.flatMap((_, index) => Array(k).fill(index)),
           datasets: resultados.conteoSeries.map((serie, i) => ({
              label: `Serie ${i}`,
              data: serie,
              fill: false,
              borderColor: `rgba(${(i * 50) % 255}, ${(i * 100) % 255}, ${(i * 150) % 255}, 1)`,
              tension: 0.1,
           })),
        }
      : null;

   return (
      <div className="prueba-series-container">
         {data ? (
            <div className="chart-container">
               <h4>Gráfica de Series</h4>
               <Line data={data} />
            </div>
         ) : (
            <div className="chart-placeholder">
               <h4>Gráfica de Series</h4>
               <p>Agrega datos para visualizar la gráfica.</p>
            </div>
         )}

         <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
            <Box className="modal-box">
               <h3>Resultados de la Prueba</h3>
               <p>
                  Estadístico Chi-Cuadrado: <b>{resultados?.chiCuadrado.toFixed(4)}</b>
               </p>
               <p>
                  Grados de Libertad: <b>{resultados?.gradosDeLibertad}</b>
               </p>
               <p>
                  Resultado:{" "}
                  {resultados?.chiCuadrado < resultados?.valorCritico ? "Independencia Verificada" : "Independencia No Verificada"}
               </p>
            </Box>
         </Modal>

         <Modal open={isCodeModalOpen} onClose={() => setIsCodeModalOpen(false)}>
            <Box className="modal-box code-box">
               <h3>Código Java para Prueba de Series:</h3>
               <pre>{cod}</pre>
            </Box>
         </Modal>

         <div className="inputs-container">
            <label>
               Nivel de Significancia (α):
               <input type="number" step="0.01" value={alpha} onChange={(e) => setAlpha(parseFloat(e.target.value))} />
            </label>
            <label>
               Longitud de las series (k):
               <input type="number" value={k} onChange={(e) => setK(parseInt(e.target.value, 10))} />
            </label>
            <label>
               Agregar número a la muestra:
               <input type="number" value={nuevoNumero} onChange={(e) => setNuevoNumero(e.target.value)} />
            </label>
            <div className="button-group">
               <button onClick={handleAgregarNumero}>Agregar Número</button>
               <button onClick={handleCalcular}>Calcular</button>
               <button onClick={() => setIsCodeModalOpen(true)}>Ver Código Java</button>
            </div>
         </div>

         <div className="muestra-container">
            <h4>Muestra:</h4>
            <p>{muestra.length > 0 ? muestra.join(", ") : "No se han agregado números."}</p>
         </div>
      </div>
   );
}

export default PruebaSeries;
