import React, { useState } from 'react';
import axios from 'axios';

const EditExpense = ({ token, expense, onUpdate, onCancel }) => {
    const [description, setDescription] = useState(expense.description);
    const [amount, setAmount] = useState(expense.amount);

    const updateExpense = async () => {
        try {
            const response = await axios.put(`http://localhost:5000/expenses/${expense._id}`, {
                description,
                amount,
            }, {
                headers: { Authorization: `Bearer ${token}` },
            });

            onUpdate(response.data);
        } catch (error) {
            console.error('Error updating expense:', error);
            alert('Failed to update expense. Please try again.');
        }
    };

    return (
        <div className="edit-expense">
            <h2>Edit Expense</h2>
            <form onSubmit={(e) => { e.preventDefault(); updateExpense(); }}>
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
                <button type="submit">Update</button>
                <button type="button" onClick={onCancel}>Cancel</button>
            </form>
        </div>
    );
};

export default EditExpense;