import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Linking,
  Platform,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { COLORS, SPACING, APPLE_SHADOW } from '../constants/theme';
import {
  Lock,
  AlertTriangle,
  RefreshCw,
  LogOut,
  Phone,
  CreditCard,
  User,
  GraduationCap,
  Building,
} from 'lucide-react-native';

export default function DebtLockScreen() {
  const { student, logout, refreshProfile } = useAuth();
  const [checking, setChecking] = useState(false);
  const [checkMessage, setCheckMessage] = useState<string | null>(null);

  const handleRefresh = async () => {
    try {
      setChecking(true);
      setCheckMessage(null);
      await refreshProfile();
      // Brief feedback delay
      setTimeout(() => {
        setCheckMessage("To'lov holati qayta tekshirildi. Agar to'lov qilgan bo'lsangiz va status o'zgarmasa, iltimos ma'muriyatga murojaat qiling.");
      }, 600);
    } catch (e: any) {
      setCheckMessage("Tekshirishda xatolik yuz berdi. Internet aloqasini tekshiring.");
    } finally {
      setChecking(false);
    }
  };

  const formatMoney = (amount?: number) => {
    if (!amount || isNaN(amount)) return null;
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + " so'm";
  };

  const branchPhone = student?.branch?.phone || '+998 (71) 200-00-00';
  const debtAmount = formatMoney(student?.totalDebt || student?.monthlyFee);

  const handleCallSupport = () => {
    const cleanNumber = branchPhone.replace(/[^\d+]/g, '');
    Linking.openURL(`tel:${cleanNumber}`).catch(() => {});
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Lock Visual Badge */}
      <View style={styles.badgeContainer}>
        <View style={styles.outerGlow}>
          <View style={styles.innerGlow}>
            <View style={styles.iconCircle}>
              <Lock size={44} color="#FF453A" strokeWidth={2.4} />
            </View>
          </View>
        </View>
      </View>

      {/* Main Requirement Headline */}
      <View style={styles.header}>
        <View style={styles.statusPill}>
          <AlertTriangle size={14} color="#FF453A" strokeWidth={2.5} />
          <Text style={styles.statusPillText}>
            Holat: {student?.status === 'BLOCKED' || student?.status === 'BLOCK' ? 'Bloklangan (Qarzdor)' : 'Qarzdor'}
          </Text>
        </View>

        <Text style={styles.mainTitle}>
          Oylik to'lov qiling{'\n'}keyin ochiladi student app
        </Text>

        <Text style={styles.subtitle}>
          Hurmatli talaba, hisobingizda oylik to'lov bo'yicha qarzdorlik mavjudligi sababli dastur imkoniyatlari vaqtincha cheklangan.
        </Text>
      </View>

      {/* Debt & Student Details Card */}
      <View style={styles.detailsCard}>
        <View style={styles.cardHeader}>
          <CreditCard size={18} color="#FF9500" strokeWidth={2.2} />
          <Text style={styles.cardTitle}>To'lov va Talaba Ma'lumotlari</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <View style={styles.infoLabelGroup}>
            <User size={15} color="#8E8E93" />
            <Text style={styles.infoLabel}>Talaba</Text>
          </View>
          <Text style={styles.infoValue}>
            {student?.firstName} {student?.lastName}
          </Text>
        </View>

        {student?.studentCode && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabelSub}>Talaba ID:</Text>
            <Text style={styles.infoBadge}>{student.studentCode}</Text>
          </View>
        )}

        {student?.course?.name && (
          <View style={styles.infoRow}>
            <View style={styles.infoLabelGroup}>
              <GraduationCap size={15} color="#8E8E93" />
              <Text style={styles.infoLabel}>Kurs</Text>
            </View>
            <Text style={styles.infoValue} numberOfLines={1}>
              {student.course.name}
            </Text>
          </View>
        )}

        {student?.group?.name && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabelSub}>Guruh:</Text>
            <Text style={styles.infoValue}>{student.group.name}</Text>
          </View>
        )}

        {student?.branch?.name && (
          <View style={styles.infoRow}>
            <View style={styles.infoLabelGroup}>
              <Building size={15} color="#8E8E93" />
              <Text style={styles.infoLabel}>Filial</Text>
            </View>
            <Text style={styles.infoValue} numberOfLines={1}>
              {student.branch.name}
            </Text>
          </View>
        )}

        {debtAmount && (
          <View style={[styles.infoRow, styles.debtHighlightRow]}>
            <Text style={styles.debtLabel}>Qarzdorlik summasi:</Text>
            <Text style={styles.debtValue}>{debtAmount}</Text>
          </View>
        )}
      </View>

      {/* Check Result Message */}
      {checkMessage && (
        <View style={styles.checkMessageBox}>
          <Text style={styles.checkMessageText}>{checkMessage}</Text>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={handleRefresh}
          disabled={checking}
          activeOpacity={0.8}
        >
          {checking ? (
            <ActivityIndicator size="small" color="#000000" />
          ) : (
            <RefreshCw size={19} color="#000000" strokeWidth={2.4} />
          )}
          <Text style={styles.refreshButtonText}>
            {checking ? "Tekshirilmoqda..." : "To'lovni tekshirish"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.supportButton}
          onPress={handleCallSupport}
          activeOpacity={0.8}
        >
          <Phone size={18} color="#FF9500" strokeWidth={2.2} />
          <Text style={styles.supportButtonText}>
            Ma'muriyat bilan bog'lanish ({branchPhone})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={logout}
          activeOpacity={0.7}
        >
          <LogOut size={16} color="#8E8E93" strokeWidth={2} />
          <Text style={styles.logoutButtonText}>Hisobdan chiqish</Text>
        </TouchableOpacity>
      </View>

      {/* Footer Branding Note */}
      <View style={styles.footer}>
        <Text style={styles.footerNote}>
          To'lov tasdiqlangandan so'ng, "To'lovni tekshirish" tugmasini bosing yoki ilovani qayta oching. Tizim darhol ochiladi.
        </Text>
        <Text style={styles.footerBrand}>InFast IT-Academy LMS</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollContent: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xxl,
    paddingBottom: SPACING.huge * 1.5,
    alignItems: 'center',
  },
  badgeContainer: {
    marginTop: SPACING.xl,
    marginBottom: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outerGlow: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 69, 58, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerGlow: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(255, 69, 58, 0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#1C1C1E',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 69, 58, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    ...APPLE_SHADOW,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
    width: '100%',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 69, 58, 0.15)',
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 69, 58, 0.3)',
    gap: 6,
    marginBottom: SPACING.md,
  },
  statusPillText: {
    color: '#FF453A',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  mainTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 30,
    letterSpacing: -0.3,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    color: '#8E8E93',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    paddingHorizontal: SPACING.sm,
  },
  detailsCard: {
    width: '100%',
    backgroundColor: '#1C1C1E',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    ...APPLE_SHADOW,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: SPACING.sm,
  },
  cardTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginVertical: SPACING.sm,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 7,
  },
  infoLabelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  infoLabel: {
    color: '#8E8E93',
    fontSize: 13,
    fontWeight: '500',
  },
  infoLabelSub: {
    color: '#8E8E93',
    fontSize: 13,
    fontWeight: '500',
    paddingLeft: 22,
  },
  infoValue: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    maxWidth: '55%',
    textAlign: 'right',
  },
  infoBadge: {
    color: '#FF9500',
    fontSize: 12,
    fontWeight: '700',
    backgroundColor: 'rgba(255, 149, 0, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  debtHighlightRow: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 69, 58, 0.2)',
    backgroundColor: 'rgba(255, 69, 58, 0.08)',
    paddingHorizontal: SPACING.sm,
    borderRadius: 10,
  },
  debtLabel: {
    color: '#FF453A',
    fontSize: 14,
    fontWeight: '700',
  },
  debtValue: {
    color: '#FF453A',
    fontSize: 16,
    fontWeight: '800',
  },
  checkMessageBox: {
    width: '100%',
    backgroundColor: 'rgba(255, 149, 0, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 149, 0, 0.3)',
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  checkMessageText: {
    color: '#FFD60A',
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },
  actions: {
    width: '100%',
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  refreshButton: {
    backgroundColor: '#FF9500',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 14,
    gap: 8,
    ...APPLE_SHADOW,
  },
  refreshButtonText: {
    color: '#000000',
    fontSize: 15,
    fontWeight: '700',
  },
  supportButton: {
    backgroundColor: '#2C2C2E',
    borderWidth: 1,
    borderColor: 'rgba(255, 149, 0, 0.25)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    borderRadius: 14,
    gap: 8,
  },
  supportButtonText: {
    color: '#FF9500',
    fontSize: 13,
    fontWeight: '600',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 6,
  },
  logoutButtonText: {
    color: '#8E8E93',
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
  },
  footerNote: {
    color: '#636366',
    fontSize: 11,
    lineHeight: 16,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  footerBrand: {
    color: '#48484A',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
