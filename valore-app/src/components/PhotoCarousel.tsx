import React, { useState, useRef } from 'react';
import {
  View,
  Image,
  FlatList,
  Dimensions,
  StyleSheet,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { colors, spacing, borderRadius } from '../styles/theme';

interface PhotoCarouselProps {
  photos: string[];
  height?: number;
  showDots?: boolean;
  borderRadius?: number;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function PhotoCarousel({
  photos,
  height = 250,
  showDots = true,
  borderRadius: customBorderRadius = borderRadius.lg,
}: PhotoCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffset / SCREEN_WIDTH);
    setActiveIndex(index);
  };

  if (photos.length === 0) {
    return (
      <View style={[styles.placeholder, { height, borderRadius: customBorderRadius }]}>
        <Image
          source={{ uri: 'https://via.placeholder.com/400x300' }}
          style={styles.image}
          resizeMode="cover"
        />
      </View>
    );
  }

  if (photos.length === 1) {
    return (
      <View style={{ height, borderRadius: customBorderRadius, overflow: 'hidden' }}>
        <Image
          source={{ uri: photos[0] }}
          style={styles.image}
          resizeMode="cover"
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { height }]}>
      <FlatList
        ref={flatListRef}
        data={photos}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        renderItem={({ item }) => (
          <View style={[styles.imageWrapper, { width: SCREEN_WIDTH, borderRadius: customBorderRadius }]}>
            <Image
              source={{ uri: item }}
              style={styles.image}
              resizeMode="cover"
            />
          </View>
        )}
        keyExtractor={(item, index) => `${item}-${index}`}
      />

      {/* Pagination dots */}
      {showDots && photos.length > 1 && (
        <View style={styles.pagination}>
          {photos.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === activeIndex && styles.dotActive,
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  placeholder: {
    backgroundColor: colors.backgroundTertiary,
    overflow: 'hidden',
  },
  imageWrapper: {
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  pagination: {
    position: 'absolute',
    bottom: spacing.md,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xs,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  dotActive: {
    backgroundColor: colors.textInverse,
    width: 24,
  },
});
