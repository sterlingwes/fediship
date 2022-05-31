import React, {useEffect} from 'react';
import {useCallback, useState} from 'react';
import {Image, ImageProps} from 'react-native';

interface Props extends ImageProps {
  fallbackUri: string;
}

export const RedundantImage = (props: Props) => {
  const [source, setSource] = useState(props.source);

  useEffect(() => {
    if (source !== props.source) {
      setSource(props.source);
    }
  }, [props.source, setSource, source]);

  const onError = useCallback(() => {
    setSource({uri: props.fallbackUri});
  }, [setSource, props.fallbackUri]);

  return <Image {...props} source={source} onError={onError} />;
};
