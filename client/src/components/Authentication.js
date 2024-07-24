import axios from 'axios';

const Authentication = {
    login: async (username, password) => {
        const response = await axios.post('http://localhost:5000/login', { username, password });
        return { token: response.data.token, user: username };
    },

    register: async (username, password) => {
        await axios.post('http://localhost:5000/register', { username, password });
    }
};

export default Authentication;