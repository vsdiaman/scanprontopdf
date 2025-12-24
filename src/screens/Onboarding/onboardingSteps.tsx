import { ImageSourcePropType } from 'react-native';

export type OnboardingStep = {
  title: string;
  description: string;
  image: ImageSourcePropType;
};

export const onboardingSteps: OnboardingStep[] = [
  {
    title: 'Escaneie sem complicação, documentos em segundos',
    description:
      'Aponte a câmera e gere seu PDF em segundos. Recorte automático e qualidade nítida.',
    image: require('../../assets/images/image1.png'),
  },
  {
    title: 'Organize seus documentos facilmente',
    description:
      'Renomeie seus scans e encontre tudo rápido. Sem bagunça. Tudo ao seu alcance.',
    image: require('../../assets/images/image2.png'),
  },
  {
    title: 'Mais produtividade no dia a dia',
    description:
      'Escaneie, renomeie e compartilhe rápido. Menos tempo com papel, mais foco no que importa.',
    image: require('../../assets/images/image3.png'),
  },
];
