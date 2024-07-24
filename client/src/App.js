import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Login from './components/Login';

const App = () => {
    const [balance, setBalance] = useState(0);
    const [transactions, setTransactions] = useState([]);
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [token, setToken] = useState('');
    const [user, setUser] = useState('');

    useEffect(() => {
        if (token) {
            const fetchExpenses = async () => {
                try {
                    const response = await axios.get('http://localhost:5000/expenses', {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    const expenses = response.data;
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
            setBalance((prevBalance) => prevBalance + parsedAmount);
            setTransactions((prevTransactions) => [
                ...prevTransactions,
                newExpense,
            ]);
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
                setBalance((prevBalance) => prevBalance - amount);
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

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(storedUser);
        }
    }, []);

    return (
        <div className="container">
            {!token ? (
                <Login setToken={setToken} setUser={setUser} />
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
                        localStorage.removeItem('user');
                        setToken('');
                        setUser('');
                    }}>Logout</button>
                </div>
            )}
        </div>
    );
};

export default App;