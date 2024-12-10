import React, { useEffect, useState, useContext } from "react";
import { firestore } from "../../connection/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { Card, CardMedia, CardContent, Typography, Grid, Box, CircularProgress, Button } from "@mui/material";
import { styled } from "@mui/system";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { SearchContext } from "../../context/SearchContext";
import { UserContext } from "../../context/UserContext";
import styles from "./SubscribedCourses.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";

const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2",
    },
  },
});

// Estilo de las tarjetas
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
    border: '4px solid #000', // Borde negro más grueso al pasar el mouse
  },
});

// Estilo de la imagen
const StyledCardMedia = styled(CardMedia)({
  width: '90%', // Asegura que la imagen ocupe el ancho deseado
  height: 140, // Altura fija para imágenes
  borderRadius: '10px',
  backgroundColor: '#e0e0e0', // Fondo gris claro en caso de no haber imagen
  backgroundSize: 'cover', // Ajusta la imagen para que no se recorte
  backgroundPosition: 'center', // Centra la imagen
});

// Estilo del botón
const StyledButton = styled(Button)({
  margin: '10px auto', // Centra el botón horizontalmente
  backgroundColor: 'black',
  color: 'white',
  fontSize: '1rem', // Tamaño del texto dentro del botón
  padding: '8px', // Espaciado interno
  width: '300px', // Ancho fijo para todos los botones
  display: 'block', // Obliga al botón a respetar el ancho definido
});

const SubscribedCourses = () => {
  const [userGroups, setUserGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useContext(UserContext);
  const { searchTerm, setSearchTerm } = useContext(SearchContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserGroups = async () => {
      setLoading(true);

      if (currentUser && currentUser !== "invitado") {
        const userRef = doc(firestore, "users", currentUser.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          if (userData.courses) {
            const groupsDetails = await Promise.all(
              userData.courses.map(async (course) => {
                const groupDoc = await getDoc(doc(firestore, "groups", course.courseId));
                return groupDoc.exists() ? { id: course.courseId, ...groupDoc.data() } : null;
              })
            );
            const filteredGroups = groupsDetails.filter((group) => group !== null);
            setUserGroups(filteredGroups);
          }
        }
      }

      setLoading(false);
    };

    fetchUserGroups();
  }, [currentUser]);

  const handleCardClick = (groupId) => {
    navigate(`/User/viewcourse/${groupId}`);
  };

  const handleSearchInputChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredGroups =
    searchTerm.trim() !== ""
      ? userGroups.filter((group) => group.groupName.toLowerCase().includes(searchTerm.toLowerCase()))
      : userGroups;

  return (
    <ThemeProvider theme={theme}>
      <Box mt={3} mx="auto" maxWidth={1600} px={3}>
        {/* Contenedor combinado para el título y el buscador */}
        <Box mb={3} display="flex" justifyContent="space-between" alignItems="center" className={styles.headerContainer}>
          {/* Título */}
          <Typography
            variant="h5"
            sx={{
              fontWeight: 900,
              fontSize: '1.8rem',
              color: '#000',
              textAlign: 'left',
            }}
          >
            Grupos en los que estás inscrito
          </Typography>

          {/* Barra de búsqueda */}
          <Box className={styles.searchContainer} style={{ position: "relative", maxWidth: "600px", width: "100%" }}>
            <FontAwesomeIcon icon={faSearch} className={styles.searchIcon} />
            <input
              className={styles.search__input}
              type="text"
              placeholder="Buscar grupos..."
              value={searchTerm}
              onChange={handleSearchInputChange}
            />
          </Box>
        </Box>

        {/* Indicador de carga o resultados */}
        {loading ? (
          <Box py={2} mb={3} textAlign="center">
            <CircularProgress />
          </Box>
        ) : filteredGroups.length > 0 ? (
          <Grid container spacing={3} className={styles.resultsContainer}>
            {filteredGroups.map((group) => (
              <Grid item xs={12} sm={6} md={4} key={group.id}>
                <StyledCard>
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
                      {group.groupName}
                    </Typography>

                    {/* Descripción */}
                    <Typography
                      variant="body2"
                      style={{ fontSize: '1rem', color: '#666' }}
                    >
                      {group.groupDescription || 'Sin descripción disponible'}
                    </Typography>

                    {/* Botón */}
                    <StyledButton onClick={() => handleCardClick(group.id)}>Ver Grupo</StyledButton>
                  </CardContent>
                </StyledCard>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Box py={2} textAlign="center" className={styles.noResults}>
            <Typography variant="h5">No hay resultados para "{searchTerm}"</Typography>
          </Box>
        )}
      </Box>
    </ThemeProvider>
  );
};

export default SubscribedCourses;
