import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { MainTabsParamList } from './types';
import { InicioScreen } from '../features/inicio/InicioScreen';
import { FamiliasStack } from './FamiliasStack';
import { AgendaScreen } from '../features/agenda/AgendaScreen';
import { RelatoriosScreen } from '../features/relatorios/RelatoriosScreen';
import { PerfilScreen } from '../features/perfil/PerfilScreen';
import { AssistentesStack } from './AssistentesStack';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme';

const Tab = createBottomTabNavigator<MainTabsParamList>();

const ICONS: Record<keyof MainTabsParamList, keyof typeof Ionicons.glyphMap> = {
  Inicio: 'home',
  Familias: 'people',
  Agenda: 'calendar',
  Relatorios: 'document-text',
  Assistentes: 'person-add',
  Perfil: 'person',
};

export function MainTabs() {
  const { role } = useAuth();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
        tabBarLabelStyle: { fontSize: 11 },
        tabBarIcon: ({ color, size }) => (
          <Ionicons name={ICONS[route.name as keyof MainTabsParamList]} color={color} size={size} />
        ),
      })}
    >
      <Tab.Screen name="Inicio" component={InicioScreen} options={{ title: 'Início' }} />
      <Tab.Screen name="Familias" component={FamiliasStack} options={{ title: 'Famílias' }} />
      <Tab.Screen name="Agenda" component={AgendaScreen} />
      <Tab.Screen name="Relatorios" component={RelatoriosScreen} options={{ title: 'Relatórios' }} />
      {role === 'admin' && <Tab.Screen name="Assistentes" component={AssistentesStack} />}
      <Tab.Screen name="Perfil" component={PerfilScreen} />
    </Tab.Navigator>
  );
}
