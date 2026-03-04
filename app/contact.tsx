import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';

const phoneNumber = '+90 532 741 29 83';
const emailAddress = 'hello.coffeehouseankara@mail.com';

export default function ContactScreen() {
  const router = useRouter();

  return (
    <View style={styles.page}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>İletişim</Text>
        <View style={styles.backBtn} />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Coffee House Ankara</Text>
        <Text style={styles.subtitle}>Bize aşağıdaki kanallardan ulaşabilirsin.</Text>

        <Pressable style={styles.card} onPress={() => Linking.openURL(`tel:${phoneNumber}`)}>
          <Ionicons name="call-outline" size={22} color="#0f646c" />
          <View style={styles.cardTextWrap}>
            <Text style={styles.cardLabel}>Telefon</Text>
            <Text style={styles.cardValue}>{phoneNumber}</Text>
          </View>
        </Pressable>

        <Pressable style={styles.card} onPress={() => Linking.openURL(`mailto:${emailAddress}`)}>
          <Ionicons name="mail-outline" size={22} color="#0f646c" />
          <View style={styles.cardTextWrap}>
            <Text style={styles.cardLabel}>E-posta</Text>
            <Text style={styles.cardValue}>{emailAddress}</Text>
          </View>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#f8feff',
  },
  header: {
    height: 62,
    backgroundColor: '#0f646c',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  backBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 20,
    gap: 12,
  },
  title: {
    color: '#0b3840',
    fontSize: 28,
    fontWeight: '800',
  },
  subtitle: {
    color: '#3f6064',
    fontSize: 14,
    marginBottom: 4,
  },
  card: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d6ecef',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  cardTextWrap: {
    flex: 1,
    gap: 2,
  },
  cardLabel: {
    color: '#0f646c',
    fontSize: 13,
    fontWeight: '700',
  },
  cardValue: {
    color: '#103f45',
    fontSize: 16,
    fontWeight: '700',
  },
});
