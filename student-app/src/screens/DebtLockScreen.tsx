import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Linking,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../context/AuthContext';
import {
  Lock,
  RefreshCw,
  LogOut,
  Phone,
  AlertCircle,
  Building2,
  Users,
  GraduationCap,
} from 'lucide-react-native';

export default function DebtLockScreen() {
  const { student, logout, refreshProfile } = useAuth();
  const [checking, setChecking] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleRefresh = async () => {
    try {
      setChecking(true);
      setFeedback(null);
      await refreshProfile();
      setTimeout(() => {
        setFeedback("To'lov holati yangilandi. Agar to'lov qilgan bo'lsangiz, ma'muriyat tez orada tasdiqlaydi.");
      }, 500);
    } catch {
      setFeedback("Tarmoq xatosi. Internet aloqasini tekshiring.");
    } finally {
      setChecking(false);
    }
  };

  const formatMoney = (amount?: number) => {
    if (!amount || isNaN(amount)) return null;
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + " so'm";
  };

  const branchPhone = student?.branch?.phone || '+998 (71) 200-00-00';
  const debtAmount = formatMoney(student?.totalDebt || student?.monthlyFee);

  const handleCallSupport = () => {
    const cleanNumber = branchPhone.replace(/[^\d+]/g, '');
    Linking.openURL(`tel:${cleanNumber}`).catch(() => {});
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Minimal Lock Icon */}
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <Lock size={28} color="#FF9500" strokeWidth={2.2} />
          </View>
        </View>

        {/* Headings */}
        <Text style={styles.title}>To'lov kutilmoqda</Text>
        <Text style={styles.subtitle}>
          Darslar va topshiriqlarni davom ettirish uchun to'lovni amalga oshirishingiz lozim.
        </Text>

        {/* Debt Amount Display */}
        {debtAmount && (
          <View style={styles.debtCard}>
            <Text style={styles.debtLabel}>QARZDORLIK SUMMASI</Text>
            <Text style={styles.debtValue}>{debtAmount}</Text>
          </View>
        )}

        {/* Student & Course Details */}
        <View style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <View style={styles.detailIconBox}>
              <GraduationCap size={16} color="#8E8E93" />
            </View>
            <View style={styles.detailTextBox}>
              <Text style={styles.detailLabel}>Talaba</Text>
              <Text style={styles.detailValue}>
                {student?.firstName} {student?.lastName}
              </Text>
            </View>
            {student?.studentCode && (
              <View style={styles.codeBadge}>
                <Text style={styles.codeBadgeText}>{student.studentCode}</Text>
              </View>
            )}
          </View>

          {student?.group?.name && (
            <>
              <View style={styles.divider} />
              <View style={styles.detailRow}>
                <View style={styles.detailIconBox}>
                  <Users size={16} color="#8E8E93" />
                </View>
                <View style={styles.detailTextBox}>
                  <Text style={styles.detailLabel}>Guruh</Text>
                  <Text style={styles.detailValue}>{student.group.name}</Text>
                </View>
              </View>
            </>
          )}

          {student?.branch?.name && (
            <>
              <View style={styles.divider} />
              <View style={styles.detailRow}>
                <View style={styles.detailIconBox}>
                  <Building2 size={16} color="#8E8E93" />
                </View>
                <View style={styles.detailTextBox}>
                  <Text style={styles.detailLabel}>Filial</Text>
                  <Text style={styles.detailValue}>{student.branch.name}</Text>
                </View>
              </View>
            </>
          )}
        </View>

        {/* Status Feedback Banner */}
        {feedback && (
          <View style={styles.feedbackBanner}>
            <AlertCircle size={16} color="#8E8E93" />
            <Text style={styles.feedbackText}>{feedback}</Text>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.primaryButton, checking && styles.buttonDisabled]}
            onPress={handleRefresh}
            disabled={checking}
            activeOpacity={0.85}
          >
            {checking ? (
              <ActivityIndicator color="#000000" size="small" />
            ) : (
              <View style={styles.buttonContent}>
                <RefreshCw size={17} color="#000000" strokeWidth={2.4} />
                <Text style={styles.primaryButtonText}>To'lovni tekshirish</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleCallSupport}
            activeOpacity={0.75}
          >
            <Phone size={16} color="#FFFFFF" strokeWidth={2.2} />
            <Text style={styles.secondaryButtonText}>
              Ma'muriyat bilan bog'lanish ({branchPhone})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.textButton}
            onPress={logout}
            activeOpacity={0.6}
          >
            <LogOut size={15} color="#8E8E93" />
            <Text style={styles.textButtonText}>Chiqish</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
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
    paddingVertical: 48,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 149, 0, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 149, 0, 0.25)',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
    paddingHorizontal: 12,
  },
  debtCard: {
    backgroundColor: '#161618',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginTop: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  debtLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#8E8E93',
    letterSpacing: 0.6,
  },
  debtValue: {
    fontSize: 26,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 4,
    letterSpacing: -0.4,
  },
  detailsCard: {
    backgroundColor: '#161618',
    borderRadius: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  detailIconBox: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  detailTextBox: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 11,
    color: '#8E8E93',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
    marginTop: 2,
  },
  codeBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  codeBadgeText: {
    fontSize: 11,
    color: '#8E8E93',
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    marginLeft: 58,
  },
  feedbackBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginTop: 16,
  },
  feedbackText: {
    fontSize: 12,
    color: '#8E8E93',
    flex: 1,
    lineHeight: 16,
  },
  actions: {
    marginTop: 28,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#FFFFFF',
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  primaryButtonText: {
    color: '#000000',
    fontSize: 15,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#1C1C1E',
    height: 50,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  secondaryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  textButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    marginTop: 4,
  },
  textButtonText: {
    color: '#8E8E93',
    fontSize: 13,
    fontWeight: '500',
  },
});
