const express = require("./node_modules/express");
const bodyParser = require("./node_modules/body-parser");
const bunyan = require("./node_modules/bunyan");
const logger = require("./logger");
const Courier = require("./models/courier");

const app = express();
app.use(bodyParser.json());

app.use(
  bodyParser.urlencoded({
    extended: true
  })
);

app.post("/couriers", async function(req, res) {
  const { max_capacity, id } = req.body;
  try {
    const couriers = await Courier.find({ id });

    if (couriers.length > 0) {
      logger.error("Courier found in the system 409");
      res
        .status(409)
        .json({ resource: req.body, msg: "Conflict resource exists" });
    } else {
      let courier = Courier({ max_capacity, id, packages: [] });
      await courier.save();
      logger.info("Courier created", { courier });
      res.status(201).json({ resource: req.body, msg: "Resource created" });
    }
  } catch (error) {
    logger.error("Server error creating resource", error);
    res.status(500).json({ msg: "Internal Server Error" });
  }
});

app.put("/couriers/:id", async function(req, res) {
  try {
    const courier = await Courier.findOne({ id: req.params.id });
    if (courier) {
      courier.id = req.params.id;
      courier.max_capacity = req.body.max_capacity;
      await courier.save();
      logger.info("Courier updated", { courier });
      res.status(200).json({
        msg: "resource updated successfully"
      });
    } else {
      logger.error(`Resource with ${req.params.id} not found`);
      res
        .status(404)
        .json({ resource: req.params.id, msg: "Resource not found" });
    }
  } catch (error) {
    logger.error("Server error updating", error);
    res.status(500).json({ msg: "Internal Server Error" });
  }
});

app.delete("/couriers/:id", async function(req, res) {
  try {
    const courier = await Courier.findOne({ id: req.params.id });
    if (courier) {
      await courier.remove({ id: req.params.id });
      res
        .status(200)
        .json({ msg: `Resource deleted with ${req.params.id} deleted` });
    } else {
      logger.info(`Resource with ${req.params.id} not found`);
      res
        .status(404)
        .json({ resource: req.params.id, msg: "Resource not found" });
    }
  } catch (error) {
    logger.error("Server error deleting courier", error);
    res.status(500).json({ msg: "Internal Server Error" });
  }
});

app.post("/couriers/:id/package", async function(req, res) {
  try {
    const package = req.body;
    const courier = await Courier.findOne({ id: req.params.id });
    if (courier) {
      if (courier.max_capacity - package.weight < 0) {
        res
          .status(403)
          .json({ msg: "Forbidden: Weight of the package is over capacity" });
      }

      courier.max_capacity = courier.max_capacity - package.weight;
      courier.packages.push(package);
      await courier.save();
      logger.info("Added package", { courier, package });
      res.status(201).json({ resource: courier, msg: "Added package" });
    } else {
      res
        .status(404)
        .json({ resource: req.params.id, msg: "Resource not found" });
    }
  } catch (error) {
    logger.error("Server error adding package", error);
    res.status(500).json({ msg: "Internal Server Error" });
  }
});

app.delete("/couriers/:id/package/:packageId", async function(req, res) {
  try {
    const package = req.body;
    const courier = await Courier.findOne({ id: req.params.id });
    if (courier) {
      const index = courier.packages.findIndex(elem => {
        return req.params.packageId === elem.packageId;
      });

      if (index > -1) {
        courier.max_capacity += courier.packages[index].weight;
        courier.packages.splice(index, 1);
        courier.save();
        logger.info("Package from courier deleted", { courier });
        res.status(200).json({ courier, msg: "Package deleted" });
      } else {
        logger.info(`Package  ${req.params.packageId}  not found`, courier);
        res.status(404).json({ msg: "Package not found" });
      }
    } else {
      logger.info(`Courier  ${req.params.id}  not found`, courier);
      res.status(404).json({ msg: "Courier not found" });
    }
  } catch (error) {
    logger.error("Server error deleting package", error);
    res.status(500).json({ msg: "Internal Server Error" });
  }
});

app.get("/couriers/lookup", async function(req, res) {
  try {
    const couriers = await Courier.find()
      .where("max_capacity")
      .gte(req.body.capacity_required);

    logger.info("Look up couriers");
    res.json({ couriers, numberOfCouriers: couriers.length });
  } catch (error) {
    logger.error("Error looking up couriers", { error });
    res.status(500).json({ msg: "Internal Server Error" });
  }
});

app.listen(5000, function() {
  console.log("Example app listening on port 3000!");
});

exports = module.exports = {
  app,
  Courier
};
