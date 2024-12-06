import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Box, Button, Modal, TextField, Typography } from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import { firestore, storage } from '../connection/firebaseConfig';
import { collection, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { ref, listAll, deleteObject } from "firebase/storage";

const Inicio = () => {
  const [groups, setGroups] = useState([]);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [editGroupId, setEditGroupId] = useState(null);
  const [editGroupName, setEditGroupName] = useState('');
  const [editGroupDescription, setEditGroupDescription] = useState('');
  const [editGroupCode, setEditGroupCode] = useState('');
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState(null);
  const navigate = useNavigate();

  // Obtener grupos de Firestore cuando el componente esté montado
  React.useEffect(() => {
    const fetchGroups = async () => {
      const querySnapshot = await getDocs(collection(firestore, "groups"));
      const groupsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setGroups(groupsData);
    };

    fetchGroups();
  }, []);

  const deleteFolderContents = async (folderRef) => {
    const listResponse = await listAll(folderRef);
    const deletePromises = listResponse.items.map((itemRef) => deleteObject(itemRef));
    const subfolderPromises = listResponse.prefixes.map((subfolderRef) => deleteFolderContents(subfolderRef));
    await Promise.all([...deletePromises, ...subfolderPromises]);
  };

  const deleteGroup = async () => {
    if (groupToDelete) {
      try {
        const groupDocRef = doc(firestore, "groups", groupToDelete);
        await deleteDoc(groupDocRef);

        const groupStorageRef = ref(storage, `groups/${groupToDelete}`);
        await deleteFolderContents(groupStorageRef);

        setGroups(groups.filter(group => group.id !== groupToDelete));
        setOpenDeleteModal(false);
        alert('Grupo eliminado exitosamente');
      } catch (error) {
        console.error("Error eliminando el grupo: ", error);
        alert('Hubo un error eliminando el grupo');
      }
    }
  };

  const handleDelete = (groupId) => {
    setGroupToDelete(groupId);
    setOpenDeleteModal(true);
  };

  const handleEdit = (group) => {
    setEditGroupId(group.id);
    setEditGroupName(group.groupName);
    setEditGroupDescription(group.groupDescription);
    setEditGroupCode(group.groupCode);
    setOpenEditModal(true);
  };

  const handleEditSave = async () => {
    try {
      const groupDocRef = doc(firestore, "groups", editGroupId);
      await updateDoc(groupDocRef, {
        groupName: editGroupName,
        groupDescription: editGroupDescription,
        groupCode: editGroupCode
      });
      setGroups(groups.map(group => group.id === editGroupId ? { ...group, groupName: editGroupName, groupDescription: editGroupDescription, groupCode: editGroupCode } : group));
      setOpenEditModal(false);
      alert('Grupo actualizado exitosamente');
    } catch (error) {
      console.error("Error actualizando el grupo: ", error);
      alert('Hubo un error actualizando el grupo');
    }
  };

  const handleEditCancel = () => {
    setOpenEditModal(false);
  };

  return (
    <Box
      sx={{
        marginLeft: '250px', // Ajuste para el sidebar
        padding: 3,
        bgcolor: 'white',
        height: '100vh',
        overflowY: 'auto',
      }}
    >
      <Typography variant="h4" gutterBottom>
        Grupos
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nombre del Grupo</TableCell>
              <TableCell>Descripción</TableCell>
              <TableCell>Imagen</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {groups.map((group) => (
              <TableRow key={group.id}>
                <TableCell>{group.groupName}</TableCell>
                <TableCell>{group.groupDescription.length > 10 ? group.groupDescription.substring(0, 10) + '...' : group.groupDescription}</TableCell>
                <TableCell>
                  {group.imageUrl && <img src={group.imageUrl} alt={group.groupName} width="100" style={{ borderRadius: '10px' }} />}
                </TableCell>
                <TableCell>
                  <IconButton color="primary" onClick={() => handleEdit(group)}>
                    <Edit />
                  </IconButton>
                  <IconButton color="secondary" onClick={() => handleDelete(group.id)}>
                    <Delete />
                  </IconButton>
                  <IconButton color="default" onClick={() => navigate(`groups/${group.id}/tasks`)}>
                    <AssignmentIndIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Modal para editar */}
      <Modal
        open={openEditModal}
        onClose={handleEditCancel}
        aria-labelledby="edit-modal-title"
        aria-describedby="edit-modal-description"
      >
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 24,
          p: 4,
        }}>
          <Typography variant="h6" id="edit-modal-title">
            Editar Grupo
          </Typography>
          <TextField
            fullWidth
            label="Nombre del Grupo"
            value={editGroupName}
            onChange={(e) => setEditGroupName(e.target.value)}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Descripción del Grupo"
            value={editGroupDescription}
            onChange={(e) => setEditGroupDescription(e.target.value)}
            margin="normal"
            multiline
            rows={4}
          />
          <TextField
            fullWidth
            label="Código del Grupo"
            value={editGroupCode}
            onChange={(e) => setEditGroupCode(e.target.value)}
            margin="normal"
            inputProps={{ maxLength: 3 }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button onClick={handleEditCancel} sx={{ mr: 2 }}>Cancelar</Button>
            <Button variant="contained" onClick={handleEditSave}>Guardar</Button>
          </Box>
        </Box>
      </Modal>

      {/* Modal para confirmar eliminación */}
      <Modal
        open={openDeleteModal}
        onClose={() => setOpenDeleteModal(false)}
        aria-labelledby="delete-modal-title"
        aria-describedby="delete-modal-description"
      >
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 24,
          p: 4,
        }}>
          <Typography variant="h6" id="delete-modal-title">
            Confirmar Eliminación
          </Typography>
          <Typography id="delete-modal-description" sx={{ mt: 2 }}>
            ¿Estás seguro de que deseas eliminar este grupo?
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button onClick={() => setOpenDeleteModal(false)} sx={{ mr: 2 }}>Cancelar</Button>
            <Button variant="contained" color="secondary" onClick={deleteGroup}>Eliminar</Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default Inicio;
