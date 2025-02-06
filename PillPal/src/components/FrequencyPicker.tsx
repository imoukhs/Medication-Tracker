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

interface FrequencyPickerProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (frequency: string) => void;
  frequencies: string[];
  selectedFrequency?: string;
}

const FrequencyPicker: React.FC<FrequencyPickerProps> = ({
  visible,
  onClose,
  onSelect,
  frequencies,
  selectedFrequency,
}) => {
  const { colors } = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={[styles.content, { backgroundColor: colors.background }]}>
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <Text style={[styles.title, { color: colors.text }]}>Select Frequency</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.optionsContainer}>
            {frequencies.map((frequency) => (
              <TouchableOpacity
                key={frequency}
                style={[
                  styles.option,
                  { borderBottomColor: colors.border },
                  selectedFrequency === frequency && { backgroundColor: `${colors.primary}20` },
                ]}
                onPress={() => {
                  onSelect(frequency);
                  onClose();
                }}
              >
                <Text style={[styles.optionText, { color: colors.text }]}>{frequency}</Text>
                {selectedFrequency === frequency && (
                  <Ionicons name="checkmark" size={24} color={colors.primary} />
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
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  content: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: Dimensions.get('window').height * 0.7,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  optionsContainer: {
    padding: 10,
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
  },
  optionText: {
    fontSize: 16,
  },
});

export default FrequencyPicker; 