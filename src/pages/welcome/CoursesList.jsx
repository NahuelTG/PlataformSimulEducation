// src/context/CoursesContext.js
import React, { createContext, useState, useEffect } from 'react';

export const CoursesContext = createContext();

export const CoursesProvider = ({ children }) => {
    const [courses, setCourses] = useState([]);

    useEffect(() => {
        // Fetch courses from an API or define them statically
        const fetchCourses = async () => {
            const response = await fetch('/api/courses');
            const data = await response.json();
            setCourses(data);
        };

        fetchCourses();
    }, []);

    return (
        <ThemeProvider theme={theme}>
        <Box mt={3} mx="auto" maxWidth={1200} px={3}>
          <Box py={2} mb={3} bgcolor="#f0f0f0" borderRadius={5} textAlign="center">
            <Typography variant="h4" gutterBottom style={{ color: '#1f2029', fontWeight: 'bold', marginTop: '7px' }}>
              Grupos Disponibles
            </Typography>
          </Box>
          <Grid container spacing={3}>
            {groups.map((group) => (
              <Grid item xs={12} sm={6} md={4} key={group.id}>
                <StyledCard onClick={() => handleCardClick(group.id)}>
                  <StyledCardMedia
                    image={group.imageUrl || 'default-image-url'}
                    title={group.groupName}
                  />
                  <CardContent>
                    <Typography gutterBottom variant="h5" component="div">
                      {group.groupName}
                    </Typography>
                  </CardContent>
                  <GroupBadge style={{ backgroundColor: '#1e293b' }}>
                    {group.groupCode}
                  </GroupBadge>
                </StyledCard>
              </Grid>
            ))}
          </Grid>
        </Box>
      </ThemeProvider>
    );
};