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
import { COLORS, SPACING, APPLE_SHADOW } from '../constants/theme';
import {
  Building2,
  Users,
  BookOpen,
  Calendar,
  CreditCard,
  LogOut,
  ChevronRight,
  ShieldCheck,
  Phone,
  Sparkles,
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
    Alert.alert('Chiqish', 'Haqiqatan ham akkauntdan chiqmoqchimisiz?', [
      { text: 'Bekor qilish', style: 'cancel' },
      { text: 'Chiqish', style: 'destructive', onPress: logout },
    ]);
  };

  const profile = data?.student || student;
  const progress = data?.progress || { xp: 0, xcoin: 0, level: 1 };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Apple Large Title */}
      <View style={styles.header}>
        <Text style={styles.categoryLabel}>HISOBLAR</Text>
        <Text style={styles.largeTitle}>Profil</Text>
      </View>

      {/* Apple Profile Header Card */}
      <View style={styles.profileHeaderCard}>
        <View style={styles.avatarLarge}>
          <Text style={styles.avatarLargeText}>
            {profile?.firstName?.[0] || 'I'}{profile?.lastName?.[0] || 'N'}
          </Text>
        </View>

        <Text style={styles.fullName}>{profile?.firstName} {profile?.lastName}</Text>
        <Text style={styles.studentCodeText}>Talaba ID: {profile?.studentCode || 'INF-STD'}</Text>

        <View style={styles.statusPill}>
          <ShieldCheck size={12} color="#34C759" />
          <Text style={styles.statusPillText}>Faol talaba</Text>
        </View>
      </View>

      {/* Apple Inset Group: O'quv Ma'lumotlari */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>O'QUV MA'LUMOTLARI</Text>
      </View>

      <View style={styles.groupedCard}>
        <View style={styles.row}>
          <View style={[styles.iconBox, { backgroundColor: '#EBF5FF' }]}>
            <Building2 size={18} color="#007AFF" />
          </View>
          <View style={styles.rowContent}>
            <Text style={styles.rowLabel}>Filial</Text>
            <Text style={styles.rowValue}>{profile?.branch?.name || "Asosiy Filial"}</Text>
          </View>
        </View>

        <View style={styles.separator} />

        <View style={styles.row}>
          <View style={[styles.iconBox, { backgroundColor: '#FFF4E6' }]}>
            <BookOpen size={18} color="#FF9500" />
          </View>
          <View style={styles.rowContent}>
            <Text style={styles.rowLabel}>Kurs</Text>
            <Text style={styles.rowValue}>{profile?.course?.name || "Frontend & Web"}</Text>
          </View>
        </View>

        <View style={styles.separator} />

        <View style={styles.row}>
          <View style={[styles.iconBox, { backgroundColor: '#F0EEFF' }]}>
            <Users size={18} color="#5856D6" />
          </View>
          <View style={styles.rowContent}>
            <Text style={styles.rowLabel}>Guruh</Text>
            <Text style={styles.rowValue}>{profile?.group?.name || "FS-Guruh"}</Text>
          </View>
        </View>

        <View style={styles.separator} />

        <View style={styles.row}>
          <View style={[styles.iconBox, { backgroundColor: '#EAF8EE' }]}>
            <Phone size={18} color="#34C759" />
          </View>
          <View style={styles.rowContent}>
            <Text style={styles.rowLabel}>Telefon raqam</Text>
            <Text style={styles.rowValue}>{profile?.phone || "+998 90 123 45 67"}</Text>
          </View>
        </View>
      </View>

      {/* Apple Inset Group: Statistika va Yutuqlar */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>YUTUQLAR VA BALLAR</Text>
      </View>

      <View style={styles.groupedCard}>
        <View style={styles.row}>
          <View style={[styles.iconBox, { backgroundColor: '#FFF4E6' }]}>
            <Sparkles size={18} color="#FF9500" />
          </View>
          <View style={styles.rowContent}>
            <Text style={styles.rowLabel}>Tajriba (XP)</Text>
            <Text style={styles.rowValue}>{progress.xp || 0} XP (Lv. {progress.level || 1})</Text>
          </View>
        </View>

        <View style={styles.separator} />

        <View style={styles.row}>
          <View style={[styles.iconBox, { backgroundColor: '#FFFBE6' }]}>
            <Sparkles size={18} color="#E5A100" />
          </View>
          <View style={styles.rowContent}>
            <Text style={styles.rowLabel}>XCoin Balansi</Text>
            <Text style={styles.rowValue}>{progress.xcoin || 0} tanga</Text>
          </View>
        </View>
      </View>

      {/* Apple Inset Group: Chiqish */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>AKKAUNT</Text>
      </View>

      <View style={styles.groupedCard}>
        <TouchableOpacity style={styles.rowAction} onPress={handleLogout} activeOpacity={0.6}>
          <View style={[styles.iconBox, { backgroundColor: '#FEE2E2' }]}>
            <LogOut size={18} color="#EF4444" />
          </View>
          <View style={styles.rowContent}>
            <Text style={[styles.rowValue, { color: '#FF3B30' }]}>Akkauntdan chiqish</Text>
          </View>
          <ChevronRight size={18} color="#C7C7CC" />
        </TouchableOpacity>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  contentContainer: {
    paddingTop: 8,
    paddingBottom: 40,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
  },
  categoryLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8E8E93',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  largeTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#000000',
    letterSpacing: -0.5,
  },
  profileHeaderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginHorizontal: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 24,
    ...APPLE_SHADOW,
  },
  avatarLarge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarLargeText: {
    fontSize: 26,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  fullName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
    letterSpacing: -0.4,
  },
  studentCodeText: {
    fontSize: 13,
    color: '#8E8E93',
    marginTop: 2,
    fontWeight: '500',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EAF8EE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    marginTop: 10,
    gap: 4,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#34C759',
  },
  sectionHeader: {
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8E8E93',
    letterSpacing: -0.1,
    textTransform: 'uppercase',
  },
  groupedCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    marginHorizontal: 16,
    overflow: 'hidden',
    marginBottom: 20,
    ...APPLE_SHADOW,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  rowAction: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  rowContent: {
    flex: 1,
  },
  rowLabel: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '500',
  },
  rowValue: {
    fontSize: 15,
    color: '#000000',
    fontWeight: '600',
    marginTop: 1,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#E5E5EA',
    marginLeft: 64,
  },
});
