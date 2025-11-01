import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import {useApp} from '../context/AppContext';

const ProfilePage = ({navigation}: any) => {
  const {owner, dogs, logout} = useApp();

  const handleLogOut = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: () => {
            logout();
            navigation.reset({
              index: 0,
              routes: [{name: 'Login'}],
            });
            Alert.alert('Success', 'You have been logged out successfully');
          },
        },
      ]
    );
  };

  const handleSwitchAccount = () => {
    Alert.alert(
      'Switch Account',
      'Are you sure you want to switch accounts? You will be logged out.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Switch',
          onPress: () => {
            logout();
            navigation.reset({
              index: 0,
              routes: [{name: 'Login'}],
            });
            Alert.alert('Success', 'Switched account successfully');
          },
        },
      ]
    );
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
            <Text style={styles.profileIcon}>👤</Text>
          </View>
          <Text style={styles.dogName}>{owner?.name || 'Owner'}</Text>
          <Text style={styles.accountInfo}>{owner?.email || 'No email'}</Text>
        </View>

        {/* Dogs Section */}
        <View style={styles.dogsSection}>
          <View style={styles.dogsSectionHeader}>
            <Text style={styles.dogsSectionTitle}>Your Dogs ({dogs.length})</Text>
            <TouchableOpacity 
              style={styles.addPetButton}
              onPress={() => navigation.navigate('SignUpDog')}
            >
              <Text style={styles.addPetButtonText}>+ Add New Pet</Text>
            </TouchableOpacity>
          </View>
          {dogs.length > 0 ? (
            <View style={styles.dogsList}>
              {dogs.map(dog => (
                <View key={dog.id} style={styles.dogItem}>
                  <View style={styles.dogItemImageContainer}>
                    {dog.imageUri ? (
                      <Image source={{uri: dog.imageUri}} style={styles.dogItemImage} />
                    ) : (
                      <Text style={styles.dogItemEmoji}>🐕</Text>
                    )}
                  </View>
                  <Text style={styles.dogItemName}>{dog.name}</Text>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.noDogsContainer}>
              <Text style={styles.noDogsText}>No pets registered yet</Text>
            </View>
          )}
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
  profileIcon: {
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
  dogsSection: {
    marginBottom: 32,
  },
  dogsSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  dogsSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
  },
  addPetButton: {
    backgroundColor: '#000000',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addPetButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  noDogsContainer: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  noDogsText: {
    fontSize: 16,
    color: '#666666',
  },
  dogsList: {
    gap: 12,
  },
  dogItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  dogItemImageContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  dogItemImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  dogItemEmoji: {
    fontSize: 28,
  },
  dogItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
});

export default ProfilePage;





