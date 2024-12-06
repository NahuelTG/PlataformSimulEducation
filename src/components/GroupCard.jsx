import React from 'react';
import { Card, CardContent, CardActions, Typography, Button, Box, useMediaQuery, useTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const GroupCard = ({ group, onEdit, onDelete }) => {
    const navigate = useNavigate();
    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

    return (
        <Card sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            padding: 2,
            bgcolor: 'white',
            boxShadow: 3,
            borderRadius: 2
        }}>
            <CardContent sx={{ flex: 1 }}>
                {group.imageUrl && (
                    <Box
                        component="img"
                        src={group.imageUrl}
                        alt={group.groupName}
                        sx={{
                            width: '100%',
                            height: 200,
                            objectFit: 'cover',
                            borderRadius: '4px',
                            mb: 2,
                        }}
                    />
                )}
                <Typography variant="h6" gutterBottom>
                    {group.groupName}
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    marginBottom: 1,
                }}>
                    {group.groupDescription}
                </Typography>
            </CardContent>
            <CardActions
                sx={{
                    display: 'flex',
                    flexDirection: isSmallScreen ? 'column' : 'row',
                    gap: 1,
                    padding: 1,
                    justifyContent: 'space-between',
                }}
            >
                <Button
                    variant="contained"
                    sx={{
                        backgroundColor: 'black',
                        color: 'white',
                        flex: 1,
                        width: isSmallScreen ? '100%' : 'auto',
                        '&:hover': {
                            backgroundColor: 'darkgray',
                        },
                        textTransform: 'none',
                        marginBottom: isSmallScreen ? 1 : 0,
                    }}
                    onClick={() => onEdit(group)}
                >
                    Editar
                </Button>
                <Button
                    variant="contained"
                    sx={{
                        backgroundColor: 'black',
                        color: 'white',
                        flex: 1,
                        width: isSmallScreen ? '100%' : 'auto',
                        '&:hover': {
                            backgroundColor: 'darkgray',
                        },
                        textTransform: 'none',
                        marginBottom: isSmallScreen ? 1 : 0,
                    }}
                    onClick={() => onDelete(group.id)}
                >
                    Eliminar
                </Button>
                <Button
                    variant="contained"
                    sx={{
                        backgroundColor: 'black',
                        color: 'white',
                        flex: 1,
                        width: isSmallScreen ? '100%' : 'auto',
                        '&:hover': {
                            backgroundColor: 'darkgray',
                        },
                        textTransform: 'none',
                    }}
                    onClick={() => navigate(`/Admin/groups/${group.id}/tasks`)}
                >
                    Ver Tareas
                </Button>
            </CardActions>
        </Card>
    );
};

export default GroupCard;
