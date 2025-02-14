import React, { useState, useEffect } from 'react';
import {
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  Pagination,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Checkbox,
  Button,
} from '@mui/material';
import axios from 'axios';
import { API_BASE_URL } from '../services/api';
import FavoritesList from './FavoritesList';

const SearchPage = () => {
  const [breeds, setBreeds] = useState([]); // All available breeds
  const [selectedBreed, setSelectedBreed] = useState(''); // Selected breed for filtering
  const [dogs, setDogs] = useState([]); // List of dogs fetched from the API for the current page
  const [page, setPage] = useState(1); // Current page for pagination
  const [total, setTotal] = useState(0); // Total number of dogs for pagination
  const [favorites, setFavorites] = useState(() => {
    // Retrieve favorites from localStorage if available
    const savedFavorites = localStorage.getItem('favorites');
    return savedFavorites ? JSON.parse(savedFavorites) : [];
  }); // List of favorited dog IDs (persists across pages)
  const [favoriteDogs, setFavoriteDogs] = useState([]); // List of full dog objects for favorites
  const [matchedDog, setMatchedDog] = useState(null); // The matched dog object
  const [sortOrder, setSortOrder] = useState('breed:asc'); // Default sort order

  // Fetch all breeds on component mount
  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/dogs/breeds`, { withCredentials: true })
      .then((response) => setBreeds(response.data))
      .catch((error) => console.error('Error fetching breeds:', error));
  }, []);

  // Fetch dogs based on selected breed, pagination, and sort order
  useEffect(() => {
    const fetchDogs = async () => {
      try {
        const params = {
          size: 10, // Number of results per page
          from: (page - 1) * 10, // Pagination offset
          sort: sortOrder, // Sort order (e.g., "breed:asc" or "breed:desc")
        };

        // Only include the breeds parameter if a specific breed is selected
        if (selectedBreed) {
          params.breeds = [selectedBreed];
        }

        const response = await axios.get(`${API_BASE_URL}/dogs/search`, {
          params,
          withCredentials: true,
        });
        setDogs(response.data.resultIds); // Store dog IDs for the current page
        setTotal(response.data.total);
      } catch (error) {
        console.error('Error fetching dogs:', error);
      }
    };

    fetchDogs();
  }, [selectedBreed, page, sortOrder]); // Re-fetch when breed, page, or sort order changes

  // Fetch full dog details for the fetched dog IDs
  useEffect(() => {
    const fetchDogDetails = async () => {
      if (dogs.length > 0) {
        try {
          const response = await axios.post(`${API_BASE_URL}/dogs`, dogs, {
            withCredentials: true,
          });
          setDogs(response.data); // Replace IDs with full dog objects
        } catch (error) {
          console.error('Error fetching dog details:', error);
        }
      }
    };

    fetchDogDetails();
  }, [dogs]);

  // Fetch full details for favorite dogs
  useEffect(() => {
    const fetchFavoriteDogs = async () => {
      if (favorites.length > 0) {
        try {
          const response = await axios.post(`${API_BASE_URL}/dogs`, favorites, {
            withCredentials: true,
          });
          setFavoriteDogs(response.data); // Store full dog objects for favorites
        } catch (error) {
          console.error('Error fetching favorite dog details:', error);
        }
      } else {
        setFavoriteDogs([]);
      }
    };

    fetchFavoriteDogs();
  }, [favorites]);

  // Toggle a dog's favorite status
  const toggleFavorite = (dogId) => {
    setFavorites((prevFavorites) => {
      const updatedFavorites = prevFavorites.includes(dogId)
        ? prevFavorites.filter((id) => id !== dogId) // Remove if already favorited
        : [...prevFavorites, dogId]; // Add to favorites

      // Save updated favorites to localStorage
      localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
      return updatedFavorites;
    });
  };

  // Clear all favorites
  const clearFavorites = () => {
    setFavorites([]);
    localStorage.removeItem('favorites'); // Remove favorites from localStorage
  };

  // Generate a match from the favorited dogs
  const generateMatch = async () => {
    if (favorites.length === 0) {
      alert('Please select at least one dog to generate a match.');
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/dogs/match`, favorites, {
        withCredentials: true,
      });
      const matchedDogId = response.data.match;

      // Fetch the matched dog's details
      const matchedDogResponse = await axios.post(`${API_BASE_URL}/dogs`, [matchedDogId], {
        withCredentials: true,
      });
      setMatchedDog(matchedDogResponse.data[0]);
    } catch (error) {
      console.error('Error generating match:', error);
    }
  };

  // Handle sort order change
  const handleSortChange = (event) => {
    setSortOrder(event.target.value);
  };

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" gutterBottom>
        Search Dogs
      </Typography>

      {/* Breed Filter */}
      <Select
        value={selectedBreed}
        onChange={(e) => setSelectedBreed(e.target.value)}
        displayEmpty
        fullWidth
        sx={{ mb: 2 }}
      >
        <MenuItem value="">All Breeds</MenuItem>
        {breeds.map((breed) => (
          <MenuItem key={breed} value={breed}>
            {breed}
          </MenuItem>
        ))}
      </Select>

      {/* Sort Order Dropdown */}
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Sort By</InputLabel>
        <Select value={sortOrder} onChange={handleSortChange} label="Sort By">
          <MenuItem value="breed:asc">Breed (A-Z)</MenuItem>
          <MenuItem value="breed:desc">Breed (Z-A)</MenuItem>
        </Select>
      </FormControl>

      {/* Dog List */}
      <List>
        {dogs.map((dog) => (
          <ListItem key={dog.id}>
            <Checkbox
              checked={favorites.includes(dog.id)}
              onChange={() => toggleFavorite(dog.id)}
            />
            <ListItemText
              primary={dog.name}
              secondary={`Breed: ${dog.breed}, Age: ${dog.age}, Location: ${dog.zip_code}`}
            />
            <img src={dog.img} alt={dog.name} style={{ width: 100, height: 100 }} />
          </ListItem>
        ))}
      </List>

      {/* Pagination */}
      <Pagination
        count={Math.ceil(total / 10)}
        page={page}
        onChange={(e, value) => setPage(value)}
        sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}
      />

      {/* Favorites Section */}
      <FavoritesList
        favoriteDogs={favoriteDogs}
        clearFavorites={clearFavorites}
        toggleFavorite={toggleFavorite}
      />

      {/* Generate Match Button */}
      <Button
        variant="contained"
        color="primary"
        onClick={generateMatch}
        sx={{ mt: 2 }}
      >
        Generate Match
      </Button>

      {/* Display Matched Dog */}
      {matchedDog && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5">Your Match</Typography>
          <ListItem>
            <ListItemText
              primary={matchedDog.name}
              secondary={`Breed: ${matchedDog.breed}, Age: ${matchedDog.age}`}
            />
            <img src={matchedDog.img} alt={matchedDog.name} style={{ width: 100, height: 100 }} />
          </ListItem>
        </Box>
      )}
    </Box>
  );
};

export default SearchPage;