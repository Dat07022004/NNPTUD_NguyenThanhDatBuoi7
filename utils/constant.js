const fs = require('fs');
const path = require('path');
const { generateKeyPairSync } = require('crypto');

function normalizeKey(key) {
	return key ? key.replace(/\\n/g, '\n') : null;
}

let privateKey = normalizeKey(process.env.JWT_PRIVATE_KEY);
let publicKey = normalizeKey(process.env.JWT_PUBLIC_KEY);

const privateKeyPath = path.join(process.cwd(), 'privateKey.pem');
const publicKeyPath = path.join(process.cwd(), 'publicKey.pem');

if (fs.existsSync(privateKeyPath) && fs.existsSync(publicKeyPath)) {
	privateKey = fs.readFileSync(privateKeyPath, 'utf8');
	publicKey = fs.readFileSync(publicKeyPath, 'utf8');
}

if (!privateKey || !publicKey) {
	const generatedKeys = generateKeyPairSync('rsa', {
		modulusLength: 2048,
		publicKeyEncoding: {
			type: 'pkcs1',
			format: 'pem'
		},
		privateKeyEncoding: {
			type: 'pkcs1',
			format: 'pem'
		}
	});

	privateKey = generatedKeys.privateKey;
	publicKey = generatedKeys.publicKey;

	console.warn('JWT keys are generated in memory. Set JWT_PRIVATE_KEY and JWT_PUBLIC_KEY in environment for persistent tokens.');
}

module.exports = {
	jwtConfig: {
		privateKey,
		publicKey,
		signOptions: {
			algorithm: 'RS256',
			expiresIn: '1d'
		},
		verifyOptions: {
			algorithms: ['RS256']
		}
	}
}
