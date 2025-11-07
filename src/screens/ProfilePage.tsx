import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  Platform,
  Modal,
} from 'react-native';
import {CommonActions} from '@react-navigation/native';
import {useApp} from '../context/AppContext';

const ProfilePage = ({navigation}: any) => {
  const {owner, dogs, logout, deleteDog, markDogDeceased} = useApp();
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedDog, setSelectedDog] = useState<any>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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
            // Clear auth state first
            logout();
            
            // Reset navigation to Login screen
            // Since ProfilePage is nested (TabNavigator -> StackNavigator),
            // we need to reset from the root Stack navigator
            // Try to get the root navigator by traversing up the navigation tree
            let rootNavigator = navigation;
            while (rootNavigator.getParent()) {
              rootNavigator = rootNavigator.getParent();
            }
            
            // Reset the entire navigation stack to Login
            rootNavigator.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{name: 'Login'}],
              })
            );
          },
        },
      ]
    );
  };

  const handleDeleteDog = (dog: any) => {
    console.log('handleDeleteDog called with:', dog.name);
    setSelectedDog(dog);
    setShowDeleteConfirm(false);
    setDeleteModalVisible(true);
    console.log('Modal should be visible now');
  };

  const handleMarkDeceased = async () => {
    if (!selectedDog) return;
    setDeleteModalVisible(false);
    const success = await markDogDeceased(selectedDog.id);
    if (success) {
      Alert.alert('Success', `${selectedDog.name} has been marked as deceased.`);
    } else {
      Alert.alert('Error', 'Failed to mark dog as deceased. Please try again.');
    }
    setSelectedDog(null);
  };

  const handleDeleteAccount = () => {
    if (!selectedDog) return;
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!selectedDog) return;
    setDeleteModalVisible(false);
    setShowDeleteConfirm(false);
    const success = await deleteDog(selectedDog.id);
    if (success) {
      Alert.alert('Success', `${selectedDog.name} has been deleted.`);
    } else {
      Alert.alert('Error', 'Failed to delete dog. Please try again.');
    }
    setSelectedDog(null);
  };

  const closeModal = () => {
    setDeleteModalVisible(false);
    setShowDeleteConfirm(false);
    setSelectedDog(null);
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
                <View key={dog.id} style={styles.dogItemContainer}>
                  <TouchableOpacity 
                    style={styles.dogItem}
                    onPress={() => navigation.navigate('ProfilePageVitals', {dogId: dog.id})}
                    activeOpacity={0.7}
                  >
                    <View style={styles.dogItemImageContainer}>
                      {dog.imageUri ? (
                        <Image source={{uri: dog.imageUri}} style={styles.dogItemImage} />
                      ) : (
                        <Text style={styles.dogItemEmoji}>🐕</Text>
                      )}
                    </View>
                    <View style={styles.dogItemTextContainer}>
                      <Text style={styles.dogItemName}>{dog.name}</Text>
                      {dog.isDeceased && (
                        <Text style={styles.deceasedLabel}>Deceased</Text>
                      )}
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.deleteButton}
                    onPress={() => {
                      console.log('Delete button clicked for:', dog.name);
                      handleDeleteDog(dog);
                    }}
                    activeOpacity={0.5}
                    hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
                  >
                    <Text style={styles.deleteButtonText}>⋯</Text>
                  </TouchableOpacity>
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

      {/* Debug: Show modal state */}
      {__DEV__ && deleteModalVisible && (
        <View style={{position: 'absolute', top: 100, left: 20, backgroundColor: 'yellow', padding: 10, zIndex: 99999}}>
          <Text>Modal State: {deleteModalVisible ? 'VISIBLE' : 'HIDDEN'}</Text>
          <Text>Selected Dog: {selectedDog?.name || 'None'}</Text>
        </View>
      )}

      {/* Delete Dog Modal */}
      <Modal
        visible={deleteModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeModal}
        statusBarTranslucent={true}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={closeModal}
        >
          <View 
            style={styles.modalContent}
          >
            {!showDeleteConfirm ? (
              <>
                <Text style={styles.modalTitle}>Delete Dog</Text>
                <Text style={styles.modalMessage}>
                  What would you like to do with {selectedDog?.name}?
                </Text>
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalButtonCancel]}
                    onPress={closeModal}
                  >
                    <Text style={styles.modalButtonTextCancel}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalButtonPrimary]}
                    onPress={handleMarkDeceased}
                  >
                    <Text style={styles.modalButtonText}>Mark as Deceased</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalButtonDanger]}
                    onPress={handleDeleteAccount}
                  >
                    <Text style={styles.modalButtonTextDanger}>Delete Account</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
                <Text style={styles.modalTitle}>Confirm Deletion</Text>
                <Text style={styles.modalMessage}>
                  Are you sure you want to permanently delete {selectedDog?.name}? This action cannot be undone.
                </Text>
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalButtonCancel]}
                    onPress={() => setShowDeleteConfirm(false)}
                  >
                    <Text style={styles.modalButtonTextCancel}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalButtonDanger]}
                    onPress={confirmDelete}
                  >
                    <Text style={styles.modalButtonTextDanger}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </TouchableOpacity>
      </Modal>

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
  dogItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    overflow: 'visible',
  },
  dogItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    padding: 16,
  },
  dogItemTextContainer: {
    flex: 1,
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
  deceasedLabel: {
    fontSize: 12,
    color: '#FF3B30',
    fontWeight: '600',
    marginTop: 4,
  },
  deleteButton: {
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 44,
    minHeight: 44,
  },
  deleteButtonText: {
    fontSize: 24,
    color: '#666666',
    fontWeight: 'bold',
    lineHeight: 24,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '85%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 10000,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 22,
  },
  modalButtons: {
    gap: 12,
  },
  modalButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: '#F5F5F5',
  },
  modalButtonPrimary: {
    backgroundColor: '#007AFF',
  },
  modalButtonDanger: {
    backgroundColor: '#FF3B30',
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalButtonTextCancel: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
  modalButtonTextDanger: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ProfilePage;





