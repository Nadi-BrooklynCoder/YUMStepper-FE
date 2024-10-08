import React, { useState, useEffect } from 'react';
import { Image, StyleSheet } from 'react-native';

const AnimatedGif = ({ frameDuration, style }) => {
  const frames = [
    require('../assets/Gif/1.png'),
    require('../assets/Gif/2.png'),
    require('../assets/Gif/3.png'),
    require('../assets/Gif/4.png'),
    require('../assets/Gif/5.png'),
    require('../assets/Gif/6.png'),
    require('../assets/Gif/7.png'),
    require('../assets/Gif/8.png'),
    require('../assets/Gif/9.png'),
    require('../assets/Gif/10.png'),
    require('../assets/Gif/12.png'),
    require('../assets/Gif/13.png'),
    require('../assets/Gif/14.png'),

  ];

  const [currentFrame, setCurrentFrame] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFrame(prevFrame => (prevFrame + 1) % frames.length);
    }, frameDuration);

    return () => clearInterval(interval); // Cleanup on component unmount
  }, [frames, frameDuration]);

  return (
    <Image 
      source={frames[currentFrame]} 
      style={[styles.image, style]}  // Merge styles
    />
  );
};

const styles = StyleSheet.create({
  image: {
    width: 200,
    height: 200,
  },
});

export default AnimatedGif;
