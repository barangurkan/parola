import sqlite3
from flask import Flask, request, jsonify
from flask_cors import CORS
from Crypto.Cipher import AES
from Crypto.Util.Padding import pad, unpad
from Crypto.Random import get_random_bytes
import base64


def aes_anahtar_olustur():
    return get_random_bytes(16)



def aes_sifrele(plain_text, key):

    cipher = AES.new(key, AES.MODE_ECB)
    padded_text = pad(plain_text.encode("utf-8"), AES.block_size)  # Metni blok boyutuna hizala
    encrypted_bytes = cipher.encrypt(padded_text)
    return base64.b64encode(encrypted_bytes).decode("utf-8")


def aes_sifre_coz(cipher_text, key):

    cipher = AES.new(key, AES.MODE_ECB)
    encrypted_bytes = base64.b64decode(cipher_text)
    decrypted_bytes = unpad(cipher.decrypt(encrypted_bytes), AES.block_size)
    return decrypted_bytes.decode("utf-8")

app = Flask(__name__)
CORS(app)

def get_db_connection():
    conn = sqlite3.connect('veritabani.db')
    conn.row_factory = sqlite3.Row
    return conn

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    kullanici_adi = data['kullanici_adi']
    sifre = data['sifre']

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute('SELECT * FROM kullanici_bilgileri WHERE kullanici_adi = ? AND sifre = ?', (kullanici_adi, sifre))
    user = cursor.fetchone()

    conn.close()

    if user:
        return jsonify({
            "message": "Giriş başarılı",
            "kullanici_adi": kullanici_adi,
            "sifreleme_anahtari": user['sifreleme_anahtari']
        }), 200
    else:
        return jsonify({"message": "Geçersiz kullanıcı adı veya şifre"}), 401

@app.route('/api/dashboard', methods=['GET'])
def dashboard():
    kullanici_adi = request.args.get('kullanici_adi')  # Kullanıcı adı URL parametresi olarak alınıyor
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute('SELECT id, sifreleme_anahtari FROM kullanici_bilgileri WHERE kullanici_adi = ?', (kullanici_adi,))
    user = cursor.fetchone()

    if user:
        user_id = user['id']
        sifreleme_anahtari = base64.b64decode(user['sifreleme_anahtari'])

        cursor.execute('SELECT * FROM uygulama_bilgileri WHERE kullanici_id = ?', (user_id,))
        user_apps = cursor.fetchall()

        conn.close()

        if user_apps:
            apps = [{"uygulama_adi": app['uygulama_adi'],
                     "uygulama_sifresi": aes_sifre_coz(app['uygulama_sifresi'], sifreleme_anahtari)} for app in user_apps]
            return jsonify({"apps": apps}), 200
        else:
            return jsonify({"message": "Hiç uygulama bulunamadı"}), 404
    else:
        conn.close()
        return jsonify({"message": "Kullanıcı bulunamadı"}), 404


@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    kullanici_adi = data['kullanici_adi']
    sifre = data['sifre']

    sifreleme_anahtari = base64.b64encode(aes_anahtar_olustur()).decode()

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute(
            'INSERT INTO kullanici_bilgileri (kullanici_adi, sifre, sifreleme_anahtari) VALUES (?, ?, ?)',
            (kullanici_adi, sifre, sifreleme_anahtari)
        )
        conn.commit()
        conn.close()
        return jsonify({"message": "Kayıt başarılı!"}), 201
    except sqlite3.IntegrityError:
        conn.close()
        return jsonify({"message": "Kullanıcı adı zaten mevcut!"}), 409


@app.route('/api/add_app', methods=['POST'])
def add_app():
    data = request.get_json()
    kullanici_adi = data['kullanici_adi']
    uygulama_adi = data['uygulama_adi']
    uygulama_sifresi = data['uygulama_sifresi']

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute('SELECT id, sifreleme_anahtari FROM kullanici_bilgileri WHERE kullanici_adi = ?', (kullanici_adi,))
    user = cursor.fetchone()

    if user:
        user_id = user['id']
        sifreleme_anahtari = base64.b64decode(user['sifreleme_anahtari'])
        sifreli_uygulama_sifresi = aes_sifrele(uygulama_sifresi, sifreleme_anahtari)

        cursor.execute(
            'INSERT INTO uygulama_bilgileri (kullanici_id, uygulama_adi, uygulama_sifresi) VALUES (?, ?, ?)',
            (user_id, uygulama_adi, sifreli_uygulama_sifresi)
        )
        conn.commit()
        conn.close()

        return jsonify({"message": "Uygulama başarıyla eklendi!"}), 201
    else:
        conn.close()
        return jsonify({"message": "Kullanıcı bulunamadı!"}), 404

if __name__ == "__main__":
    app.run(debug=True)
