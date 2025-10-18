import qrcode from 'qrcode-terminal';

// Use the phone hotspot IP
const ip = '10.125.131.44';  // Your laptop IP on phone hotspot
const port = 8080;
const url = `http://${ip}:${port}`;

console.log('\n╔════════════════════════════════════════════════════╗');
console.log('║  📱 OPEN THIS URL ON YOUR PHONE 📱               ║');
console.log('╚════════════════════════════════════════════════════╝\n');

qrcode.generate(url, { small: true });

console.log('\n🔗 URL:', url);
console.log('\n📝 Instructions:');
console.log('   ✅ Your laptop is connected to YOUR phone hotspot');
console.log('   ✅ Open phone browser and type the URL above');
console.log('   ✅ Or scan QR from another device');
console.log('   ✅ Install Fixora app when prompted!\n');
console.log('💡 Laptop IP: 10.125.131.44');
console.log('💡 Phone Gateway: 10.125.131.89\n');
