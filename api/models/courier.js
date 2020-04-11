const mongoose = require("mongoose");
const Schema = mongoose.Schema;
let CourierSchema;
const logger = require("../logger");

logger.info("Connecting to mongo");
let mongodb = "localhost";
if (!process.env.MONGODB) {
  mongodb = "mongodb";
}
mongoose
  .connect(`mongodb://${mongodb}:27017/test`, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .catch(error => {
    console.log("Error connecting to MongoDB!!!!", error);
  });

logger.info("Connected");
CourierSchema = new Schema({
  id: { type: [String], index: true }, // field level
  max_capacity: Number,
  packages: [{ packageId: String, description: String, weight: Number }]
});

module.exports = mongoose.model("Courier", CourierSchema);
