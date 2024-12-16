import React, { useState } from 'react';
import './RegisterForm.css';
import { useNavigate } from 'react-router-dom'; // useNavigate ekliyoruz

export const RegisterForm = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const navigate = useNavigate(); // useNavigate kullanımı

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            alert('Şifreler eşleşmiyor!');
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ kullanici_adi: username, sifre: password }),
            });

            const result = await response.json();
            if (response.ok) {
                alert('Kayıt başarılı!');
                navigate('/'); // Giriş sayfasına yönlendiriliyor
            } else {
                alert(result.message || 'Kayıt sırasında bir hata oluştu!');
            }
        } catch (error) {
            alert('Sunucuyla bağlantı kurulamadı.');
        }
    };

    return (
        <div className="wrapper">
            <form onSubmit={handleSubmit}>
                <h1>Kayıt Ol🔒</h1>
                <div className="input-box">
                    <input
                        type="text"
                        placeholder="Kullanıcı Adı"
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </div>
                <div className="input-box">
                    <input
                        type="password"
                        placeholder="Şifre"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                <div className="input-box">
                    <input
                        type="password"
                        placeholder="Şifreyi Tekrar Girin"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                </div>
                <button type="submit">Kayıt Ol</button>
            </form>
        </div>
    );
};
