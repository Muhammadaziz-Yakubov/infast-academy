import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Image,
} from 'react-native';
import { apiRequest } from '../services/api';
import { COLORS, SPACING, APPLE_SHADOW } from '../constants/theme';
import {
  Calendar,
  MapPin,
  Users,
  Coins,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ChevronLeft,
} from 'lucide-react-native';

interface EventsScreenProps {
  onBack?: () => void;
}

export default function EventsScreen({ onBack }: EventsScreenProps) {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await apiRequest('/api/student/events');
      if (res.success) {
        setData(res);
      }
    } catch (e) {
      console.warn('Events fetch error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRegister = (event: any) => {
    if (event.isRegistered) {
      Alert.alert(
        "Ro'yxatdan chiqish",
        `"${event.title}" tadbiridan ro'yxatdan chiqmoqchimisiz?`,
        [
          { text: 'Bekor qilish', style: 'cancel' },
          {
            text: 'Chiqish',
            style: 'destructive',
            onPress: async () => {
              try {
                setProcessingId(event._id);
                const res = await apiRequest('/api/student/events', {
                  method: 'POST',
                  body: { eventId: event._id, action: 'UNREGISTER' },
                });
                if (res.success) {
                  Alert.alert('Xabar', res.message);
                  fetchEvents();
                }
              } catch (err: any) {
                Alert.alert('Xatolik', err.message);
              } finally {
                setProcessingId(null);
              }
            },
          },
        ]
      );
      return;
    }

    // Show strict rule warning modal/alert
    Alert.alert(
      '⚠️ Muhim qoida va shart!',
      `Tadbirga yozilish qoidalari:\n\n` +
      `✅ Agar tadbir kuni kelsangiz va davomatdan o'tsangiz: +${event.coinReward || 500} XCoin balansingizga qo'shiladi!\n\n` +
      `❌ Agar ro'yxatdan o'tib, sababsiz kelmasangiz: balansingizdan -${event.coinPenalty || 500} XCoin jarima sifatida ayirib tashlanadi!\n\n` +
      `Ushbu shartlarga rozimisiz va tadbirga qatnashasizmi?`,
      [
        { text: 'Yo‘q, bekor qilish', style: 'cancel' },
        {
          text: 'Ha, roziman (Yozilish)',
          onPress: async () => {
            try {
              setProcessingId(event._id);
              const res = await apiRequest('/api/student/events', {
                method: 'POST',
                body: { eventId: event._id, action: 'REGISTER' },
              });
              if (res.success) {
                Alert.alert('🎉 Tabriklaymiz!', res.message);
                fetchEvents();
              }
            } catch (err: any) {
              Alert.alert('Xatolik', err.message);
            } finally {
              setProcessingId(null);
            }
          },
        },
      ]
    );
  };

  if (loading && !data) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="small" color={COLORS.primary} />
        <Text style={styles.loadingText}>Tadbirlar yuklanmoqda...</Text>
      </View>
    );
  }

  const events = data?.events || [];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            fetchEvents();
          }}
          tintColor={COLORS.primary}
        />
      }
    >
      {/* Apple Large Title Header */}
      <View style={styles.header}>
        {onBack && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={onBack}
            activeOpacity={0.7}
          >
            <ChevronLeft size={20} color="#0A84FF" strokeWidth={2.4} />
            <Text style={styles.backButtonText}>Bosh sahifa</Text>
          </TouchableOpacity>
        )}
        <Text style={styles.categoryLabel}>HAYOT VA JAMOAT</Text>
        <Text style={styles.largeTitle}>Tadbirlar</Text>
      </View>

      {/* Rules Notice Banner */}
      <View style={styles.noticeBanner}>
        <View style={styles.noticeIconBadge}>
          <AlertTriangle size={18} color="#FF9500" />
        </View>
        <View style={styles.noticeTextCol}>
          <Text style={styles.noticeTitle}>Tadbir Qoidalari</Text>
          <Text style={styles.noticeDesc}>
            Kelganingizda +500 XCoin mukofot, ro'yxatdan o'tib kelmasangiz -500 XCoin jarima hisoblanadi.
          </Text>
        </View>
      </View>

      {/* Events List */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>BO'LAJAK TADBIRLAR ({events.length})</Text>
      </View>

      {events.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>Hozircha faol tadbirlar mavjud emas</Text>
        </View>
      ) : (
        events.map((evt: any) => {
          const isRegistered = evt.isRegistered;
          const isProcessing = processingId === evt._id;
          const dateObj = new Date(evt.date);
          const isPast = dateObj.getTime() < Date.now() || evt.status === 'COMPLETED';
          const dateFormatted = dateObj.toLocaleDateString('uz-UZ', {
            timeZone: 'Asia/Tashkent',
            weekday: 'short',
            day: 'numeric',
            month: 'long',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          });

          return (
            <View key={evt._id} style={styles.eventCard}>
              {/* Event Image */}
              <View style={styles.eventImageContainer}>
                {evt.imageUrl ? (
                  <Image source={{ uri: evt.imageUrl }} style={styles.eventImage} />
                ) : (
                  <View style={styles.eventImagePlaceholder} />
                )}
                <View style={styles.rewardFloatBadge}>
                  <Sparkles size={12} color="#000000" />
                  <Text style={styles.rewardFloatText}>+{evt.coinReward} XCoin</Text>
                </View>
              </View>

              <View style={styles.eventBody}>
                <Text style={styles.eventTitle}>{evt.title}</Text>
                <Text style={styles.eventDesc} numberOfLines={2}>
                  {evt.description}
                </Text>

                {/* Event Meta Details */}
                <View style={styles.metaRow}>
                  <View style={styles.metaItem}>
                    <Calendar size={14} color="#FF9500" />
                    <Text style={styles.metaText}>{dateFormatted}</Text>
                  </View>

                  <View style={styles.metaItem}>
                    <MapPin size={14} color="#0A84FF" />
                    <Text style={styles.metaText} numberOfLines={1}>{evt.location}</Text>
                  </View>
                </View>

                {/* Participants & Action Button */}
                <View style={styles.eventFooter}>
                  <View style={styles.participantsBadge}>
                    <Users size={14} color="#8E8E93" />
                    <Text style={styles.participantsText}>
                      {evt.participantsCount} / {evt.maxParticipants} talaba
                    </Text>
                  </View>

                  {evt.myAttendanceStatus === 'ATTENDED' ? (
                    <View style={[styles.actionButton, { backgroundColor: 'rgba(48, 209, 88, 0.2)', borderWidth: 1, borderColor: '#30D158' }]}>
                      <CheckCircle2 size={14} color="#30D158" style={{ marginRight: 4 }} />
                      <Text style={[styles.actionButtonText, { color: '#30D158' }]}>
                        Qatnashdingiz (+{evt.coinReward} XCoin)
                      </Text>
                    </View>
                  ) : evt.myAttendanceStatus === 'ABSENT' ? (
                    <View style={[styles.actionButton, { backgroundColor: 'rgba(255, 69, 58, 0.2)', borderWidth: 1, borderColor: '#FF453A' }]}>
                      <AlertTriangle size={14} color="#FF453A" style={{ marginRight: 4 }} />
                      <Text style={[styles.actionButtonText, { color: '#FF453A' }]}>
                        Kelmagansiz (-{evt.coinPenalty} XCoin)
                      </Text>
                    </View>
                  ) : isPast ? (
                    <View style={[styles.actionButton, { backgroundColor: '#2C2C2E' }]}>
                      <Text style={[styles.actionButtonText, { color: '#8E8E93' }]}>
                        Tadbir yakunlandi
                      </Text>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={[
                        styles.actionButton,
                        isRegistered && styles.actionButtonRegistered,
                      ]}
                      onPress={() => handleRegister(evt)}
                      disabled={isProcessing}
                      activeOpacity={0.8}
                    >
                      {isProcessing ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <>
                          {isRegistered && <CheckCircle2 size={14} color="#FFFFFF" style={{ marginRight: 4 }} />}
                          <Text style={styles.actionButtonText}>
                            {isRegistered ? "Yozilgansiz (Chiqish)" : "Yozilish"}
                          </Text>
                        </>
                      )}
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          );
        })
      )}

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
    paddingBottom: 95,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000000',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 95,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 10,
    alignSelf: 'flex-start',
  },
  backButtonText: {
    fontSize: 16,
    color: '#0A84FF',
    fontWeight: '600',
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
  noticeBanner: {
    backgroundColor: 'rgba(255, 149, 0, 0.12)',
    borderRadius: 18,
    marginHorizontal: 16,
    padding: 16,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 149, 0, 0.25)',
  },
  noticeIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: 'rgba(255, 149, 0, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  noticeTextCol: {
    flex: 1,
  },
  noticeTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FF9500',
    marginBottom: 2,
  },
  noticeDesc: {
    fontSize: 11,
    color: '#EBEBF5',
    lineHeight: 16,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8E8E93',
    letterSpacing: 0.5,
  },
  emptyCard: {
    backgroundColor: '#1C1C1E',
    marginHorizontal: 16,
    padding: 30,
    borderRadius: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  emptyText: {
    color: '#8E8E93',
    fontSize: 14,
    fontWeight: '500',
  },
  eventCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 20,
    marginHorizontal: 16,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    ...APPLE_SHADOW,
  },
  eventImageContainer: {
    height: 140,
    width: '100%',
    position: 'relative',
    backgroundColor: '#2C2C2E',
  },
  eventImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  eventImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#2C2C2E',
  },
  rewardFloatBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#FFD60A',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  rewardFloatText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '800',
  },
  eventBody: {
    padding: 16,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  eventDesc: {
    fontSize: 13,
    color: '#8E8E93',
    lineHeight: 18,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 12,
    color: '#EBEBF5',
    fontWeight: '500',
  },
  eventFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  participantsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  participantsText: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '500',
  },
  actionButton: {
    backgroundColor: '#0A84FF',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButtonRegistered: {
    backgroundColor: 'rgba(10, 132, 255, 0.25)',
    borderWidth: 1,
    borderColor: '#0A84FF',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
