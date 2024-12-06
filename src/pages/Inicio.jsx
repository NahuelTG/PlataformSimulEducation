import React, { useState, useEffect } from 'react';
import { Typography, Modal, TextField, Box, Button, useMediaQuery, useTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { firestore, storage } from '../connection/firebaseConfig';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { ref, listAll, deleteObject } from 'firebase/storage';
import GroupCard from '../components/GroupCard';

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
    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

    useEffect(() => {
        const fetchGroups = async () => {
            try {
                const querySnapshot = await getDocs(collection(firestore, 'groups'));
                const groupsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setGroups(groupsData);
            } catch (error) {
                console.error('Error fetching groups:', error);
            }
        };
        fetchGroups();
    }, []);

    const deleteFolderContents = async (folderRef) => {
        try {
            const listResponse = await listAll(folderRef);
            const deletePromises = listResponse.items.map(itemRef => deleteObject(itemRef));
            const subfolderPromises = listResponse.prefixes.map(subfolderRef => deleteFolderContents(subfolderRef));
            await Promise.all([...deletePromises, ...subfolderPromises]);
        } catch (error) {
            console.error('Error deleting folder contents:', error);
        }
    };

    const deleteGroup = async () => {
        if (groupToDelete) {
            try {
                // Elimina el documento de Firestore primero.
                const groupDocRef = doc(firestore, 'groups', groupToDelete);
                await deleteDoc(groupDocRef);

                // Muestra el alert antes de la eliminación de los archivos.
                alert('Grupo eliminado exitosamente');
                setOpenDeleteModal(false);
                window.location.reload();

                const groupStorageRef = ref(storage, `groups/${groupToDelete}`);
                await deleteFolderContents(groupStorageRef);

                setGroups(groups.filter(group => group.id !== groupToDelete));

            } catch (error) {
                console.error('Error deleting group:', error);
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
            const groupDocRef = doc(firestore, 'groups', editGroupId);
            await updateDoc(groupDocRef, {
                groupName: editGroupName,
                groupDescription: editGroupDescription,
                groupCode: editGroupCode
            });
            setGroups(groups.map(group => group.id === editGroupId ? { ...group, groupName: editGroupName, groupDescription: editGroupDescription, groupCode: editGroupCode } : group));
            setOpenEditModal(false);
            alert('Grupo actualizado exitosamente');
        } catch (error) {
            console.error('Error updating group:', error);
            alert('Hubo un error actualizando el grupo');
        }
    };

    const handleEditCancel = () => {
        setOpenEditModal(false);
    };

    return (
        <Box
            sx={{
                marginLeft: isSmallScreen ? 0 : '250px',
                padding: 3,
                bgcolor: 'white',
                height: '100vh',
                overflowY: 'auto',
            }}
        >
            <Typography variant="h4" gutterBottom align="left" sx={{ marginLeft: isSmallScreen ? 2 : 0 }}>
                Grupos Administrados
            </Typography>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: isSmallScreen ? 'column' : 'row',
                    flexWrap: 'wrap',
                    gap: 3, // Espacio entre las tarjetas
                }}
            >
                {groups.map((group) => (
                    <Box key={group.id} sx={{ width: isSmallScreen ? '100%' : 'calc(33.33% - 16px)' }}>
                        <GroupCard
                            group={group}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />
                    </Box>
                ))}
            </Box>

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
                        <Button onClick={handleEditCancel} sx={{ mr: 2 }}>
                            Cancelar
                        </Button>
                        <Button onClick={handleEditSave} variant="contained">
                            Guardar
                        </Button>
                    </Box>
                </Box>
            </Modal>

            {/* Modal para eliminar */}
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
                        Eliminar Grupo
                    </Typography>
                    <Typography variant="body1" id="delete-modal-description">
                        ¿Estás seguro de que quieres eliminar este grupo? Esta acción es irreversible.
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                        <Button onClick={() => setOpenDeleteModal(false)} sx={{ mr: 2 }}>
                            Cancelar
                        </Button>
                        <Button onClick={deleteGroup} variant="contained" color="error">
                            Eliminar
                        </Button>
                    </Box>
                </Box>
            </Modal>
        </Box>
    );
};

export default Inicio;
