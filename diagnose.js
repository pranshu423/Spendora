
const net = require('net');

const checkPort = (port, name) => {
    return new Promise((resolve) => {
        const socket = new net.Socket();
        socket.setTimeout(2000);

        socket.on('connect', () => {
            console.log(`✅ ${name} is listening on port ${port}`);
            socket.destroy();
            resolve(true);
        });

        socket.on('timeout', () => {
            console.log(`❌ ${name} timed out on port ${port}`);
            socket.destroy();
            resolve(false);
        });

        socket.on('error', (err) => {
            console.log(`❌ ${name} is NOT listening on port ${port} (${err.code})`);
            resolve(false);
        });

        socket.connect(port, 'localhost');
    });
};

const runDiagnostics = async () => {
    console.log('Running diagnostics...');
    const mongoUp = await checkPort(27017, 'MongoDB');
    const serverUp = await checkPort(5000, 'Backend Server');

    if (!mongoUp) {
        console.log('\n⚠️  MongoDB appears to be down. Please start MongoDB service.');
    }
    if (!serverUp) {
        console.log('\n⚠️  Backend Server appears to be down. Check terminal for startup errors.');
    }
    if (mongoUp && serverUp) {
        console.log('\n✅ All services appear to be running.');
    }
};

runDiagnostics();
