import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SendScreen() {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  const handleSend = () => {
    if (!recipient || !amount) {
      Alert.alert('Error', 'Please fill in recipient and amount');
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    // TODO: Implement actual send money logic
    Alert.alert(
      'Confirm Transfer',
      `Send $${numAmount.toFixed(2)} to ${recipient}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send',
          style: 'default',
          onPress: () => {
            Alert.alert('Success', 'Money sent successfully!');
            setRecipient('');
            setAmount('');
            setNote('');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Send Money</Text>
      </View>

      <View style={styles.content}>
        {/* Recipient Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Send to</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="person-outline" size={20} color={Colors.textSecondary} />
            <TextInput
              style={styles.input}
              placeholder="Email or phone number"
              value={recipient}
              onChangeText={setRecipient}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>

        {/* Quick Contacts */}
        <View style={styles.quickContacts}>
          <Text style={styles.sectionTitle}>Recent Contacts</Text>
          <View style={styles.contactsList}>
            {['John Doe', 'Jane Smith', 'Mike Johnson'].map((name, index) => (
              <TouchableOpacity
                key={index}
                style={styles.contactItem}
                onPress={() => setRecipient(name.toLowerCase().replace(' ', '.'))}
              >
                <View style={styles.contactAvatar}>
                  <Text style={styles.contactInitial}>
                    {name.split(' ').map(n => n[0]).join('')}
                  </Text>
                </View>
                <Text style={styles.contactName}>{name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Amount Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Amount</Text>
          <View style={styles.amountContainer}>
            <Text style={styles.currencySymbol}>$</Text>
            <TextInput
              style={styles.amountInput}
              placeholder="0.00"
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Note Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Add a note (optional)</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="chatbubble-outline" size={20} color={Colors.textSecondary} />
            <TextInput
              style={styles.input}
              placeholder="What's this for?"
              value={note}
              onChangeText={setNote}
              multiline
            />
          </View>
        </View>

        {/* Send Button */}
        <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
          <Text style={styles.sendButtonText}>Send Money</Text>
        </TouchableOpacity>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickAction}>
            <Ionicons name="qr-code" size={24} color={Colors.primary} />
            <Text style={styles.quickActionText}>Scan QR</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickAction}>
            <Ionicons name="people" size={24} color={Colors.primary} />
            <Text style={styles.quickActionText}>Contacts</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickAction}>
            <Ionicons name="time" size={24} color={Colors.primary} />
            <Text style={styles.quickActionText}>Recent</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.textPrimary,
    marginLeft: 12,
  },
  quickContacts: {
    marginBottom: 24,
  },
  contactsList: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  contactItem: {
    alignItems: 'center',
  },
  contactAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  contactInitial: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  contactName: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  amountInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginLeft: 8,
  },
  sendButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  sendButtonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '600',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
  },
  quickAction: {
    alignItems: 'center',
    padding: 16,
  },
  quickActionText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 8,
  },
});