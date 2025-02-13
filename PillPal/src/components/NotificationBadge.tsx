import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface NotificationBadgeProps {
  count: number;
}

const NotificationBadge: React.FC<NotificationBadgeProps> = ({ count }) => {
  const { colors } = useTheme();

  if (count === 0) return null;

  return (
    <View style={[styles.badge, { backgroundColor: colors.error }]}>
      <Text style={styles.text}>{count > 99 ? '99+' : count}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: -5,
    right: -10,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default NotificationBadge; 