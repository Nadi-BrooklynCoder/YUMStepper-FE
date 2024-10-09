<<<<<<< HEAD
import { View, Text, Pressable, StyleSheet } from 'react-native';
=======
import { View, Text, Pressable, StyleSheet, Image } from 'react-native';
>>>>>>> KhyBranch
import React, { useContext } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useFonts, Montserrat_300Light_Italic } from '@expo-google-fonts/montserrat';
import { AuthContext } from '../Context/AuthContext';
<<<<<<< HEAD

const Home = () => {
  
  const { userToken } = useContext(AuthContext)
=======
import AnimatedGif from '../Components/AnimatedGif'; // Importing AnimatedGif component

const Home = () => {
  const { userToken } = useContext(AuthContext);
>>>>>>> KhyBranch
  const navigation = useNavigation();

  let [fontsLoaded] = useFonts({
    Montserrat_300Light_Italic,
  });

  if (!fontsLoaded) {
    return null; 
  }

  return (
    <View style={styles.container}>
      {/* Replacing imageOne with AnimatedGif */}
      <AnimatedGif 
        frameDuration={205} // Set the gif speed
        style={styles.imageOne} // Add style for dimensions and appearance
      />

<<<<<<< HEAD
      {!userToken && ( 
        <Pressable style={styles.button} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.buttonText}>Login</Text>
        </Pressable>
      )}
     
=======
      <Image 
        source={require('../assets/animatedLogo/slogan.png')}
        style={styles.imageTwo} 
        resizeMode="contain" // Ensures the image maintains its aspect ratio
      />

      {!userToken && (
        <Pressable 
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed, // Change style on press
          ]}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.buttonText}>Start Stepping Here!</Text>
        </Pressable>
      )}
>>>>>>> KhyBranch
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: 'antiquewhite',
  },
  button: {
    backgroundColor: '#597500',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    width: 255,
    height: 60,
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 4 },
    shadowOpacity: 0.7,
    shadowRadius: 4,
    elevation: 5, //height
    marginTop:10,
  },
  buttonPressed: { // Style for pressed state
    backgroundColor: '#007BFF', // Darker shade for pressed effect
    elevation: 8, // Optional: Higher elevation for pressed effect
    width: 300,
    height: 60,
  },
  buttonText: {
    color: 'antiquewhite',
    fontWeight: 'bold',
    fontFamily:'arial',
    fontSize: 23,
  },
  imageOne: {
    width: 300,
    height: 350,
    marginBottom:0.5,
  },
  imageTwo: {
    width: 400,
    height: 100, // Adjust height based on your image
    marginRight:10,
    marginLeft:10,
  },
});

export default Home;
