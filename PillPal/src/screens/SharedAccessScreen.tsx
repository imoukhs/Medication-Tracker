import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Modal,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { RootStackParamList } from '../types';
import { UserRole, UserPermissions } from '../types/user';
import SupabaseSharedAccessService from '../services/SupabaseSharedAccessService';
import RolePickerModal from '../components/RolePickerModal';
import NotificationService from '../services/NotificationService';

type SharedAccessScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface SharedAccessItem {
  id: string;
  email: string;
  role: UserRole;
  status: 'pending' | 'active' | 'rejected';
  created_at: string;
}

const SharedAccessScreen = () => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const navigation = useNavigation<SharedAccessScreenNavigationProp>();
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showRolePicker, setShowRolePicker] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('caregiver');
  const [activeConnections, setActiveConnections] = useState<SharedAccessItem[]>([]);
  const [pendingInvites, setPendingInvites] = useState<SharedAccessItem[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (user) {
      loadInitialData();
    } else {
      navigation.replace('Login');
    }
  }, [user]);

  const loadInitialData = async () => {
    if (!user) {
      navigation.replace('Login');
      return;
    }

    try {
      setIsLoading(true);
      const [connectionsResponse, invitesResponse] = await Promise.all([
        SupabaseSharedAccessService.getActiveConnections(),
        SupabaseSharedAccessService.getReceivedInvites(),
      ]);

      if (connectionsResponse.error) throw connectionsResponse.error;
      if (invitesResponse.error) throw invitesResponse.error;

      setActiveConnections(connectionsResponse.data ?? []);
      setPendingInvites(invitesResponse.data ?? []);
      setHasMore((connectionsResponse.data?.length ?? 0) === 10);
      setPage(0);

      // Show notification for new invites
      if (invitesResponse.data && invitesResponse.data.length > 0) {
        for (const invite of invitesResponse.data) {
          await NotificationService.scheduleMedicationReminder({
            id: invite.id,
            name: 'New Role Assignment',
            dosage: '',
            frequency: '',
            instructions: `${invite.email} has invited you as a ${invite.role.replace('_', ' ')}`,
            scheduledTime: new Date(),
            supply: 0,
            lowSupplyThreshold: 0,
            owner_id: user.id,
            shared_with: []
          });
        }
      }
    } catch (error) {
      console.error('Error loading shared access data:', error);
      Alert.alert('Error', 'Failed to load shared access data');
    } finally {
      setIsLoading(false);
    }
  };

  const loadMoreData = async () => {
    if (!hasMore || isLoading) return;

    try {
      setIsLoading(true);
      const nextPage = page + 1;
      const { data, error } = await SupabaseSharedAccessService.getActiveConnections(nextPage);

      if (error) throw error;

      if (data) {
        setActiveConnections(prev => [...prev, ...data]);
        setHasMore(data.length === 10);
        setPage(nextPage);
      }
    } catch (error) {
      console.error('Error loading more connections:', error);
      Alert.alert('Error', 'Failed to load more connections');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadInitialData();
    setRefreshing(false);
  };

  const handleInvite = async () => {
    if (!inviteEmail) {
      Alert.alert('Error', 'Please enter an email address');
      return;
    }

    if (!selectedRole) {
      Alert.alert('Error', 'Please select a role');
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await SupabaseSharedAccessService.sendInvite(inviteEmail, selectedRole);
      
      if (error) {
        Alert.alert('Error', error.message);
        return;
      }

      if (data) {
        await loadInitialData();
        setShowInviteModal(false);
        setInviteEmail('');
        setSelectedRole('caregiver');
        Alert.alert('Success', 'Invitation sent successfully');
      }
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to send invitation');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptInvite = async (inviteId: string) => {
    try {
      const { error } = await SupabaseSharedAccessService.respondToInvite(inviteId, true);
      if (error) throw error;

      Alert.alert('Success', 'Invitation accepted');
      handleRefresh();
    } catch (error) {
      console.error('Error accepting invite:', error);
      Alert.alert('Error', 'Failed to accept invitation');
    }
  };

  const handleRejectInvite = async (inviteId: string) => {
    try {
      const { error } = await SupabaseSharedAccessService.respondToInvite(inviteId, false);
      if (error) throw error;

      Alert.alert('Success', 'Invitation rejected');
      handleRefresh();
    } catch (error) {
      console.error('Error rejecting invite:', error);
      Alert.alert('Error', 'Failed to reject invitation');
    }
  };

  const handleRemoveAccess = async (connectionId: string) => {
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
              const { error } = await SupabaseSharedAccessService.removeConnection(connectionId);
              if (error) throw error;

              Alert.alert('Success', 'Access removed successfully');
              handleRefresh();
            } catch (error) {
              console.error('Error removing access:', error);
              Alert.alert('Error', 'Failed to remove access');
            }
          },
        },
      ]
    );
  };

  const renderInviteModal = () => (
    <Modal
      visible={showInviteModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowInviteModal(false)}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}
      >
        <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Invite User</Text>
            <TouchableOpacity onPress={() => setShowInviteModal(false)}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.modalBody}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>Email Address</Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: colors.surface,
                color: colors.text,
                borderColor: colors.border
              }]}
              value={inviteEmail}
              onChangeText={setInviteEmail}
              placeholder="Enter email address"
              placeholderTextColor={colors.textSecondary}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <TouchableOpacity
              style={[styles.roleSelector, { borderColor: colors.border }]}
              onPress={() => setShowRolePicker(true)}
            >
              <Text style={[styles.inputLabel, { color: colors.text, marginBottom: 0 }]}>Role</Text>
              <View style={styles.roleSelectorContent}>
                <Text style={[styles.selectedRole, { color: colors.text }]}>
                  {selectedRole.replace('_', ' ')}
                </Text>
                <Ionicons name="chevron-down" size={20} color={colors.text} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.inviteButton, { backgroundColor: colors.primary }]}
              onPress={handleInvite}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.inviteButtonText}>Send Invite</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      <RolePickerModal
        visible={showRolePicker}
        onClose={() => setShowRolePicker(false)}
        onSelect={(role) => {
          setSelectedRole(role);
          setShowRolePicker(false);
        }}
        selectedRole={selectedRole}
      />
    </Modal>
  );

  const renderPendingInvites = () => {
    if (pendingInvites.length === 0) return null;

    return (
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Pending Invitations</Text>
        {pendingInvites.map((invite) => (
          <View
            key={invite.id}
            style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <View style={styles.cardContent}>
              <View>
                <Text style={[styles.email, { color: colors.text }]}>{invite.email}</Text>
                <Text style={[styles.role, { color: colors.textSecondary }]}>
                  {invite.role.charAt(0).toUpperCase() + invite.role.slice(1).replace('_', ' ')}
                </Text>
              </View>
              <View style={styles.actions}>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: colors.primary }]}
                  onPress={() => handleAcceptInvite(invite.id)}
                >
                  <Text style={styles.actionButtonText}>Accept</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.rejectButton]}
                  onPress={() => handleRejectInvite(invite.id)}
                >
                  <Text style={[styles.actionButtonText, { color: colors.error }]}>Reject</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderActiveConnections = () => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Active Connections</Text>
      {activeConnections.map((connection) => (
        <View
          key={connection.id}
          style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
        >
          <View style={styles.cardContent}>
            <View>
              <Text style={[styles.email, { color: colors.text }]}>{connection.email}</Text>
              <Text style={[styles.role, { color: colors.textSecondary }]}>
                {connection.role.charAt(0).toUpperCase() + connection.role.slice(1).replace('_', ' ')}
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.removeButton]}
              onPress={() => handleRemoveAccess(connection.id)}
            >
              <Ionicons name="trash-outline" size={24} color={colors.error} />
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </View>
  );

  if (isLoading && !refreshing) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Shared Access</Text>
        <TouchableOpacity onPress={() => setShowInviteModal(true)}>
          <Ionicons name="add" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        onScroll={({ nativeEvent }) => {
          const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
          const isEndReached = layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;
          if (isEndReached && hasMore) {
            loadMoreData();
          }
        }}
        scrollEventThrottle={16}
      >
        {renderPendingInvites()}
        {renderActiveConnections()}
        {activeConnections.length === 0 && pendingInvites.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={48} color={colors.textSecondary} />
            <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
              No shared access connections yet
            </Text>
            <TouchableOpacity
              style={[styles.emptyStateButton, { backgroundColor: colors.primary }]}
              onPress={() => setShowInviteModal(true)}
            >
              <Text style={styles.emptyStateButtonText}>Invite Someone</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {renderInviteModal()}
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
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    overflow: 'hidden',
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  email: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  role: {
    fontSize: 14,
  },
  actions: {
    flexDirection: 'row',
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginLeft: 8,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  rejectButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#ff3b30',
  },
  removeButton: {
    padding: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  modalBody: {
    padding: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  roleSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 24,
  },
  roleSelectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedRole: {
    fontSize: 16,
    marginRight: 8,
  },
  inviteButton: {
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inviteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    marginTop: 48,
  },
  emptyStateText: {
    fontSize: 16,
    marginTop: 16,
    marginBottom: 24,
  },
  emptyStateButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  emptyStateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SharedAccessScreen; 