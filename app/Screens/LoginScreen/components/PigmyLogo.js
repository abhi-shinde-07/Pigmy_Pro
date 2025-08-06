import { Image, View } from 'react-native';
import { logoStyles as styles } from '../styles/LoginScreenStyles';

const PigmyLogo = () => (
  <View style={styles.logoContainer}>
    <View style={styles.logoGlow}>
      <Image 
        source={require('../../../../assets/images/PigmyPro.png')}
        style={styles.logoImage}
        resizeMode="contain"
        onError={(error) => console.log('Logo image error:', error)}
      />
    </View>
  </View>
);

export default PigmyLogo;