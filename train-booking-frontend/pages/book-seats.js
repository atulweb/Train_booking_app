import { useState } from 'react';
import axios from '../utils/axios';

export default function BookSeats() {
  const [seatCount, setSeatCount] = useState(1);
  const [userId, setUserId] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleBooking = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        '/seats/book',
        { seatCount, userId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage(`Seats booked successfully: ${response.data.bookedSeats}`);
    } catch (err) {
      setError(err.response?.data || 'An error occurred');
    }
  };

  return (
    <div>
      <h1>Book Seats</h1>
      <form onSubmit={handleBooking}>
        <input
          type="number"
          placeholder="Number of Seats"
          value={seatCount}
          onChange={(e) => setSeatCount(e.target.value)}
          min="1"
          required
        />
        <input
          type="text"
          placeholder="User ID"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          required
        />
        <button type="submit">Book Seats</button>
      </form>
      {message && <p style={{ color: 'green' }}>{message}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}
