import base64
import json
from Crypto.Cipher import AES
from Crypto.Util.Padding import unpad
import configparser


config = configparser.ConfigParser()
config.read('config.ini')
SECRET_KEY = bytes(config['KEY']['SECRET_KEY'], 'utf-8')


def decrypt_data(encrypted_data):
    try:
        # Расшифровка данных
        cipher = AES.new(SECRET_KEY, AES.MODE_ECB)
        decrypted_data = unpad(cipher.decrypt(base64.b64decode(encrypted_data)), AES.block_size)
        return json.loads(decrypted_data.decode('utf-8'))
    except Exception as e:
        raise ValueError("Decryption failed")