import { faArrowLeft, faClock, faEnvelope, faGlobe, faMapMarkerAlt, faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import {
  Alert,
  Dimensions,
  Image,
  Linking,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const { width } = Dimensions.get('window');

const HelpDeskScreen = () => {
  const navigation = useNavigation();

  const handleEmail = () => {
    const email = 'mailto:techyverve@gmail.com';
    Linking.canOpenURL(email)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(email);
        } else {
          Alert.alert('Error', 'Email is not supported on this device');
        }
      })
      .catch((err) => console.error('An error occurred', err));
  };

  const handleWebsite = () => {
    const website = 'https://www.techyverve.in';
    Linking.canOpenURL(website)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(website);
        } else {
          Alert.alert('Error', 'Website cannot be opened on this device');
        }
      })
      .catch((err) => console.error('An error occurred', err));
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#6739B7" />

      {/* Header */}
      <View style={styles.header}>
        <Image
          source={require('../../../assets/images/HelpDesk.png')}
          style={styles.headerBackgroundImage}
          resizeMode="stretch"
        />

        <View style={styles.headerOverlay}>
          {/* Top Corner Icons */}
          <View style={styles.topCornerIcons}>
            <TouchableOpacity
              style={styles.backIcon}
              onPress={() => navigation.goBack()}
              activeOpacity={0.8}
            >
              <FontAwesomeIcon icon={faArrowLeft} size={20} color="#FFFFFF" />
            </TouchableOpacity>

            <View style={styles.placeholder} />
          </View>

          {/* Centered Help Info Section */}
          <View style={styles.helpInfoSection}>
            <View style={styles.iconWrapper}>
              <FontAwesomeIcon icon={faQuestionCircle} size={28} color="#FFFFFF" />
            </View>
            <Text style={styles.headerTitle}>Help Desk</Text>
            <Text style={styles.headerSubtitle}>We're here to help you</Text>
          </View>
        </View>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.sectionTitle}>How can we help you?</Text>

        <Text style={styles.sectionDescription}>
          Get in touch with our support team for any questions or assistance
        </Text>

        {/* Email */}
        <TouchableOpacity
          style={styles.card}
          onPress={handleEmail}
          activeOpacity={0.7}
        >
          <View style={styles.iconContainer}>
            <FontAwesomeIcon icon={faEnvelope} size={24} color="#FFFFFF" />
          </View>
          <View style={styles.cardText}>
            <Text style={styles.cardTitle}>Email Us</Text>
            <Text style={styles.cardDescription}>techyverve@gmail.com</Text>
            <Text style={styles.cardSubtext}>Tap to open email client</Text>
          </View>
        </TouchableOpacity>

        {/* Website */}
        <TouchableOpacity
          style={styles.card}
          onPress={handleWebsite}
          activeOpacity={0.7}
        >
          <View style={styles.iconContainer}>
            <FontAwesomeIcon icon={faGlobe} size={24} color="#FFFFFF" />
          </View>
          <View style={styles.cardText}>
            <Text style={styles.cardTitle}>Visit Our Website</Text>
            <Text style={styles.cardDescription}>www.techyverve.in</Text>
            <Text style={styles.cardSubtext}>Tap to open in browser</Text>
          </View>
        </TouchableOpacity>

        {/* Additional Info Cards */}
        <View style={styles.infoSection}>
          <Text style={styles.infoSectionTitle}>Support Information</Text>

          <View style={styles.infoCard}>
            <View style={styles.infoIconContainer}>
              <FontAwesomeIcon icon={faClock} size={20} color="#6739B7" />
            </View>
            <View style={styles.infoText}>
              <Text style={styles.infoTitle}>Support Hours</Text>
              <Text style={styles.infoDescription}>9:00 AM to 6:00 PM</Text>
              <Text style={styles.infoSubtext}>Monday to Saturday</Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <View style={styles.infoIconContainer}>
              <FontAwesomeIcon icon={faMapMarkerAlt} size={20} color="#6739B7" />
            </View>
            <View style={styles.infoText}>
              <Text style={styles.infoTitle}>Response Time</Text>
              <Text style={styles.infoDescription}>Within 24 hours</Text>
              <Text style={styles.infoSubtext}>For email inquiries</Text>
            </View>
          </View>
        </View>

        
      </ScrollView>
    </SafeAreaView>
  );
};

export default HelpDeskScreen;

// Keep your styles object as-is


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#6739B7',
  },
  header: {
    backgroundColor: '#6739B7',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 30,
    position: 'relative',
    overflow: 'hidden',
    minHeight: 220,
  },
  headerBackgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: width,
    height: 235,
    opacity: 0.4,
  },
  headerOverlay: {
    position: 'relative',
    zIndex: 1,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topCornerIcons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 2,
  },
  backIcon: {
    width: 32,
    height: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backdropFilter: 'blur(8px)',
  },
  helpInfoSection: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginTop: 20,
  },
  headerTitle: {
    fontSize: 18,
    color: '#FFFFFF',
    fontFamily: 'DMSans-Bold',
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 8,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    fontFamily: 'DMSans-Medium',
    lineHeight: 18,
    textAlign: 'center',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  placeholder: {
    width: 32,
  },
  iconWrapper: {
    width: 60,
    height: 60,
    backgroundColor: 'rgba(175, 126, 207, 0.3)',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backdropFilter: 'blur(10px)',
    marginBottom: 16,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -20,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 24,
    fontFamily: 'DMSans-Bold',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  sectionDescription: {
    fontSize: 16,

    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
    fontFamily: "DMSans-Medium",
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: '#6739B7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(103, 57, 183, 0.1)',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#6739B7',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6739B7',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  cardText: {
    marginLeft: 20,
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: 'DMSans-Bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 16,
    color: '#6739B7',
    fontFamily: 'DMSans-Medium',
    marginBottom: 2,
  },
  cardSubtext: {
    fontSize: 12,
    color: '#9CA3AF',
    fontFamily: 'DMSans-Regular',
    fontStyle: 'italic',
  },
  infoSection: {
    marginTop: 32,
  },
  infoSectionTitle: {
    fontSize: 20,
    fontFamily: 'DMSans-Bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#6739B7',
  },
  infoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(103, 57, 183, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoText: {
    marginLeft: 16,
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontFamily: 'DMSans-Bold',
    color: '#1F2937',
    marginBottom: 2,
  },
  infoDescription: {
    fontSize: 14,
    color: '#6739B7',
    fontFamily: 'DMSans-Medium',
    marginBottom: 1,
  },
  infoSubtext: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'DMSans-Regular',
  },
  noteContainer: {
    marginTop: 32,
    padding: 20,
    backgroundColor: '#F0F4FF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(103, 57, 183, 0.2)',
  },
  note: {
    fontSize: 14,
    color: '#4B5563',
    textAlign: 'center',
    fontFamily: 'DMSans-Regular',
    lineHeight: 22,
  },
});