import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AssistentesStackParamList } from './types';
import { AssistentesListScreen } from '../features/assistentes/AssistentesListScreen';
import { AssistenteFormScreen } from '../features/assistentes/AssistenteFormScreen';

const Stack = createNativeStackNavigator<AssistentesStackParamList>();

export function AssistentesStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Lista" component={AssistentesListScreen} />
      <Stack.Screen name="Novo" component={AssistenteFormScreen} />
      <Stack.Screen name="Editar" component={AssistenteFormScreen} />
    </Stack.Navigator>
  );
}
