import React from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { UserRole } from '../types/index';

const { height } = Dimensions.get('window');

interface RolePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (role: UserRole) => void;
  selectedRole: UserRole;
}

const ROLE_OPTIONS: Array<{ role: UserRole; label: string; description: string }> = [
  {
    role: 'caregiver',
    label: 'Caregiver',
    description: 'Can manage medications, view medical info, and receive alerts',
  },
  {
    role: 'healthcare_provider',
    label: 'Healthcare Provider',
    description: 'Can view and edit medical information and medication details',
  },
  {
    role: 'family_member',
    label: 'Family Member',
    description: 'Can view medications and receive alerts',
  },
];

const RolePickerModal: React.FC<RolePickerModalProps> = ({
  visible,
  onClose,
  onSelect,
  selectedRole,
}) => {
  const { colors } = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
          <View style={[styles.header, { backgroundColor: colors.surface }]}>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Select Role</Text>
            <View style={styles.headerRight} />
          </View>

          <ScrollView style={styles.optionsList}>
            {ROLE_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.role}
                style={[
                  styles.optionItem,
                  { backgroundColor: colors.surface },
                  selectedRole === option.role && {
                    borderColor: colors.primary,
                    borderWidth: 2,
                  },
                ]}
                onPress={() => {
                  onSelect(option.role);
                  onClose();
                }}
              >
                <View style={styles.optionContent}>
                  <Text style={[styles.optionLabel, { color: colors.text }]}>
                    {option.label}
                  </Text>
                  <Text style={[styles.optionDescription, { color: colors.textSecondary }]}>
                    {option.description}
                  </Text>
                </View>
                {selectedRole === option.role && (
                  <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    maxHeight: height * 0.7,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  headerRight: {
    width: 24,
  },
  optionsList: {
    padding: 16,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  optionContent: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
  },
});

export default RolePickerModal; 