const mongoose = require('mongoose');

const testIds = ['66289d0c64b6e5f8f533a364', 'null', 'undefined', '[object Object]', ''];

testIds.forEach(id => {
    console.log(`ID: "${id}", Valid: ${mongoose.Types.ObjectId.isValid(id)}`);
});
