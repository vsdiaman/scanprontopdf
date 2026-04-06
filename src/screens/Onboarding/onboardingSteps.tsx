import { ImageSourcePropType } from 'react-native';

export type OnboardingStep = {
  titleKey: string;
  descriptionKey: string;
  image: ImageSourcePropType;
};

export const onboardingSteps: OnboardingStep[] = [
  {
    titleKey: 'onboarding.step1.title',
    descriptionKey: 'onboarding.step1.description',
    image: require('../../assets/images/image1.png'),
  },
  {
    titleKey: 'onboarding.step2.title',
    descriptionKey: 'onboarding.step2.description',
    image: require('../../assets/images/image2.png'),
  },
  {
    titleKey: 'onboarding.step3.title',
    descriptionKey: 'onboarding.step3.description',
    image: require('../../assets/images/image3.png'),
  },
];
