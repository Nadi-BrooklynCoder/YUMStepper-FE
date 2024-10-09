import { View, Text, Pressable, StyleSheet, Image } from 'react-native';
import React, { useContext } from 'react';
import { useNavigation } from '@react-navigation/native';
import { Montserrat_700Bold } from '@expo-google-fonts/montserrat';
import { useFonts } from 'expo-font';
import { AuthContext } from '../Context/AuthContext';
import AnimatedGif from '../Components/AnimatedGif'; // Importing AnimatedGif component
import * as Animatable from 'react-native-animatable';

const Home = () => {
  const { userToken } = useContext(AuthContext);
  const navigation = useNavigation();

  let [fontsLoaded] = useFonts({
    Montserrat_700Bold,
    Itim: require('../assets/fonts/Itim-Regular.ttf'),
    'Open-Sans': require('../assets/fonts/OpenSans-Bold.ttf'),
  });

  if (!fontsLoaded) {
    return null; 
  }

  const sloganWords = ["Step", "your", "way", "to", "YUM!"];

  return (
    <View style={styles.container}>
      {/* Replacing imageOne with AnimatedGif */}
      <AnimatedGif 
        frameDuration={205} // Set the gif speed
        style={styles.imageOne} // Add style for dimensions and appearance
      />

<View style={styles.sloganContainer}>
        {sloganWords.map((word, index) => (
          <Animatable.Text
            key={index}
            animation="fadeInRight"
            delay={index * 700} 
            duration={1000}
            style={styles.sloganText}
          >
            {word}
          </Animatable.Text>
        ))}
      </View>

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

      {/* Placeholder for social media icons */}
      <View style={styles.socialContainer}>
        <Image 
          source={require('../assets/instagram.png')} // Placeholder Instagram icon
          style={styles.instagramIcon}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
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
    height: 50,
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 4 },
    shadowOpacity: 0.7,
    shadowRadius: 4,
    elevation: 5, //height
    marginBottom: 40,
    marginTop: -10
  },
  buttonPressed: { // Style for pressed state
    backgroundColor: '#007BFF', // Darker shade for pressed effect
    elevation: 8, // Optional: Higher elevation for pressed effect
    width: 300,
    height: 50,
  },
  buttonText: {
    color: 'antiquewhite',
    fontWeight: 'bold',
    fontFamily: 'OpenSans_700Bold',
    fontSize: 18,
    textAlign: 'center',
  },
  sloganContainer: {
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    justifyContent: 'center',
    marginBottom: 25, 
  },
  sloganText: {
    fontSize: 22, 
    fontFamily: 'Itim_400Regular',
    color: '#A41623', 
    textAlign: 'center',
    marginHorizontal: 3, 
  },
  imageOne: {
    width: 300,
    height: 300,
    marginTop: 40,
  },
  socialContainer: {
    marginTop: -20,
    alignItems: 'center',
  },
  socialText: {
    fontSize: 18,
    fontFamily: 'Montserrat_700Bold',
    color: '#A41623',
  },
  instagramIcon: {
    width: 40,
    height: 40,
    marginTop: -5
  },
});

export default Home;


