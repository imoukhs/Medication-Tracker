import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import NotificationBadge from './NotificationBadge';

interface SettingItemProps {
  icon: string;
  label: string;
  description: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  isDestructive?: boolean;
  notificationCount?: number;
}

const SettingItem: React.FC<SettingItemProps> = ({
  icon,
  label,
  description,
  onPress,
  rightElement,
  isDestructive = false,
  notificationCount = 0,
}) => {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={[styles.container, { borderColor: colors.border }]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons
            name={icon as any}
            size={24}
            color={isDestructive ? colors.error : colors.primary}
          />
          {notificationCount > 0 && (
            <NotificationBadge count={notificationCount} />
          )}
        </View>
        <View style={styles.textContainer}>
          <Text style={[
            styles.label,
            { color: isDestructive ? colors.error : colors.text }
          ]}>
            {label}
          </Text>
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            {description}
          </Text>
        </View>
        {rightElement ? (
          <View style={styles.rightElement}>
            {rightElement}
          </View>
        ) : (
          <Ionicons
            name="chevron-forward"
            size={24}
            color={colors.textSecondary}
          />
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
  },
  rightElement: {
    marginLeft: 8,
  },
});

export default SettingItem; 