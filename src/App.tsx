import React, { useState } from 'react';
import axios from 'axios';

const LoginAndGenerateQR: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userId, setUserId] = useState<number | null>(null);
  const [qrCode, setQrCode] = useState('');

  interface LoginResponse {
    auth: boolean;
    token: string;
}

const handleLogin = async (email: string, password: string): Promise<void> => {
    try {
        const response = await axios.post<LoginResponse>('http://localhost:3000/login', { email, password });
        const { token } = response.data; // Obtén el token del servidor

        // Almacena el token en localStorage
        localStorage.setItem('token', token);

        // Redirige a la página deseada después de iniciar sesión
        // e.g., this.props.history.push('/dashboard');
    } catch (error: any) {
        console.error('Error al iniciar sesión:', error);
        // Manejo de errores (por ejemplo, mostrar un mensaje al usuario)
        if (error.response) {
            console.error('Error del servidor:', error.response.data);
        } else {
            console.error('Error de red:', error.message);
        }
    }
};
  const handleGenerateQR = async () => {
    console.log('Intentando generar QR...'); // Agrega este log
    if (!userId) {
        alert('Por favor ingresa un ID de usuario válido.');
        return;
    }

    const token = localStorage.getItem('token'); // Obtener el token del localStorage
    if (!token) {
        alert('No estás autenticado. Inicia sesión primero.');
        return;
    }
    console.log(localStorage.getItem('token'));

    try {
      const response = await axios.post(
          'http://localhost:3000/generate-qr',
          { userId },
          { headers: { Authorization: `Bearer ${token}` } } // Envía el token en los encabezados
      );
      console.log(response.data.qrCode);
      
      setQrCode(response.data.qrCode);
  } catch (error: any) {
    console.log(userId)
      console.error('Error al generar el código QR:', error);
      
      alert('Error al generar el código QR: ' + error.response?.data?.message || error.message);
  }
};

  return (
    <div>
      <h2>Iniciar Sesión</h2>
      <input
        type="email"
        placeholder="Correo electrónico"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Contraseña"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={() => handleLogin(email, password)}>Iniciar Sesión</button>

      <div>
        <h2>Generar Código QR</h2>
        <input
          type="number"
          placeholder="ID de Usuario"
          value={userId || ''}
          onChange={(e) => setUserId(Number(e.target.value))}
        />
        <button onClick={handleGenerateQR}>Generar QR</button>
        {qrCode && <img src={qrCode} alt="Código QR" />}
      </div>
    </div>
  );
};

export default LoginAndGenerateQR;
