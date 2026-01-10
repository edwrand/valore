import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SavedListsScreen from '../screens/saved/SavedLists';
import ListDetailScreen from '../screens/saved/ListDetail';
import HotelDetailScreen from '../screens/explore/HotelDetail';

export type SavedStackParamList = {
  SavedLists: undefined;
  ListDetail: { listId: string };
  HotelDetail: { hotelId: string };
};

const Stack = createNativeStackNavigator<SavedStackParamList>();

export default function SavedStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="SavedLists" component={SavedListsScreen} />
      <Stack.Screen name="ListDetail" component={ListDetailScreen} />
      <Stack.Screen name="HotelDetail" component={HotelDetailScreen} />
    </Stack.Navigator>
  );
}
