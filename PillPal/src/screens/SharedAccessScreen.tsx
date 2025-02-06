import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Platform,
} from 'react-native';
import { Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../context/ThemeContext';
import { RootStackParamList, UserRelationship, UserRole } from '../types';
import UserRelationshipService from '../services/UserRelationshipService';
import RolePickerModal from '../components/RolePickerModal';

type SharedAccessScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const ROLE_LABELS: Record<UserRole, string> = {
  caregiver: 'Caregiver',
  healthcare_provider: 'Healthcare Provider',
  family_member: 'Family Member',
  patient: 'Patient',
};

const SharedAccessScreen = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<SharedAccessScreenNavigationProp>();
  const [activeRelationships, setActiveRelationships] = useState<UserRelationship[]>([]);
  const [pendingInvites, setPendingInvites] = useState<UserRelationship[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('caregiver');
  const [showRoleModal, setShowRoleModal] = useState(false);

  useEffect(() => {
    loadRelationships();
  }, []);

  const loadRelationships = async () => {
    try {
      // TODO: Replace with actual user ID
      const userId = 'current-user-id';
      const active = await UserRelationshipService.getActiveRelationships(userId);
      const pending = await UserRelationshipService.getPendingInvites(userId);
      setActiveRelationships(active);
      setPendingInvites(pending);
    } catch (error) {
      Alert.alert('Error', 'Failed to load relationships');
    }
  };

  const handleInvite = async () => {
    if (!inviteEmail.trim()) {
      Alert.alert('Error', 'Please enter an email address');
      return;
    }

    try {
      // TODO: Replace with actual user ID
      const userId = 'current-user-id';
      await UserRelationshipService.addRelationship(userId, inviteEmail, selectedRole);
      Alert.alert('Success', 'Invitation sent successfully');
      setInviteEmail('');
      loadRelationships();
    } catch (error) {
      Alert.alert('Error', 'Failed to send invitation');
    }
  };

  const handleAcceptInvite = async (relationshipId: string) => {
    try {
      await UserRelationshipService.updateRelationshipStatus(relationshipId, 'active');
      loadRelationships();
    } catch (error) {
      Alert.alert('Error', 'Failed to accept invitation');
    }
  };

  const handleRejectInvite = async (relationshipId: string) => {
    try {
      await UserRelationshipService.updateRelationshipStatus(relationshipId, 'rejected');
      loadRelationships();
    } catch (error) {
      Alert.alert('Error', 'Failed to reject invitation');
    }
  };

  const handleRemoveAccess = async (relationshipId: string) => {
    Alert.alert(
      'Remove Access',
      'Are you sure you want to remove access for this person?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await UserRelationshipService.removeRelationship(relationshipId);
              loadRelationships();
            } catch (error) {
              Alert.alert('Error', 'Failed to remove access');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Shared Access</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Invite Someone</Text>
          <View style={styles.inviteForm}>
            <TextInput
              style={[styles.input, { 
                backgroundColor: colors.surface,
                color: colors.text,
                borderColor: colors.border,
              }]}
              value={inviteEmail}
              onChangeText={setInviteEmail}
              placeholder="Enter email address"
              placeholderTextColor={colors.textSecondary}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TouchableOpacity
              style={[styles.roleButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => setShowRoleModal(true)}
            >
              <Text style={[styles.roleButtonText, { color: colors.text }]}>
                {ROLE_LABELS[selectedRole]}
              </Text>
              <Ionicons name="chevron-down" size={20} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.inviteButton, { backgroundColor: colors.primary }]}
              onPress={handleInvite}
            >
              <Text style={styles.inviteButtonText}>Send Invite</Text>
            </TouchableOpacity>
          </View>
        </View>

        {pendingInvites.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Pending Invites</Text>
            {pendingInvites.map((invite) => (
              <View
                key={invite.id}
                style={[styles.relationshipCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
              >
                <View style={styles.relationshipInfo}>
                  <Text style={[styles.relationshipEmail, { color: colors.text }]}>
                    {invite.relatedUserId}
                  </Text>
                  <Text style={[styles.relationshipRole, { color: colors.textSecondary }]}>
                    {ROLE_LABELS[invite.role]}
                  </Text>
                </View>
                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: colors.primary }]}
                    onPress={() => handleAcceptInvite(invite.id)}
                  >
                    <Text style={styles.actionButtonText}>Accept</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: colors.error }]}
                    onPress={() => handleRejectInvite(invite.id)}
                  >
                    <Text style={styles.actionButtonText}>Reject</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Active Relationships</Text>
          {activeRelationships.map((relationship) => (
            <View
              key={relationship.id}
              style={[styles.relationshipCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              <View style={styles.relationshipInfo}>
                <Text style={[styles.relationshipEmail, { color: colors.text }]}>
                  {relationship.relatedUserId}
                </Text>
                <Text style={[styles.relationshipRole, { color: colors.textSecondary }]}>
                  {ROLE_LABELS[relationship.role]}
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.removeButton, { borderColor: colors.error }]}
                onPress={() => handleRemoveAccess(relationship.id)}
              >
                <Text style={[styles.removeButtonText, { color: colors.error }]}>Remove</Text>
              </TouchableOpacity>
            </View>
          ))}
          {activeRelationships.length === 0 && (
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No active relationships
            </Text>
          )}
        </View>
      </ScrollView>

      <RolePickerModal
        visible={showRoleModal}
        onClose={() => setShowRoleModal(false)}
        onSelect={setSelectedRole}
        selectedRole={selectedRole}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 16,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  inviteForm: {
    gap: 12,
  },
  input: {
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  roleButton: {
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  roleButtonText: {
    fontSize: 16,
  },
  inviteButton: {
    height: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inviteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  relationshipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
  },
  relationshipInfo: {
    flex: 1,
  },
  relationshipEmail: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  relationshipRole: {
    fontSize: 14,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  removeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
  },
  removeButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    fontStyle: 'italic',
  },
});

export default SharedAccessScreen; 