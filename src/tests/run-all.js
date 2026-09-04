const { spawn } = require('child_process');
const path = require('path');

const runScript = (scriptName) => {
  return new Promise((resolve, reject) => {
    const proc = spawn('node', [path.join(__dirname, scriptName)], { stdio: 'inherit' });
    proc.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${scriptName} failed with exit code ${code}`));
    });
  });
};

async function main() {
  console.log('🚀 Running all API test suites...\n');
  await runScript('auth.test.js');
  console.log('\n---------------------------------------------\n');
  await runScript('material-price.test.js');
  console.log('\n---------------------------------------------\n');
  await runScript('recycler.test.js');
  console.log('\n---------------------------------------------\n');
  await runScript('lot.test.js');
  console.log('\n---------------------------------------------\n');
  await runScript('recommendation.test.js');
  console.log('\n---------------------------------------------\n');
  await runScript('transaction.test.js');
  console.log('\n---------------------------------------------\n');
  await runScript('handover.test.js');
  console.log('\n---------------------------------------------\n');
  await runScript('earnings.test.js');
  console.log('\n---------------------------------------------\n');
  await runScript('docs.test.js');
  console.log('\n🎉 ALL TEST SUITES PASSED SUCCESSFULLY!\n');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
