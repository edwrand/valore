import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Map as MapIcon } from 'lucide-react-native';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../styles/theme';
import SearchBar from '../../components/SearchBar';
import HotelCard from '../../components/HotelCard';
import { useHotels } from '../../hooks/useHotels';
import { useToggleSave } from '../../hooks/useSaveHotel';
import type { MapStackParamList } from '../../navigation/MapStack';
import type { HotelWithDetails } from '../../types/models';

type Props = {
  navigation: NativeStackNavigationProp<MapStackParamList, 'MapView'>;
};

export default function MapViewScreen({ navigation }: Props) {
  const [searchQuery, setSearchQuery] = useState('');

  const { data: hotels, isLoading, refetch, isRefetching } = useHotels({
    query: searchQuery || undefined,
  });

  const toggleSave = useToggleSave();

  const handleHotelPress = (hotelId: string) => {
    navigation.navigate('HotelDetail', { hotelId });
  };

  const handleSave = (hotelId: string) => {
    toggleSave.mutate({ hotelId });
  };

  // Filter hotels that have coordinates
  const hotelsWithCoords = hotels?.filter((h) => h.lat !== null && h.lng !== null) || [];

  const renderItem = ({ item }: { item: HotelWithDetails }) => (
    <View style={styles.cardWrapper}>
      <HotelCard
        hotel={item}
        onPress={() => handleHotelPress(item.id)}
        onSave={() => handleSave(item.id)}
        isSaved={item.is_saved}
        compact
      />
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.empty}>
      <Text style={styles.emptyText}>
        {searchQuery ? 'No hotels match your search' : 'No hotels with locations found'}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Map</Text>
      </View>

      {/* Map placeholder banner */}
      <View style={styles.mapPlaceholder}>
        <MapIcon size={32} color={colors.textTertiary} />
        <Text style={styles.placeholderTitle}>Map View Coming Soon</Text>
        <Text style={styles.placeholderText}>
          Full map functionality requires a development build.{'\n'}
          Browse hotels with locations below.
        </Text>
      </View>

      {/* Search bar */}
      <View style={styles.searchContainer}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search hotels..."
        />
      </View>

      {/* Hotels list */}
      {isLoading && !hotels ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={hotelsWithCoords}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={renderEmpty}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
        />
      )}

      {/* Hotel count */}
      <View style={styles.countBadge}>
        <Text style={styles.countText}>
          {hotelsWithCoords.length} hotels with locations
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  title: {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  mapPlaceholder: {
    backgroundColor: colors.backgroundSecondary,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  placeholderTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  placeholderText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  searchContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  list: {
    paddingBottom: spacing.xl + 40,
  },
  cardWrapper: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  empty: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  countBadge: {
    position: 'absolute',
    bottom: spacing.lg,
    alignSelf: 'center',
    backgroundColor: colors.textPrimary,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  countText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.textInverse,
  },
});
