import React, { useState, useEffect } from 'react';
import { Typography, Modal, TextField, Box, Button, useMediaQuery, useTheme, Avatar, Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { firestore, storage } from '../connection/firebaseConfig';
import { collection, getDocs, doc, updateDoc, deleteDoc, setDoc } from 'firebase/firestore';
import { ref, listAll, deleteObject, uploadBytes, getDownloadURL } from 'firebase/storage';
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
    const [openCreateModal, setOpenCreateModal] = useState(false);
    const [groupImage, setGroupImage] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [groupName, setGroupName] = useState('');
    const [groupDescription, setGroupDescription] = useState('');
    const [groupCode, setGroupCode] = useState('');
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
                const groupDocRef = doc(firestore, 'groups', groupToDelete);
                await deleteDoc(groupDocRef);
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

    const handleCreateGroup = async (event) => {
        event.preventDefault();
        const newGroupRef = doc(collection(firestore, "groups"));
        const groupId = newGroupRef.id;

        try {
            let imageUrl = '';

            if (imageFile) {
                const storageRef = ref(storage, `groups/${groupId}/images/${imageFile.name}`);
                await uploadBytes(storageRef, imageFile);
                imageUrl = await getDownloadURL(storageRef);
            }
            await setDoc(newGroupRef, {
                groupName,
                groupDescription,
                groupCode,
                imageUrl,
            });

            setGroupName('');
            setGroupDescription('');
            setGroupCode('');
            setGroupImage(null);
            setImageFile(null);
            setOpenCreateModal(false);
            alert('Grupo creado exitosamente');
            window.location.reload();

        } catch (error) {
            console.error("Error creando el grupo: ", error);
            alert('Hubo un error creando el grupo');
        }
    };

    return (
        <Box
            sx={{
                marginLeft: isSmallScreen ? 0 : '300px',
                padding: 3,
                bgcolor: 'white',
                height: '100vh',
                overflowY: 'auto',
            }}
        >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h4" gutterBottom align="left" sx={{ marginLeft: isSmallScreen ? 2 : 0 }}>
                    Grupos Administrados
                </Typography>
                <Button
                    variant="contained"
                    color="inherit"
                    onClick={() => setOpenCreateModal(true)}
                >
                    Crear Curso
                </Button>
            </Box>

            <Box
                sx={{
                    display: 'flex',
                    flexDirection: isSmallScreen ? 'column' : 'row',
                    flexWrap: 'wrap',
                    gap: 3,
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

            <Modal
                open={openCreateModal}
                onClose={() => setOpenCreateModal(false)}
                aria-labelledby="create-modal-title"
                aria-describedby="create-modal-description"
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
                    <Typography variant="h6" id="create-modal-title">
                        Crear Nuevo Grupo
                    </Typography>
                    <form onSubmit={handleCreateGroup}>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField
                                    variant="outlined"
                                    fullWidth
                                    label="Nombre del Grupo"
                                    name="groupName"
                                    value={groupName}
                                    onChange={e => setGroupName(e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    variant="outlined"
                                    fullWidth
                                    label="Descripción del Grupo"
                                    name="groupDescription"
                                    multiline
                                    rows={4}
                                    value={groupDescription}
                                    onChange={e => setGroupDescription(e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    variant="outlined"
                                    fullWidth
                                    label="Código del Grupo"
                                    name="groupCode"
                                    inputProps={{ maxLength: 3 }}
                                    value={groupCode}
                                    onChange={e => setGroupCode(e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <input
                                    accept="image/*"
                                    id="group-image-input"
                                    type="file"
                                    onChange={(event) => {
                                        const file = event.target.files[0];
                                        if (file) {
                                            const reader = new FileReader();
                                            reader.onloadend = () => setGroupImage(reader.result);
                                            reader.readAsDataURL(file);
                                            setImageFile(file);
                                        }
                                    }}
                                    style={{ display: 'none' }}
                                />
                                <label htmlFor="group-image-input">
                                    <Button variant="span" component="span">
                                        Seleccionar Imagen
                                    </Button>
                                </label>
                                {groupImage && (
                                    <Avatar alt="Group Image" src={groupImage} sx={{ width: 150, height: 150, margin: 'auto', marginTop: '10px' }} />
                                )}
                            </Grid>
                            <Grid item xs={12}>
                            <Button
                                variant="contained"
                                fullWidth
                                type="submit"
                                sx={{
                                    backgroundColor: "black",
                                    color: "white",
                                    "&:hover": {
                                    backgroundColor: "gray",
                                    },
                                }}
                            >
                                Craer Grupo
                            </Button>

                            </Grid>
                        </Grid>
                    </form>
                </Box>
            </Modal>

            {/* Modal para editar */}
            <Modal
                open={openEditModal}
                onClose={() => setOpenEditModal(false)}
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
                        <Button onClick={() => setOpenEditModal(false)} sx={{ mr: 2 }}>
                            Cancelar
                        </Button>
                        <Button
                        variant="contained"
                        onClick={handleEditSave}
                        type="submit"
                        sx={{
                            backgroundColor: "black",
                            color: "white",
                            "&:hover": {
                            backgroundColor: "gray", 
                            },
                        }}
                        >
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
                    <Typography variant="h5" id="delete-modal-description">
                        ¿Estás seguro de que quieres eliminar este grupo?
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
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
