import React, { useContext, useState } from 'react';
import { Alert, Button, Text, TextInput, View } from 'react-native';
import { AuthContext } from '../context/AuthContext';

const PinScreen = () => {
  const [pin, setPin] = useState('');
  const { verifyPin } = useContext(AuthContext);

  const handleSubmit = async () => {
    const success = await verifyPin(pin);
    if (!success) {
      Alert.alert('Incorrect PIN', 'Please try again.');
      setPin('');
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
      <Text style={{ fontSize: 18, marginBottom: 10 }}>Enter your 4-digit PIN</Text>
      <TextInput
        value={pin}
        onChangeText={setPin}
        keyboardType="numeric"
        secureTextEntry
        maxLength={4}
        style={{
          borderWidth: 1,
          borderColor: 'gray',
          borderRadius: 5,
          padding: 10,
          marginBottom: 20,
          fontSize: 20,
          textAlign: 'center',
        }}
      />
      <Button title="Unlock" onPress={handleSubmit} />
    </View>
  );
};

export default PinScreen;
