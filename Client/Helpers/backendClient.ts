import axios from 'axios';

const backendClient = axios.create({
    baseURL: process.env.BACKEND_URL?.replace(/\/api$/, ''),
    headers: {
        'x-api-secret': process.env.API_SECRET,
    },
});

export default backendClient;
