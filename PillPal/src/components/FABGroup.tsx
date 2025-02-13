import React, { useState, useRef } from 'react';
import { View, TouchableOpacity, StyleSheet, Animated, PanResponder, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useHelp } from '../context/HelpContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const BUTTON_SIZE = 56;

const FABGroup = () => {
  const { colors } = useTheme();
  const { showHelpModal } = useHelp();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  
  const pan = useRef(new Animated.ValueXY()).current;
  const scale = useRef(new Animated.Value(1)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        Animated.spring(scale, {
          toValue: 0.9,
          useNativeDriver: true,
          tension: 100,
          friction: 5,
        }).start();
      },
      onPanResponderMove: Animated.event(
        [
          null,
          { dx: pan.x, dy: pan.y }
        ],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: (_, gestureState) => {
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
          tension: 100,
          friction: 5,
        }).start();

        // Snap to edges
        let newX = gestureState.moveX - BUTTON_SIZE / 2;
        let newY = gestureState.moveY - BUTTON_SIZE / 2;

        // Ensure the button stays within screen bounds
        newX = Math.max(0, Math.min(newX, SCREEN_WIDTH - BUTTON_SIZE));
        newY = Math.max(0, Math.min(newY, SCREEN_HEIGHT - BUTTON_SIZE));

        Animated.spring(pan, {
          toValue: { x: newX, y: newY },
          useNativeDriver: false,
          tension: 80,
          friction: 6,
        }).start();
      },
    })
  ).current;

  const handlePress = () => {
    navigation.navigate('AddMedication');
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [
            { translateX: pan.x },
            { translateY: pan.y },
            { scale },
          ],
        },
      ]}
      {...panResponder.panHandlers}
    >
      <TouchableOpacity
        style={[styles.button, { backgroundColor: colors.primary }]}
        onPress={handlePress}
      >
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    zIndex: 999,
  },
  button: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});

export default FABGroup; 