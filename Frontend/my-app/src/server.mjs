import fetch from 'node-fetch';

const url = 'http://10.244.88.120:8005/api/login';
const username = 'admin';
const password = 'admin';

// Функция для создания заголовка Authorization с использованием Digest-аутентификации
async function createDigestAuthHeader(method, url, username, password, challenge) {
    // Разбор challenge (www-authenticate заголовка)
    const challengeParams = parseChallengeParams(challenge);
    
    // Создание заголовка Authorization
    const credentials = {
        username: username,
        password: password,
        method: method,
        uri: url,
        nonce: challengeParams.nonce,
        realm: challengeParams.realm,
        qop: 'auth',
        opaque: challengeParams.opaque
    };
    
    // Генерация response
    const response = await generateDigestResponse(credentials);
    
    // Формирование заголовка Authorization
    const authHeader = `Digest username="${username}", realm="${challengeParams.realm}", nonce="${challengeParams.nonce}", uri="${url}", response="${response}", opaque="${challengeParams.opaque}", qop=auth, algorithm=MD5`;
    console.log(authHeader);
    return authHeader;
}

// Функция для разбора параметров challenge (www-authenticate заголовка)
function parseChallengeParams(challenge) {
    const params = {};
    const regex = /([a-zA-Z0-9_-]+)=(?:"([^"]+)"|([^ ,]+))/g;
    let match;
    while ((match = regex.exec(challenge)) !== null) {
        const key = match[1];
        const value = match[2] || match[3];
        params[key] = value;
    }
    return params;
}

// Функция для генерации Digest response
async function generateDigestResponse(credentials) {
    const A1 = `${credentials.username}:${credentials.realm}:${credentials.password}`;
    const A2 = `${credentials.method}:${credentials.uri}`;
    const HA1 = md5(A1);
    const HA2 = md5(A2);
    const response = md5(`${HA1}:${credentials.nonce}:${credentials.nc}:${credentials.cnonce}:${credentials.qop}:${HA2}`);
    return response;
}

// Функция для вычисления MD5 хеша
function md5(str) {
    const crypto = require('crypto');
    return crypto.createHash('md5').update(str).digest('hex');
}

// Выполнение POST запроса с аутентификацией Digest
async function performDigestAuthPost(url, username, password) {
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': await createDigestAuthHeader('POST', url, username, password, response.headers.get('www-authenticate')),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({}) // Пустое тело POST запроса
        });

        if (response.ok) {
            const data = await response.json();
            console.log('Успешный ответ:', data);
        } else {
            console.error('Ошибка:', response.statusText);
        }
    } catch (error) {
        console.error('Ошибка при выполнении запроса:', error.message);
    }
}

// Вызов функции для выполнения POST запроса с Digest-аутентификацией
performDigestAuthPost(url, username, password);