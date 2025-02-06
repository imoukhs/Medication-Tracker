import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../context/ThemeContext';
import { RootStackParamList } from '../types';
import StorageService from '../services/StorageService';

type EmergencyContactScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'EmergencyContact'>;

interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
}

const EmergencyContactScreen = () => {
  const navigation = useNavigation<EmergencyContactScreenNavigationProp>();
  const { colors } = useTheme();
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [relationship, setRelationship] = useState('');

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      const savedContacts = await StorageService.getEmergencyContacts();
      if (savedContacts) {
        setContacts(savedContacts);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load emergency contacts');
    }
  };

  const handleAddContact = async () => {
    if (!name.trim() || !phone.trim() || !relationship.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const phoneRegex = /^\+?[\d\s-]{10,}$/;
    if (!phoneRegex.test(phone.trim())) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return;
    }

    const newContact: EmergencyContact = {
      id: Date.now().toString(),
      name: name.trim(),
      phone: phone.trim(),
      relationship: relationship.trim(),
    };

    try {
      const updatedContacts = [...contacts, newContact];
      await StorageService.saveEmergencyContacts(updatedContacts);
      setContacts(updatedContacts);
      setName('');
      setPhone('');
      setRelationship('');
      Alert.alert('Success', 'Emergency contact added successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to save emergency contact');
    }
  };

  const handleDeleteContact = async (id: string) => {
    Alert.alert(
      'Delete Contact',
      'Are you sure you want to delete this emergency contact?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const updatedContacts = contacts.filter(contact => contact.id !== id);
              await StorageService.saveEmergencyContacts(updatedContacts);
              setContacts(updatedContacts);
            } catch (error) {
              Alert.alert('Error', 'Failed to delete emergency contact');
            }
          },
        },
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Emergency Contacts</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.formContainer}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Add New Contact</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]}
            placeholder="Name"
            placeholderTextColor={colors.textSecondary}
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]}
            placeholder="Phone Number"
            placeholderTextColor={colors.textSecondary}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]}
            placeholder="Relationship"
            placeholderTextColor={colors.textSecondary}
            value={relationship}
            onChangeText={setRelationship}
          />
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: colors.primary }]}
            onPress={handleAddContact}
          >
            <Text style={styles.addButtonText}>Add Contact</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.contactsContainer}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Your Contacts</Text>
          {contacts.length === 0 ? (
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No emergency contacts added yet
            </Text>
          ) : (
            contacts.map(contact => (
              <View
                key={contact.id}
                style={[styles.contactCard, { backgroundColor: colors.surface }]}
              >
                <View style={styles.contactInfo}>
                  <Text style={[styles.contactName, { color: colors.text }]}>{contact.name}</Text>
                  <Text style={[styles.contactDetails, { color: colors.textSecondary }]}>
                    {contact.phone}
                  </Text>
                  <Text style={[styles.contactDetails, { color: colors.textSecondary }]}>
                    {contact.relationship}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteContact(contact.id)}
                >
                  <Ionicons name="trash-outline" size={24} color={colors.error} />
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 60,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 15,
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
  formContainer: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },
  input: {
    height: 50,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 12,
    fontSize: 16,
  },
  addButton: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  contactsContainer: {
    flex: 1,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 20,
  },
  contactCard: {
    flexDirection: 'row',
    padding: 15,
    borderRadius: 8,
    marginBottom: 12,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  contactDetails: {
    fontSize: 14,
    marginBottom: 2,
  },
  deleteButton: {
    padding: 5,
  },
});

export default EmergencyContactScreen; 