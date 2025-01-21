const execSync = require('child_process').execSync
// process.argv.forEach((value, index) => {
//   console.log(index, value)
// })
// console.log('process.argv[2]', process.argv[2])
const cmd = `sass --style=compressed assets/wnyc-app/_theme.scss assets/wnyc-app/wnyc-app.min.css`
//# skipcq JS-0002
console.log(`Compiling theme wnyc-app theme...`)
execSync(cmd, {
  cwd: process.cwd()
})
