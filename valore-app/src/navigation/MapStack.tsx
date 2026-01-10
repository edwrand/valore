import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MapViewScreen from '../screens/map/MapView';
import HotelDetailScreen from '../screens/explore/HotelDetail';

export type MapStackParamList = {
  MapView: undefined;
  HotelDetail: { hotelId: string };
};

const Stack = createNativeStackNavigator<MapStackParamList>();

export default function MapStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="MapView" component={MapViewScreen} />
      <Stack.Screen name="HotelDetail" component={HotelDetailScreen} />
    </Stack.Navigator>
  );
}
