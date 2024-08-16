const { MongoClient } = require('mongodb');
const express = require('express');
const bodyParser = require('body-parser');
const ObjectId = require('mongodb').ObjectId;

const app = express();

app.use(bodyParser.json());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    );
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');
  
    next();
  });
// Connection URL
const url = 'your db url';
const client = new MongoClient(url);

// Database Name
const dbName = 'myProject';

  // Use connect method to connect to the server
  client.connect()
  .then(() => {
    app.listen(5000);
  })
    
  console.log('Connected successfully to server');
  const db = client.db(dbName);
  const collection = db.collection('events');

  app.get('/api/v3/app/events', async (req, res,next) => {
    
    const { type, limit, page } = req.query;
     if(!page){
        next();
    }
    else {
        // Validate query parameters
    const pageNumber = parseInt(page, 10) ; 
    const pageSize = parseInt(limit, 10);

    if (pageNumber < 1 || pageSize < 1) {
        return res.status(400).send({ error: 'Invalid pagination parameters' });
    }

    try {
        // Build the query and sort order
        const query = {};
        const sort = {};

        // Determine sorting based on 'type' parameter
        if (type === 'latest') {
            sort.schedule = -1; // Sort by most recent event date
        } else {
            sort.schedule = -1; // Default to sorting by schedule in descending order
        }

        // Fetch paginated results
        const events = await collection
            .find(query)
            .sort(sort)
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize)
            .toArray();

        // Get the total count for pagination metadata
        const totalCount = await collection.countDocuments(query);

        res.status(200).json({
            page: pageNumber,
            limit: pageSize,
            total: totalCount,
            totalPages: Math.ceil(totalCount / pageSize),
            events
        });
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).send({ error: 'An error occurred while fetching events' });
    }
    }
});

  app.get("/api/v3/app/events",async(req,res)=>{
    const id=req.query.id;//find id from query params
    try {
        const filteredDocs = await collection.find({ _id: new ObjectId(id) }).toArray();//find document based on given query
    console.log('Found documents filtered by unique event id =>', filteredDocs);
    res.send(filteredDocs);
    } catch (error) {
        console.log(error);
    }
    
    })

    app.post("/api/v3/app/events",async(req,res)=>{
        const data=req.body;//fetch data from the body
        const insertResult = await collection.insertOne(data);//insert into collection
        console.log('Inserted documents =>', insertResult);
        res.send(data);
        return insertResult.insertedId;//Creates an event and returns the Id of the event
    })
    
    
    app.put("/api/v3/app/events/:id",async(req,res)=>{
        const id=(req.params.id);
        const data=req.body;
        const updateResult = await collection.updateOne({ _id: new ObjectId(id)}, { $set: data });
        console.log('Updated documents =>', updateResult);
        res.send(data)
    })

    app.delete("/api/v3/app/events/:id",async(req,res)=>{
        const id=(req.params.id);
        const deleteResult = await collection.deleteOne({ _id: new ObjectId(id) });
    console.log('Deleted documents =>', deleteResult);
    res.send("deleted")
    })

  