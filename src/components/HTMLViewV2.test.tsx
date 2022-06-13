import TestRenderer from 'react-test-renderer';
import {HTMLNodeRenderer, htmlToReactElements, parseHtml} from './HTMLViewV2';
import {Type, TypeProps} from './Type';

jest.mock('react-native-mmkv');

const defaultElements = {
  text: {Component: Type, props: {scale: 'S'} as TypeProps},
};

const spanHideRenderNode: HTMLNodeRenderer = (n, api) => {
  if (n.nodeName !== 'span') {
    return false;
  }

  const classes = api.getClasses(n);
  if (!classes) {
    return false;
  }

  // specific cases we're handling rendering for
  if (classes.includes('invisible')) {
    return null; // filter out invisible elements
  }

  if (classes.includes('ellipsis') && api.hasTextChild(n)) {
    n.childNodes[0].value = n.childNodes[0].value += '...';
    return false;
  }

  // fallback no-op to allow component to control rendering
  return false;
};

describe('HTMLViewV2', () => {
  describe('htmlToReactElements', () => {
    it('should take a HTML node tree and return a react hierarchy', () => {
      const html = '<p>Hello world<br />I am Wes</p>';
      const node = htmlToReactElements({
        elements: defaultElements,
        html,
      });
      if (node == null || typeof node === 'string') {
        throw new Error('expected JSX element return for test case');
      }
      const tree = TestRenderer.create(node);
      expect(tree).toMatchInlineSnapshot(`
        <Text
          scale="S"
          style={
            Array [
              Object {
                "color": "#E6EEF6",
              },
              Object {
                "fontSize": 16,
                "lineHeight": 20.8,
              },
            ]
          }
        >
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
              scale="S"
              style={
                Array [
                  Object {
                    "color": "#E6EEF6",
                  },
                  Object {
                    "fontSize": 16,
                    "lineHeight": 20.8,
                  },
                ]
              }
            >
              <Text
                scale="S"
                style={
                  Array [
                    Object {
                      "color": "#E6EEF6",
                    },
                    Object {
                      "fontSize": 16,
                      "lineHeight": 20.8,
                    },
                  ]
                }
              >
                Hello world
              </Text>
              <View
                style={
                  Array [
                    Object {
                      "paddingVertical": 10,
                    },
                    Object {},
                  ]
                }
              />
              <Text
                scale="S"
                style={
                  Array [
                    Object {
                      "color": "#E6EEF6",
                    },
                    Object {
                      "fontSize": 16,
                      "lineHeight": 20.8,
                    },
                  ]
                }
              >
                I am Wes
              </Text>
            </Text>
          </View>
        </Text>
      `);
    });

    describe('with links with sub-spans', () => {
      const bioWithLinks =
        '<p>From the Netherlands 🇳🇱</p><p>Social media needs to be fun, safe and secure again. Our team and I are working hard to keep that possible here for you♥️</p><p>Don’t forget: questions or any other chitchat are always welcome, we are on a social platform after all!</p><p>I love you all, purrr...</p><p>☮️  In loving memory of Patrick♥️<br><a href="http://jhenrystuhr.tributes.com/obituary/show/Patrick-Lee-Archibald-108506367" rel="nofollow noopener noreferrer" target="_blank"><span class="invisible">http://</span><span class="ellipsis">jhenrystuhr.tributes.com/obitu</span><span class="invisible">ary/show/Patrick-Lee-Archibald-108506367</span></a></p><p>a🕯️for Lorenz, Sascha &amp; Maxim🖤</p><p><a href="https://mstdn.social/tags/fedi22" class="mention hashtag" rel="nofollow noopener noreferrer" target="_blank">#<span>fedi22</span></a> <a href="https://mstdn.social/tags/cats" class="mention hashtag" rel="nofollow noopener noreferrer" target="_blank">#<span>cats</span></a> <a href="https://mstdn.social/tags/mstdn" class="mention hashtag" rel="nofollow noopener noreferrer" target="_blank">#<span>mstdn</span></a> <a href="https://mstdn.social/tags/admin" class="mention hashtag" rel="nofollow noopener noreferrer" target="_blank">#<span>admin</span></a> <a href="https://mstdn.social/tags/tech" class="mention hashtag" rel="nofollow noopener noreferrer" target="_blank">#<span>tech</span></a></p>';

      it('should render the parts of the link that are visible', () => {
        const node = htmlToReactElements({
          elements: {
            ...defaultElements,
            a: {
              Component: Type,
              props: {style: {color: 'blue'}, onPress: () => {}},
            },
          },
          renderNode: spanHideRenderNode,
          html: bioWithLinks,
        });
        if (node == null || typeof node === 'string') {
          throw new Error('expected JSX element return for test case');
        }
        const tree = TestRenderer.create(node);
        expect(tree).toMatchInlineSnapshot(`
          <Text
            scale="S"
            style={
              Array [
                Object {
                  "color": "#E6EEF6",
                },
                Object {
                  "fontSize": 16,
                  "lineHeight": 20.8,
                },
              ]
            }
          >
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
                scale="S"
                style={
                  Array [
                    Object {
                      "color": "#E6EEF6",
                    },
                    Object {
                      "fontSize": 16,
                      "lineHeight": 20.8,
                    },
                  ]
                }
              >
                <Text
                  scale="S"
                  style={
                    Array [
                      Object {
                        "color": "#E6EEF6",
                      },
                      Object {
                        "fontSize": 16,
                        "lineHeight": 20.8,
                      },
                    ]
                  }
                >
                  From the Netherlands 🇳🇱
                </Text>
              </Text>
            </View>
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
                scale="S"
                style={
                  Array [
                    Object {
                      "color": "#E6EEF6",
                    },
                    Object {
                      "fontSize": 16,
                      "lineHeight": 20.8,
                    },
                  ]
                }
              >
                <Text
                  scale="S"
                  style={
                    Array [
                      Object {
                        "color": "#E6EEF6",
                      },
                      Object {
                        "fontSize": 16,
                        "lineHeight": 20.8,
                      },
                    ]
                  }
                >
                  Social media needs to be fun, safe and secure again. Our team and I are working hard to keep that possible here for you♥️
                </Text>
              </Text>
            </View>
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
                scale="S"
                style={
                  Array [
                    Object {
                      "color": "#E6EEF6",
                    },
                    Object {
                      "fontSize": 16,
                      "lineHeight": 20.8,
                    },
                  ]
                }
              >
                <Text
                  scale="S"
                  style={
                    Array [
                      Object {
                        "color": "#E6EEF6",
                      },
                      Object {
                        "fontSize": 16,
                        "lineHeight": 20.8,
                      },
                    ]
                  }
                >
                  Don’t forget: questions or any other chitchat are always welcome, we are on a social platform after all!
                </Text>
              </Text>
            </View>
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
                scale="S"
                style={
                  Array [
                    Object {
                      "color": "#E6EEF6",
                    },
                    Object {
                      "fontSize": 16,
                      "lineHeight": 20.8,
                    },
                  ]
                }
              >
                <Text
                  scale="S"
                  style={
                    Array [
                      Object {
                        "color": "#E6EEF6",
                      },
                      Object {
                        "fontSize": 16,
                        "lineHeight": 20.8,
                      },
                    ]
                  }
                >
                  I love you all, purrr...
                </Text>
              </Text>
            </View>
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
                scale="S"
                style={
                  Array [
                    Object {
                      "color": "#E6EEF6",
                    },
                    Object {
                      "fontSize": 16,
                      "lineHeight": 20.8,
                    },
                  ]
                }
              >
                <Text
                  scale="S"
                  style={
                    Array [
                      Object {
                        "color": "#E6EEF6",
                      },
                      Object {
                        "fontSize": 16,
                        "lineHeight": 20.8,
                      },
                    ]
                  }
                >
                  ☮️  In loving memory of Patrick♥️
                </Text>
                <View
                  style={
                    Array [
                      Object {
                        "paddingVertical": 10,
                      },
                      Object {},
                    ]
                  }
                />
                <Text
                  onPress={[Function]}
                  style={
                    Array [
                      Object {
                        "color": "#E6EEF6",
                      },
                      Object {
                        "fontSize": 20,
                        "lineHeight": 26,
                      },
                      Object {
                        "color": "blue",
                      },
                    ]
                  }
                >
                  <Text
                    scale="S"
                    style={
                      Array [
                        Object {
                          "color": "#E6EEF6",
                        },
                        Object {
                          "fontSize": 16,
                          "lineHeight": 20.8,
                        },
                      ]
                    }
                  >
                    jhenrystuhr.tributes.com/obitu...
                  </Text>
                </Text>
              </Text>
            </View>
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
                scale="S"
                style={
                  Array [
                    Object {
                      "color": "#E6EEF6",
                    },
                    Object {
                      "fontSize": 16,
                      "lineHeight": 20.8,
                    },
                  ]
                }
              >
                <Text
                  scale="S"
                  style={
                    Array [
                      Object {
                        "color": "#E6EEF6",
                      },
                      Object {
                        "fontSize": 16,
                        "lineHeight": 20.8,
                      },
                    ]
                  }
                >
                  a🕯️for Lorenz, Sascha & Maxim🖤
                </Text>
              </Text>
            </View>
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
                scale="S"
                style={
                  Array [
                    Object {
                      "color": "#E6EEF6",
                    },
                    Object {
                      "fontSize": 16,
                      "lineHeight": 20.8,
                    },
                  ]
                }
              >
                <Text
                  onPress={[Function]}
                  style={
                    Array [
                      Object {
                        "color": "#E6EEF6",
                      },
                      Object {
                        "fontSize": 20,
                        "lineHeight": 26,
                      },
                      Object {
                        "color": "blue",
                      },
                    ]
                  }
                >
                  <Text
                    scale="S"
                    style={
                      Array [
                        Object {
                          "color": "#E6EEF6",
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
                    scale="S"
                    style={
                      Array [
                        Object {
                          "color": "#E6EEF6",
                        },
                        Object {
                          "fontSize": 16,
                          "lineHeight": 20.8,
                        },
                      ]
                    }
                  >
                    fedi22
                  </Text>
                </Text>
                <Text
                  scale="S"
                  style={
                    Array [
                      Object {
                        "color": "#E6EEF6",
                      },
                      Object {
                        "fontSize": 16,
                        "lineHeight": 20.8,
                      },
                    ]
                  }
                >
                   
                </Text>
                <Text
                  onPress={[Function]}
                  style={
                    Array [
                      Object {
                        "color": "#E6EEF6",
                      },
                      Object {
                        "fontSize": 20,
                        "lineHeight": 26,
                      },
                      Object {
                        "color": "blue",
                      },
                    ]
                  }
                >
                  <Text
                    scale="S"
                    style={
                      Array [
                        Object {
                          "color": "#E6EEF6",
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
                    scale="S"
                    style={
                      Array [
                        Object {
                          "color": "#E6EEF6",
                        },
                        Object {
                          "fontSize": 16,
                          "lineHeight": 20.8,
                        },
                      ]
                    }
                  >
                    cats
                  </Text>
                </Text>
                <Text
                  scale="S"
                  style={
                    Array [
                      Object {
                        "color": "#E6EEF6",
                      },
                      Object {
                        "fontSize": 16,
                        "lineHeight": 20.8,
                      },
                    ]
                  }
                >
                   
                </Text>
                <Text
                  onPress={[Function]}
                  style={
                    Array [
                      Object {
                        "color": "#E6EEF6",
                      },
                      Object {
                        "fontSize": 20,
                        "lineHeight": 26,
                      },
                      Object {
                        "color": "blue",
                      },
                    ]
                  }
                >
                  <Text
                    scale="S"
                    style={
                      Array [
                        Object {
                          "color": "#E6EEF6",
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
                    scale="S"
                    style={
                      Array [
                        Object {
                          "color": "#E6EEF6",
                        },
                        Object {
                          "fontSize": 16,
                          "lineHeight": 20.8,
                        },
                      ]
                    }
                  >
                    mstdn
                  </Text>
                </Text>
                <Text
                  scale="S"
                  style={
                    Array [
                      Object {
                        "color": "#E6EEF6",
                      },
                      Object {
                        "fontSize": 16,
                        "lineHeight": 20.8,
                      },
                    ]
                  }
                >
                   
                </Text>
                <Text
                  onPress={[Function]}
                  style={
                    Array [
                      Object {
                        "color": "#E6EEF6",
                      },
                      Object {
                        "fontSize": 20,
                        "lineHeight": 26,
                      },
                      Object {
                        "color": "blue",
                      },
                    ]
                  }
                >
                  <Text
                    scale="S"
                    style={
                      Array [
                        Object {
                          "color": "#E6EEF6",
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
                    scale="S"
                    style={
                      Array [
                        Object {
                          "color": "#E6EEF6",
                        },
                        Object {
                          "fontSize": 16,
                          "lineHeight": 20.8,
                        },
                      ]
                    }
                  >
                    admin
                  </Text>
                </Text>
                <Text
                  scale="S"
                  style={
                    Array [
                      Object {
                        "color": "#E6EEF6",
                      },
                      Object {
                        "fontSize": 16,
                        "lineHeight": 20.8,
                      },
                    ]
                  }
                >
                   
                </Text>
                <Text
                  onPress={[Function]}
                  style={
                    Array [
                      Object {
                        "color": "#E6EEF6",
                      },
                      Object {
                        "fontSize": 20,
                        "lineHeight": 26,
                      },
                      Object {
                        "color": "blue",
                      },
                    ]
                  }
                >
                  <Text
                    scale="S"
                    style={
                      Array [
                        Object {
                          "color": "#E6EEF6",
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
                    scale="S"
                    style={
                      Array [
                        Object {
                          "color": "#E6EEF6",
                        },
                        Object {
                          "fontSize": 16,
                          "lineHeight": 20.8,
                        },
                      ]
                    }
                  >
                    tech
                  </Text>
                </Text>
              </Text>
            </View>
          </Text>
        `);
      });
    });
  });

  describe('parseHtml', () => {
    describe('with no html tags', () => {
      it('should not propagate lib error throw', () => {
        const html = 'I am plain text!';
        expect(parseHtml(html)).toEqual(html);
      });
    });

    it('should return the HTML node tree', () => {
      const html =
        '<p>Hello world<br />I am Wes<span class="invisible">man</span></p>';
      const result = parseHtml(html);
      expect(result).toMatchInlineSnapshot(`
        Object {
          "childNodes": Array [
            Object {
              "attrs": Array [],
              "childNodes": Array [
                Object {
                  "attrs": Array [],
                  "childNodes": Array [],
                  "namespaceURI": "http://www.w3.org/1999/xhtml",
                  "nodeName": "head",
                  "parentNode": [Circular],
                  "tagName": "head",
                },
                Object {
                  "attrs": Array [],
                  "childNodes": Array [
                    Object {
                      "attrs": Array [],
                      "childNodes": Array [
                        Object {
                          "nodeName": "#text",
                          "parentNode": [Circular],
                          "value": "Hello world",
                        },
                        Object {
                          "attrs": Array [],
                          "childNodes": Array [],
                          "namespaceURI": "http://www.w3.org/1999/xhtml",
                          "nodeName": "br",
                          "parentNode": [Circular],
                          "tagName": "br",
                        },
                        Object {
                          "nodeName": "#text",
                          "parentNode": [Circular],
                          "value": "I am Wes",
                        },
                        Object {
                          "attrs": Array [
                            Object {
                              "name": "class",
                              "value": "invisible",
                            },
                          ],
                          "childNodes": Array [
                            Object {
                              "nodeName": "#text",
                              "parentNode": [Circular],
                              "value": "man",
                            },
                          ],
                          "namespaceURI": "http://www.w3.org/1999/xhtml",
                          "nodeName": "span",
                          "parentNode": [Circular],
                          "tagName": "span",
                        },
                      ],
                      "namespaceURI": "http://www.w3.org/1999/xhtml",
                      "nodeName": "p",
                      "parentNode": [Circular],
                      "tagName": "p",
                    },
                  ],
                  "namespaceURI": "http://www.w3.org/1999/xhtml",
                  "nodeName": "body",
                  "parentNode": [Circular],
                  "tagName": "body",
                },
              ],
              "namespaceURI": "http://www.w3.org/1999/xhtml",
              "nodeName": "html",
              "parentNode": [Circular],
              "tagName": "html",
            },
          ],
          "mode": "quirks",
          "nodeName": "#document",
        }
      `);
    });
  });
});
