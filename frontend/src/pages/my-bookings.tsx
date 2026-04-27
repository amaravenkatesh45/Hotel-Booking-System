import React, { useState, useEffect } from 'react';

const MyBookings = () => {
    const [bookings, setBookings] = useState<any[]>([]);

    useEffect(() => {
        // Fetch User Bookings
        fetch('http://localhost:8080/api/user/bookings')
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch');
                return res.json();
            })
            .then(data => setBookings(Array.isArray(data) ? data : []))
            .catch(err => console.error(err));
    }, []);

    const cancelBooking = (id: number) => {
        fetch(`http://localhost:8080/api/user/bookings/${id}/cancel`, { method: 'PUT' })
            .then(res => {
                if (res.ok) {
                    alert('Booking cancelled successfully');
                    setBookings(bookings.map(b => b.id === id ? { ...b, status: 'CANCELLED' } : b));
                }
            })
            .catch(err => console.error('Error cancelling booking:', err));
    };

    return (
        <div className="max-w-4xl mx-auto p-6 mt-10">
            <h1 className="text-3xl font-bold text-gray-800 mb-8 border-b pb-4">My Bookings</h1>
            
            <div className="grid gap-6">
                {bookings.length > 0 ? bookings.map((b) => (
                    <div key={b.id} className="bg-white shadow-md rounded-xl p-6 flex justify-between items-center border-l-4 border-indigo-500 hover:shadow-lg transition">
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Booking #{b.id}</p>
                            <h3 className="text-xl font-semibold text-gray-800">Room ID: {b.roomId}</h3>
                            <p className="text-gray-600 mt-2">
                                <span className="font-medium">Dates:</span> {b.checkInDate} to {b.checkOutDate}
                            </p>
                            <p className="mt-2">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                    b.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' :
                                    b.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                                    'bg-yellow-100 text-yellow-700'
                                }`}>
                                    {b.status}
                                </span>
                            </p>
                        </div>
                        
                        {b.status !== 'CANCELLED' && (
                            <button 
                                onClick={() => cancelBooking(b.id)}
                                className="bg-red-50 hover:bg-red-100 text-red-600 font-medium px-4 py-2 rounded-lg border border-red-200 transition duration-300"
                            >
                                Cancel Reservation
                            </button>
                        )}
                    </div>
                )) : (
                    <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                        <h3 className="text-lg font-medium text-gray-700">No bookings found</h3>
                        <p className="text-gray-500 mt-2">You haven't made any reservations yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyBookings;
