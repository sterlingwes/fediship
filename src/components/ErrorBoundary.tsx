import React from 'react';
import {View} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import {useErrorReporter} from '../api/worker.hooks';
import {StyleCreator} from '../theme';
import {useThemeGetters, useThemeStyle} from '../theme/utils';
import {SolidButton} from './SolidButton';
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
  const {loading, sent, sendErrorReport} = useErrorReporter();
  const styles = useThemeStyle(styleCreator);
  const {getColor} = useThemeGetters();

  return (
    <View style={styles.container}>
      <Type scale="XS" color={getColor('blueAccent')}>
        Whoops
      </Type>
      <Type scale="XL" semiBold>
        Something unexpected happened... 😅
      </Type>
      <Type scale="S" style={styles.secondPara}>
        The following would be useful for the developer in helping him tracking
        down the problem. Please consider sharing! 🙇🏻‍♂️
      </Type>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        {error && (
          <>
            <Type scale="XS" style={styles.errorMessage} semiBold>
              {error.message}
            </Type>
            <Type scale="XS" style={styles.errorStack}>
              {error.stack}
            </Type>
          </>
        )}
      </ScrollView>
      <View style={styles.buttonContainer}>
        <SolidButton
          onPress={() => sendErrorReport(error)}
          disabled={sent || !error}
          loading={loading}>
          {sent ? 'Sent ✅' : 'Send'}
        </SolidButton>
      </View>
    </View>
  );
};

const styleCreator: StyleCreator = ({getColor}) => ({
  container: {
    backgroundColor: getColor('base'),
    flex: 1,
    justifyContent: 'center',
    alignContent: 'center',
    paddingTop: 80,
    paddingBottom: 20,
    paddingHorizontal: 30,
  },
  secondPara: {
    marginVertical: 20,
  },
  scrollViewContent: {
    paddingVertical: 20,
  },
  errorMessage: {
    color: getColor('error'),
    marginBottom: 10,
  },
  errorStack: {
    color: getColor('primary'),
  },
  buttonContainer: {
    paddingVertical: 10,
  },
});
