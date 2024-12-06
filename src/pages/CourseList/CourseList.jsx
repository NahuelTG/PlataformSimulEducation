import React, { useEffect } from 'react';
import { collection, getDocs } from "firebase/firestore";
import { firestore } from '../../connection/firebaseConfig';
import { useNavigate } from 'react-router-dom';

const CourseList = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      const querySnapshot = await getDocs(collection(firestore, "clases"));
      const coursesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Redirige automáticamente al primer curso si hay datos
      if (coursesData.length > 0) {
        navigate(`/Admin/edit-course/${coursesData[0].id}`);
      } else {
        console.warn("No hay cursos disponibles para redirigir.");
      }
    };

    fetchCourses();
  }, [navigate]);

  return null; // No renderiza nada en pantalla
};

export default CourseList;