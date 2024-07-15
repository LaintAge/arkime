import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import CryptoJS from 'crypto-js';
import './LoginForm.css';

// Пример ключа (32 байта для AES-256)
const secretKey = process.env.REACT_APP_SECRET_KEY;

const encryptData = (data) => {
  const encrypted = CryptoJS.AES.encrypt(JSON.stringify(data), CryptoJS.enc.Utf8.parse(secretKey), {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7
  }).toString();
  return encrypted;
};

const LoginForm = ({ setIsAuthenticated, setEncryptedData }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Сброс сообщений об ошибках
    setUsernameError('');
    setPasswordError('');
    setMessage('');

    // Проверка на заполненность полей
    let hasError = false;
    if (!username) {
      setUsernameError('Логин обязателен для заполнения');
      hasError = true;
    }
    if (!password) {
      setPasswordError('Пароль обязателен для заполнения');
      hasError = true;
    }

    if (hasError) return;

    // Шифрование данных перед отправкой
    const encryptedData = encryptData({ username, password });
    setEncryptedData(encryptedData); // Передаем зашифрованные данные

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/login`, { data: encryptedData });

      if (response.data.message === "Authorized") {
        setIsAuthenticated(true);
        navigate('/dashboard');
      } 
      
    } catch (error) {
      if (error.response && error.response.status === 401) {
        setMessage("Неправильный логин или пароль");
      } else {
        setMessage('Произошла ошибка');
      }
      console.error(error); 
    }    
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Username:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="form-control"
            placeholder="Введите логин"
          />
          {usernameError && <p className="error-message">{usernameError}</p>}
        </div>
        <div className="form-group">
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="form-control"
            placeholder="Введите пароль"
          />
          {passwordError && <p className="error-message">{passwordError}</p>}
        </div>
        <button type="submit" className="btn btn-primary">Login</button>
      </form>
      {message && <p className="error-message">{message}</p>}
    </div>
  );
};

export default LoginForm;
