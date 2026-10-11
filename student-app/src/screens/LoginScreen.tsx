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
import { COLORS, SPACING } from '../constants/theme';
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
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Top Header & Branding */}
        <View style={styles.header}>
          <View style={styles.logoBadge}>
            <BookOpen size={36} color="#FFFFFF" strokeWidth={2.5} />
          </View>
          <Text style={styles.brandTitle}>INFAST ACADEMY</Text>
          <Text style={styles.brandSubtitle}>Student Mobile Portal</Text>
        </View>

        {/* Card Form */}
        <View style={styles.card}>
          <Text style={styles.formTitle}>Xush kelibsiz! 👋</Text>
          <Text style={styles.formSubtitle}>
            Administrator tomonidan berilgan ma'lumotlar bilan tizimga kiring
          </Text>

          {errorMessage && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          )}

          {/* Phone Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Telefon raqami</Text>
            <View style={styles.inputContainer}>
              <Phone size={18} color={COLORS.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="+998 90 123 45 67"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="phone-pad"
                autoCapitalize="none"
                value={phone}
                onChangeText={(val) => {
                  setPhone(val);
                  setErrorMessage(null);
                }}
              />
            </View>
          </View>

          {/* Password Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Parol</Text>
            <View style={styles.inputContainer}>
              <Lock size={18} color={COLORS.textMuted} style={styles.inputIcon} />
              <TextInput
                style={[styles.textInput, { flex: 1 }]}
                placeholder="Parolingiz..."
                placeholderTextColor={COLORS.textMuted}
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
              >
                {showPassword ? (
                  <EyeOff size={18} color={COLORS.textMuted} />
                ) : (
                  <Eye size={18} color={COLORS.textMuted} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Login Button */}
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitButtonText}>Kirish</Text>
            )}
          </TouchableOpacity>

          {/* Demo Mode Button */}
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
            activeOpacity={0.8}
          >
            <Sparkles size={16} color={COLORS.primary} />
            <Text style={styles.demoButtonText}>Ilovani sinab ko'rish (Demo o'quvchi)</Text>
          </TouchableOpacity>

          <View style={styles.infoBox}>
            <Sparkles size={16} color={COLORS.primary} />
            <Text style={styles.infoText}>
              Boshlang'ich parol sifatida talaba ID kodi yoki telefoningizning oxirgi 6 raqami o'rnatilgan.
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xxl,
  },
  logoBadge: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.textPrimary,
    letterSpacing: 0.5,
  },
  brandSubtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: '600',
    marginTop: 2,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 28,
    padding: SPACING.xxl,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  formSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
    marginBottom: SPACING.lg,
    lineHeight: 18,
  },
  errorBanner: {
    backgroundColor: COLORS.accentRedLight,
    padding: SPACING.md,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FECACA',
    marginBottom: SPACING.md,
  },
  errorText: {
    color: COLORS.accentRed,
    fontSize: 12,
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: SPACING.md,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    paddingHorizontal: SPACING.md,
    height: 48,
  },
  inputIcon: {
    marginRight: SPACING.sm,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  eyeButton: {
    padding: 6,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.sm,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primarySoft,
    padding: SPACING.md,
    borderRadius: 14,
    marginTop: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.primaryLight,
  },
  infoText: {
    flex: 1,
    marginLeft: SPACING.sm,
    fontSize: 11,
    color: COLORS.primaryDark,
    lineHeight: 16,
    fontWeight: '500',
  },
  demoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF7ED',
    borderWidth: 1.5,
    borderColor: '#FFEDD5',
    borderRadius: 16,
    height: 48,
    marginTop: 10,
    gap: 8,
  },
  demoButtonText: {
    color: COLORS.primaryDark,
    fontSize: 13,
    fontWeight: '800',
  },
});
