import React from 'react';
import {ClipPath, Defs, G, Path, Rect, Svg} from 'react-native-svg';
import {screenWidth} from '../../dimensions';

export const LogoBoat = ({size}: {size?: number}) => {
  const width = size ?? (screenWidth * 2) / 3;
  return (
    <Svg
      width={width}
      height={width}
      preserveAspectRatio="xMidYMid meet"
      id="screenshot-46bc7661-dafd-11ec-b6c9-e12af9118ad8"
      viewBox="0 0 500 500"
      fill="none">
      <G id="shape-46bc7661-dafd-11ec-b6c9-e12af9118ad8">
        <Defs>
          <ClipPath id="frame-clip-46bc7661-dafd-11ec-b6c9-e12af9118ad8-db81d840-ddbd-11ec-bad1-3b47f50127ed">
            <Rect
              rx="0"
              ry="0"
              x="0"
              y="0"
              width="500"
              height="500"
              fill="rgb(255, 255, 255)"
              fillOpacity={1}
            />
          </ClipPath>
        </Defs>
        <G clipPath="url(#frame-clip-46bc7661-dafd-11ec-b6c9-e12af9118ad8-db81d840-ddbd-11ec-bad1-3b47f50127ed)">
          <G id="fills-46bc7661-dafd-11ec-b6c9-e12af9118ad8">
            <Rect
              width="500"
              height="500"
              x="0"
              transform="matrix(1,0,0,1,0,0)"
              fill="rgb(255, 255, 255)"
              fillOpacity={0}
              ry="0"
              rx="0"
              y="0"
            />
          </G>
          <G>
            <G id="shape-02b063c0-db00-11ec-b6c9-e12af9118ad8">
              <G id="shape-576d2130-db02-11ec-b6c9-e12af9118ad8">
                <G id="shape-4e814b00-dafd-11ec-b6c9-e12af9118ad8">
                  <G id="fills-4e814b00-dafd-11ec-b6c9-e12af9118ad8">
                    <Path
                      // rx="0"
                      // ry="0"
                      d="M253.1563062703326,63.59999999999994L249.97699970419046,328.0666940254772L98.91038775514454,328.0666940254772L253.1563062703326,63.59999999999994Z"
                      fill="rgb(68, 54, 101)"
                      fillOpacity={1}
                    />
                  </G>
                </G>
                <G id="shape-754e3210-dafe-11ec-b6c9-e12af9118ad8">
                  <G id="fills-754e3210-dafe-11ec-b6c9-e12af9118ad8">
                    <Path
                      // rx="0"
                      // ry="0"
                      d="M344.44893814407624,120.15151110441144C344.44893814407624,120.15151110441144,322.59995875285824,107.73283325192972,278.2105663952776,106.40529378169606C260.9381746911996,105.88873384440774,251.95626205158885,117.38536199312819,251.95626205158885,117.38536199312819L252.88788596835752,64.09724102940936L344.44893814407624,120.15151110441144Z"
                      fill="rgb(68, 54, 101)"
                      fillOpacity={1}
                    />
                  </G>
                </G>
              </G>
              <G id="shape-399b2850-db02-11ec-b6c9-e12af9118ad8">
                <G id="shape-90850321-dafd-11ec-b6c9-e12af9118ad8">
                  <G id="fills-90850321-dafd-11ec-b6c9-e12af9118ad8">
                    <Path
                      // rx="0"
                      // ry="0"
                      d="M98.99999999999989,327.99999999999994L388,327.99999999999994L248.36710228222205,447L98.99999999999989,327.99999999999994Z"
                      fill="rgb(205, 89, 105)"
                      fillOpacity={1}
                    />
                  </G>
                </G>
                <G id="shape-1adbf0a0-daff-11ec-b6c9-e12af9118ad8">
                  <G id="fills-1adbf0a0-daff-11ec-b6c9-e12af9118ad8">
                    <Path
                      // rx="0"
                      // ry="0"
                      d="M98.99999999999989,328L388,328L281.3573219539214,419.0000000000001L98.99999999999989,328Z"
                      fill="rgb(170, 73, 95)"
                      fillOpacity={1}
                    />
                  </G>
                </G>
                <G id="shape-a26ca420-dafe-11ec-b6c9-e12af9118ad8">
                  <G id="fills-a26ca420-dafe-11ec-b6c9-e12af9118ad8">
                    <Path
                      // rx="0"
                      // ry="0"
                      d="M98.99999999999989,328.00000000000006L388,328.00000000000006L319.2384608021523,387L98.99999999999989,328.00000000000006Z"
                      fill="rgb(129, 66, 95)"
                      fillOpacity={1}
                    />
                  </G>
                </G>
              </G>
            </G>
          </G>
        </G>
      </G>
    </Svg>
  );
};
