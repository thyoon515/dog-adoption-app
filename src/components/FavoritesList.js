// filepath: /C:/Users/tyoon/Documents/dog-adoption-app-3/src/components/FavoritesList.js
import React from 'react';
import { List, ListItem, ListItemText, Button, Typography, Box } from '@mui/material';

const FavoritesList = ({ favoriteDogs, clearFavorites, toggleFavorite }) => {
  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h5">Favorites</Typography>
      <List>
        {favoriteDogs.map((dog) => (
          <ListItem key={dog.id}>
            <ListItemText
              primary={dog.name}
              secondary={`Breed: ${dog.breed}, Age: ${dog.age}`}
            />
            <Button onClick={() => toggleFavorite(dog.id)}>Remove</Button>
          </ListItem>
        ))}
      </List>
      <Button
        variant="contained"
        color="secondary"
        onClick={clearFavorites}
        sx={{ mt: 2 }}
      >
        Clear Favorites
      </Button>
    </Box>
  );
};

export default FavoritesList;