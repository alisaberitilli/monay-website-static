import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { Colors } from '@/constants/Colors';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: logout,
        },
      ]
    );
  };

  const ProfileSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );

  const ProfileItem = ({ 
    icon, 
    title, 
    subtitle, 
    onPress, 
    showChevron = true 
  }: {
    icon: string;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    showChevron?: boolean;
  }) => (
    <TouchableOpacity style={styles.profileItem} onPress={onPress}>
      <View style={styles.itemIcon}>
        <Ionicons name={icon as any} size={24} color={Colors.primary} />
      </View>
      <View style={styles.itemContent}>
        <Text style={styles.itemTitle}>{title}</Text>
        {subtitle && <Text style={styles.itemSubtitle}>{subtitle}</Text>}
      </View>
      {showChevron && (
        <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </Text>
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.userName}>{user?.firstName} {user?.lastName}</Text>
              <Text style={styles.userEmail}>{user?.email}</Text>
              <View style={styles.verificationStatus}>
                <View style={[styles.statusBadge, { backgroundColor: user?.isEmailVerified ? Colors.success + '20' : Colors.warning + '20' }]}>
                  <Text style={[styles.statusText, { color: user?.isEmailVerified ? Colors.success : Colors.warning }]}>
                    Email {user?.isEmailVerified ? 'Verified' : 'Unverified'}
                  </Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: user?.isMobileVerified ? Colors.success + '20' : Colors.warning + '20' }]}>
                  <Text style={[styles.statusText, { color: user?.isMobileVerified ? Colors.success : Colors.warning }]}>
                    Mobile {user?.isMobileVerified ? 'Verified' : 'Unverified'}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Account Settings */}
        <ProfileSection title="Account">
          <ProfileItem
            icon="person-outline"
            title="Personal Information"
            subtitle="Update your personal details"
            onPress={() => Alert.alert('Coming Soon', 'This feature will be available soon.')}
          />
          <ProfileItem
            icon="shield-checkmark-outline"
            title="Security"
            subtitle="Change password, enable 2FA"
            onPress={() => Alert.alert('Coming Soon', 'This feature will be available soon.')}
          />
          <ProfileItem
            icon="card-outline"
            title="Payment Methods"
            subtitle="Manage your cards and bank accounts"
            onPress={() => Alert.alert('Coming Soon', 'This feature will be available soon.')}
          />
          <ProfileItem
            icon="document-text-outline"
            title="KYC Verification"
            subtitle={`Status: ${user?.kycStatus?.toUpperCase()}`}
            onPress={() => Alert.alert('Coming Soon', 'This feature will be available soon.')}
          />
        </ProfileSection>

        {/* Preferences */}
        <ProfileSection title="Preferences">
          <ProfileItem
            icon="notifications-outline"
            title="Notifications"
            subtitle="Push notifications, email alerts"
            onPress={() => Alert.alert('Coming Soon', 'This feature will be available soon.')}
          />
          <ProfileItem
            icon="moon-outline"
            title="Dark Mode"
            subtitle="Coming soon"
            onPress={() => Alert.alert('Coming Soon', 'Dark mode will be available soon.')}
          />
          <ProfileItem
            icon="language-outline"
            title="Language"
            subtitle="English (US)"
            onPress={() => Alert.alert('Coming Soon', 'Language selection will be available soon.')}
          />
          <ProfileItem
            icon="location-outline"
            title="Currency"
            subtitle="USD ($)"
            onPress={() => Alert.alert('Coming Soon', 'Currency selection will be available soon.')}
          />
        </ProfileSection>

        {/* Support */}
        <ProfileSection title="Support & Legal">
          <ProfileItem
            icon="help-circle-outline"
            title="Help Center"
            subtitle="FAQs and support articles"
            onPress={() => Alert.alert('Coming Soon', 'Help center will be available soon.')}
          />
          <ProfileItem
            icon="chatbubble-outline"
            title="Contact Support"
            subtitle="Get help from our team"
            onPress={() => Alert.alert('Coming Soon', 'Support chat will be available soon.')}
          />
          <ProfileItem
            icon="document-outline"
            title="Privacy Policy"
            onPress={() => Alert.alert('Coming Soon', 'Privacy policy will be available soon.')}
          />
          <ProfileItem
            icon="document-outline"
            title="Terms of Service"
            onPress={() => Alert.alert('Coming Soon', 'Terms of service will be available soon.')}
          />
        </ProfileSection>

        {/* Sign Out */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color={Colors.error} />
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        {/* App Version */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Monay Wallet v1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    padding: 20,
    backgroundColor: Colors.surface,
    marginBottom: 20,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    color: Colors.white,
    fontSize: 24,
    fontWeight: 'bold',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  verificationStatus: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginTop: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  profileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  itemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  itemSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginHorizontal: 20,
    borderRadius: 12,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.error,
    marginLeft: 16,
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  versionText: {
    fontSize: 14,
    color: Colors.textHint,
  },
});