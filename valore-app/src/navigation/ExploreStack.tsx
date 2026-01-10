import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ExploreListScreen from '../screens/explore/ExploreList';
import HotelDetailScreen from '../screens/explore/HotelDetail';
import CreateReviewScreen from '../screens/explore/CreateReview';

export type ExploreStackParamList = {
  ExploreList: undefined;
  HotelDetail: { hotelId: string };
  CreateReview: { hotelId: string };
};

const Stack = createNativeStackNavigator<ExploreStackParamList>();

export default function ExploreStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="ExploreList" component={ExploreListScreen} />
      <Stack.Screen name="HotelDetail" component={HotelDetailScreen} />
      <Stack.Screen name="CreateReview" component={CreateReviewScreen} />
    </Stack.Navigator>
  );
}
