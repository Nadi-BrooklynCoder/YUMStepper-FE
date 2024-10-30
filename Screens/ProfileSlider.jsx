//profileslider
import React, { useState, useContext, useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet, Dimensions, PanResponder, Pressable } from 'react-native';
import StepsContainer from '../Components/Profile/StepsContainer';
import PointsContainer from '../Components/Profile/PointsContainer';
import CheckinContainer from '../Components/Profile/CheckinContainer';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../Context/AuthContext';

const { width } = Dimensions.get('window');
const { height } = Dimensions.get('window');

const ProfileSlider = () => {
    const { userToken, userId, logout, user, userPoints } = useContext(AuthContext);
    const [index, setIndex] = useState(0);
    const slideAnim = useRef(new Animated.Value(0)).current; // Initialize the animation reference
    const navigation = useNavigation();
    const [points, setPoints] = useState(userPoints);

    // PanResponder setup for detecting swipes
    const panResponder = useRef(
        PanResponder.create({
            onMoveShouldSetPanResponder: (evt, gestureState) =>
                Math.abs(gestureState.dx) > Math.abs(gestureState.dy),
            onPanResponderMove: (evt, gestureState) => {
                // Move animation with swipe
                if (gestureState.dx < 0 && index < 1) {
                    slideAnim.setValue(gestureState.dx);
                } else if (gestureState.dx > 0 && index > 0) {
                    slideAnim.setValue(-width + gestureState.dx);
                }
            },
            onPanResponderRelease: (evt, gestureState) => {
                const threshold = width / 4;
                if (gestureState.dx < -threshold && index < 1) {
                    handleSlide(1); // Swipe to Points
                } else if (gestureState.dx > threshold && index > 0) {
                    handleSlide(0); // Swipe to Steps
                } else {
                    handleSlide(index); // Snap back to the current view
                }
            },
        })
    ).current;

    useEffect(() => {
        setPoints(userPoints); // Update the local state with userPoints
    }, [userPoints]);

    const handleSlide = (newIndex) => {
        setIndex(newIndex);
        Animated.spring(slideAnim, {
            toValue: -newIndex * width,
            useNativeDriver: true,
        }).start();
    };

    const renderContent = () => {
        return (
            <Animated.View
                style={[
                    styles.slidingContainer,
                    {
                        transform: [{ translateX: slideAnim }],
                    },
                ]}
            >
                <View style={styles.screen}>
                    <StepsContainer />
                </View>
                <View style={styles.screen}>
                    <PointsContainer userPoints={points} key={`points-${points}`} />
                </View>
            </Animated.View>
        );
    };

    const handleLogout = async () => {
        await logout(navigation);
    };

    if (!userId || !userToken) {
        return (
            <View style={styles.authContainer}>
                <Text style={styles.authText}>You are not logged in.</Text>
            </View>
        );
    }

    if (!user) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Loading...</Text>
            </View>
        );
    }

    return (
        <View style={styles.mainContainer} {...panResponder.panHandlers}>
            <View style={styles.userInfoContainer}>
                <Text style={styles.userInfoText}>Profile of: {user.username}</Text>
                <Text style={styles.userInfoText}>Email: {user.email}</Text>
            </View>

            <View style={styles.sliderContainer}>
                {/* Slider Indicator */}
                <Animated.View
                    style={[
                        styles.sliderIndicator,
                        {
                            transform: [
                                {
                                    translateX: slideAnim.interpolate({
                                        inputRange: [-width, 0],
                                        outputRange: [width * 0.4, 0], // Adjust slider position
                                    }),
                                },
                            ],
                        },
                    ]}
                />
            </View>

            <View style={styles.contentContainer}>
                {renderContent()}
            </View>

            <CheckinContainer />

            <View style={styles.buttonContainer}>
                <Pressable
                    onPress={() => navigation.navigate('Map', { userId, token: userToken })}
                    style={styles.mapButton}
                >
                    <Text style={styles.mapButtonText}>Go to Map</Text>
                </Pressable>

                <Pressable onPress={handleLogout} style={styles.logoutButton}>
                    <Text style={styles.logoutText}>Logout</Text>
                </Pressable>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        paddingVertical: 20,
        backgroundColor: '#FFEEDD',
        width,
        height,
    },
    userInfoContainer: {
        marginTop: 30,
        marginBottom: 10,
        alignItems: 'flex-start',
        paddingHorizontal: 20,
    },
    userInfoText: {
        fontSize: 18,
        marginBottom: 5,
        color: '#A41623',
        fontFamily: 'Itim',
        textAlign: 'center',
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
        width,
        height: height * 0.5,
        overflow: 'hidden',
        paddingVertical: 20,
    },
    slidingContainer: {
        flexDirection: 'row',
        width: width * 2,
    },
    screen: {
        width,
        justifyContent: 'center',
        alignItems: 'center',
    },
    mapButton: {
        backgroundColor: '#FFB563',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
    },
    mapButtonText: {
        color: '#000000',
        fontWeight: 'bold',
    },
    logoutButton: {
        marginTop: 20,
        alignItems: 'center',
    },
    logoutText: {
        color: '#A41623',
        fontWeight: 'bold',
    },
    authContainer: {
        padding: 20,
        backgroundColor: 'antiquewhite',
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    authText: {
        fontSize: 18,
        color: '#333',
        textAlign: 'center',
    },
    loadingContainer: {
        padding: 20,
        backgroundColor: 'antiquewhite',
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 18,
        color: '#333',
    },
});

export default ProfileSlider;