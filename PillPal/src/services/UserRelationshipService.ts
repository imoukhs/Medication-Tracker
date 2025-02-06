import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserRelationship, UserRole, UserPermissions } from '../types/index';

const RELATIONSHIPS_KEY = '@user_relationships';

const DEFAULT_PERMISSIONS: Record<UserRole, UserPermissions> = {
  caregiver: {
    canViewMedications: true,
    canEditMedications: true,
    canViewAdherence: true,
    canViewMedicalInfo: true,
    canEditMedicalInfo: true,
    canManageEmergencyContacts: true,
    canReceiveAlerts: true,
  },
  healthcare_provider: {
    canViewMedications: true,
    canEditMedications: true,
    canViewAdherence: true,
    canViewMedicalInfo: true,
    canEditMedicalInfo: true,
    canManageEmergencyContacts: false,
    canReceiveAlerts: true,
  },
  family_member: {
    canViewMedications: true,
    canEditMedications: false,
    canViewAdherence: true,
    canViewMedicalInfo: true,
    canEditMedicalInfo: false,
    canManageEmergencyContacts: true,
    canReceiveAlerts: true,
  },
  patient: {
    canViewMedications: true,
    canEditMedications: true,
    canViewAdherence: true,
    canViewMedicalInfo: true,
    canEditMedicalInfo: true,
    canManageEmergencyContacts: true,
    canReceiveAlerts: true,
  },
};

class UserRelationshipService {
  async getRelationships(): Promise<UserRelationship[]> {
    try {
      const data = await AsyncStorage.getItem(RELATIONSHIPS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting relationships:', error);
      return [];
    }
  }

  async addRelationship(userId: string, relatedUserId: string, role: UserRole): Promise<UserRelationship> {
    try {
      const relationships = await this.getRelationships();
      const newRelationship: UserRelationship = {
        id: Date.now().toString(),
        userId,
        relatedUserId,
        role,
        permissions: DEFAULT_PERMISSIONS[role],
        status: 'pending',
        createdAt: new Date(),
      };

      relationships.push(newRelationship);
      await AsyncStorage.setItem(RELATIONSHIPS_KEY, JSON.stringify(relationships));
      return newRelationship;
    } catch (error) {
      console.error('Error adding relationship:', error);
      throw new Error('Failed to add relationship');
    }
  }

  async updateRelationshipStatus(relationshipId: string, status: 'active' | 'rejected'): Promise<void> {
    try {
      const relationships = await this.getRelationships();
      const index = relationships.findIndex(rel => rel.id === relationshipId);
      
      if (index !== -1) {
        relationships[index].status = status;
        await AsyncStorage.setItem(RELATIONSHIPS_KEY, JSON.stringify(relationships));
      }
    } catch (error) {
      console.error('Error updating relationship status:', error);
      throw new Error('Failed to update relationship status');
    }
  }

  async updatePermissions(relationshipId: string, permissions: Partial<UserPermissions>): Promise<void> {
    try {
      const relationships = await this.getRelationships();
      const index = relationships.findIndex(rel => rel.id === relationshipId);
      
      if (index !== -1) {
        relationships[index].permissions = {
          ...relationships[index].permissions,
          ...permissions,
        };
        await AsyncStorage.setItem(RELATIONSHIPS_KEY, JSON.stringify(relationships));
      }
    } catch (error) {
      console.error('Error updating permissions:', error);
      throw new Error('Failed to update permissions');
    }
  }

  async removeRelationship(relationshipId: string): Promise<void> {
    try {
      const relationships = await this.getRelationships();
      const filtered = relationships.filter(rel => rel.id !== relationshipId);
      await AsyncStorage.setItem(RELATIONSHIPS_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error removing relationship:', error);
      throw new Error('Failed to remove relationship');
    }
  }

  async getActiveRelationships(userId: string): Promise<UserRelationship[]> {
    try {
      const relationships = await this.getRelationships();
      return relationships.filter(
        rel => (rel.userId === userId || rel.relatedUserId === userId) && rel.status === 'active'
      );
    } catch (error) {
      console.error('Error getting active relationships:', error);
      return [];
    }
  }

  async getPendingInvites(userId: string): Promise<UserRelationship[]> {
    try {
      const relationships = await this.getRelationships();
      return relationships.filter(
        rel => rel.relatedUserId === userId && rel.status === 'pending'
      );
    } catch (error) {
      console.error('Error getting pending invites:', error);
      return [];
    }
  }
}

export default new UserRelationshipService(); 