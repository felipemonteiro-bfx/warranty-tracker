// Script temporário para gerar chaves VAPID
const webpush = require('web-push');

const vapidKeys = webpush.generateVAPIDKeys();

console.log('\n✅ Chaves VAPID geradas:\n');
console.log('NEXT_PUBLIC_VAPID_PUBLIC_KEY=' + vapidKeys.publicKey);
console.log('VAPID_PRIVATE_KEY=' + vapidKeys.privateKey);
console.log('\n📋 Adicione essas linhas ao seu .env.local:\n');
console.log(`NEXT_PUBLIC_VAPID_PUBLIC_KEY=${vapidKeys.publicKey}`);
console.log(`VAPID_PRIVATE_KEY=${vapidKeys.privateKey}`);
console.log('\n⚠️  IMPORTANTE: A chave privada é secreta! Não compartilhe nem commite no Git.\n');
