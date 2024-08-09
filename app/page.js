"use client"
import { firestore } from '@/firebase';
import {Box, Typography, Stack, Button, Modal, TextField, Select, MenuItem, FormControl, InputLabel, Grid} from '@mui/material'
import { Firestore, getDoc, query, collection, getDocs, setDoc, doc, deleteDoc  } from 'firebase/firestore';
import { useEffect, useState } from 'react';

// import { IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import IconButton from '@mui/material/IconButton';

import bg from './images/pantry.jpg'

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: '#C4A484',
  // border: '2px solid #000',
  boxShadow: 24,
  pt: 2,
  px: 4,
  pb: 3,
  display: 'flex',
  flexDirection: 'column',
  gap: 3,
  // opacity: 0.5
  // color: '#774E3A'
  borderRadius: '10px'
};

export default function Home() {
  const [pantry, setPantry] = useState([])

  const [open, setOpen] = useState(false)
  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [isUpdate, setIsUpdate] = useState(false); // New state to handle update mode
  const [searchQuery, setSearchQuery] = useState('');

  // function to update items 
  const updatePantry = async () => {
    const snapshot = query(collection(firestore, 'pantry'));
    const docs = await getDocs(snapshot);
    const pantryList = [];
    
    docs.forEach((doc) => {
      pantryList.push({ name: doc.id, ...doc.data() });
    });
    
    // Sorting items
    pantryList.sort((a, b) => {
      if (!a.expiryDate) return 1; 
      if (!b.expiryDate) return -1;
      return new Date(a.expiryDate) - new Date(b.expiryDate);
    });
    
    // Filter items based on search query
    const filteredPantry = pantryList.filter(item =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    setPantry(filteredPantry);
  };

  // function to add items
  const addItem = async ({ name, count, unit, expiryDate }) => {
    const docRef = doc(collection(firestore, 'pantry'), name);
    const docSnap = await getDoc(docRef);
  
    if (docSnap.exists()) {
      // Prepare updated data with the new values
      const updatedData = {
        count: count,
        unit: unit !== undefined && unit !== '' ? unit : '',
        expiryDate: expiryDate !== undefined && expiryDate !== '' ? expiryDate : ''
      };
  
      // Update the document with the new data, overwriting existing data
      await setDoc(docRef, updatedData, { merge: false });
  
      console.log(`Updated item '${name}' with data:`, updatedData);
    } else {
      // Add new item with all fields
      await setDoc(docRef, {
        count: count,
        unit: unit,
        expiryDate: expiryDate
      });
  
      console.log(`Added new item '${name}' with data:`, { count, unit, expiryDate });
    }
  
    // Refresh the pantry list
    await updatePantry();
  }
  
  useEffect(() => {
    updatePantry();
  }, [searchQuery]);  // Add searchQuery as a dependency
  
  // function to remove items 
  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, 'pantry'), item)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      const {count} = docSnap.data()
      if (count === 1){
        await deleteDoc(docRef)
      } else {
        await setDoc(docRef, {count: count - 1})
      }
    }
    await updatePantry()
  }

  // function to add or update items
  const handleSave = async () => {
    if (itemName && quantity) {
      const count = parseInt(quantity, 10);
      const updatedItem = {
        name: itemName,
        count: count,
        unit: unit || '',
        expiryDate: expiryDate || ''
      };
  
      if (isUpdate) {
        await addItem(updatedItem); // This will overwrite the existing item with new values
      } else {
        await addItem(updatedItem); // This will add a new item
      }
    }
  
    // Clear form and close dialog
    setItemName('');
    setQuantity('');
    setUnit('');
    setExpiryDate('');
    setIsUpdate(false);
    handleClose();
  }
  
  

  // function to delete items
  const handleDelete = async () => {
    const docRef = doc(collection(firestore, 'pantry'), itemName);
  
    try {
      // Delete the document from Firestore
      await deleteDoc(docRef);
      console.log(`Deleted item '${itemName}'`);
  
      // Refresh the pantry list
      await updatePantry();
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  
    // Clear form and close dialog
    setItemName('');
    setQuantity('');
    setUnit('');
    setExpiryDate('');
    setIsUpdate(false);
    handleClose();
  }
  

  return (
    <Box 
    width="200vh" 
    height="100vh"
    display={'flex'}
    justifyContent={'center'}
    flexDirection={'column'}
    alignItems={'center'}
    gap={2}
    borderRadius={2}
    // bgcolor={'red'}
    sx={{
      backgroundImage: `url(${bg.src})`,
      backgroundSize: 'cover', // To cover the entire Box
      backgroundPosition: 'center', // Center the image
    }}
    >
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            {isUpdate ? 'Update Item' : 'Add Item'}
          </Typography>
          <Stack width='100%' direction={'column'} spacing={2}>
            <TextField 
              id="outlined-basic" 
              label="Item" 
              variant='outlined' 
              fullWidth
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}  
              disabled={isUpdate} // Disable if updating
            />
            <TextField 
              label="Quantity" 
              variant="outlined" 
              fullWidth 
              value={quantity} 
              onChange={(e) => setQuantity(e.target.value)} 
            />
            
            <FormControl fullWidth>
              <InputLabel id="unit-label">Unit</InputLabel>
              <Select
                labelId="unit-label"
                id="unit-select"
                value={unit}
                label="Unit"
                onChange={(e) => setUnit(e.target.value)}
              >
                <MenuItem value="Grams">Grams</MenuItem>
                <MenuItem value="Kgs">Kgs</MenuItem>
                <MenuItem value="Liters">Liters</MenuItem>
                <MenuItem value="Units">Units</MenuItem>
                <MenuItem value="Bundles">Bundles</MenuItem>
                <MenuItem value="Dozens">Dozens</MenuItem>
              </Select>
            </FormControl>

            <TextField 
              label="Expiry Date" 
              type="date" 
              variant="outlined" 
              fullWidth 
              InputLabelProps={{ shrink: true }}
              value={expiryDate} 
              onChange={(e) => setExpiryDate(e.target.value)} 
              inputProps={{ min: new Date().toISOString().split('T')[0] }}  
            />
            <Stack direction="row" spacing={2}>
              <Button variant='outlined' onClick={handleSave}>
                {isUpdate ? 'Update' : 'Add'}
              </Button>
              {isUpdate && (
                <Button variant='outlined' color='error' onClick={handleDelete}>
                  Delete
                </Button>
              )}
            </Stack>
          </Stack>
        </Box>
      </Modal>



      <Button variant='contained' onClick={handleOpen} sx={{ width: '200px', padding:'10px', fontSize: '1.5rem', backgroundColor: '#774E3A', '&:hover': {
      backgroundColor: '#281B13'}}}>+ Add Item</Button>
      {/* <Button variant='contained' onClick={() => removeItem(item.name)} sx={{ maxWidth: '250px', padding:'12px'}}>Remove</Button> */}
      <Box border={'2px solid #5C4033'} borderRadius={4}>
      
      <Box 
        width="1600px" 
        height="auto" 
        // bgcolor={'#000000'} 
        paddingY={2}
        paddingX={2}
        overflow={'hidden'} // Ensure no overflow
        borderRadius={4}
        bgcolor={'rgba(255, 255, 255, 0.5)'}
      >
        <Typography 
          variant='h2' 
          textAlign={'center'} 
          marginBottom={2} 
          sx={{ 
            color: '#5C4033', 
            opacity: 1,
            fontWeight: 'bold'
          }}
        >
          Pantry Items
        </Typography>
        <TextField 
          label="Search Items" 
          variant="outlined" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ 
            width: '95%',
            // bgcolor: 'rgba(255, 255, 255, 0.5)', // Correctly use bgcolor here
            // '& .MuiOutlinedInput-root': { // Target the input root
            //   bgcolor: 'rgba(255, 255, 255, 0.5)', // Apply the same background color to the input field
            // }
          }}
        />
        
        <Button 
          onClick={updatePantry}
          sx={{ 
            width: '50px', 
            height: '55px', 
            backgroundColor: '#774E3A', 
            '&:hover': { backgroundColor: '#281B13' },
            marginLeft: '5px'
          }}
        >
          <SearchIcon sx={{ fontSize: '2rem', color: 'white' }} />
        </Button>

        {/* Column Headers */}
        <Grid container spacing={2} paddingY={1} paddingX={2} marginBottom={1}>
          <Grid item xs={3}>
            <Typography variant='h6' color={'#5C4033'} fontSize="1.5rem" fontWeight="1000" textAlign={'center'}>
              Item
            </Typography>
          </Grid>
          <Grid item xs={2}>
            <Typography variant='h6' color={'#5C4033'} fontSize="1.5rem" fontWeight="bold" textAlign={'center'}>
              Quantity
            </Typography>
          </Grid>
          <Grid item xs={2}>
            <Typography variant='h6' color={'#5C4033'} fontSize="1.5rem" fontWeight="bold" textAlign={'center'}>
              Unit
            </Typography>
          </Grid>
          <Grid item xs={3}>
            <Typography variant='h6' color={'#5C4033'} fontSize="1.5rem" fontWeight="bold" textAlign={'center'}>
              Expiry Date
            </Typography>
          </Grid>
        </Grid>


        {/* Pantry Items */}
        <Stack spacing={1} overflow={'hidden'} paddingX={2}>
          {pantry.map((item) => (
          <Grid container spacing={0} key={item.name} alignItems={'center'}>
              <Grid item xs={3}>
                <Box
                  width="90%"
                  minHeight="50px"
                  display={'flex'}
                  alignItems={'center'}
                  // bgcolor={'#f0f0f0'}
                  paddingX={2}
                  textAlign={'center'}
                  justifyContent={'center'}
                  borderRadius={2}
                  marginLeft={3}
                >
                  <Typography variant='h6' color={'#333'} sx={{fontWeight: 700}}>
                    {item.name.charAt(0).toUpperCase() + item.name.slice(1)}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={2}>
                <Box
                  width="90%"
                  minHeight="50px"
                  display={'flex'}
                  alignItems={'center'}
                  // bgcolor={'#f0f0f0'}
                  paddingX={2}
                  textAlign={'center'}
                  justifyContent={'center'}
                  borderRadius={2}
                  marginLeft={2}
                  marginRight={2}
                >
                  <Typography variant='h6' color={'#333'} sx={{fontWeight: 700}}>
                    {item.count}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={2}>
                <Box
                  width="90%"
                  minHeight="50px"
                  display={'flex'}
                  alignItems={'center'}
                  // bgcolor={'#f0f0f0'}
                  paddingX={2}
                  textAlign={'center'}
                  justifyContent={'center'}
                  borderRadius={2}
                  marginLeft={2.5}
                  marginRight={2}
                >
                  <Typography variant='h6' color={'#333'} sx={{fontWeight: 700}}>
                    {item.unit}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={3}>
                <Box
                  width="90%"
                  minHeight="50px"
                  display={'flex'}
                  alignItems={'center'}
                  // bgcolor={'#f0f0f0'}
                  paddingX={2}
                  textAlign={'center'}
                  justifyContent={'center'}
                  // bgcolor={'white'}
                  borderRadius={2}
                  marginLeft={3}
                >
                  <Typography variant='h6' color={'#333'} sx={{fontWeight: 700}}>
                    {item.expiryDate}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={1}>
                <Box display="flex" justifyContent="flex-start" alignItems="center">
                  <Button 
                    variant='contained' 
                    onClick={() => {
                      setItemName(item.name);
                      setQuantity(item.count.toString());
                      setUnit(item.unit);
                      setExpiryDate(item.expiryDate);
                      setIsUpdate(true); // Set to true for update mode
                      handleOpen();
                    }} 
                    sx={{ maxWidth: '100px', padding: '13px', paddingX: 5, marginLeft: 4, marginRight: 2,backgroundColor: '#774E3A', '&:hover': {
                      backgroundColor: '#281B13'} }}
                  >
                    <EditIcon />
                  </Button>
                  <Button 
                    variant='contained' 
                    onClick={() => removeItem(item.name)} 
                    sx={{ maxWidth: '100px', padding: '13px', marginLeft: 5, paddingX: 5, backgroundColor: '#774E3A', '&:hover': {
                      backgroundColor: '#281B13'} }} // Adds space to the right of the Remove button
                  >
                    <DeleteIcon />
                  </Button>
                  
                </Box>
              </Grid>

            </Grid>
          ))}
        </Stack>



      </Box>

      </Box>
    </Box>
  );
}
