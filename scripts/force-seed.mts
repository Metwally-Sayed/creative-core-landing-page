import { spawn } from 'child_process';

const run = () => {
  console.log('Starting force-seed...');
  const child = spawn('npx', ['tsx', 'scripts/seed-globals.mts'], {
    shell: true,
  });

  child.stdout.on('data', (data) => {
    const output = data.toString();
    process.stdout.write(output);
    if (output.includes('created or renamed') || output.includes('Is ') || output.includes('?')) {
      console.log('\n[Force-Seed] Detected prompt, sending ENTER...');
      child.stdin.write('\n');
    }
  });

  child.stderr.on('data', (data) => {
    process.stderr.write(data.toString());
  });

  child.on('close', (code) => {
    console.log(`child process exited with code ${code}`);
    process.exit(code || 0);
  });
};

run();
