const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Express app setup
const app = express();
app.use(express.json());
app.use(cors());

// MongoDB Connection
mongoose.connect('mongodb://localhost/todoapp', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => {
        console.log('MongoDB connected');
    })
    .catch((error) => {
        console.log('MongoDB connection failed:', error.message);
    });

// Mongoose Schema for Todo
const TodoSchema = new mongoose.Schema({
    task: { type: String, required: true },
    completed: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    completedAt: { type: Date, default: null }
});
const Todo = mongoose.model('Todo', TodoSchema);

// API Routes
// 1. Get all todos
app.get('/todos', async (req, res) => {
    try {
        const todos = await Todo.find();
        res.json(todos);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 2. Create new todo
app.post('/todos', async (req, res) => {
    try {
        const newTodo = new Todo({
            task: req.body.task
        });
        await newTodo.save();
        res.json(newTodo);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// 3. Delete todo
app.delete('/todos/:id', async (req, res) => {
    try {
        await Todo.findByIdAndDelete(req.params.id);
        res.json({ message: 'Todo deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 4. Update todo
app.put('/todos/:id', async (req, res) => {
    try {
        const todo = await Todo.findByIdAndUpdate(
            req.params.id, 
            { task: req.body.task, completed: req.body.completed, completedAt: req.body.completedAt },
            { new: true }
        );
        
        if (!todo) {
            return res.status(404).json({ message: 'Todo not found' });
        }
        res.json(todo);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});



// Start the server
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
