import React, { useEffect, useState } from 'react';
import { firestore } from '../../connection/firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { Card, CardMedia, CardContent, Typography, Grid, Box } from '@mui/material';
import { styled } from '@mui/system';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import styles from './CoursesList.module.css'; // CSS Modular
import { Button } from '@mui/material';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
  },
});

// Estilo de la tarjeta
const StyledCard = styled(Card)({
  width: '100%',
  maxWidth: 420, // Tamaño estándar de las tarjetas
  height: 250, // Altura fija para todas las tarjetas
  margin: '1rem',
  border: '3px solid #000', // Borde negro
  borderRadius: '10px', // Bordes ligeramente redondeados
  boxShadow: 'none', // Sin sombra
  backgroundColor: '#fff', // Fondo blanco
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  alignItems: 'center', // Centra el contenido
  padding: '16px',
  cursor: 'pointer',
  '&:hover': {
    border: '3px solid #000', // Borde negro al pasar el mouse
  },
});

// Estilo del contenedor de la imagen
const StyledCardMedia = styled(CardMedia)({
  width: '90%', // Asegura que la imagen ocupe el ancho adecuado
  height: 120, // Altura fija para imágenes
  borderRadius: '10px',
  backgroundColor: '#e0e0e0', // Fondo gris claro en caso de no haber imagen
  backgroundSize: 'cover', // Ajusta la imagen para que no se recorte
  backgroundPosition: 'center',
});

// Función para truncar texto
const truncateText = (text, maxLength) => {
  if (text.length > maxLength) {
    return text.slice(0, maxLength) + '...';
  }
  return text;
};

const CoursesList = () => {
  const [groups, setGroups] = useState([]);
  const [searchTerm, setSearchTerm] = useState(''); // Término de búsqueda
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGroups = async () => {
      const groupsCollection = collection(firestore, 'groups');
      const groupsSnapshot = await getDocs(groupsCollection);
      const groupsList = groupsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setGroups(groupsList);
    };

    fetchGroups();
  }, []);

  const handleCardClick = (groupId) => {
    navigate(`/User/course/${groupId}`);
  };

  const filteredGroups = searchTerm
    ? groups.filter((group) =>
        group.groupName.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : groups;

  return (
    <ThemeProvider theme={theme}>
      <Box mt={3} mx="auto" maxWidth={1600} px={3}>
        {/* Contenedor del encabezado */}
        <Box className={styles.headerContainer}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 900,
              fontSize: '1.8rem',
              color: '#000',
              textAlign: 'left', // Alineado a la izquierda
            }}
          >
            Grupos
          </Typography>

          <Box className={styles.searchContainer}>
            <FontAwesomeIcon icon={faSearch} className={styles.searchIcon} />
            <input
              className={styles.search__input}
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Box>
        </Box>

        {/* Contenedor de grupos */}
        <Grid container spacing={3}>
          {filteredGroups.length > 0 ? (
            filteredGroups.map((group) => (
              <Grid item xs={12} sm={6} md={4} key={group.id}>
                <StyledCard onClick={() => handleCardClick(group.id)}>
                  <StyledCardMedia
                    image={group.imageUrl || 'default-image-url'}
                    title={group.groupName}
                  />
                  <CardContent>
                    {/* Título */}
                    <Typography
                      gutterBottom
                      variant="h5"
                      component="div"
                      style={{ fontWeight: 'bold', fontSize: '1.5rem', color: '#000' }}
                    >
                      {truncateText(group.groupName, 30)}
                    </Typography>

                    {/* Descripción */}
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      style={{ fontSize: '1rem', color: '#000' }}
                    >
                      {truncateText(group.groupDescription || 'Sin descripción', 30)}
                    </Typography>

                    {/* Botón */}
                    <Button
                      variant="contained"
                      style={{
                        margin: '10px auto', // Centra el botón horizontalmente
                        backgroundColor: 'black',
                        color: 'white',
                        fontSize: '1rem', // Tamaño del texto dentro del botón
                        padding: '8px', // Espaciado interno del botón
                        width: '300px', // Ancho fijo para todos los botones
                        display: 'block', // Obliga al botón a respetar el ancho definido
                      }}
                      onClick={() => handleCardClick(group.id)}
                    >
                      Ver Grupo
                    </Button>
                  </CardContent>
                </StyledCard>
              </Grid>
            ))
          ) : (
            <Typography
              variant="h6"
              color="textSecondary"
              style={{ textAlign: 'center', width: '100%' }}
            >
              No se encontraron grupos
            </Typography>
          )}
        </Grid>
      </Box>
    </ThemeProvider>
  );
};

export default CoursesList;
