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

const StyledCard = styled(Card)({
  maxWidth: 345,
  margin: '1rem',
  position: 'relative',
  cursor: 'pointer',
  transition: 'transform 0.3s ease',
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.2)',
  },
});
const StyledCardMedia = styled(CardMedia)({
  height: 140,
});

const GroupBadge = styled('div')(({ theme }) => ({
  position: 'absolute',
  top: '10px',
  right: '10px',
  backgroundColor: theme.palette.primary.main,
  color: 'white',
  padding: '0.5rem',
  borderRadius: '5px',
}));
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
                      image={group.imageUrl || "default-image-url"}
                      title={group.groupName}
                    />
                    <CardContent>
                      <Typography
                        gutterBottom
                        variant="h5"
                        component="div"
                        style={{ fontWeight: 'bold' }}
                      >
                        {group.groupName}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {truncateText(group.groupDescription || 'Sin descripción', 30)}
                      </Typography>
                      <Button
                        variant="contained"
                        style={{
                          margin: '10px',
                          backgroundColor: 'black',
                          color: 'white',
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
