import { View, Text } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import { GOOGLE_API_KEY, API_BASE_URL } from '@env';
import axios from 'axios';
import RewardCard from '../Components/Rewards/RewardCard';
import { AuthContext } from '../Context/AuthContext';

const Rewards = () => {

    const { userId } = useContext(AuthContext) 
    const [rewards, setRewards] = useState([])

    useEffect(async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/rewards`)
            const userRewards = res.data.filter( r => r.user_id === userId || !r?.user_id)
            setRewards(userRewards)  
        } catch (err) {
            if (err.response) {
                console.error("Error response:", err.response.data);
                console.error("Status:", err.response.status);
            } else if (err.request) {
                console.error("No response received:", err.request);
            } else {
                console.error("Error", err.message);
            }
        }
    },[ userId ])

    return (
        <View>
            {rewards.map((reward, idx) => {
                return <RewardCard reward={reward} key={idx}/>
            })}
        </View>
    )
}

export default Rewards;