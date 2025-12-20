export type OnboardingStep = {
  title: string;
  description: string;
};

export const onboardingSteps: OnboardingStep[] = [
  {
    title: 'Escaneie sem complicação',
    description: 'Abra a câmera, enquadre e gere o scan. Fluxo curto.',
  },
  {
    title: 'Escolha PDF ou JPEG',
    description: 'Você decide o formato. Depois salva e compartilha.',
  },
  {
    title: 'Feito pra ser rápido',
    description: 'Interface leve, foco total em desempenho e usabilidade.',
  },
];
