import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
    const [apps, setApps] = useState([]);
    const [appName, setAppName] = useState('');
    const [appPassword, setAppPassword] = useState('');
    const location = useLocation();
    const kullaniciAdi = location.state?.kullanici_adi; // Giriş yapan kullanıcı adı

    useEffect(() => {
        if (kullaniciAdi) {
            fetch(`http://localhost:5000/api/dashboard?kullanici_adi=${kullaniciAdi}`)
                .then((response) => response.json())
                .then((data) => {
                    if (data.apps) {
                        setApps(data.apps);
                    } else {
                        alert(data.message || 'Uygulama bilgileri alınamadı!');
                    }
                })
                .catch(() => alert('Sunucuyla bağlantı kurulamadı.'));
        }
    }, [kullaniciAdi]);

    const handleAddApp = (e) => {
        e.preventDefault();

        if (!appName || !appPassword) {
            alert('Lütfen tüm alanları doldurun!');
            return;
        }

        fetch('http://localhost:5000/api/add_app', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                kullanici_adi: kullaniciAdi,
                uygulama_adi: appName,
                uygulama_sifresi: appPassword,
            }),
        })
            .then((response) => {
                if (!response.ok) {
                    return response.json().then((data) => {
                        alert(data.message || 'Uygulama ekleme başarısız!');
                        throw new Error('Uygulama ekleme başarısız!');
                    });
                }
                return response.json(); // Başarılı ise devam et
            })
            .then((data) => {
                alert(data.message || 'Uygulama başarıyla eklendi!');
                setApps([...apps, { uygulama_adi: appName, uygulama_sifresi: appPassword }]); // Yeni uygulamayı listeye ekliyoruz
                setAppName('');
                setAppPassword('');
            })
            .catch(() => alert('Sunucuyla bağlantı kurulamadı.'));
    };

    return (
        <div className="dashboard">
            <h1>Hoşgeldin, {kullaniciAdi}!</h1>
            <h2>Uygulama Bilgilerin</h2>
            {apps.length > 0 ? (
                <ul>
                    {apps.map((app, index) => (
                        <li key={index}>
                            <strong>Uygulama Adı:</strong> {app.uygulama_adi} <br />
                            <strong>Uygulama Şifresi:</strong> {app.uygulama_sifresi}
                        </li>
                    ))}
                </ul>
            ) : (
                <p>Hiç uygulama bilgisi bulunamadı.</p>
            )}

            <h2>Yeni Uygulama Ekle</h2>
            <form onSubmit={handleAddApp}>
                <div className="input-box">
                    <input
                        type="text"
                        placeholder="Uygulama Adı"
                        value={appName}
                        onChange={(e) => setAppName(e.target.value)}
                        required
                    />
                </div>
                <div className="input-box">
                    <input
                        type="password"
                        placeholder="Uygulama Şifresi"
                        value={appPassword}
                        onChange={(e) => setAppPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">Ekle</button>
            </form>
        </div>
    );
};

export default Dashboard;
