import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { firestore } from '../../connection/firebaseConfig';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, deleteField } from 'firebase/firestore';
import { UserContext } from '../../context/UserContext';
import { Container, Typography, Button, CardMedia, Snackbar, Alert, Box, Chip } from '@mui/material';

const CourseDetail = () => {
  const { courseId } = useParams();
  const { currentUser } = useContext(UserContext);
  const [course, setCourse] = useState(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    const fetchCourse = async () => {
      const courseDoc = doc(firestore, 'groups', courseId);
      const courseSnapshot = await getDoc(courseDoc);
      if (courseSnapshot.exists()) {
        setCourse(courseSnapshot.data());
      } else {
        console.error('No se encontró el curso');
      }
    };

    const checkSubscription = async () => {
      if (currentUser && currentUser !== 'invitado') {
        const userRef = doc(firestore, 'users', currentUser.uid);
        const userSnapshot = await getDoc(userRef);
        if (userSnapshot.exists()) {
          const userData = userSnapshot.data();
          if (userData.courses && userData.courses.some(course => course.courseId === courseId)) {
            setIsSubscribed(true);
          }
        }
      }
    };

    fetchCourse();
    checkSubscription();
  }, [courseId, currentUser]);

  const handleSubscribe = async () => {
    if (!currentUser || currentUser === 'invitado') {
      setSnackbar({ open: true, message: 'Debes iniciar sesión para suscribirte a un curso', severity: 'warning' });
      return;
    }

    const userRef = doc(firestore, 'users', currentUser.uid);
    try {
      await updateDoc(userRef, {
        courses: arrayUnion({ courseId, progress: 0 })
      });
      setIsSubscribed(true);
      setSnackbar({ open: true, message: 'Te has suscrito al curso exitosamente', severity: 'success' });
    } catch (error) {
      console.error("Error al suscribirse al curso: ", error);
      setSnackbar({ open: true, message: 'Hubo un error al suscribirse al curso', severity: 'error' });
    }
  };

  const handleUnsubscribe = async () => {
    const userRef = doc(firestore, 'users', currentUser.uid);
    try {
      await updateDoc(userRef, {
        courses: arrayRemove({ courseId, progress: 0 })
      });

      const userSnapshot = await getDoc(userRef);
      if (userSnapshot.exists()) {
        const userData = userSnapshot.data();
        if (!userData.courses || userData.courses.length === 0) {
          await updateDoc(userRef, {
            courses: deleteField()
          });
        }
      }

      setIsSubscribed(false);
      setSnackbar({ open: true, message: 'Se anuló la suscripción al curso', severity: 'error' });
    } catch (error) {
      console.error("Error al anular la suscripción al curso: ", error);
      setSnackbar({ open: true, message: 'Hubo un error al anular la suscripción al curso', severity: 'error' });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ open: false, message: '', severity: 'success' });
  };

  if (!course) {
    return <p>Cargando...</p>;
  }

  return (
    <Container>
      <CardMedia
        component="img"
        image={course.imageUrl || 'default-image-url'}
        alt={course.groupName}
        style={{ height: '258px', marginBottom: '1rem' }}
      />
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Typography variant="h3" gutterBottom style={{ color: '#1f2029', fontWeight: 'bold' }}>
          {course.groupName}
        </Typography>
        
      </Box>
      <Box 
        component="div"
        sx={{ 
          padding: '1.5rem',
          border: '1px solid #ccc',
          borderRadius: '8px',
          marginBottom: '1.5rem',
          backgroundColor: '#f9f9f9',
          boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
          lineHeight: 1.8,
          textAlign: 'justify'
        }}
      >
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: '#1f2029' }}>
          Descripción del Curso
        </Typography>
        <Typography variant="body1" sx={{ color: '#333', marginBottom: '1rem' }}>
          {course.groupDescription || 'Este grupo no tiene una descripción aún.'}
        </Typography>
        <Typography variant="body2" sx={{ color: '#555' }}>
          Puedes suscribirte a este grupo para obtener más información, participar en discusiones y colaborar con otros miembros.
        </Typography>
      </Box>

      {isSubscribed ? (
        <Box sx={{ marginBottom: '2rem', textAlign: 'center' }}>
          <Button 
            variant="contained" 
            sx={{ 
              backgroundColor: '#f44336', 
              color: '#fff', 
              '&:hover': {
                backgroundColor: '#d32f2f' // Red más oscuro para el hover
              }
            }} 
            onClick={handleUnsubscribe}
          >
            Salirse del curso
          </Button>
        </Box>  
      ) : (
        <Box sx={{ marginBottom: '2rem', textAlign: 'center' }}>
          <Button 
            variant="contained" 
            sx={{ 
              backgroundColor: '#181616', 
              color: '#fff',
              '&:hover': {
                backgroundColor: '#503459' 
              }
            }} 
            onClick={handleSubscribe}
          >
            Unirse al Curso
          </Button>
        </Box>
      )}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%', backgroundColor: snackbar.severity === 'success' ? '#4caf50' : '#f44336', color: '#fff' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default CourseDetail;
