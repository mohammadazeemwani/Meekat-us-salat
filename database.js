const mongoose = require("mongoose");
require("dotenv").config();

exports.MongooseConnect = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
};

const fcmBatchSchema = new mongoose.Schema({
  districtHash: String,
  tokens: [[String]],
});

const FcmBatch = mongoose.model("FcmBatch", fcmBatchSchema);
exports.FcmBatch = FcmBatch;

// save district only in small case
exports.saveToken = async (districtHash, token) => {
  // Find the latest batch
  const consernedDistrict = await FcmBatch.findOne({ districtHash: districtHash });

  if (consernedDistrict) {
    //get latest tokens array and push new token
    if (consernedDistrict.tokens[consernedDistrict.tokens.length - 1].length <=500) {
      await consernedDistrict.tokens[consernedDistrict.tokens.length - 1].push(token);
      consernedDistrict.save();
        return {
            indexOfBatch: consernedDistrict.tokens.length - 1,
            // remb we are using push and not unshift
            indexOfFcmInBatch: consernedDistrict.tokens[consernedDistrict.tokens.length - 1].length - 1
        }

    } else {
      await consernedDistrict.tokens.push([token]);
      consernedDistrict.save();

      return {
          indexOfBatch: consernedDistrict.tokens.length - 1,
          indexOfFcmInBatch: 0
      }
    }
  } else {
    //create new batch
    const newConsernedDistrict = new FcmBatch({
      districtHash: districtHash,
      tokens: [[token]],
    });
    // Save the batch to the database
    await newConsernedDistrict.save();

    return {
        indexOfBatch: 0,
        indexOfFcmInBatch: 0
    }
  }
};


// hash1 => Uri  **value: 3                         
// hash2 => Baramulla // Tangmarg // Sopore  **value: 1
// hash3 => Bandipora // Punch  **value: 2
// hash4 => Teetwal // Karna  **value: 4
// hash5 => Islamabad // Tral  **value: -2
// hash6 => Pulwama // Kulgam // Harmukh  **value: -1
// hash7 => Leh  **value: -11
// hash8 => Pahalgam  **value: -3
// hash9 => Srinagar // Budgam  **value: 0