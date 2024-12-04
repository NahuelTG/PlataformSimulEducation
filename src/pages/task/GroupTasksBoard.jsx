import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { firestore, storage } from '../../connection/firebaseConfig';
import { Box, Button, Container, Modal, TextField, Typography, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { Delete, Visibility, Add } from '@mui/icons-material';

const GroupTasksBoard = () => {
  const { groupId } = useParams();
  const [tasks, setTasks] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskContent, setNewTaskContent] = useState('');
  const [newTaskType, setNewTaskType] = useState('announcement');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTasks = async () => {
      const tasksCollection = collection(firestore, 'groups', groupId, 'tasks');
      const tasksSnapshot = await getDocs(tasksCollection);
      const tasksData = tasksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTasks(tasksData);
    };

    fetchTasks();
  }, [groupId]);

  const handleAddTask = async () => {
    const tasksCollection = collection(firestore, 'groups', groupId, 'tasks');
    await addDoc(tasksCollection, {
      title: newTaskTitle,
      content: newTaskContent,
      type: newTaskType,
      createdAt: new Date()
    });
    setOpenModal(false);
    setNewTaskTitle('');
    setNewTaskContent('');
    setNewTaskType('announcement');
    // Refetch tasks
    const tasksSnapshot = await getDocs(tasksCollection);
    const tasksData = tasksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setTasks(tasksData);
  };

  const handleDeleteTask = async (taskId) => {
    const taskDocRef = doc(firestore, 'groups', groupId, 'tasks', taskId);
    await deleteDoc(taskDocRef);
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  return (
    <div className='list-container'>
    <Container>
      <Box sx={{ borderRadius: 2, boxShadow: 3, padding: 3, backgroundColor: 'white', marginTop: '100px', marginBottom: '100px' }}>
        <Typography variant="h4" gutterBottom>
          Tareas y Publicaciones
        </Typography>
        <Button startIcon={<Add />} variant="contained" onClick={() => setOpenModal(true)}>Agregar</Button>
        <TableContainer component={Paper} sx={{ marginTop: 3 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Título</TableCell>
                <TableCell>Contenido</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell>{task.title}</TableCell>
                  <TableCell>{task.content}</TableCell>
                  <TableCell>
                    <IconButton color="secondary" onClick={() => handleDeleteTask(task.id)}>
                      <Delete />
                    </IconButton>
                    {task.type === 'task' && (
                      <IconButton color="primary" onClick={() => navigate(`${task.id}`)}>
                        <Visibility />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
        <Modal
            open={openModal}
            onClose={() => setOpenModal(false)}
            aria-labelledby="simple-modal-title"
            aria-describedby="simple-modal-description"
        >
    </Container>
    </div>
  );
};

export default GroupTasksBoard;
