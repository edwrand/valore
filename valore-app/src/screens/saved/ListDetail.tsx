import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { ChevronLeft, Bookmark } from 'lucide-react-native';
import { colors, spacing, fontSize, fontWeight } from '../../styles/theme';
import HotelCard from '../../components/HotelCard';
import { useListWithHotels, useRemoveFromList } from '../../hooks/useSaveHotel';
import type { SavedStackParamList } from '../../navigation/SavedStack';
import type { HotelWithDetails } from '../../types/models';

type Props = {
  navigation: NativeStackNavigationProp<SavedStackParamList, 'ListDetail'>;
  route: RouteProp<SavedStackParamList, 'ListDetail'>;
};

export default function ListDetailScreen({ navigation, route }: Props) {
  const { listId } = route.params;
  const { data: list, isLoading } = useListWithHotels(listId);
  const removeFromList = useRemoveFromList();

  const handleHotelPress = (hotelId: string) => {
    navigation.navigate('HotelDetail', { hotelId });
  };

  const handleRemove = (hotelId: string) => {
    removeFromList.mutate({ hotelId, listId });
  };

  if (isLoading || !list) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const renderItem = ({ item }: { item: HotelWithDetails }) => (
    <View style={styles.cardWrapper}>
      <HotelCard
        hotel={item}
        onPress={() => handleHotelPress(item.id)}
        onSave={() => handleRemove(item.id)}
        isSaved={true}
      />
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.empty}>
      <Bookmark size={48} color={colors.textTertiary} />
      <Text style={styles.emptyTitle}>No hotels in this list</Text>
      <Text style={styles.emptyText}>
        Start exploring and save hotels to this list
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ChevronLeft size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.title}>{list.name}</Text>
          <Text style={styles.subtitle}>
            {list.hotels.length} {list.hotels.length === 1 ? 'hotel' : 'hotels'}
          </Text>
        </View>
        <View style={{ width: 24 }} />
      </View>

      {/* Hotels list */}
      <FlatList
        data={list.hotels}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  list: {
    padding: spacing.md,
  },
  cardWrapper: {
    marginBottom: spacing.md,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  emptyText: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
