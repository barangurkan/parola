import React, { useState } from 'react';
import './LoginForm.css';
import { FaUserAlt } from 'react-icons/fa';
import { RiLockPasswordFill } from 'react-icons/ri';
import { Link, useNavigate } from 'react-router-dom';

export const LoginForm = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loggedInUser, setLoggedInUser] = useState(null); // Giriş yapan kullanıcıyı takip edeceğiz

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch('http://localhost:5000/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ kullanici_adi: username, sifre: password }),
            });

            const result = await response.json();
            if (response.ok) {
                setLoggedInUser(result.kullanici_adi); // Giriş yapan kullanıcıyı kaydediyoruz
                // Store AES key (optional, if needed later)
                const aesKey = result.sifreleme_anahtari;
                // You can store the key in localStorage or context, depending on your needs
                localStorage.setItem('aesKey', aesKey);
                navigate('/dashboard', { state: { kullanici_adi: result.kullanici_adi } }); // Kullanıcı adıyla yönlendirme yapıyoruz
            } else {
                alert(result.message || 'Hatalı kullanıcı adı veya şifre!');
            }
        } catch (error) {
            alert('Sunucuyla bağlantı kurulamadı.');
        }
    };

    return (
        <div className='wrapper'>
            <form onSubmit={handleSubmit}>
                <h1>ŞifreMatik🔒</h1>
                <div className="input-box">
                    <input
                        type="text"
                        placeholder='Kullanıcı Adı'
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <FaUserAlt className='icon' />
                </div>
                <div className="input-box">
                    <input
                        type="password"
                        placeholder='Şifre'
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <RiLockPasswordFill className='icon' />
                </div>

                <button type='submit'>Giriş</button>
                <div className="register-link">
                    <p>
                        <Link to="/Register">Kayıt Ol</Link>
                    </p>
                </div>
            </form>
        </div>
    );
};
