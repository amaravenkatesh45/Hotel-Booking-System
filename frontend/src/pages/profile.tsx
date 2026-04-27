import React, { useState, useEffect } from 'react';

const Profile = () => {
    const [profile, setProfile] = useState<any>(null);
    const [points, setPoints] = useState<number>(0);

    useEffect(() => {
        // Fetch Profile
        fetch('http://localhost:8080/api/user/me')
            .then(res => res.json())
            .then(data => setProfile(data))
            .catch(err => console.error(err));

        // Fetch Points
        fetch('http://localhost:8080/api/user/points')
            .then(res => res.json())
            .then(data => setPoints(data.loyaltyPoints))
            .catch(err => console.error(err));
    }, []);

    const redeemPoints = () => {
        fetch('http://localhost:8080/api/user/points/redeem', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ points: 100 })
        })
        .then(res => res.json())
        .then(data => {
            alert(data.message || 'Points redeemed');
            if (data.remainingPoints !== undefined) setPoints(data.remainingPoints);
        });
    };

    if (!profile) return <div className="p-8 text-center text-lg">Loading profile...</div>;

    return (
        <div className="max-w-2xl mx-auto p-6 mt-10 bg-white rounded-lg shadow-lg">
            <h1 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-4">User Profile</h1>
            <div className="space-y-4 mb-8 text-gray-600">
                <p className="flex justify-between border-b pb-2">
                    <span className="font-semibold text-gray-800">Username:</span> 
                    <span>{profile.username || 'N/A'}</span>
                </p>
                <p className="flex justify-between border-b pb-2">
                    <span className="font-semibold text-gray-800">Email:</span> 
                    <span>{profile.email || 'N/A'}</span>
                </p>
            </div>
            
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 rounded-lg shadow text-white flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-semibold mb-1">Loyalty Rewards</h2>
                    <p className="text-blue-100 text-sm">Earn points on every booking!</p>
                </div>
                <div className="text-right">
                    <p className="text-3xl font-bold">{points}</p>
                    <p className="text-sm opacity-80 mb-2">Points Available</p>
                    <button 
                        onClick={redeemPoints}
                        className="bg-white text-indigo-600 text-sm font-semibold px-4 py-2 rounded-full hover:bg-gray-100 transition duration-300"
                    >
                        Redeem 100 pts
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Profile;
