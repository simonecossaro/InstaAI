import { createStackNavigator } from '@react-navigation/stack';
import ChatSearchScreen from './ChatSearchScreen';
import ChatScreen from './ChatScreen';

const Stack = createStackNavigator();

export default function SearchStack() {
  return (
    <Stack.Navigator
    screenOptions={{
        headerShown: false 
    }}
    >
      <Stack.Screen name="ChatSearchScreen" component={ChatSearchScreen} />
      <Stack.Screen name="ChatScreen" component={ChatScreen} />
    </Stack.Navigator>
  );
};