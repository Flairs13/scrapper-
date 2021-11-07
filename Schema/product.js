const {Schema, model} = require('mongoose')


const schema = new Schema({
  product: Array,
  position: Number,
})

module.exports = model('product', schema)