
const nb = require('neverbounce');
console.log('Type of export:', typeof nb);
console.log('Export keys:', Object.keys(nb));
if (typeof nb === 'function') {
    console.log('It is a function/class');
} else {
    console.log('It is an object');
}
try {
    new nb({ apiKey: 'test' });
    console.log('Constructor worked');
} catch (e) {
    console.log('Constructor failed:', e.message);
}
