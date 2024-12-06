import React, { useState } from 'react';
import { Grid, Card, CardContent, CardActions, Typography, Button, Modal, TextField, Box, IconButton } from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import { useNavigate } from 'react-router-dom';
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

  // Obtener grupos de Firestore
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
      <Grid container spacing={3}>
        {groups.map((group) => (
          <Grid item xs={12} sm={6} md={4} key={group.id}>
            <Card>
              <CardContent>
                {group.imageUrl && (
                  <Box
                    component="img"
                    src={group.imageUrl}
                    alt={group.groupName}
                    sx={{
                      width: '100%',
                      height: 150,
                      objectFit: 'cover',
                      borderRadius: '4px',
                    }}
                  />
                )}
                <Typography variant="h6" gutterBottom>
                  {group.groupName}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {group.groupDescription.length > 60 ? group.groupDescription.substring(0, 60) + '...' : group.groupDescription}
                </Typography>
              </CardContent>
              <CardActions>
                <IconButton color="primary" onClick={() => handleEdit(group)}>
                  <Edit />
                </IconButton>
                <IconButton color="secondary" onClick={() => handleDelete(group.id)}>
                  <Delete />
                </IconButton>
                <IconButton color="default" onClick={() => navigate(`groups/${group.id}/tasks`)}>
                  <AssignmentIndIcon />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

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
