//https://medium.com/yom-ai/rest-api-with-node-js-and-elasticsearch-1368cf9df02a

// create the API
//express router object
// elsticsearch client that will connect to our local server

const express = require("express");
//Se instancia el objecto enrutador de express
const router = express.Router();
//importa el cliente oficial de elasticseach
const elastic = require("elasticsearch");
//permite leer json en POST request
const bodyParser = require("body-parser").json();
//Se crea una instancia del cliente de elasticsearch,
//que se conecta a localhost en el puerto 9200
const elasticClient = elastic.Client({
  host: "https://elastic:6_hauEcbCx0=VIaax8XV@localhost:9200",
  requestTimeout: 1000 * 60 * 60,
  keepAlive: false,
});

let productos = [
  {
    sku: "1",
    name: "Sillón 3 cuerpos",
    categories: ["sillon", "sofa", "muebles", "living", "cuero"],
    description: "Hermoso sillón de cuero de 3 cuerpos",
  },
  {
    sku: "2",
    name: "Sillón 2 cuerpos",
    categories: ["sillon", "sofa", "muebles", "living", "ecocuero"],
    description: "Hermoso sillón de ecocuero de 2 cuerpos",
  },
  {
    sku: "3",
    name: "Mesa de comedor redonda de vidrio",
    categories: ["mesa", "comedor", "vidrio"],
    description: "Moderna mesa de 110 cm de radio",
  },
];

//finding out the errors in the better way
router.use((req, res, next) => {
  elasticClient
    .index({
      index: "logs",
      body: {
        url: req.url,
        method: req.method,
      },
    })
    .then((res) => {
      console.log("Logs indexed");
    })
    .catch((err) => {
      console.log(err);
    });
  next();
});

//CRUD endpoint of our rest api ,
//post api for creating index
//At this point we will expose the POST endpoint that creates a product, which receives a body with the data to save. The function of the elasticsearch client that takes care of this is index, and it receives as minimum parameters the index (equivalent to collection or table) and the body of the data to be saved.
router.post("/products", bodyParser, (req, res) => {
  elasticClient
    .index({
      index: "products",
      body: req.body,
    })
    .then((resp) => {
      return res.status(200).json({
        msg: "product indexed",
      });
    })
    .catch((err) => {
      return res.status(500).json({
        msg: "Error",
        err,
      });
    });
});

//get api - for getting specific product id
//Later we can see the GET endpoint that returns a product with a particular id, the one specified in req.params.id. It should be noted that the id to be sent is the one given by elasticsearch. In this case the function of elasticsearch used is get, and it receives the index and the id of the document that is searched.

router.get("/products/:id", (req, res) => {
  let query = {
    index: "products",
    id: req.params.id,
  };
  elasticClient
    .get(query)
    .then((resp) => {
      if (!resp) {
        return res.status(404).json({
          product: resp,
        });
      }
      return res.status(200).json({
        product: resp,
      });
    })
    .catch((err) => {
      return res.status(500).json({
        msg: "Error not found",
        err,
      });
    });
});

//put api to update specific document based on id
//Then we have the endpoint PUT, which updates a specific document based on the id it has in elasticsearch, this function receives the index, the id, and the content to be updated.
router.put("/products/:id", bodyParser, (req, res) => {
  elasticClient
    .update({
      index: "products",
      id: req.params.id,
      body: {
        doc: req.body,
      },
    })
    .then((resp) => {
      return res.status(200).json({
        msg: "product updated",
      });
    })
    .catch((err) => {
      console.log(err);
      return res.status(500).json({
        msg: "Error",
        err,
      });
    });
});

//delete api to delete specific id from the document
//The penultimate place we have the endpoint DELETE, which receives the id of the document to be deleted.
router.delete("/products/:id", (req, res) => {
  elasticClient
    .delete({
      index: "products",
      id: req.params.id,
    })
    .then((resp) => {
      res.status(200).json({
        msg: "Product deleted",
      });
    })
    .catch((err) => {
      res.status(404).json({
        msg: "Error",
      });
    });
});

//get endpoint without a particular id
//And we have saved the best for last, the GET endpoint without a particular id. Why do we say it’s the best? Because here we can see in action the power and speed of elasticsearch. This endpoint has the option to receive a query string found in req.query, which if it exists will perform a text search in elasticsearch in all the fields of the index and return the documents that match the search. In case it doesn’t receive the query string it will simply return all the documents in that index.
router.get("/products", (req, res) => {
  let query = {
    index: "products",
  };
  if (req.query.product) query.q = `*${req.query.product}*`;
  elasticClient
    .search(query)
    .then((resp) => {
      return res.status(200).json({
        products: resp.hits.hits,
      });
    })
    .catch((err) => {
      console.log(err);
      return res.status(500).json({
        msg: "Error",
        err,
      });
    });
});

//post users details
router.post("/users", bodyParser, (req, res) => {
  elasticClient
    .index({
      index: "users",
      body: req.body,
    })
    .then((resp) => {
      return res.status(200).json({
        msg: "users indexed",
      });
    })
    .catch((err) => {
      return res.status(500).json({
        msg: "Error",
        err,
      });
    });
});
//get users details
router.get("/users", (req, res) => {
  let query = {
    index: "users",
  };
  if (req.query.users) query.q = `*${req.query.users}*`;
  elasticClient
    .search(query)
    .then((resp) => {
      return res.status(200).json({
        users: resp.hits.hits,
      });
    })
    .catch((err) => {
      console.log(err);
      return res.status(500).json({
        msg: "Error",
        err,
      });
    });
});

//post login details
router.post("/login", bodyParser, (req, res) => {
  let query = {
    index: "users",
    id: req.body.id,
  };
  if (!req.body.password || !req.body.id) {
    return res.status(400).json({
      msg: "invalid body request",
    });
  } else {
    elasticClient
      .get(query)
      .then((resp) => {
        if (resp._source.password === req.body.password) {
          return res.status(200).json({
            msg: "login successfully",
          });
        } else {
          return res.status(401).json({
            msg: "invalid password , please try again !",
          });
        }
      })

      .catch((err) => {
        console.log(err);
        return res.status(500).json({
          msg: "Error",
          err,
        });
      });
  }
});

module.exports = router;
