const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const dbPath = path.join(__dirname, '..', 'db');
const verifyToken = require('../middleware/auth');
let categories = JSON.parse(fs.readFileSync(path.join(dbPath, 'categories.json'), 'utf8'));

router.get('/', (req, res) => {
  res.json(categories);
});

router.post('/', verifyToken, (req, res) => {
    const newCategory = {
        id: categories.length > 0 ? Math.max(...categories.map(c => c.id)) + 1 : 1,
        name: req.body.name,
        active: req.body.active !== undefined ? req.body.active : true
    };
    categories.push(newCategory);
    fs.writeFileSync(path.join(dbPath, 'categories.json'), JSON.stringify(categories, null, 2));
    res.status(201).json(newCategory);
});

router.patch('/:id', verifyToken, (req, res) => {
    const category = categories.find(c => c.id === parseInt(req.params.id));
    if (!category) {
        return res.status(404).json({ message: 'Category not found' });
    }
    category.name = req.body.name !== undefined ? req.body.name : category.name;
    category.active = req.body.active !== undefined ? req.body.active : category.active;
    fs.writeFileSync(path.join(dbPath, 'categories.json'), JSON.stringify(categories, null, 2));
    res.json(category);
});

router.delete('/:id', verifyToken, (req, res) => {
    const categoryIndex = categories.findIndex(c => c.id === parseInt(req.params.id));
    if (categoryIndex === -1) {
        return res.status(404).json({ message: 'Category not found' });
    }
    categories.splice(categoryIndex, 1);
    fs.writeFileSync(path.join(dbPath, 'categories.json'), JSON.stringify(categories, null, 2));
    res.status(204).send();
});


module.exports = router;
