import React, { useContext, useRef, useCallback, useEffect, useState } from 'react';
import {
    View,
    Text,
    Animated,
    StyleSheet,
    Dimensions,
    PanResponder,
    TouchableOpacity,
    Pressable,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons'; // Updated to FontAwesome5 for proper icon support
import StepsContainer from '../Components/Profile/StepsContainer';
import PointsContainer from '../Components/Profile/PointsContainer';
import CheckinContainer from '../Components/Profile/CheckinContainer';
import StepsHistory from '../Components/Profile/StepsHistory';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../Context/AuthContext';

const { width } = Dimensions.get('window');

const ProfileSlider = () => {
    const {
        logout,
        user,
        userToken,
        isLoading,
        refreshTrigger,
        setRefreshTrigger,
        userId,
        fetchCheckInHistory,
    } = useContext(AuthContext);
    const [index, setIndex] = useState(0);
    const slideAnim = useRef(new Animated.Value(0)).current;
    const navigation = useNavigation();

    // Total number of slides
    const TOTAL_SCREENS = 2;

    // Trigger fetchCheckInHistory when userId or refreshTrigger changes
    useEffect(() => {
        if (userId && userToken) {
            console.log("Fetching updated check-in history...");
            fetchCheckInHistory();
        }
    }, [userId, userToken, fetchCheckInHistory]);

    // PanResponder for swipe handling
    const panResponder = useRef(
        PanResponder.create({
            onMoveShouldSetPanResponder: (evt, gestureState) =>
                Math.abs(gestureState.dx) > Math.abs(gestureState.dy) && Math.abs(gestureState.dx) > 10,
            onPanResponderMove: (evt, gestureState) => {
                let newValue = -index * width + gestureState.dx;
                newValue = Math.max(-(TOTAL_SCREENS - 1) * width, Math.min(0, newValue));
                slideAnim.setValue(newValue);
            },
            onPanResponderRelease: (evt, gestureState) => {
                const threshold = width / 4;
                let newIndex = index;
                if (gestureState.dx < -threshold && index < TOTAL_SCREENS - 1) {
                    newIndex = index + 1;
                } else if (gestureState.dx > threshold && index > 0) {
                    newIndex = index - 1;
                }
                handleSlide(newIndex);
            },
        })
    ).current;

    // Function to handle slide transition
    const handleSlide = useCallback((newIndex) => {
        setIndex(newIndex);
        Animated.spring(slideAnim, {
            toValue: -newIndex * width,
            useNativeDriver: true,
        }).start();
    }, [slideAnim]);

    // Handle Logout with Confirmation
    const handleLogout = useCallback(() => {
        Alert.alert(
            "Confirm Logout",
            "Are you sure you want to logout?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Logout",
                    style: "destructive",
                    onPress: async () => {
                        await logout(navigation);
                        setIndex(0);
                    }
                },
            ],
            { cancelable: true }
        );
    }, [logout, navigation]);

    // Redirect to Login if userToken is missing
    useEffect(() => {
        if (!userToken) {
            navigation.navigate('Login');
        }
    }, [userToken, navigation]);

    // Show loading indicator while data is being fetched
    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#A41623" />
            </View>
        );
    }

    return (
        <View style={styles.mainContainer} {...panResponder.panHandlers}>
            {/* Logout Button */}
            <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
                <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>

            {/* Beginner YumStepper Level (top-left corner) */}
            {/* Beginner YumStepper Level */}
<View style={styles.levelContainer}>
    <FontAwesome5 name="utensils" size={20} color="#F85E00" /> 
    <Text style={styles.levelText}>YUMStepper Explorer</Text>
</View>


            {/* User Information */}
            <View style={styles.userInfoContainer}>
                <Text style={styles.userInfoText}>Profile of: {user?.username ?? 'N/A'}</Text>
                <Text style={styles.userInfoText}>Email: {user?.email ?? 'N/A'}</Text>
            </View>

            {/* Slider Indicator */}
            <View style={styles.sliderContainer}>
                <Animated.View
                    style={[
                        styles.sliderIndicator,
                        {
                            transform: [
                                {
                                    translateX: slideAnim.interpolate({
                                        inputRange: [-(TOTAL_SCREENS - 1) * width, 0],
                                        outputRange: [width * 0.4, 0],
                                    }),
                                },
                            ],
                        },
                    ]}
                />
            </View>

            {/* Sliding Content */}
            <View style={styles.contentContainer}>
                <Animated.View
                    style={[
                        styles.slidingContainer,
                        {
                            transform: [{ translateX: slideAnim }],
                        },
                    ]}
                >
                    {/* First Slide: Points and Check-ins */}
                    <View style={styles.screen}>
                        <PointsContainer key={`points-${user?.points_earned}`} refreshTrigger={refreshTrigger} />
                        <CheckinContainer refreshTrigger={refreshTrigger} />
                    </View>

                    {/* Second Slide: Steps and Steps History */}
                    <View style={styles.screen}>
                        <StepsContainer />
                        <StepsHistory />
                    </View>
                </Animated.View>
            </View>

            {/* Navigate to Map Button */}
            <Pressable onPress={() => navigation.navigate('Map')} style={styles.mapButton}>
                <Text style={styles.mapButtonText}>🚶‍♂️ Go to Map</Text>
            </Pressable>
        </View>
    );
};

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: '#FFEEDD',
        width,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFEEDD',
    },
    logoutButton: {
        position: 'absolute',
        top: 40,
        right: 20,
        backgroundColor: '#A41623',
        padding: 10,
        borderRadius: 5,
        zIndex: 3,
    },
    logoutText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    levelContainer: {
        position: 'absolute',
        top: 40,
        left: 20,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF5E1',
        padding: 5,
        borderRadius: 5,
        zIndex: 3,
    },
    levelText: {
        marginLeft: 5,
        fontSize: 16,
        color: '#003087',
        fontWeight: 'bold',
    },
    userInfoContainer: {
        marginTop: 110,
        marginBottom: 10,
        alignItems: 'flex-start',
        paddingHorizontal: 20,
    },
    userInfoText: {
        fontSize: 18,
        marginBottom: 5,
        color: '#A41623',
        fontFamily: 'Itim',
    },
    sliderContainer: {
        marginTop: 20,
        position: 'relative',
        width: width * 0.8,
        alignSelf: 'center',
        justifyContent: 'center',
    },
    sliderIndicator: {
        position: 'absolute',
        bottom: -10,
        left: 0,
        width: '50%',
        height: 5,
        backgroundColor: '#F85E00',
        borderRadius: 3,
    },
    contentContainer: {
        flex: 1,
        marginTop: 20,
    },
    slidingContainer: {
        flexDirection: 'row',
        width: width * 2,
        flex: 1,
    },
    screen: {
        width: width,
        flex: 1,
    },
    mapButton: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        backgroundColor: '#A41623',
        padding: 15,
        borderRadius: 50,
        zIndex: 3,
    },
    mapButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default ProfileSlider;
