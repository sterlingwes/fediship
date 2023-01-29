import React from 'react';
import TestRenderer from 'react-test-renderer';
import {RichText} from './RichText';

jest.mock('react-native-mmkv');

describe('RichText', () => {
  describe('base case', () => {
    it('should render a react tree with emoji support (Image elements)', () => {
      const html =
        '<p>:nkoWave: Hello and a good meowing everyone! Enjoy your day and stay safe! ❤️ :cat_hug_triangle:</p>';
      const tree = TestRenderer.create(
        <RichText
          {...{
            html,
            emojis: [
              {
                shortcode: 'nkoWave',
                static_url: 'https://some.static.url',
                url: 'https://some.url',
                visible_in_picker: false,
              },
            ],
          }}
        />,
      );
      expect(tree).toMatchInlineSnapshot(`
        <View
          style={
            Array [
              Object {
                "paddingBottom": 10,
              },
              Object {},
            ]
          }
        >
          <Text
            color="#E6EEF6"
            scale="S"
            style={
              Array [
                Object {
                  "fontFamily": "Nunito-Regular",
                },
                Object {
                  "color": "#E6EEF6",
                },
                Object {
                  "fontSize": 16,
                  "lineHeight": 20.8,
                },
                Object {
                  "color": "#E6EEF6",
                },
              ]
            }
          >
            <Image
              source={
                Object {
                  "height": 18,
                  "uri": "https://some.url",
                  "width": 18,
                }
              }
              style={
                Object {
                  "height": 18,
                  "width": 18,
                }
              }
            />
            <Text
              color="#E6EEF6"
              scale="S"
              style={
                Array [
                  Object {
                    "fontFamily": "Nunito-Regular",
                  },
                  Object {
                    "color": "#E6EEF6",
                  },
                  Object {
                    "fontSize": 16,
                    "lineHeight": 20.8,
                  },
                  Object {
                    "color": "#E6EEF6",
                  },
                ]
              }
            >
               Hello and a good meowing everyone! Enjoy your day and stay safe! ❤️ :cat_hug_triangle:
            </Text>
          </Text>
        </View>
      `);
    });
  });

  describe('two paragraphs', () => {
    it('should render them as two roots of a 2-item array', () => {
      const html =
        '<p>„Ich sehe, wie die Welt allmählich in eine Wildnis verwandelt wird. Ich höre den nahenden<br>Donner, der auch uns vernichten wird. Ich kann das Leiden von Millionen spüren. Und<br>dennoch glaube ich, wenn ich zum Himmel blicke, dass alles in Ordnung gehen und auch<br>diese Grausamkeit ein Ende finden wird. Dass wieder Ruhe und Frieden einkehren werden.“</p><p><a href="https://social.tchncs.de/tags/NeverForget" class="mention hashtag" rel="nofollow noopener noreferrer" target="_blank">#<span>NeverForget</span></a> <a href="https://social.tchncs.de/tags/AnneFrank" class="mention hashtag" rel="nofollow noopener noreferrer" target="_blank">#<span>AnneFrank</span></a>, <br>Heute vor 80 Jahren begann sie ihr Tagebuch, zu ihrem 13. Geburtstag geschenkt bekam.</p>';
      const tree = TestRenderer.create(
        <RichText
          {...{
            html,
            emojis: [],
          }}
        />,
      );
      expect(tree).toMatchInlineSnapshot(`
        Array [
          <View
            style={
              Array [
                Object {
                  "paddingBottom": 10,
                },
                Object {},
              ]
            }
          >
            <Text
              color="#E6EEF6"
              scale="S"
              style={
                Array [
                  Object {
                    "fontFamily": "Nunito-Regular",
                  },
                  Object {
                    "color": "#E6EEF6",
                  },
                  Object {
                    "fontSize": 16,
                    "lineHeight": 20.8,
                  },
                  Object {
                    "color": "#E6EEF6",
                  },
                ]
              }
            >
              <Text
                color="#E6EEF6"
                scale="S"
                style={
                  Array [
                    Object {
                      "fontFamily": "Nunito-Regular",
                    },
                    Object {
                      "color": "#E6EEF6",
                    },
                    Object {
                      "fontSize": 16,
                      "lineHeight": 20.8,
                    },
                    Object {
                      "color": "#E6EEF6",
                    },
                  ]
                }
              >
                „Ich sehe, wie die Welt allmählich in eine Wildnis verwandelt wird. Ich höre den nahenden
              </Text>
            </Text>
          </View>,
          <View
            style={
              Array [
                Object {
                  "paddingBottom": 10,
                },
                Object {},
              ]
            }
          >
            <Text
              color="#E6EEF6"
              scale="S"
              style={
                Array [
                  Object {
                    "fontFamily": "Nunito-Regular",
                  },
                  Object {
                    "color": "#E6EEF6",
                  },
                  Object {
                    "fontSize": 16,
                    "lineHeight": 20.8,
                  },
                  Object {
                    "color": "#E6EEF6",
                  },
                ]
              }
            >
              <Text
                color="#E6EEF6"
                scale="S"
                style={
                  Array [
                    Object {
                      "fontFamily": "Nunito-Regular",
                    },
                    Object {
                      "color": "#E6EEF6",
                    },
                    Object {
                      "fontSize": 16,
                      "lineHeight": 20.8,
                    },
                    Object {
                      "color": "#E6EEF6",
                    },
                  ]
                }
              >
                Donner, der auch uns vernichten wird. Ich kann das Leiden von Millionen spüren. Und
              </Text>
            </Text>
          </View>,
          <View
            style={
              Array [
                Object {
                  "paddingBottom": 10,
                },
                Object {},
              ]
            }
          >
            <Text
              color="#E6EEF6"
              scale="S"
              style={
                Array [
                  Object {
                    "fontFamily": "Nunito-Regular",
                  },
                  Object {
                    "color": "#E6EEF6",
                  },
                  Object {
                    "fontSize": 16,
                    "lineHeight": 20.8,
                  },
                  Object {
                    "color": "#E6EEF6",
                  },
                ]
              }
            >
              <Text
                color="#E6EEF6"
                scale="S"
                style={
                  Array [
                    Object {
                      "fontFamily": "Nunito-Regular",
                    },
                    Object {
                      "color": "#E6EEF6",
                    },
                    Object {
                      "fontSize": 16,
                      "lineHeight": 20.8,
                    },
                    Object {
                      "color": "#E6EEF6",
                    },
                  ]
                }
              >
                dennoch glaube ich, wenn ich zum Himmel blicke, dass alles in Ordnung gehen und auch
              </Text>
            </Text>
          </View>,
          <View
            style={
              Array [
                Object {
                  "paddingBottom": 10,
                },
                Object {},
              ]
            }
          >
            <Text
              color="#E6EEF6"
              scale="S"
              style={
                Array [
                  Object {
                    "fontFamily": "Nunito-Regular",
                  },
                  Object {
                    "color": "#E6EEF6",
                  },
                  Object {
                    "fontSize": 16,
                    "lineHeight": 20.8,
                  },
                  Object {
                    "color": "#E6EEF6",
                  },
                ]
              }
            >
              <Text
                color="#E6EEF6"
                scale="S"
                style={
                  Array [
                    Object {
                      "fontFamily": "Nunito-Regular",
                    },
                    Object {
                      "color": "#E6EEF6",
                    },
                    Object {
                      "fontSize": 16,
                      "lineHeight": 20.8,
                    },
                    Object {
                      "color": "#E6EEF6",
                    },
                  ]
                }
              >
                diese Grausamkeit ein Ende finden wird. Dass wieder Ruhe und Frieden einkehren werden.“
              </Text>
            </Text>
          </View>,
          <View
            style={
              Array [
                Object {
                  "paddingBottom": 10,
                },
                Object {},
              ]
            }
          >
            <Text
              color="#E6EEF6"
              scale="S"
              style={
                Array [
                  Object {
                    "fontFamily": "Nunito-Regular",
                  },
                  Object {
                    "color": "#E6EEF6",
                  },
                  Object {
                    "fontSize": 16,
                    "lineHeight": 20.8,
                  },
                  Object {
                    "color": "#E6EEF6",
                  },
                ]
              }
            >
              <Text
                color="#9baec8"
                hitSlop={
                  Object {
                    "bottom": 20,
                    "top": 20,
                  }
                }
                medium={true}
                onPress={[Function]}
                scale="S"
                style={
                  Array [
                    Object {
                      "fontFamily": "Nunito-Regular",
                    },
                    Object {
                      "color": "#E6EEF6",
                    },
                    Object {
                      "fontFamily": "Nunito-Medium",
                    },
                    Object {
                      "fontSize": 16,
                      "lineHeight": 20.8,
                    },
                    Object {
                      "color": "#9baec8",
                    },
                  ]
                }
              >
                <Text
                  color={null}
                  scale="S"
                  style={
                    Array [
                      Object {
                        "fontFamily": "Nunito-Regular",
                      },
                      Object {
                        "fontSize": 16,
                        "lineHeight": 20.8,
                      },
                    ]
                  }
                >
                  #
                </Text>
                <Text
                  color={null}
                  scale="S"
                  style={
                    Array [
                      Object {
                        "fontFamily": "Nunito-Regular",
                      },
                      Object {
                        "fontSize": 16,
                        "lineHeight": 20.8,
                      },
                    ]
                  }
                >
                  NeverForget
                </Text>
              </Text>
              <Text
                color="#E6EEF6"
                scale="S"
                style={
                  Array [
                    Object {
                      "fontFamily": "Nunito-Regular",
                    },
                    Object {
                      "color": "#E6EEF6",
                    },
                    Object {
                      "fontSize": 16,
                      "lineHeight": 20.8,
                    },
                    Object {
                      "color": "#E6EEF6",
                    },
                  ]
                }
              >
                 
              </Text>
              <Text
                color="#9baec8"
                hitSlop={
                  Object {
                    "bottom": 20,
                    "top": 20,
                  }
                }
                medium={true}
                onPress={[Function]}
                scale="S"
                style={
                  Array [
                    Object {
                      "fontFamily": "Nunito-Regular",
                    },
                    Object {
                      "color": "#E6EEF6",
                    },
                    Object {
                      "fontFamily": "Nunito-Medium",
                    },
                    Object {
                      "fontSize": 16,
                      "lineHeight": 20.8,
                    },
                    Object {
                      "color": "#9baec8",
                    },
                  ]
                }
              >
                <Text
                  color={null}
                  scale="S"
                  style={
                    Array [
                      Object {
                        "fontFamily": "Nunito-Regular",
                      },
                      Object {
                        "fontSize": 16,
                        "lineHeight": 20.8,
                      },
                    ]
                  }
                >
                  #
                </Text>
                <Text
                  color={null}
                  scale="S"
                  style={
                    Array [
                      Object {
                        "fontFamily": "Nunito-Regular",
                      },
                      Object {
                        "fontSize": 16,
                        "lineHeight": 20.8,
                      },
                    ]
                  }
                >
                  AnneFrank
                </Text>
              </Text>
              <Text
                color="#E6EEF6"
                scale="S"
                style={
                  Array [
                    Object {
                      "fontFamily": "Nunito-Regular",
                    },
                    Object {
                      "color": "#E6EEF6",
                    },
                    Object {
                      "fontSize": 16,
                      "lineHeight": 20.8,
                    },
                    Object {
                      "color": "#E6EEF6",
                    },
                  ]
                }
              >
                , 
              </Text>
            </Text>
          </View>,
          <View
            style={
              Array [
                Object {
                  "paddingBottom": 10,
                },
                Object {},
              ]
            }
          >
            <Text
              color="#E6EEF6"
              scale="S"
              style={
                Array [
                  Object {
                    "fontFamily": "Nunito-Regular",
                  },
                  Object {
                    "color": "#E6EEF6",
                  },
                  Object {
                    "fontSize": 16,
                    "lineHeight": 20.8,
                  },
                  Object {
                    "color": "#E6EEF6",
                  },
                ]
              }
            >
              <Text
                color="#E6EEF6"
                scale="S"
                style={
                  Array [
                    Object {
                      "fontFamily": "Nunito-Regular",
                    },
                    Object {
                      "color": "#E6EEF6",
                    },
                    Object {
                      "fontSize": 16,
                      "lineHeight": 20.8,
                    },
                    Object {
                      "color": "#E6EEF6",
                    },
                  ]
                }
              >
                Heute vor 80 Jahren begann sie ihr Tagebuch, zu ihrem 13. Geburtstag geschenkt bekam.
              </Text>
            </Text>
          </View>,
        ]
      `);
    });
  });
});
