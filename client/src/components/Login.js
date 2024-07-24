import React, { useState } from 'react';
import Authentication from './Authentication';

const Login = ({ setToken, setUser }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [registerUsername, setRegisterUsername] = useState('');
    const [registerPassword, setRegisterPassword] = useState('');

    const handleLogin = async (username, password) => {
        try {
            const { token, user } = await Authentication.login(username, password);
            setToken(token);
            setUser(user);
            localStorage.setItem('token', token);
            localStorage.setItem('user', user);
        } catch (error) {
            console.error('Error logging in:', error);
            alert('Failed to login. Please try again.');
        }
    };

    const handleRegister = async (username, password) => {
        try {
            await Authentication.register(username, password);
            alert('Registration successful! You can now log in.');
        } catch (error) {
            console.error('Error registering:', error);
            alert('Failed to register. Please try again.');
        }
    };

    return (
        <div>
            <h2>Login</h2>
            <form onSubmit={(e) => {
                e.preventDefault();
                handleLogin(username, password);
            }}>
                <label htmlFor="login-username">Username:</label>
                <input
                    type="text"
                    id="login-username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
                <label htmlFor="login-password">Password:</label>
                <input
                    type="password"
                    id="login-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type="submit">Login</button>
            </form>

            <h2>Register</h2>
            <form onSubmit={(e) => {
                e.preventDefault();
                handleRegister(registerUsername, registerPassword);
            }}>
                <label htmlFor="register-username">Username:</label>
                <input
                    type="text"
                    id="register-username"
                    value={registerUsername}
                    onChange={(e) => setRegisterUsername(e.target.value)}
                    required
                />
                <label htmlFor="register-password">Password:</label>
                <input
                    type="password"
                    id="register-password"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    required
                />
                <button type="submit">Register</button>
            </form>
        </div>
    );
};

export default Login;