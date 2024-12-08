import React, { useState, useEffect, useContext } from "react";
import { collection, getDocs, getDoc, setDoc, deleteDoc, doc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { firestore, storage } from "../../connection/firebaseConfig";
import { UserContext } from "../../context/UserContext";
import { SearchContext } from "../../context/SearchContext";
import {
   Box,
   Button,
   Container,
   IconButton,
   Modal,
   Table,
   TableBody,
   TableCell,
   TableContainer,
   TableHead,
   TableRow,
   Typography,
   Paper,
   CircularProgress,
   Snackbar,
   Grid,
} from "@mui/material";
import { Delete, CloudUpload } from "@mui/icons-material";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import styles from "./ViewCourse.module.css";

const GroupBoard = () => {
   const { groupC } = useContext(SearchContext);
   const { currentUser } = useContext(UserContext);
   const [boardItems, setBoardItems] = useState([]);
   const [file, setFile] = useState(null);
   const [fileUrl, setFileUrl] = useState("");
   const [fileName, setFileName] = useState("");
   const [grade, setGrade] = useState("none");
   const [openFileModal, setOpenFileModal] = useState(false);
   const [openTaskModal, setOpenTaskModal] = useState(false);
   const [selectedTask, setSelectedTask] = useState(null);
   const [loading, setLoading] = useState(false);
   const [message, setMessage] = useState("");
   const defaultLayoutPluginInstance = defaultLayoutPlugin();
   const groupId = groupC;
   const [open, setOpen] = useState(false);

   useEffect(() => {
      const fetchBoardItems = async () => {
         const boardCollection = collection(firestore, "groups", groupId, "tasks");
         const boardSnapshot = await getDocs(boardCollection);
         const boardData = boardSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
         setBoardItems(boardData);
      };

      fetchBoardItems();
   }, [groupId]);

   const checkFilesExist = async (task) => {
      try {
         setLoading(true);
         const submissionDocRef = doc(firestore, "groups", groupId, "tasks", task.id, "submissions", currentUser.uid);
         const submissionDoc = await getDoc(submissionDocRef);
         if (submissionDoc.exists()) {
            const data = submissionDoc.data();
            setFileUrl(data.fileUrl);
            setFileName(data.fileName);
            setGrade(data.grade);
            setMessage("Archivo existente");
         } else {
            setFileUrl("");
            setFileName("");
            setGrade("none");
            setMessage("No se encontraron archivos");
         }
      } catch (error) {
         console.error("Error al verificar archivos:", error);
      } finally {
         setLoading(false);
      }
   };

   const handleFileUpload = async (e) => {
      const file = e.target.files[0];
      if (file && file.type === "application/pdf") {
         setFile(file);
         setLoading(true);

         try {
            const submissionDocRef = doc(firestore, "groups", groupId, "tasks", selectedTask.id, "submissions", currentUser.uid);
            await setDoc(submissionDocRef, {
               userId: currentUser.uid,
               fileUrl: "",
               fileName: file.name,
               grade: "none",
               timestamp: new Date(),
            });

            const fileRef = ref(storage, `groups/${groupId}/tasks/${selectedTask.id}/${currentUser.uid}/${file.name}`);
            await uploadBytes(fileRef, file);

            const url = await getDownloadURL(fileRef);
            setFileUrl(url);

            await setDoc(submissionDocRef, { fileUrl: url }, { merge: true });

            setMessage("Archivo subido exitosamente");
         } catch (error) {
            console.error("Error al subir el archivo:", error);
            setMessage("Error al subir el archivo");
         } finally {
            setLoading(false);
         }
      } else {
         setMessage("Error: Solo se pueden subir archivos PDF");
      }
   };

   const handleFileSubmit = async () => {
      if (!fileUrl) {
         setMessage("Error: URL del archivo no disponible");
         return;
      }

      setOpenFileModal(false);
      setFile(null);
      setFileUrl("");
      const boardSnapshot = await getDocs(collection(firestore, "groups", groupId, "tasks"));
      const boardData = boardSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setBoardItems(boardData);
   };

   const handleDeleteFile = async () => {
      if (!fileUrl) {
         setMessage("Error: No se encontró la URL del archivo");
         return;
      }

      setLoading(true);
      try {
         const fileRef = ref(storage, `groups/${groupId}/tasks/${selectedTask.id}/${currentUser.uid}/${fileName}`);
         await deleteObject(fileRef);

         const submissionDocRef = doc(firestore, "groups", groupId, "tasks", selectedTask.id, "submissions", currentUser.uid);
         await deleteDoc(submissionDocRef);

         setFileUrl("");
         setFile(null);
         setFileName("");
         setMessage("Archivo eliminado exitosamente");

         const boardSnapshot = await getDocs(collection(firestore, "groups", groupId, "tasks"));
         const boardData = boardSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
         setBoardItems(boardData);
      } catch (error) {
         console.error("Error al eliminar archivo:", error);
         setMessage("Error al eliminar archivo");
      } finally {
         setLoading(false);
      }
   };

   const handleOpenFileModal = async (task) => {
      setMessage("");
      setSelectedTask(task);
      setOpenFileModal(true);
      await checkFilesExist(task);
   };

   const handleOpenTaskModal = (task) => {
      setSelectedTask(task);
      setOpenTaskModal(true);
   };

   const handleButtonClick = () => {
      setOpen(true);
   };

   const handleClose = () => {
      setOpen(false);
   };

   return (
      <Container>
         <Box>
            <Grid container spacing={3} sx={{ marginTop: 3 }}>
               {boardItems.map((item) => (
                  <Grid item xs={12} key={item.id}>
                     {" "}
                     {/* Cambié xs={12} para que ocupe toda la fila */}
                     <Box
                        className={styles.card}
                        sx={{
                           border: "2px solid black",
                           borderRadius: "8px",
                           padding: "16px",
                           boxShadow: "0px 2px 8px rgba(0,0,0,0.1)",
                           transition: "transform 0.2s, box-shadow 0.2s",
                           "&:hover": {
                              transform: "scale(1.02)",
                              boxShadow: "0px 4px 12px rgba(0,0,0,0.2)",
                           },
                           display: "flex", // Asegura la flexibilidad en el contenido
                           flexDirection: "column", // Alineación vertical de los elementos
                        }}
                        onClick={() => handleOpenTaskModal(item)}
                     >
                        <Typography
                           variant="h5"
                           className={styles.cardTitle}
                           sx={{
                              marginBottom: "12px",
                              textAlign: "left", // Alinea el texto a la izquierda
                              color: "#333",
                              fontWeight: "bold",
                           }}
                        >
                           {item.title}
                        </Typography>
                        <Typography
                           variant="body2"
                           className={styles.cardContent}
                           sx={{
                              marginBottom: "16px",
                              color: "#555",
                              textAlign: "left", // Alinea el contenido a la izquierda
                           }}
                        >
                           {item.content.substring(0, 100)}...
                        </Typography>
                        {item.type === "task" && (
                           <Button
                              className={styles.cardButton}
                              variant="contained"
                              sx={{
                                 backgroundColor: "black",
                                 color: "white",
                                 width: "100%", // El botón ocupa todo el ancho
                                 marginTop: "auto", // Empuja el botón hacia el final de la tarjeta
                                 "&:hover": { backgroundColor: "#333" },
                              }}
                              onClick={(e) => {
                                 e.stopPropagation();
                                 handleOpenFileModal(item);
                              }}
                           >
                              Subir Archivo
                           </Button>
                        )}
                     </Box>
                  </Grid>
               ))}
            </Grid>
         </Box>

         {/* Modales y Snackbar (Sin cambios) */}
         <Modal
            open={openFileModal}
            onClose={() => setOpenFileModal(false)}
            aria-labelledby="file-modal-title"
            aria-describedby="file-modal-description"
         >
            <Box
               sx={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: "80%",
                  height: "80%",
                  bgcolor: "background.paper",
                  borderRadius: 2,
                  boxShadow: 24,
                  p: 4,
               }}
            >
               <Typography variant="h6" id="file-modal-title">
                  Subir Archivo
               </Typography>
               {loading ? (
                  <CircularProgress />
               ) : fileUrl ? (
                  <Box sx={{ height: "65vh" }}>
                     <Typography variant="body1">Archivo Subido:</Typography>
                     <Worker workerUrl={`https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`}>
                     <Viewer fileUrl={fileUrl} plugins={[defaultLayoutPluginInstance]} />
                     </Worker>
                     <div style={{ marginTop: "25px" }}></div>
                     {grade === "none" ? (
                        <Button variant="contained" color="secondary" onClick={handleDeleteFile}>
                           Eliminar
                        </Button>
                     ) : (
                        <Button variant="contained" color="success" sx={{ cursor: "default" }} onClick={handleButtonClick}>
                           Calificado: {grade}
                        </Button>
                     )}
                  </Box>
               ) : (
                  <Box>
                     <input type="file" accept="application/pdf" onChange={handleFileUpload} />
                     <Button variant="contained" onClick={handleFileSubmit}>
                        Subir
                     </Button>
                  </Box>
               )}
               {message && (
                  <Typography variant="body2" color="error">
                     {message}
                  </Typography>
               )}
            </Box>
         </Modal>
         <Modal
            open={openTaskModal}
            onClose={() => setOpenTaskModal(false)}
            aria-labelledby="task-modal-title"
            aria-describedby="task-modal-description"
         >
            <Box
               sx={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  minWidth: "50%",
                  minHeight: "30%",
                  transform: "translate(-50%, -50%)",
                  maxWidth: "80%",
                  maxHeight: "70%",
                  bgcolor: "background.paper",
                  borderRadius: 2,
                  boxShadow: 24,
                  p: 4,
               }}
            >
               <Typography variant="h6" id="task-modal-title">
                  Detalles de la Tarea
               </Typography>
               {selectedTask && (
                  <Box>
                     <Typography variant="body1">
                        <strong>Título:</strong> {selectedTask.title}
                     </Typography>
                     <Typography variant="body1">
                        <strong>Contenido:</strong> {selectedTask.content}
                     </Typography>
                  </Box>
               )}
            </Box>
         </Modal>
         <Snackbar open={open} autoHideDuration={1000} onClose={handleClose} message="Una tarea calificada no se puede eliminar." />
      </Container>
   );
};

export default GroupBoard;
