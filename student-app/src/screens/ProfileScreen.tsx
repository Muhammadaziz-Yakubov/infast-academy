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
  LogOut,
  ChevronRight,
  ShieldCheck,
  Phone,
  Sparkles,
  Coins,
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
          <ShieldCheck size={12} color="#30D158" />
          <Text style={styles.statusPillText}>Faol talaba</Text>
        </View>
      </View>

      {/* Apple Inset Group: O'quv Ma'lumotlari */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>O'QUV MA'LUMOTLARI</Text>
      </View>

      <View style={styles.groupedCard}>
        <View style={styles.row}>
          <View style={[styles.iconBox, { backgroundColor: 'rgba(10, 132, 255, 0.16)' }]}>
            <Building2 size={18} color="#0A84FF" />
          </View>
          <View style={styles.rowContent}>
            <Text style={styles.rowLabel}>Filial</Text>
            <Text style={styles.rowValue}>{profile?.branch?.name || "Asosiy Filial"}</Text>
          </View>
        </View>

        <View style={styles.separator} />

        <View style={styles.row}>
          <View style={[styles.iconBox, { backgroundColor: 'rgba(255, 149, 0, 0.16)' }]}>
            <BookOpen size={18} color="#FF9500" />
          </View>
          <View style={styles.rowContent}>
            <Text style={styles.rowLabel}>Kurs</Text>
            <Text style={styles.rowValue}>{profile?.course?.name || "Frontend & Web"}</Text>
          </View>
        </View>

        <View style={styles.separator} />

        <View style={styles.row}>
          <View style={[styles.iconBox, { backgroundColor: 'rgba(94, 92, 230, 0.16)' }]}>
            <Users size={18} color="#5E5CE6" />
          </View>
          <View style={styles.rowContent}>
            <Text style={styles.rowLabel}>Guruh</Text>
            <Text style={styles.rowValue}>{profile?.group?.name || "FS-Guruh"}</Text>
          </View>
        </View>

        <View style={styles.separator} />

        <View style={styles.row}>
          <View style={[styles.iconBox, { backgroundColor: 'rgba(48, 209, 88, 0.16)' }]}>
            <Phone size={18} color="#30D158" />
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
          <View style={[styles.iconBox, { backgroundColor: 'rgba(255, 149, 0, 0.16)' }]}>
            <Sparkles size={18} color="#FF9500" />
          </View>
          <View style={styles.rowContent}>
            <Text style={styles.rowLabel}>Tajriba (XP)</Text>
            <Text style={styles.rowValue}>{progress.xp || 0} XP (Lv. {progress.level || 1})</Text>
          </View>
        </View>

        <View style={styles.separator} />

        <View style={styles.row}>
          <View style={[styles.iconBox, { backgroundColor: 'rgba(255, 214, 10, 0.16)' }]}>
            <Coins size={18} color="#FFD60A" />
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
          <View style={[styles.iconBox, { backgroundColor: 'rgba(255, 69, 58, 0.16)' }]}>
            <LogOut size={18} color="#FF453A" />
          </View>
          <View style={styles.rowContent}>
            <Text style={[styles.rowValue, { color: '#FF453A' }]}>Akkauntdan chiqish</Text>
          </View>
          <ChevronRight size={18} color="#636366" />
        </TouchableOpacity>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000', // Apple OLED True Black
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
    fontSize: 34,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.6,
  },
  profileHeaderCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 22,
    marginHorizontal: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    ...APPLE_SHADOW,
  },
  avatarLarge: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#FF9500',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    shadowColor: '#FF9500',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarLargeText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  fullName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  studentCodeText: {
    fontSize: 13,
    color: '#8E8E93',
    fontWeight: '600',
    marginBottom: 12,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(48, 209, 88, 0.16)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    gap: 5,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#30D158',
  },
  sectionHeader: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#8E8E93',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  groupedCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 20,
    marginHorizontal: 16,
    overflow: 'hidden',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    ...APPLE_SHADOW,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  rowAction: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 11,
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
    color: '#FFFFFF',
    fontWeight: '600',
    marginTop: 2,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginLeft: 66,
  },
});
