import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../services/api';
import { COLORS, SPACING } from '../constants/theme';
import {
  User,
  Phone,
  Building2,
  Users,
  Layers,
  Award,
  Coins,
  LogOut,
  Calendar,
  CreditCard,
  ShieldCheck,
} from 'lucide-react-native';

export default function ProfileScreen() {
  const { student, logout } = useAuth();
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const res = await apiRequest('/api/student/dashboard');
      if (res.success) {
        setData(res);
      }
    } catch (e) {
      console.warn('Profile fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Chiqish', 'Akkauntdan chiqishni tasdiqlaysizmi?', [
      { text: 'Bekor qilish', style: 'cancel' },
      { text: 'Chiqish', style: 'destructive', onPress: logout },
    ]);
  };

  const profile = data?.student || student;
  const progress = data?.progress || { xp: 0, xcoin: 0, level: 1 };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Profile Header Card */}
      <View style={styles.headerCard}>
        <View style={styles.avatarLarge}>
          <Text style={styles.avatarLargeText}>
            {profile?.firstName?.[0] || 'I'}
            {profile?.lastName?.[0] || 'N'}
          </Text>
        </View>

        <Text style={styles.fullName}>
          {profile?.firstName} {profile?.lastName}
        </Text>
        <Text style={styles.studentCodeText}>
          Talaba ID: {profile?.studentCode || 'INF-STD'}
        </Text>

        <View style={styles.statusPill}>
          <ShieldCheck size={12} color="#16A34A" />
          <Text style={styles.statusPillText}>Faol Talaba</Text>
        </View>
      </View>

      {/* Gamification Stats Banner */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Award size={20} color={COLORS.primary} />
          <Text style={styles.statBoxVal}>{progress.xp} XP</Text>
          <Text style={styles.statBoxSub}>{progress.level}-Daraja</Text>
        </View>

        <View style={styles.statBox}>
          <Coins size={20} color="#D97706" />
          <Text style={[styles.statBoxVal, { color: '#B45309' }]}>{progress.xcoin}</Text>
          <Text style={styles.statBoxSub}>XCoin Balansi</Text>
        </View>
      </View>

      {/* Details List */}
      <View style={styles.detailsCard}>
        <View style={styles.detailRow}>
          <Phone size={18} color={COLORS.textMuted} />
          <View style={styles.detailTextCol}>
            <Text style={styles.detailLabel}>Telefon</Text>
            <Text style={styles.detailVal}>{profile?.phone}</Text>
          </View>
        </View>

        <View style={styles.detailRow}>
          <Building2 size={18} color={COLORS.textMuted} />
          <View style={styles.detailTextCol}>
            <Text style={styles.detailLabel}>Filial</Text>
            <Text style={styles.detailVal}>{profile?.branch?.name || 'InFast Asosiy'}</Text>
          </View>
        </View>

        <View style={styles.detailRow}>
          <Users size={18} color={COLORS.textMuted} />
          <View style={styles.detailTextCol}>
            <Text style={styles.detailLabel}>Guruh</Text>
            <Text style={styles.detailVal}>{profile?.group?.name || 'Guruh biriktirilgan'}</Text>
          </View>
        </View>

        <View style={styles.detailRow}>
          <Layers size={18} color={COLORS.textMuted} />
          <View style={styles.detailTextCol}>
            <Text style={styles.detailLabel}>Kurs</Text>
            <Text style={styles.detailVal}>{profile?.course?.name || 'Dasturlash'}</Text>
          </View>
        </View>

        <View style={[styles.detailRow, { borderBottomWidth: 0 }]}>
          <CreditCard size={18} color={COLORS.textMuted} />
          <View style={styles.detailTextCol}>
            <Text style={styles.detailLabel}>Oylik to'lov muddati</Text>
            <Text style={styles.detailVal}>Har oyning {profile?.paymentDueDay || 5}-sanasigacha</Text>
          </View>
        </View>
      </View>

      {/* Logout Action */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
        <LogOut size={18} color={COLORS.accentRed} />
        <Text style={styles.logoutBtnText}>Tizimdan chiqish</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  contentContainer: {
    padding: SPACING.lg,
    paddingBottom: 40,
  },
  headerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 26,
    padding: SPACING.xl,
    alignItems: 'center',
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  avatarLarge: {
    width: 76,
    height: 76,
    borderRadius: 26,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  avatarLargeText: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '900',
  },
  fullName: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  studentCodeText: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '600',
    marginTop: 2,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: SPACING.md,
    gap: 4,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#16A34A',
  },
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: SPACING.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statBoxVal: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.textPrimary,
    marginVertical: 4,
  },
  statBoxSub: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  detailsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    marginBottom: SPACING.xl,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    paddingHorizontal: SPACING.sm,
  },
  detailTextCol: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  detailLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  detailVal: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.accentRedLight,
    borderRadius: 16,
    paddingVertical: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  logoutBtnText: {
    color: COLORS.accentRed,
    fontSize: 14,
    fontWeight: '800',
  },
});
