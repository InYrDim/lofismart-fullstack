const { spawn } = require('child_process');
const path = require('path');
const { promisify } = require('util');

const exec = promisify(require('child_process').exec);

const isWindows = process.platform === 'win32';
const npmCmd = isWindows ? 'npm.cmd' : 'npm';
const containerName = 'mysql-container';

const backendDir = path.join(__dirname, 'lofishmart-backend');
const frontendDir = path.join(__dirname, 'lofishmart-frontend');

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
};

// Check and start MySQL container
async function ensureMySQL() {
  console.log(`${colors.cyan}🗄️  Checking MySQL container...${colors.reset}`);
  
  try {
    const { stdout } = await exec(`podman ps -a --filter name=${containerName} --format "{{.Names}} {{.Status}}"`);
    const containerInfo = stdout.trim();
    
    if (containerInfo.includes(containerName)) {
      if (containerInfo.includes('Up')) {
        console.log(`${colors.green}✅ MySQL container is already running${colors.reset}`);
        return true;
      } else {
        console.log(`${colors.yellow}⚠️  MySQL container exists but is not running. Starting...${colors.reset}`);
        await exec(`podman start ${containerName}`);
        console.log(`${colors.green}✅ MySQL container started${colors.reset}`);
        return true;
      }
    } else {
      console.log(`${colors.red}❌ MySQL container "${containerName}" not found!${colors.reset}`);
      console.log(`${colors.yellow}Please create and start the container first:${colors.reset}`);
      console.log(`  podman run -d --name ${containerName} -e MYSQL_ROOT_PASSWORD=... -e MYSQL_DATABASE=... -p 3306:3306 mysql:latest`);
      return false;
    }
  } catch (err) {
    console.log(`${colors.red}❌ Error checking MySQL container: ${err.message}${colors.reset}`);
    return false;
  }
}

async function main() {
  console.log('\n🚀 Starting LofishMart...\n');
  
  const mysqlReady = await ensureMySQL();
  if (!mysqlReady) {
    console.log(`${colors.red}Cannot start without MySQL container. Exiting.${colors.reset}`);
    process.exit(1);
  }
  
  // Wait a bit for MySQL to be ready
  console.log(`${colors.yellow}Waiting for MySQL to be ready...${colors.reset}`);
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Start MySQL log streaming
  console.log(`${colors.cyan}📜 Starting MySQL log streaming...${colors.reset}`);
  const mysqlLogs = spawn('podman', ['logs', '-f', '--tail', '50', containerName], {
    shell: true,
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  mysqlLogs.stdout.on('data', (data) => {
    process.stdout.write(`${colors.yellow}[MySQL] ${data.toString().trim()}${colors.reset}\n`);
  });

  mysqlLogs.stderr.on('data', (data) => {
    process.stderr.write(`${colors.yellow}[MySQL] ${data.toString().trim()}${colors.reset}\n`);
  });

  mysqlLogs.on('close', (code) => {
    console.log(`${colors.yellow}MySQL log stream exited with code ${code}${colors.reset}`);
  });

  // Start backend
  console.log(`${colors.cyan}📦 Starting Backend...${colors.reset}`);
  const backend = spawn(npmCmd, ['start'], {
    cwd: backendDir,
    shell: true,
    stdio: ['inherit', 'pipe', 'pipe'],
  });

  backend.stdout.on('data', (data) => {
    process.stdout.write(`${colors.green}[Backend] ${data.toString().trim()}${colors.reset}\n`);
  });

  backend.stderr.on('data', (data) => {
    process.stderr.write(`${colors.red}[Backend] ${data.toString().trim()}${colors.reset}\n`);
  });

  backend.on('close', (code) => {
    console.log(`${colors.yellow}Backend process exited with code ${code}${colors.reset}`);
    killAll();
  });

  // Start frontend
  console.log(`${colors.cyan}🌐 Starting Frontend...${colors.reset}`);
  const frontend = spawn(npmCmd, ['run', 'dev'], {
    cwd: frontendDir,
    shell: true,
    stdio: ['inherit', 'pipe', 'pipe'],
  });

  frontend.stdout.on('data', (data) => {
    process.stdout.write(`${colors.cyan}[Frontend] ${data.toString().trim()}${colors.reset}\n`);
  });

  frontend.stderr.on('data', (data) => {
    process.stderr.write(`${colors.red}[Frontend] ${data.toString().trim()}${colors.reset}\n`);
  });

  frontend.on('close', (code) => {
    console.log(`${colors.yellow}Frontend process exited with code ${code}${colors.reset}`);
    killAll();
  });

  // Handle Ctrl+C
  function killAll() {
    console.log(`\n${colors.red}Shutting down...${colors.reset}`);
    if (!mysqlLogs.killed) mysqlLogs.kill();
    if (!backend.killed) backend.kill();
    if (!frontend.killed) frontend.kill();
    process.exit(0);
  }
  function killAll() {
    console.log(`\n${colors.red}Shutting down...${colors.reset}`);
    if (!backend.killed) backend.kill();
    if (!frontend.killed) frontend.kill();
    process.exit(0);
  }

  process.on('SIGINT', killAll);
  process.on('SIGTERM', killAll);

  console.log(`${colors.bright}✨ Both servers are starting!${colors.reset}`);
  console.log(`${colors.yellow}Backend:${colors.reset} http://localhost:3000`);
  console.log(`${colors.yellow}Frontend:${colors.reset} http://localhost:5173 (usually)\n`);
}

main();
