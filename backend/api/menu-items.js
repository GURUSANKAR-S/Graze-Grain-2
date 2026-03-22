const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const dbPath = path.join(__dirname, '..', 'db');
const verifyToken = require('../middleware/auth');
const multer = require('multer');

// Set up multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '..', '..', 'public', 'images'));
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage });

let menuItems = JSON.parse(fs.readFileSync(path.join(dbPath, 'menu-items.json'), 'utf8'));

router.get('/', (req, res) => {
  res.json(menuItems);
});

router.get('/:id', (req, res) => {
    const menuItem = menuItems.find(item => item.id === parseInt(req.params.id));
    if (menuItem) {
        res.json(menuItem);
    } else {
        res.status(404).json({ message: 'Menu item not found' });
    }
});

router.post('/', verifyToken, upload.single('image'), (req, res) => {
    const newMenuItem = {
        id: menuItems.length > 0 ? Math.max(...menuItems.map(item => item.id)) + 1 : 1,
        name: req.body.name,
        description: req.body.description,
        price: parseFloat(req.body.price),
        categoryId: parseInt(req.body.categoryId),
        image: req.file ? `/images/${req.file.filename}` : '',
        availability: req.body.availability !== undefined ? req.body.availability === 'true' : true
    };
    menuItems.push(newMenuItem);
    fs.writeFileSync(path.join(dbPath, 'menu-items.json'), JSON.stringify(menuItems, null, 2));
    res.status(201).json(newMenuItem);
});

router.patch('/:id', verifyToken, upload.single('image'), (req, res) => {
    const menuItem = menuItems.find(item => item.id === parseInt(req.params.id));
    if (!menuItem) {
        return res.status(404).json({ message: 'Menu item not found' });
    }

    menuItem.name = req.body.name !== undefined ? req.body.name : menuItem.name;
    menuItem.description = req.body.description !== undefined ? req.body.description : menuItem.description;
    menuItem.price = req.body.price !== undefined ? parseFloat(req.body.price) : menuItem.price;
    menuItem.categoryId = req.body.categoryId !== undefined ? parseInt(req.body.categoryId) : menuItem.categoryId;
    menuItem.availability = req.body.availability !== undefined ? req.body.availability === 'true' : menuItem.availability;
    
    if (req.file) {
        // Delete old image if it exists
        if (menuItem.image) {
            const oldImagePath = path.join(__dirname, '..', '..', 'public', menuItem.image);
            if (fs.existsSync(oldImagePath)) {
                fs.unlinkSync(oldImagePath);
            }
        }
        menuItem.image = `/images/${req.file.filename}`;
    }

    fs.writeFileSync(path.join(dbPath, 'menu-items.json'), JSON.stringify(menuItems, null, 2));
    res.json(menuItem);
});

router.delete('/:id', verifyToken, (req, res) => {
    const menuItemIndex = menuItems.findIndex(item => item.id === parseInt(req.params.id));
    if (menuItemIndex === -1) {
        return res.status(404).json({ message: 'Menu item not found' });
    }

    const menuItem = menuItems[menuItemIndex];
    // Delete image if it exists
    if (menuItem.image) {
        const imagePath = path.join(__dirname, '..', '..', 'public', menuItem.image);
        if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
        }
    }

    menuItems.splice(menuItemIndex, 1);
    fs.writeFileSync(path.join(dbPath, 'menu-items.json'), JSON.stringify(menuItems, null, 2));
    res.status(204).send();
});


module.exports = router;
