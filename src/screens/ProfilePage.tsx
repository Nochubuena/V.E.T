import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
} from 'react-native';

const ProfilePage = ({navigation}: any) => {
  const handleLogOut = () => {
    // Navigate back to sign in
    navigation.reset({
      index: 0,
      routes: [{name: 'SignIn'}],
    });
  };

  const handleSwitchAccount = () => {
    // Navigate back to sign in
    navigation.reset({
      index: 0,
      routes: [{name: 'SignIn'}],
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <View style={styles.backButton}>
            <Text style={styles.backArrow}>‹</Text>
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Information */}
        <View style={styles.profileSection}>
          <View style={styles.profileImage}>
            <Text style={styles.dogEmoji}>🐕</Text>
          </View>
          <Text style={styles.dogName}>Dog Name 1</Text>
          <Text style={styles.accountInfo}>gmail used</Text>
        </View>

        {/* Action Items */}
        <View style={styles.actionsSection}>
          <View style={styles.divider} />
          
          {/* Switch Account */}
          <TouchableOpacity style={styles.actionItem} onPress={handleSwitchAccount}>
            <View style={styles.actionLeft}>
              <Text style={styles.actionIcon}>⇄</Text>
              <Text style={styles.actionText}>Switch Account</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Log Out */}
          <TouchableOpacity style={styles.actionItem} onPress={handleLogOut}>
            <View style={styles.actionLeft}>
              <View style={styles.logoutIcon}>
                <Text style={styles.logoutSymbol}>🚪</Text>
              </View>
              <Text style={[styles.actionText, styles.logoutText]}>Log Out</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          <View style={styles.divider} />
        </View>
      </ScrollView>

      {/* Bottom Navigation Bar (handled by Tab Navigator in App.tsx) */}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backArrow: {
    fontSize: 24,
    color: '#000000',
    fontWeight: 'bold',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 100,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  dogEmoji: {
    fontSize: 60,
  },
  dogName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4,
  },
  accountInfo: {
    fontSize: 16,
    color: '#666666',
  },
  actionsSection: {
    width: '100%',
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  actionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  actionText: {
    fontSize: 16,
    color: '#000000',
  },
  logoutText: {
    color: '#FF3B30',
  },
  logoutIcon: {
    marginRight: 12,
  },
  logoutSymbol: {
    fontSize: 20,
  },
  chevron: {
    fontSize: 20,
    color: '#000000',
  },
});

export default ProfilePage;




