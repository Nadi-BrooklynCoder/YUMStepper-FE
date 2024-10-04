import { View, Text, Pressable, StyleSheet } from 'react-native';
import React, { useContext } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useFonts, Montserrat_300Light_Italic } from '@expo-google-fonts/montserrat';
import { AuthContext } from '../Context/AuthContext';

const Home = () => {

  const { userToken } = useContext(AuthContext)
  
  const navigation = useNavigation();

  let [fontsLoaded] = useFonts({
    Montserrat_300Light_Italic,
  });

  if (!fontsLoaded) {
    return null; 
  }

  return (
    <View style={styles.container}>
      

      <Text style={styles.title}>YUM Stepper</Text>

      {!userToken && (
        <Pressable style={styles.button} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.buttonText}>Login</Text>
        </Pressable>
      )}
      
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F2632F',
  },
  title: {
    fontWeight: 1000,
    marginBottom: 20,
    fontFamily: 'Montserrat_300Light_Italic',
    fontSize: 70,
  },
  button: {
    backgroundColor: '#3498DB',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
    width: 110,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default Home;
