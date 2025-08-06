import { Text, View } from 'react-native';
import { headerStyles as styles } from '../styles/LoginScreenStyles';
import PigmyLogo from './PigmyLogo';

const Header = () => {
  return (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        <View style={styles.logoWrapper}>
          <PigmyLogo />
        </View>
        <Text style={styles.headerSubtitle}>
          Welcome back! Please sign in to continue
        </Text>
      </View>
    </View>
  );
};

export default Header;