var uniq = require('uniq');
var nums = [1, 2, 3, 5, 3, 4, 2, 1, 5, 3];
console.log('hello from browserify: ' + uniq(nums).join(', '));
