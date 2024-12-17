import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { collection, getDocs, addDoc, deleteDoc, doc, query } from "firebase/firestore";
import { Box, Button, Container, Modal, TextField, Typography, Grid, IconButton, Autocomplete } from "@mui/material";
import { Delete, Visibility, Add } from "@mui/icons-material";
import { firestore, storage } from "../../connection/firebaseConfig";
import styles from "./GroupTasksBoard.module.css"; // Archivo CSS
import { UserContext } from "../../context/UserContext";

const GroupTasksBoard = () => {
   const { currentUser } = useContext(UserContext);
   const { groupId } = useParams();
   const [tasks, setTasks] = useState([]);
   const [openModal, setOpenModal] = useState(false);
   const [newTaskTitle, setNewTaskTitle] = useState("");
   const [newTaskContent, setNewTaskContent] = useState("");
   const [newTaskType, setNewTaskType] = useState("announcement");
   const navigate = useNavigate();
   const [contacts, setContacts] = useState([]); // Lista de usuarios
   const [selectedUser, setSelectedUser] = useState(null); // Usuario seleccionado

   useEffect(() => {
      const fetchTasks = async () => {
         const tasksCollection = collection(firestore, "groups", groupId, "tasks");
         const tasksSnapshot = await getDocs(tasksCollection);
         const tasksData = tasksSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
         setTasks(tasksData);
      };

      fetchTasks();
   }, [groupId]);

   useEffect(() => {
      fetchContacts();
      console.log("contacto");
   }, []);

   // Recuperar usuarios desde Firebase
   const fetchContacts = async () => {
      const q = query(collection(firestore, "users"));
      const querySnapshot = await getDocs(q);
      const users = [];

      // Agregar los usuarios de Firebase al array
      querySnapshot.forEach((doc) => {
         const user = doc.data();
         if (user.email !== currentUser.email) {
            users.push({ label: user.username, id: user.email }); // Usar email como ID
         }
      });

      // Agregar la opción "Todos"
      users.unshift({ label: "Todos", id: "all" });

      setContacts(users);
   };

   // Guardar la tarea en Firestore
   const handleAddTask = async () => {
      try {
         const tasksCollection = collection(firestore, "groups", groupId, "tasks");

         // Crear la tarea
         await addDoc(tasksCollection, {
            title: newTaskTitle,
            content: newTaskContent,
            type: newTaskType,
            assignedTo: selectedUser ? selectedUser.id : "all", // Asignar al usuario seleccionado o a todos
            createdAt: new Date(),
         });

         // Reiniciar modal y campos
         setOpenModal(false);
         setNewTaskTitle("");
         setNewTaskContent("");
         setNewTaskType("announcement");
         setSelectedUser(null);

         // Actualizar lista de tareas
         const tasksSnapshot = await getDocs(tasksCollection);
         const tasksData = tasksSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
         setTasks(tasksData);
      } catch (error) {
         console.error("Error al agregar la tarea:", error);
      }
   };

   const handleDeleteTask = async (taskId) => {
      const taskDocRef = doc(firestore, "groups", groupId, "tasks", taskId);
      await deleteDoc(taskDocRef);
      setTasks(tasks.filter((task) => task.id !== taskId));
   };

   const handleViewTask = (taskId) => {
      navigate(`${taskId}`);
   };

   return (
      <div className={styles.listContainer}>
         <Container>
            <Box>
               <Typography variant="h4" className={styles.taskTitle}>
                  Tareas y Publicaciones
               </Typography>
               <Button
                  startIcon={<Add />}
                  className={styles.addButton}
                  onClick={() => setOpenModal(true)}
                  sx={{
                     bgcolor: "black", // Fondo negro
                     color: "white", // Texto blanco
                     textTransform: "none", // Texto sin mayúsculas automáticas
                     fontWeight: "bold", // Texto en negrita
                     padding: "10px 20px", // Espaciado interno
                     transition: "all 0.3s ease", // Transición suave para hover
                     "&:hover": {
                        bgcolor: "gray", // Fondo gris en hover
                        color: "white", // Mantener el texto blanco en hover
                     },
                     "& .MuiButton-startIcon": {
                        color: "white", // Ícono también en blanco
                     },
                  }}
               >
                  Agregar
               </Button>

               <Grid container spacing={3} sx={{ marginTop: 3 }}>
                  {tasks.map((task) => (
                     <Grid item xs={12} key={task.id}>
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
                              display: "flex",
                              flexDirection: "column",
                           }}
                        >
                           <Typography variant="h5" sx={{ marginBottom: "12px", textAlign: "left", fontWeight: "bold", color: "#333" }}>
                              {task.title}
                           </Typography>
                           <Typography variant="body2" sx={{ marginBottom: "16px", color: "#555", textAlign: "left" }}>
                              {task.content.substring(0, 100)}...
                           </Typography>
                           <Box sx={{ display: "flex", justifyContent: "space-between", marginTop: "auto" }}>
                              <IconButton
                                 sx={{
                                    color: "black",
                                    "&:hover": {
                                       color: "red",
                                    },
                                 }}
                                 onClick={() => handleDeleteTask(task.id)}
                              >
                                 <Delete />
                              </IconButton>

                              {task.type === "task" && (
                                 <Button
                                    variant="contained"
                                    sx={{ backgroundColor: "black", color: "white", "&:hover": { backgroundColor: "#333" } }}
                                    onClick={() => handleViewTask(task.id)}
                                 >
                                    Ver Detalles
                                 </Button>
                              )}
                           </Box>
                        </Box>
                     </Grid>
                  ))}
               </Grid>
            </Box>
            <Modal
               open={openModal}
               onClose={() => setOpenModal(false)}
               aria-labelledby="add-task-modal-title"
               aria-describedby="add-task-modal-description"
            >
               <Box
                  sx={{
                     position: "absolute",
                     top: "50%",
                     left: "50%",
                     transform: "translate(-50%, -50%)",
                     width: 400,
                     bgcolor: "white",
                     borderRadius: "10px",
                     boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.3)",
                     p: 4,
                     display: "flex",
                     flexDirection: "column",
                  }}
               >
                  <Typography
                     variant="h6"
                     id="add-task-modal-title"
                     sx={{
                        fontWeight: "bold",
                        color: "black",
                        marginBottom: 2,
                     }}
                  >
                     Agregar Tarea/Publicación
                  </Typography>

                  <TextField
                     fullWidth
                     label="Título"
                     value={newTaskTitle}
                     onChange={(e) => setNewTaskTitle(e.target.value)}
                     margin="normal"
                     InputLabelProps={{
                        style: { color: "black" },
                     }}
                     sx={{
                        "& .MuiOutlinedInput-root": {
                           "& fieldset": {
                              borderColor: "black",
                           },
                           "&:hover fieldset": {
                              borderColor: "gray",
                           },
                           "&.Mui-focused fieldset": {
                              borderColor: "black",
                           },
                        },
                     }}
                  />
                  <TextField
                     fullWidth
                     label="Contenido"
                     value={newTaskContent}
                     onChange={(e) => setNewTaskContent(e.target.value)}
                     margin="normal"
                     multiline
                     rows={4}
                     InputLabelProps={{
                        style: { color: "black" },
                     }}
                     sx={{
                        "& .MuiOutlinedInput-root": {
                           "& fieldset": {
                              borderColor: "black",
                           },
                           "&:hover fieldset": {
                              borderColor: "gray",
                           },
                           "&.Mui-focused fieldset": {
                              borderColor: "black",
                           },
                        },
                     }}
                  />
                  <TextField
                     fullWidth
                     select
                     label="Tipo"
                     value={newTaskType}
                     onChange={(e) => setNewTaskType(e.target.value)}
                     margin="normal"
                     SelectProps={{
                        native: true,
                     }}
                     InputLabelProps={{
                        style: { color: "black" },
                     }}
                     sx={{
                        "& .MuiOutlinedInput-root": {
                           "& fieldset": {
                              borderColor: "black",
                           },
                           "&:hover fieldset": {
                              borderColor: "gray",
                           },
                           "&.Mui-focused fieldset": {
                              borderColor: "black",
                           },
                        },
                     }}
                  >
                     <option value="announcement">Anuncio</option>
                     <option value="task">Tarea</option>
                  </TextField>
                  <Autocomplete
                     options={contacts}
                     getOptionLabel={(option) => option.label} // Muestra el nombre o "Todos"
                     onChange={(_event, value) => setSelectedUser(value)} // Actualiza el estado
                     renderInput={(params) => (
                        <TextField
                           {...params}
                           label="Asignar a usuario"
                           margin="normal"
                           InputLabelProps={{
                              style: { color: "black" },
                           }}
                           sx={{
                              "& .MuiOutlinedInput-root": {
                                 "& fieldset": {
                                    borderColor: "black",
                                 },
                                 "&:hover fieldset": {
                                    borderColor: "gray",
                                 },
                                 "&.Mui-focused fieldset": {
                                    borderColor: "black",
                                 },
                              },
                           }}
                        />
                     )}
                  />

                  <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
                     <Button
                        onClick={() => setOpenModal(false)}
                        sx={{
                           color: "black",
                           border: "1px solid black",
                           borderRadius: "5px",
                           padding: "8px 16px",
                           marginRight: 2,
                           "&:hover": {
                              backgroundColor: "rgba(0, 0, 0, 0.1)",
                           },
                        }}
                     >
                        Cancelar
                     </Button>
                     <Button
                        variant="contained"
                        sx={{
                           backgroundColor: "black",
                           color: "white",
                           borderRadius: "5px",
                           padding: "8px 16px",
                           "&:hover": {
                              backgroundColor: "gray",
                           },
                        }}
                        onClick={handleAddTask}
                     >
                        Agregar
                     </Button>
                  </Box>
               </Box>
            </Modal>
         </Container>
      </div>
   );
};

export default GroupTasksBoard;
