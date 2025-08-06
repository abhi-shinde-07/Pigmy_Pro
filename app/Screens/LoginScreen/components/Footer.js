import { Text, View } from 'react-native';
import { footerStyles as styles } from '../styles/LoginScreenStyles';
import TechyVerveLogo from './TechyVerveLogo';

const Footer = () => {
  return (
    <View style={styles.footer}>
      <TechyVerveLogo />
      <Text style={styles.copyrightText}>
        © 2024 All Rights Reserved
      </Text>
    </View>
  );
};

export default Footer;