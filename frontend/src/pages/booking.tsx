import React, { useState } from 'react';

const Booking = () => {
    const [formData, setFormData] = useState({
        roomId: 1,
        checkInDate: '',
        checkOutDate: '',
        totalPrice: 150.00
    });
    
    const [bookingCreated, setBookingCreated] = useState<any>(null);

    const handleBooking = (e: React.FormEvent) => {
        e.preventDefault();
        
        fetch('http://localhost:8080/api/user/bookings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        })
        .then(res => res.json())
        .then(data => {
            setBookingCreated(data);
            alert('Booking created successfully!');
        })
        .catch(err => console.error(err));
    };

    const handlePayment = () => {
        fetch('http://localhost:8080/api/user/payments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                booking: { id: bookingCreated.id },
                amount: formData.totalPrice
            })
        })
        .then(res => res.json())
        .then(() => {
            alert('Payment successful! Booking confirmed and points earned.');
            window.location.href = '/my-bookings'; // Redirect
        })
        .catch(err => console.error(err));
    };

    return (
        <div className="max-w-3xl mx-auto p-6 mt-10">
            <h1 className="text-3xl font-bold text-gray-800 mb-8 border-b pb-4">Create a Reservation</h1>

            {!bookingCreated ? (
                <form onSubmit={handleBooking} className="bg-white shadow-xl rounded-xl p-8 border border-gray-100">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <label className="block text-gray-700 font-semibold mb-2">Check-in Date</label>
                            <input 
                                type="date" 
                                required
                                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                                value={formData.checkInDate}
                                onChange={e => setFormData({...formData, checkInDate: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 font-semibold mb-2">Check-out Date</label>
                            <input 
                                type="date" 
                                required
                                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                                value={formData.checkOutDate}
                                onChange={e => setFormData({...formData, checkOutDate: e.target.value})}
                            />
                        </div>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg mb-6 flex justify-between items-center border border-gray-200">
                        <span className="text-gray-600 font-medium">Estimated Total:</span>
                        <span className="text-2xl font-bold text-gray-800">${formData.totalPrice.toFixed(2)}</span>
                    </div>

                    <button 
                        type="submit"
                        className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 shadow-md transition duration-300"
                    >
                        Reserve Now
                    </button>
                </form>
            ) : (
                <div className="bg-white shadow-xl rounded-xl p-8 border border-gray-100 text-center">
                    <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Booking Pending Payment</h2>
                    <p className="text-gray-600 mb-6">Your reservation has been created. Please complete the payment to confirm it and earn loyalty points.</p>
                    
                    <button 
                        onClick={handlePayment}
                        className="bg-green-500 text-white font-bold px-8 py-3 rounded-lg hover:bg-green-600 shadow-md transition duration-300"
                    >
                        Pay ${formData.totalPrice.toFixed(2)}
                    </button>
                </div>
            )}
        </div>
    );
};

export default Booking;
