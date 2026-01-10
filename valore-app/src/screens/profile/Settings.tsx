import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  ChevronLeft,
  ChevronRight,
  User,
  Bell,
  Shield,
  HelpCircle,
  FileText,
  LogOut,
  ExternalLink,
} from 'lucide-react-native';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../styles/theme';
import { useAuth } from '../../hooks/useLocalAuth';
import type { ProfileStackParamList } from '../../navigation/ProfileStack';

type Props = {
  navigation: NativeStackNavigationProp<ProfileStackParamList, 'Settings'>;
};

interface SettingItemProps {
  icon: React.ReactNode;
  label: string;
  onPress?: () => void;
  rightText?: string;
  danger?: boolean;
  external?: boolean;
}

function SettingItem({ icon, label, onPress, rightText, danger, external }: SettingItemProps) {
  return (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.settingIcon, danger && styles.settingIconDanger]}>
        {icon}
      </View>
      <Text style={[styles.settingLabel, danger && styles.settingLabelDanger]}>
        {label}
      </Text>
      {rightText && <Text style={styles.settingRight}>{rightText}</Text>}
      {onPress && !external && (
        <ChevronRight size={20} color={colors.textTertiary} />
      )}
      {external && <ExternalLink size={16} color={colors.textTertiary} />}
    </TouchableOpacity>
  );
}

export default function SettingsScreen({ navigation }: Props) {
  const { signOut, profile } = useAuth();

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: signOut,
        },
      ]
    );
  };

  const handleOpenPrivacy = () => {
    Linking.openURL('https://valore.app/privacy');
  };

  const handleOpenTerms = () => {
    Linking.openURL('https://valore.app/terms');
  };

  const handleOpenHelp = () => {
    Linking.openURL('https://valore.app/help');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ChevronLeft size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Account section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.sectionContent}>
            <SettingItem
              icon={<User size={20} color={colors.textSecondary} />}
              label="Edit Profile"
              onPress={() => navigation.navigate('EditProfile')}
            />
            <SettingItem
              icon={<Bell size={20} color={colors.textSecondary} />}
              label="Notifications"
              rightText="On"
            />
            <SettingItem
              icon={<Shield size={20} color={colors.textSecondary} />}
              label="Privacy"
              onPress={() => {}}
            />
          </View>
        </View>

        {/* Support section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <View style={styles.sectionContent}>
            <SettingItem
              icon={<HelpCircle size={20} color={colors.textSecondary} />}
              label="Help Center"
              onPress={handleOpenHelp}
              external
            />
            <SettingItem
              icon={<FileText size={20} color={colors.textSecondary} />}
              label="Terms of Service"
              onPress={handleOpenTerms}
              external
            />
            <SettingItem
              icon={<Shield size={20} color={colors.textSecondary} />}
              label="Privacy Policy"
              onPress={handleOpenPrivacy}
              external
            />
          </View>
        </View>

        {/* Sign out */}
        <View style={styles.section}>
          <View style={styles.sectionContent}>
            <SettingItem
              icon={<LogOut size={20} color={colors.error} />}
              label="Sign Out"
              onPress={handleSignOut}
              danger
            />
          </View>
        </View>

        {/* App info */}
        <View style={styles.appInfo}>
          <Text style={styles.appName}>Valore</Text>
          <Text style={styles.appVersion}>Version 1.0.0</Text>
          {profile?.username && (
            <Text style={styles.accountInfo}>
              Signed in as @{profile.username}
            </Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  headerTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: spacing.xxl,
  },
  section: {
    marginTop: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  sectionContent: {
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.borderLight,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  settingIcon: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.backgroundTertiary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  settingIconDanger: {
    backgroundColor: colors.error + '10',
  },
  settingLabel: {
    flex: 1,
    fontSize: fontSize.base,
    color: colors.textPrimary,
  },
  settingLabelDanger: {
    color: colors.error,
  },
  settingRight: {
    fontSize: fontSize.sm,
    color: colors.textTertiary,
    marginRight: spacing.sm,
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  appName: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.primary,
  },
  appVersion: {
    fontSize: fontSize.sm,
    color: colors.textTertiary,
    marginTop: spacing.xs,
  },
  accountInfo: {
    fontSize: fontSize.sm,
    color: colors.textTertiary,
    marginTop: spacing.sm,
  },
});
