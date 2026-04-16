declare module 'react-native-store-review' {
  const StoreReview: {
    isAvailableAsync: () => Promise<boolean>;
    requestReview: () => Promise<void>;
  };

  export default StoreReview;
}
