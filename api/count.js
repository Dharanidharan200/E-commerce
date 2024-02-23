const myArray = [{a:1},{a:1},{a:2},{a:3}];

// The magical counting process
const countDuplicates = (arr) => {
  // Let's use a JavaScript object to keep track of counts
  const counts = {};

  // Loop through each element in the array
  arr.forEach((value) => {
    // If the value is encountered for the first time, set the count to 1
    if (!counts[value]) {
      counts[value] = 1;
    } else {
      // If the value has been seen before, increment the count
      counts[value]++;
    }
  });

  // Voilà! The counts object now holds the frequency of each value
  return counts;
};

// Let's see the result
const result = countDuplicates(myArray);
console.log(result);