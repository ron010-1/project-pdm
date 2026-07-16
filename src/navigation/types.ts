export type FamiliasStackParamList = {
  Lista: undefined;
  Detalhe: { beneficiarioId: string };
  Novo: undefined;
  Editar: { beneficiarioId: string };
  RegistrarVisita: { beneficiarioId?: string };
  VisitaDetalhe: { visitaId: string };
};

export type MainTabsParamList = {
  Inicio: undefined;
  Familias: undefined;
  Agenda: undefined;
  Relatorios: undefined;
  Perfil: undefined;
};

// React Navigation's typing for cross-tab navigation into a nested stack screen
// requires composing navigator types end-to-end; given only Inicio/Agenda need to
// jump into the Familias stack, a small typed helper is simpler than wiring that up.
export function navigateToFamilias<Screen extends keyof FamiliasStackParamList>(
  navigation: { navigate: (...args: never[]) => void },
  screen: Screen,
  params?: FamiliasStackParamList[Screen]
) {
  (navigation.navigate as (name: string, params: object) => void)('Familias', { screen, params });
}
