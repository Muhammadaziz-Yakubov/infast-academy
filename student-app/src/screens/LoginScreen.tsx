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
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../context/AuthContext';
import { Lock, User, Eye, EyeOff, GraduationCap, ArrowRight } from 'lucide-react-native';

export default function LoginScreen() {
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!identifier.trim()) {
      setErrorMessage("Telefon raqamingiz yoki Talaba ID raqamingizni kiriting");
      return;
    }
    if (!password.trim()) {
      setErrorMessage('Parolingizni kiriting');
      return;
    }

    try {
      setLoading(true);
      setErrorMessage(null);
      await login(identifier.trim(), password);
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
      <StatusBar style="light" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Brand Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <View style={styles.logoBadge}>
              <GraduationCap size={32} color="#FFFFFF" strokeWidth={2.2} />
            </View>
          </View>
          <Text style={styles.brandTitle}>InFast Academy</Text>
          <Text style={styles.brandSubtitle}>Talabalar ta'lim portali</Text>
        </View>

        {/* Error notification */}
        {errorMessage && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        )}

        {/* Input Card Container */}
        <View style={styles.formCard}>
          <View style={styles.inputRow}>
            <View style={styles.iconBox}>
              <User size={18} color="#8E8E93" strokeWidth={2} />
            </View>
            <View style={styles.inputWrapper}>
              <Text style={styles.fieldLabel}>TALABA ID YOKI TELEFON</Text>
              <TextInput
                style={styles.textInput}
                placeholder="INF-24-001 yoki +998..."
                placeholderTextColor="#545458"
                autoCapitalize="none"
                autoCorrect={false}
                value={identifier}
                onChangeText={(val) => {
                  setIdentifier(val);
                  if (errorMessage) setErrorMessage(null);
                }}
              />
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.inputRow}>
            <View style={styles.iconBox}>
              <Lock size={18} color="#8E8E93" strokeWidth={2} />
            </View>
            <View style={styles.inputWrapper}>
              <Text style={styles.fieldLabel}>PAROL</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Parolingizni kiriting"
                placeholderTextColor="#545458"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={(val) => {
                  setPassword(val);
                  if (errorMessage) setErrorMessage(null);
                }}
              />
            </View>
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeBtn}
              activeOpacity={0.6}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              {showPassword ? (
                <EyeOff size={18} color="#8E8E93" strokeWidth={2} />
              ) : (
                <Eye size={18} color="#8E8E93" strokeWidth={2} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Primary Login Button */}
        <TouchableOpacity
          style={[styles.primaryButton, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <View style={styles.buttonInner}>
              <Text style={styles.primaryButtonText}>Tizimga kirish</Text>
              <ArrowRight size={18} color="#FFFFFF" strokeWidth={2.4} />
            </View>
          )}
        </TouchableOpacity>

        {/* Minimal Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Hisob ma'lumotlaringiz mavjud bo'lmasa, akademiyangiz ma'muriyatiga murojaat qiling.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 36,
  },
  logoContainer: {
    marginBottom: 20,
    shadowColor: '#FF9500',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  logoBadge: {
    width: 68,
    height: 68,
    borderRadius: 20,
    backgroundColor: '#FF9500',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.6,
  },
  brandSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 6,
    fontWeight: '400',
  },
  errorBanner: {
    backgroundColor: 'rgba(255, 69, 58, 0.12)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 69, 58, 0.25)',
  },
  errorText: {
    color: '#FF453A',
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
  },
  formCard: {
    backgroundColor: '#161618',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
    marginBottom: 24,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  inputWrapper: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#8E8E93',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  textInput: {
    fontSize: 15,
    color: '#FFFFFF',
    paddingVertical: 4,
  },
  eyeBtn: {
    padding: 8,
    marginLeft: 6,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    marginLeft: 60,
  },
  primaryButton: {
    backgroundColor: '#FF9500',
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF9500',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  footer: {
    marginTop: 32,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  footerText: {
    fontSize: 12,
    color: '#636366',
    textAlign: 'center',
    lineHeight: 18,
  },
});
