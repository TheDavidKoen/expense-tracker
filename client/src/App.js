import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ExpenseTracker = () => {
    const [balance, setBalance] = useState(0);
    const [transactions, setTransactions] = useState([]);
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [registerUsername, setRegisterUsername] = useState('');
    const [registerPassword, setRegisterPassword] = useState('');
    const [token, setToken] = useState('');

    useEffect(() => {
        if (token) {
            const fetchExpenses = async () => {
                try {
                    const response = await axios.get('http://localhost:5000/expenses', {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    const expenses = response.data;

                    // Calculate the balance
                    const totalBalance = expenses.reduce((acc, expense) => acc + expense.amount, 0);

                    setBalance(totalBalance);
                    setTransactions(expenses);
                } catch (error) {
                    console.error('Error fetching expenses:', error);
                    alert('Failed to fetch expenses. Please try again.');
                }
            };

            fetchExpenses();
        }
    }, [token]);

    const addExpense = async () => {
        const parsedAmount = parseFloat(amount);

        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            alert('Please enter a valid amount.');
            return;
        }

        try {
            const response = await axios.post('http://localhost:5000/expenses', {
                description,
                amount: parsedAmount,
            }, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const newExpense = response.data;

            // Update balance
            setBalance((prevBalance) => prevBalance + parsedAmount);

            // Add transaction to the list
            setTransactions((prevTransactions) => [
                ...prevTransactions,
                newExpense,
            ]);

            // Clear form
            setDescription('');
            setAmount('');
        } catch (error) {
            console.error('Error saving expense:', error);
            alert('Failed to save expense. Please try again.');
        }
    };

    const deleteExpense = async (id, amount) => {
        try {
            const response = await axios.delete(`http://localhost:5000/expenses/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.status === 200) {
                // Update balance
                setBalance((prevBalance) => prevBalance - amount);

                // Remove transaction from the list
                setTransactions((prevTransactions) =>
                    prevTransactions.filter((transaction) => transaction._id !== id)
                );
            } else {
                console.error('Failed to delete expense:', response.data);
                alert('Failed to delete expense. Please try again.');
            }
        } catch (error) {
            console.error('Error deleting expense:', error);
            alert('Failed to delete expense. Please try again.');
        }
    };

    const handleLogin = async (username, password) => {
        try {
            const response = await axios.post('http://localhost:5000/login', {
                username,
                password
            });
            setToken(response.data.token);
            localStorage.setItem('token', response.data.token);
        } catch (error) {
            console.error('Error logging in:', error);
            alert('Failed to login. Please try again.');
        }
    };

    const handleRegister = async (username, password) => {
        try {
            await axios.post('http://localhost:5000/register', {
                username,
                password
            });
            alert('Registration successful! You can now log in.');
        } catch (error) {
            console.error('Error registering:', error);
            alert('Failed to register. Please try again.');
        }
    };

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
            setToken(storedToken);
        }
    }, []);

    return (
        <div className="container">
            {!token ? (
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
            ) : (
                <div>
                    <div className="balance">
                        <h2>
                            Balance: R<span id="balance">{balance.toFixed(2)}</span>
                        </h2>
                    </div>
                    <div className="transactions">
                        <h2>Transactions</h2>
                        <ul>
                            {transactions.map((transaction) => (
                                <li key={transaction._id}>
                                    {`${transaction.description}: R${transaction.amount.toFixed(2)}`}
                                    <button onClick={() => deleteExpense(transaction._id, transaction.amount)}>Delete</button>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="add-expense">
                        <h2>Add Expense</h2>
                        <form onSubmit={(e) => e.preventDefault()}>
                            <label htmlFor="description">Description:</label>
                            <input
                                type="text"
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                required
                            />
                            <label htmlFor="amount">Amount:</label>
                            <input
                                type="number"
                                id="amount"
                                step="0.01"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                required
                            />
                            <button type="button" onClick={addExpense}>Add Expense</button>
                        </form>
                    </div>
                    <button onClick={() => {
                        localStorage.removeItem('token');
                        setToken('');
                    }}>Logout</button>
                </div>
            )}
        </div>
    );
};

export default ExpenseTracker;