// netlify/functions/todo.js
exports.handler = async (event, context) => {
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Hello from Netlify Function!" })
    };
  };
  
  const mongoose = require('mongoose');
const { MongoClient } = require('mongodb');

// Environment variables (use Netlify's environment variable settings for sensitive info)
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost/todoapp';

const client = new MongoClient(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

async function connectToDatabase() {
    if (!client.isConnected()) {
        await client.connect();
    }
    return client.db('todoapp');
}

// Handler function for Netlify
exports.handler = async (event) => {
    const db = await connectToDatabase();
    const todosCollection = db.collection('todos');

    try {
        if (event.httpMethod === 'GET') {
            const todos = await todosCollection.find().toArray();
            return {
                statusCode: 200,
                body: JSON.stringify(todos)
            };
        }

        if (event.httpMethod === 'POST') {
            const { task } = JSON.parse(event.body);
            const result = await todosCollection.insertOne({
                task,
                completed: false,
                createdAt: new Date(),
                completedAt: null
            });
            return {
                statusCode: 200,
                body: JSON.stringify(result.ops[0])
            };
        }

        if (event.httpMethod === 'DELETE') {
            const id = event.queryStringParameters.id;
            await todosCollection.deleteOne({ _id: new mongoose.Types.ObjectId(id) });
            return {
                statusCode: 200,
                body: JSON.stringify({ message: 'Todo deleted' })
            };
        }

        if (event.httpMethod === 'PUT') {
            const id = event.queryStringParameters.id;
            const { task, completed, completedAt } = JSON.parse(event.body);
            const result = await todosCollection.findOneAndUpdate(
                { _id: new mongoose.Types.ObjectId(id) },
                { $set: { task, completed, completedAt } },
                { returnOriginal: false }
            );
            if (!result.value) {
                return {
                    statusCode: 404,
                    body: JSON.stringify({ message: 'Todo not found' })
                };
            }
            return {
                statusCode: 200,
                body: JSON.stringify(result.value)
            };
        }

        return {
            statusCode: 405,
            body: JSON.stringify({ message: 'Method not allowed' })
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ message: error.message })
        };
    }
};
