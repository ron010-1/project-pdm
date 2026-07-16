import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { FamiliasStackParamList } from './types';
import { ListScreen } from '../features/beneficiarios/ListScreen';
import { DetalheScreen } from '../features/beneficiarios/DetalheScreen';
import { NovoScreen } from '../features/beneficiarios/NovoScreen';
import { EditarScreen } from '../features/beneficiarios/EditarScreen';
import { RegistrarVisitaScreen } from '../features/beneficiarios/RegistrarVisitaScreen';
import { VisitaDetalheScreen } from '../features/beneficiarios/VisitaDetalheScreen';

const Stack = createNativeStackNavigator<FamiliasStackParamList>();

export function FamiliasStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Lista" component={ListScreen} />
      <Stack.Screen name="Detalhe" component={DetalheScreen} />
      <Stack.Screen name="Novo" component={NovoScreen} />
      <Stack.Screen name="Editar" component={EditarScreen} />
      <Stack.Screen name="RegistrarVisita" component={RegistrarVisitaScreen} />
      <Stack.Screen name="VisitaDetalhe" component={VisitaDetalheScreen} />
    </Stack.Navigator>
  );
}
