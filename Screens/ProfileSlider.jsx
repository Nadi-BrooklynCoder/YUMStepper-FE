import React, { useContext, useRef, useCallback } from 'react';
import { View, Text, Animated, StyleSheet, Dimensions, PanResponder, Pressable } from 'react-native';
import StepsContainer from '../Components/Profile/StepsContainer';
import PointsContainer from '../Components/Profile/PointsContainer';
import CheckinContainer from '../Components/Profile/CheckinContainer';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../Context/AuthContext';

const { width, height } = Dimensions.get('window');

const ProfileSlider = () => {
    const { userToken, userId, logout, user } = useContext(AuthContext);
    const [index, setIndex] = React.useState(0);
    const slideAnim = useRef(new Animated.Value(0)).current;
    const navigation = useNavigation();

    const panResponder = useRef(
        PanResponder.create({
            onMoveShouldSetPanResponder: (evt, gestureState) =>
                Math.abs(gestureState.dx) > Math.abs(gestureState.dy),
            onPanResponderMove: (evt, gestureState) => {
                if (gestureState.dx < 0 && index < 1) {
                    slideAnim.setValue(gestureState.dx);
                } else if (gestureState.dx > 0 && index > 0) {
                    slideAnim.setValue(-width + gestureState.dx);
                }
            },
            onPanResponderRelease: (evt, gestureState) => {
                const threshold = width / 4;
                if (gestureState.dx < -threshold && index < 1) {
                    handleSlide(1);
                } else if (gestureState.dx > threshold && index > 0) {
                    handleSlide(0);
                } else {
                    handleSlide(index);
                }
            },
        })
    ).current;

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
                    <PointsContainer key={`points-${user.points_earned}`} />
                </View>
            </Animated.View>
        );
    };

    const handleLogout = useCallback(async () => {
        await logout(navigation);
    }, [logout, navigation]);

    return (
        <View style={styles.mainContainer} {...panResponder.panHandlers}>
            {/* Logout Button */}
            <Pressable onPress={handleLogout} style={styles.logoutButton}>
                <Text style={styles.logoutText}>Logout</Text>
            </Pressable>

            <View style={styles.userInfoContainer}>
                <Text style={styles.userInfoText}>Profile of: {user?.username}</Text>
                <Text style={styles.userInfoText}>Email: {user?.email}</Text>
            </View>

            <View style={styles.sliderContainer}>
                <Animated.View
                    style={[
                        styles.sliderIndicator,
                        {
                            transform: [
                                {
                                    translateX: slideAnim.interpolate({
                                        inputRange: [-width, 0],
                                        outputRange: [width * 0.4, 0],
                                    }),
                                },
                            ],
                        },
                    ]}
                />
            </View>

            <View style={styles.contentContainer}>{renderContent()}</View>

            <CheckinContainer />

            {/* Go to Map Button */}
            <Pressable
                onPress={() => navigation.navigate('Map', { userId, token: userToken })}
                style={styles.mapButton}
            >
                <Text style={styles.mapButtonText}>🚶‍♂️ Go to Map</Text>
            </Pressable>
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
        height: height * 0.6, // Adjusted height for larger containers
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
        padding: 20,
        borderRadius: 15,
        alignItems: 'center',
        marginTop: 30,
        width: width * 0.7,
        alignSelf: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
        position: 'absolute',
        bottom: 30,
    },
    mapButtonText: {
        color: '#000000',
        fontWeight: 'bold',
        fontSize: 18,
    },
    logoutButton: {
        position: 'absolute',
        top: 40,
        right: 20,
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 5,
        backgroundColor: '#FFFFFF', // Solid background color
        zIndex: 10,
    },
    logoutText: {
        color: '#A41623',
        fontWeight: 'bold',
        fontSize: 14,
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


   