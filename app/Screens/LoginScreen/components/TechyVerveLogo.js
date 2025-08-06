import { Image, View } from 'react-native';
import { companyLogoStyles as styles } from '../styles/LoginScreenStyles';

const TechyVerveLogo = () => (
  <View style={styles.companyLogoContainer}>
    <View style={styles.companyLogoGlow}>
      <Image 
        source={require('../../../../assets/images/Techy_Verve.png')}
        style={styles.companyLogoImage}
        resizeMode="contain"
        onError={(error) => console.log('Company logo image error:', error)}
      />
    </View>
  </View>
);

export default TechyVerveLogo;