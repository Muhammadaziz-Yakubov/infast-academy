import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { COLORS, SPACING, APPLE_SHADOW } from '../constants/theme';
import { Lock, Phone, Eye, EyeOff, Sparkles, BookOpen } from 'lucide-react-native';

export default function LoginScreen() {
  const { login, loginDemo } = useAuth();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!phone.trim()) {
      setErrorMessage('Telefon raqamingizni kiriting');
      return;
    }
    if (!password.trim()) {
      setErrorMessage('Parolni kiriting');
      return;
    }

    try {
      setLoading(true);
      setErrorMessage(null);
      await login(phone, password);
    } catch (err: any) {
      setErrorMessage(err.message || 'Kirish muvaffaqiyatsiz bo‘ldi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Apple Branding Header */}
        <View style={styles.header}>
          <View style={styles.logoBadge}>
            <BookOpen size={36} color="#FFFFFF" strokeWidth={2.4} />
          </View>
          <Text style={styles.brandTitle}>InFast Academy</Text>
          <Text style={styles.brandSubtitle}>O'quvchi shaxsiy portali</Text>
        </View>

        {/* Error Notification */}
        {errorMessage && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        )}

        {/* Apple Inset Grouped Inputs */}
        <View style={styles.inputGroupCard}>
          <View style={styles.inputRow}>
            <View style={styles.iconCircle}>
              <Phone size={16} color="#8E8E93" />
            </View>
            <TextInput
              style={styles.textInput}
              placeholder="Telefon raqam (+998 90 123 45 67)"
              placeholderTextColor="#636366"
              keyboardType="phone-pad"
              autoCapitalize="none"
              value={phone}
              onChangeText={(val) => {
                setPhone(val);
                setErrorMessage(null);
              }}
            />
          </View>

          <View style={styles.separator} />

          <View style={styles.inputRow}>
            <View style={styles.iconCircle}>
              <Lock size={16} color="#8E8E93" />
            </View>
            <TextInput
              style={[styles.textInput, { flex: 1 }]}
              placeholder="Parol"
              placeholderTextColor="#636366"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={(val) => {
                setPassword(val);
                setErrorMessage(null);
              }}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeButton}
              activeOpacity={0.6}
            >
              {showPassword ? (
                <EyeOff size={18} color="#8E8E93" />
              ) : (
                <Eye size={18} color="#8E8E93" />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Apple Solid CTA Button */}
        <TouchableOpacity
          style={[styles.primaryButton, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.primaryButtonText}>Kirish</Text>
          )}
        </TouchableOpacity>

        {/* Apple Secondary Demo Button */}
        <TouchableOpacity
          style={styles.demoButton}
          onPress={async () => {
            try {
              setLoading(true);
              await loginDemo();
            } finally {
              setLoading(false);
            }
          }}
          disabled={loading}
          activeOpacity={0.7}
        >
          <Sparkles size={16} color="#FF9500" />
          <Text style={styles.demoButtonText}>Ilovani sinab ko'rish (Demo rejim)</Text>
        </TouchableOpacity>

        <View style={styles.footerNote}>
          <Text style={styles.footerNoteText}>
            Parolingiz yo'qmi? Administratoringizdan parolni so'rang yoki demo rejim orqali barcha sahifalarni sinab ko'ring.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000', // Apple OLED True Black
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoBadge: {
    width: 72,
    height: 72,
    borderRadius: 22,
    backgroundColor: '#FF9500',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#FF9500',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 5,
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  brandSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
    marginTop: 4,
  },
  errorBanner: {
    backgroundColor: 'rgba(255, 69, 58, 0.16)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 69, 58, 0.25)',
  },
  errorText: {
    color: '#FF453A',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  inputGroupCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    ...APPLE_SHADOW,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  iconCircle: {
    width: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: '#FFFFFF',
    paddingVertical: 0,
  },
  eyeButton: {
    padding: 6,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginLeft: 54,
  },
  primaryButton: {
    backgroundColor: '#FF9500',
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#FF9500',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  demoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 149, 0, 0.12)',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 149, 0, 0.25)',
  },
  demoButtonText: {
    color: '#FF9500',
    fontSize: 14,
    fontWeight: '700',
  },
  footerNote: {
    marginTop: 28,
    paddingHorizontal: 16,
  },
  footerNoteText: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 18,
  },
});
