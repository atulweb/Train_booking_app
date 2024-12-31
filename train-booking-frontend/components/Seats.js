import React, { useState, useEffect } from "react";
import axios from "../utils/axios";

const Seats = () => {
  const [seats, setSeats] = useState(null); // Initialize as null to avoid mismatch
  const [seatCount, setSeatCount] = useState(0);
  const [bookedSeats, setBookedSeats] = useState([]);
  const [isMounted, setIsMounted] = useState(false); // Track if the component has mounted

  useEffect(() => {
    setSeats(Array(80).fill("available")); // Only set seats on client-side mount
    setIsMounted(true); // Set mounted to true when component mounts
  }, []);

  // Add this function here
  const handleBooking = async () => {
    if (seatCount <= 0 || seatCount > seats.filter((s) => s === "available").length) {
      alert("Invalid seat count or not enough available seats!");
      return;
    }
  
    // Retrieve token from localStorage or wherever it's stored
    const token = localStorage.getItem("token"); // Adjust according to your token storage method
  
    if (!token) {
      alert("No token found. Please log in.");
      return;
    }
  
    try {
      // Send booking request to the backend with the token in the Authorization header
      const response = await axios.post(
        "/seats/book",
        { seatCount, userId: 1 },
        {
          headers: {
            Authorization: `Bearer ${token}` // Add the token to the headers
          }
        }
      );
  
      console.log("Response:", response);
  
      const bookedIds = response.data.bookedSeats;
  
      console.log("Booked Seats IDs:", bookedIds);
  
      const updatedSeats = seats.map((status, index) =>
        bookedIds.includes(index + 1) ? "booked" : status
      );
  
      console.log("Updated seats:", updatedSeats);
  
      setSeats(updatedSeats);
      setBookedSeats(bookedIds);
      setConfirmationMessage(`Successfully booked seats: ${bookedIds.join(", ")}`);
      alert("successfully booked")
    } catch (error) {
      console.error("Error booking seats:", error.response);
      //alert("Error booking seats");
    }
  };
  
  

  const resetBooking = () => {
    setSeats(Array(80).fill("available"));
    setBookedSeats([]);
    setSeatCount(0);
  };

  if (!isMounted) {
    return null; // Render nothing before the component mounts
  }

  return (
    <div className="container">
      <div className="left-panel">
        <h2>Ticket Booking</h2>
        <div className="seats-grid">
          {seats.map((status, index) => (
            <div
              key={index}
              className={`seat ${status}`}
              title={`Seat ${index + 1}`}
            >
              {index + 1}
            </div>
          ))}
        </div>
        <div className="status">
          <p>
            <span className="legend available"></span> Available Seats:{" "}
            {seats.filter((s) => s === "available").length}
          </p>
          <p>
            <span className="legend booked"></span> Booked Seats:{" "}
            {bookedSeats.length}
          </p>
        </div>
      </div>
      <div className="right-panel">
        <h3>Book Seats</h3>
        <input
          type="number"
          placeholder="Enter number of seats"
          value={seatCount}
          onChange={(e) => setSeatCount(Number(e.target.value))}
          min="1"
        />
        <button onClick={handleBooking}>Book</button>
        <button onClick={resetBooking} className="reset">
          Reset Booking
        </button>
      </div>

      <style jsx>{`
        .container {
          display: flex;
          gap: 20px;
          padding: 20px;
        }
        .left-panel,
        .right-panel {
          flex: 1;
          padding: 20px;
          border: 1px solid #ccc;
          border-radius: 10px;
        }
        .seats-grid {
          display: grid;
          grid-template-columns: repeat(10, 1fr);
          gap: 10px;
          margin-top: 20px;
        }
        .seat {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #ccc;
          border-radius: 5px;
          font-size: 14px;
          font-weight: bold;
        }
        .seat.available {
          background-color: #d4edda;
        }
        .seat.booked {
          background-color: #ffeeba;
        }
        .status {
          margin-top: 20px;
        }
        .legend {
          display: inline-block;
          width: 20px;
          height: 20px;
          margin-right: 10px;
          border-radius: 3px;
        }
        .legend.available {
          background-color: #d4edda;
        }
        .legend.booked {
          background-color: #ffeeba;
        }
        .right-panel input {
          width: 100%;
          padding: 10px;
          margin-bottom: 10px;
          border: 1px solid #ccc;
          border-radius: 5px;
        }
        .right-panel button {
          width: 100%;
          padding: 10px;
          margin-bottom: 10px;
          border: none;
          border-radius: 5px;
          background-color: #007bff;
          color: white;
          font-size: 16px;
          cursor: pointer;
        }
        .right-panel button.reset {
          background-color: #dc3545;
        }
      `}</style>
    </div>
  );
};

export default Seats;
