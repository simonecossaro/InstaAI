import { createStackNavigator } from '@react-navigation/stack';
import SearchUserScreen from './SearchUser';
import SearchProfileScreen from './SearchProfileScreen';

const Stack = createStackNavigator();

export default function SearchStack() {
  return (
    <Stack.Navigator
    screenOptions={{
        headerShown: false 
    }}
    >
      <Stack.Screen name="SearchBarScreen" component={SearchUserScreen} />
      <Stack.Screen name="Search Profile" component={SearchProfileScreen} />
    </Stack.Navigator>
  );
};