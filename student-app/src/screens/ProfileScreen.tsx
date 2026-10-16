import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  TextInput,
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
  Camera,
  KeyRound,
  Check,
  X,
  AlertTriangle,
  CreditCard,
} from 'lucide-react-native';

// Professional developer avatars from DiceBear / Unsplash CDN
const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
  'https://api.dicebear.com/7.x/bottts/png?seed=developer1',
  'https://api.dicebear.com/7.x/bottts/png?seed=codefast',
];

export default function ProfileScreen() {
  const { student, logout, refreshProfile } = useAuth();
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [avatarModalVisible, setAvatarModalVisible] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [savingAvatar, setSavingAvatar] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

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

  const handleSelectAvatar = async (url: string) => {
    try {
      setSavingAvatar(true);
      const res = await apiRequest('/api/student/profile', {
        method: 'POST',
        body: { avatarUrl: url },
      });

      if (res.success) {
        setData((prev: any) => ({
          ...prev,
          student: {
            ...prev?.student,
            avatarUrl: url,
          },
        }));
        await refreshProfile();
        setAvatarModalVisible(false);
        Alert.alert('Muvaffaqiyatli', 'Profil rasmi yangilandi!');
      } else {
        Alert.alert('Xatolik', res.error || 'Rasmni saqlab bo‘lmadi');
      }
    } catch (err: any) {
      Alert.alert('Xatolik', err.message || 'Server bilan bog‘lanishda xatolik');
    } finally {
      setSavingAvatar(false);
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword || newPassword.length < 4) {
      Alert.alert('Xatolik', "Yangi parol kamida 4 ta belgidan iborat bo'lishi kerak.");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Xatolik', 'Yangi parollar bir-biriga mos kelmadi.');
      return;
    }

    try {
      setSavingPassword(true);
      const res = await apiRequest('/api/student/profile', {
        method: 'POST',
        body: { currentPassword, newPassword },
      });

      if (res.success) {
        setPasswordModalVisible(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        Alert.alert('🎉 Tabriklaymiz!', res.message || 'Parolingiz muvaffaqiyatli o‘zgartirildi.');
      } else {
        Alert.alert('Xatolik', res.error || 'Parolni o‘zgartirib bo‘lmadi.');
      }
    } catch (err: any) {
      Alert.alert('Xatolik', err.message || 'Parolni yangilashda xatolik yuz berdi.');
    } finally {
      setSavingPassword(false);
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

      {/* Apple Profile Header Card with Avatar Change Option */}
      <View style={styles.profileHeaderCard}>
        <TouchableOpacity
          style={styles.avatarWrapper}
          onPress={() => setAvatarModalVisible(true)}
          activeOpacity={0.8}
        >
          {profile?.avatarUrl ? (
            <Image source={{ uri: profile.avatarUrl }} style={styles.avatarLargeImage} />
          ) : (
            <View style={styles.avatarLarge}>
              <Text style={styles.avatarLargeText}>
                {profile?.firstName?.[0] || 'I'}{profile?.lastName?.[0] || 'N'}
              </Text>
            </View>
          )}
          <View style={styles.cameraBadge}>
            <Camera size={14} color="#FFFFFF" />
          </View>
        </TouchableOpacity>

        <Text style={styles.fullName}>{profile?.firstName} {profile?.lastName}</Text>
        <Text style={styles.studentCodeText}>Talaba ID: {profile?.studentCode || 'INF-STD'}</Text>

        {(() => {
          const isOverdue =
            profile?.paymentStatus === 'OVERDUE' ||
            profile?.status === 'BLOCKED' ||
            profile?.status === 'BLOCK' ||
            profile?.status === 'QARZDOR' ||
            (profile?.totalDebt && profile.totalDebt > 0);

          return (
            <View style={[styles.statusPill, isOverdue && { backgroundColor: 'rgba(255, 69, 58, 0.15)', borderColor: 'rgba(255, 69, 58, 0.3)' }]}>
              {isOverdue ? (
                <AlertTriangle size={12} color="#FF453A" />
              ) : (
                <ShieldCheck size={12} color="#30D158" />
              )}
              <Text style={[styles.statusPillText, isOverdue && { color: '#FF453A' }]}>
                {isOverdue ? 'Bloklangan (Qarzdor)' : 'Faol talaba'}
              </Text>
            </View>
          );
        })()}
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

        <View style={styles.separator} />

        {(() => {
          const isOverdue =
            profile?.paymentStatus === 'OVERDUE' ||
            profile?.status === 'BLOCKED' ||
            profile?.status === 'BLOCK' ||
            profile?.status === 'QARZDOR' ||
            (profile?.totalDebt && profile.totalDebt > 0);

          const formatMoney = (amount?: number) => {
            if (!amount || isNaN(amount)) return '';
            return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + " so'm";
          };

          const debtSum = profile?.totalDebt || 0;
          const statusText = isOverdue
            ? debtSum > 0 ? `Qarzdor (${formatMoney(debtSum)})` : "Qarzdor"
            : profile?.paymentStatus === 'PARTIAL'
            ? `Kutilmoqda (${formatMoney(debtSum)})`
            : "Faol (To'langan)";

          const statusColor = isOverdue
            ? '#FF453A'
            : profile?.paymentStatus === 'PARTIAL'
            ? '#FF9500'
            : '#30D158';

          const iconBg = isOverdue
            ? 'rgba(255, 69, 58, 0.16)'
            : profile?.paymentStatus === 'PARTIAL'
            ? 'rgba(255, 149, 0, 0.16)'
            : 'rgba(48, 209, 88, 0.16)';

          return (
            <View style={styles.row}>
              <View style={[styles.iconBox, { backgroundColor: iconBg }]}>
                {isOverdue ? (
                  <AlertTriangle size={18} color={statusColor} />
                ) : (
                  <CreditCard size={18} color={statusColor} />
                )}
              </View>
              <View style={styles.rowContent}>
                <Text style={styles.rowLabel}>To'lov holati</Text>
                <Text style={[styles.rowValue, { color: statusColor, fontWeight: '700' }]}>
                  {statusText}
                </Text>
              </View>
            </View>
          );
        })()}
      </View>

      {/* Apple Inset Group: Xavfsizlik & Parol */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>XAVFSIZLIK VA SOZLAMALAR</Text>
      </View>

      <View style={styles.groupedCard}>
        <TouchableOpacity
          style={styles.rowAction}
          onPress={() => setAvatarModalVisible(true)}
          activeOpacity={0.6}
        >
          <View style={[styles.iconBox, { backgroundColor: 'rgba(255, 149, 0, 0.16)' }]}>
            <Camera size={18} color="#FF9500" />
          </View>
          <View style={styles.rowContent}>
            <Text style={styles.rowLabel}>Profil rasmi</Text>
            <Text style={styles.rowValue}>Avatarni o'zgartirish</Text>
          </View>
          <ChevronRight size={18} color="#636366" />
        </TouchableOpacity>

        <View style={styles.separator} />

        <TouchableOpacity
          style={styles.rowAction}
          onPress={() => setPasswordModalVisible(true)}
          activeOpacity={0.6}
        >
          <View style={[styles.iconBox, { backgroundColor: 'rgba(10, 132, 255, 0.16)' }]}>
            <KeyRound size={18} color="#0A84FF" />
          </View>
          <View style={styles.rowContent}>
            <Text style={styles.rowLabel}>Kirish paroli</Text>
            <Text style={styles.rowValue}>Parolni yangilash</Text>
          </View>
          <ChevronRight size={18} color="#636366" />
        </TouchableOpacity>
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

      {/* --- MODAL 1: AVATAR TANLASH --- */}
      <Modal visible={avatarModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Avatarni Tanlang</Text>
              <TouchableOpacity onPress={() => setAvatarModalVisible(false)} style={styles.closeBtn}>
                <X size={20} color="#8E8E93" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>
              O'zingizga yoqqan rasmni tanlang va profilingizda aks etadi
            </Text>

            {savingAvatar ? (
              <ActivityIndicator size="large" color="#FF9500" style={{ marginVertical: 30 }} />
            ) : (
              <View style={styles.avatarGrid}>
                {PRESET_AVATARS.map((uri, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={[
                      styles.avatarGridItem,
                      profile?.avatarUrl === uri && styles.avatarGridItemSelected,
                    ]}
                    onPress={() => handleSelectAvatar(uri)}
                    activeOpacity={0.7}
                  >
                    <Image source={{ uri }} style={styles.avatarThumb} />
                    {profile?.avatarUrl === uri && (
                      <View style={styles.avatarCheckBadge}>
                        <Check size={12} color="#FFFFFF" strokeWidth={3} />
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* --- MODAL 2: PAROLNI O'ZGARTIRISH --- */}
      <Modal visible={passwordModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Parolni O'zgartirish</Text>
              <TouchableOpacity onPress={() => setPasswordModalVisible(false)} style={styles.closeBtn}>
                <X size={20} color="#8E8E93" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalInputGroup}>
              <Text style={styles.inputLabel}>Amaldagi parol (mavjud bo'lsa):</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Amaldagi parolingiz"
                placeholderTextColor="#636366"
                secureTextEntry
                value={currentPassword}
                onChangeText={setCurrentPassword}
              />

              <Text style={styles.inputLabel}>Yangi parol:</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Kamida 4 ta belgi"
                placeholderTextColor="#636366"
                secureTextEntry
                value={newPassword}
                onChangeText={setNewPassword}
              />

              <Text style={styles.inputLabel}>Yangi parolni tasdiqlang:</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Yangi parolni qayta kiriting"
                placeholderTextColor="#636366"
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
            </View>

            <TouchableOpacity
              style={[styles.saveBtn, savingPassword && { opacity: 0.6 }]}
              onPress={handleChangePassword}
              disabled={savingPassword}
            >
              {savingPassword ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.saveBtnText}>Parolni saqlash</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  avatarWrapper: {
    position: 'relative',
    marginBottom: 14,
  },
  avatarLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FF9500',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF9500',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarLargeImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#FF9500',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FF9500',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#1C1C1E',
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

  /* Modals */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1C1C1E',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 22,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.12)',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  closeBtn: {
    padding: 6,
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#8E8E93',
    marginBottom: 18,
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    justifyContent: 'center',
    marginBottom: 20,
  },
  avatarGridItem: {
    width: 66,
    height: 66,
    borderRadius: 33,
    position: 'relative',
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  avatarGridItemSelected: {
    borderColor: '#FF9500',
  },
  avatarThumb: {
    width: '100%',
    height: '100%',
  },
  avatarCheckBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#FF9500',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalInputGroup: {
    gap: 10,
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8E8E93',
    marginTop: 4,
  },
  modalInput: {
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#FFFFFF',
    fontSize: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  saveBtn: {
    backgroundColor: '#FF9500',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
