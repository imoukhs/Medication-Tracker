import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native';
import { theme } from '../theme';

const ProfileScreen = () => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.subtitle}>Achievements</Text>
        {/* We'll add achievements component here */}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.light.background,
  },
  header: {
    padding: 20,
    backgroundColor: theme.light.primary,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.light.text,
    marginBottom: 10,
  },
});

export default ProfileScreen; 