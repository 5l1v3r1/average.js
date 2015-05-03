var fs = require('fs');
var textFile = fs.readFileSync(__dirname + '/rand.txt').toString();
var lines = textFile.split('\n');
var nums = [];
for (var i = 0; i < lines.length; ++i) {
  nums[i] = parseInt(lines[i]);
}
module.exports = nums;