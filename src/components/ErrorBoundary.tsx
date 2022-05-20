import React from 'react';
import {View} from 'react-native';
import {StyleCreator} from '../theme';
import {useThemeStyle} from '../theme/utils';
import {Type} from './Type';

interface ErrorBoundaryProps {}

export class ErrorBoundary extends React.Component {
  state: {
    hasError: boolean;
    error?: Error;
  };

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {hasError: false};
  }

  static getDerivedStateFromError(error: Error) {
    // Update state so the next render will show the fallback UI.
    return {hasError: true, error};
  }

  componentDidCatch(error: Error, errorInfo: {componentStack: string}) {
    console.log(errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <BlockerError error={this.state.error} />;
    }

    return this.props.children;
  }
}

export const BlockerError = ({error}: {error: Error | undefined}) => {
  const styles = useThemeStyle(styleCreator);
  return (
    <View style={styles.container}>
      <Type>An Error Occurred</Type>
      {error && (
        <>
          <Type>{error.message}</Type>
          <Type>{error.stack}</Type>
        </>
      )}
    </View>
  );
};

const styleCreator: StyleCreator = () => ({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignContent: 'center',
    padding: 30,
  },
});
