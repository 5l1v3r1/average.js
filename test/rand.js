var rand = require('fs').readFileSync(__dirname + '/rand.txt').toString();
var comps = rand.split('\n');
var nums = [];
for (var i = 0; i < comps.length; ++i) {
  nums[i] = parseInt(comps[i]);
}
module.exports = nums;