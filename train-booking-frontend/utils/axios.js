// import axios from 'axios';

// const axiosInstance = axios.create({
//   baseURL: 'http://localhost:5000', // Backend URL
// });

//export default axiosInstance;






import axios from "axios";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000", // Use environment variable or fallback to localhost
});

export default axiosInstance;

