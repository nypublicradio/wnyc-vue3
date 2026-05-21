import Aura from "@primevue/themes/aura"
// link to Aura tokens to reference
//https://github.com/primefaces/primeuix/blob/main/packages/themes/src/presets/aura/

import { definePreset } from "@primevue/themes"

const MyPreset = definePreset(Aura, {
  primitive: {
    borderRadius: {
      none: "0",
      xs: "2px",
      sm: "4px",
      md: "6px",
      lg: "8px",
      xl: "10px",
    },
    emerald: {
      50: "#ecfdf5",
      100: "#d1fae5",
      200: "#a7f3d0",
      300: "#6ee7b7",
      400: "#34d399",
      500: "#10b981",
      600: "#059669",
      700: "#047857",
      800: "#065f46",
      900: "#064e3b",
      950: "#022c22",
    },
    green: {
      50: "#f7fbf7",
      100: "#d8eed8",
      200: "#b9e0b9",
      300: "#9ad39a",
      400: "#7bc57b",
      500: "#5cb85c",
      600: "#4e9c4e",
      700: "#408140",
      800: "#336533",
      900: "#254a25",
      950: "#172e17"
    },
    lime: {
      50: "#f7fee7",
      100: "#ecfccb",
      200: "#d9f99d",
      300: "#bef264",
      400: "#a3e635",
      500: "#84cc16",
      600: "#65a30d",
      700: "#4d7c0f",
      800: "#3f6212",
      900: "#365314",
      950: "#1a2e05",
    },
    red: {
      50: "#fdf4f5",
      100: "#f7c9d0",
      200: "#f19eac",
      300: "#eb7487",
      400: "#e43a56",
      500: "#de1e3d",
      600: "#bd1a34",
      700: "#9b152b",
      800: "#7a1122",
      900: "#590c18",
      950: "#38080f",
    },
    orange: {
      50: "#fff7ed",
      100: "#ffedd5",
      200: "#fed7aa",
      300: "#fdba74",
      400: "#fb923c",
      500: "#f97316",
      600: "#ea580c",
      700: "#c2410c",
      800: "#9a3412",
      900: "#7c2d12",
      950: "#431407",
    },
    amber: {
      50: "#fffbeb",
      100: "#fef3c7",
      200: "#fde68a",
      300: "#fcd34d",
      400: "#fbbf24",
      500: "#f59e0b",
      600: "#d97706",
      700: "#b45309",
      800: "#92400e",
      900: "#78350f",
      950: "#451a03",
    },
    yellow: {
      50: "#fffdf5",
      100: "#fef4d1",
      200: "#feecad",
      300: "#fde389",
      400: "#fddb64",
      500: "#fcd240",
      600: "#d6b336",
      700: "#b0932d",
      800: "#8b7423",
      900: "#65541a",
      950: "#3f3510",
    },
    teal: {
      50: "#f0fdfa",
      100: "#ccfbf1",
      200: "#99f6e4",
      300: "#5eead4",
      400: "#2dd4bf",
      500: "#14b8a6",
      600: "#0d9488",
      700: "#0f766e",
      800: "#115e59",
      900: "#134e4a",
      950: "#042f2e",
    },
    cyan: {
      50: "#ecfeff",
      100: "#cffafe",
      200: "#a5f3fc",
      300: "#67e8f9",
      400: "#22d3ee",
      500: "#06b6d4",
      600: "#0891b2",
      700: "#0e7490",
      800: "#155e75",
      900: "#164e63",
      950: "#083344",
    },
    sky: {
      50: "#E8F1FF",
      100: "#D1E4FF",
      200: "#9DCAFE",
      300: "#56B1FE",
      400: "#1095E2",
      500: "#0B7BBC",
      600: "#076095",
      700: "#044A74",
      800: "#023352",
      900: "#011D32",
      950: "#001221"
    },
    blue: {
      50: "#f4f6f8",
      100: "#cad3dd",
      200: "#a1b0c3",
      300: "#778ea8",
      400: "#4e6b8e",
      500: "#244873",
      600: "#1f3d62",
      700: "#193251",
      800: "#14283f",
      900: "#0e1d2e",
      950: "#09121d",
    },
    darkblue: {
      50: "#f4f4f5",
      100: "#c8cad0",
      200: "#9da0ab",
      300: "#727686",
      400: "#464c61",
      500: "#1b223c",
      600: "#171d33",
      700: "#13182a",
      800: "#0f1321",
      900: "#0b0e18",
      950: "#07090f",
    },
    indigo: {
      50: "#f2f5f8",
      100: "#c2cfdf",
      200: "#92a9c5",
      300: "#6284ab",
      400: "#315e92",
      500: "#013878",
      600: "#013066",
      700: "#012754",
      800: "#011f42",
      900: "#001630",
      950: "#000e1e",
    },
    violet: {
      50: "#f5f3ff",
      100: "#ede9fe",
      200: "#ddd6fe",
      300: "#c4b5fd",
      400: "#a78bfa",
      500: "#8b5cf6",
      600: "#7c3aed",
      700: "#6d28d9",
      800: "#5b21b6",
      900: "#4c1d95",
      950: "#2e1065",
    },
    purple: {
      50: "#faf5ff",
      100: "#f3e8ff",
      200: "#e9d5ff",
      300: "#d8b4fe",
      400: "#c084fc",
      500: "#a855f7",
      600: "#9333ea",
      700: "#7e22ce",
      800: "#6b21a8",
      900: "#581c87",
      950: "#3b0764",
    },
    fuchsia: {
      50: "#fdf4ff",
      100: "#fae8ff",
      200: "#f5d0fe",
      300: "#f0abfc",
      400: "#e879f9",
      500: "#d946ef",
      600: "#c026d3",
      700: "#a21caf",
      800: "#86198f",
      900: "#701a75",
      950: "#4a044e",
    },
    pink: {
      50: "#fdf2f8",
      100: "#fce7f3",
      200: "#fbcfe8",
      300: "#f9a8d4",
      400: "#f472b6",
      500: "#ec4899",
      600: "#db2777",
      700: "#be185d",
      800: "#9d174d",
      900: "#831843",
      950: "#500724",
    },
    rose: {
      50: "#fff1f2",
      100: "#ffe4e6",
      200: "#fecdd3",
      300: "#fda4af",
      400: "#fb7185",
      500: "#f43f5e",
      600: "#e11d48",
      700: "#be123c",
      800: "#9f1239",
      900: "#881337",
      950: "#4c0519",
    },
    slate: {
      50: "#f5f5f6",
      100: "#cecfd5",
      200: "#a7a9b3",
      300: "#808492",
      400: "#595e70",
      500: "#32384f",
      600: "#2b3043",
      700: "#232737",
      800: "#1c1f2b",
      900: "#141620",
      950: "#0d0e14",
    },
    gray: {
      50: "#f9fafb",
      100: "#f3f4f6",
      200: "#e5e7eb",
      300: "#d1d5db",
      400: "#9ca3af",
      500: "#6b7280",
      600: "#4b5563",
      700: "#374151",
      800: "#1f2937",
      900: "#111827",
      950: "#030712",
    },
    zinc: {
      50: "#fafafa",
      100: "#f4f4f5",
      200: "#e4e4e7",
      300: "#d4d4d8",
      400: "#a1a1aa",
      500: "#71717a",
      600: "#52525b",
      700: "#3f3f46",
      800: "#27272a",
      900: "#18181b",
      950: "#09090b",
    },
    neutral: {
      50: "#fafafa",
      100: "#f5f5f5",
      200: "#e5e5e5",
      300: "#d4d4d4",
      400: "#a3a3a3",
      500: "#737373",
      600: "#525252",
      700: "#404040",
      800: "#262626",
      900: "#171717",
      950: "#0a0a0a",
    },
    stone: {
      50: "#fafaf9",
      100: "#f5f5f4",
      200: "#e7e5e4",
      300: "#d6d3d1",
      400: "#a8a29e",
      500: "#78716c",
      600: "#57534e",
      700: "#44403c",
      800: "#292524",
      900: "#1c1917",
      950: "#0c0a09",
    },
    link: {
      50: "#f4f8fa",
      100: "#ccdce7",
      200: "#a4c1d3",
      300: "#7ca6c0",
      400: "#538aac",
      500: "#2b6f99",
      600: "#255e82",
      700: "#1e4e6b",
      800: "#183d54",
      900: "#112c3d",
      950: "#0b1c26",
    },
  },
  semantic: {
    transitionDuration: "0.25s",
    focusRing: {
      width: "2px",
      style: "solid",
      color: "#015fcc",
      offset: "4px",
      shadow: "none",
    },
    disabledOpacity: "0.6",
    iconSize: "1rem",
    anchorGutter: "2px",
    primary: {
      50: "{red.50}",
      100: "{red.100}",
      200: "{red.200}",
      300: "{red.300}",
      400: "{red.400}",
      500: "{red.500}",
      600: "{red.600}",
      700: "{red.700}",
      800: "{red.800}",
      900: "{red.900}",
      950: "{red.950}",
    },
    formField: {
      paddingX: "0.75rem",
      paddingY: "0.75rem",
      sm: {
        fontSize: "0.875rem",
        paddingX: "0.625rem",
        paddingY: "0.375rem",
      },
      lg: {
        fontSize: "1.125rem",
        paddingX: "0.875rem",
        paddingY: "0.625rem",
      },
      borderRadius: "{border.radius.lg}",
      focusRing: {
        width: "0",
        style: "none",
        color: "transparent",
        offset: "0",
        shadow: "none",
      },
      transitionDuration: "{transition.duration}",
    },
    list: {
      padding: "0.25rem 0.25rem",
      gap: "2px",
      header: {
        padding: "0.5rem 1rem 0.25rem 1rem",
      },
      option: {
        padding: "0.5rem 0.75rem",
        borderRadius: "{border.radius.sm}",
      },
      optionGroup: {
        padding: "0.5rem 0.75rem",
        fontWeight: "600",
      },
    },
    content: {
      borderRadius: "{border.radius.md}",
    },
    mask: {
      transitionDuration: "{transition.duration}",
    },
    navigation: {
      list: {
        padding: "0.25rem 0.25rem",
        gap: "2px",
      },
      item: {
        padding: "0.5rem 0.75rem",
        borderRadius: "{border.radius.sm}",
        gap: "0.5rem",
      },
      submenuLabel: {
        padding: "0.5rem 0.75rem",
        fontWeight: "600",
      },
      submenuIcon: {
        size: "0.875rem",
      },
    },
    overlay: {
      select: {
        borderRadius: "{border.radius.md}",
        shadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)",
      },
      popover: {
        borderRadius: "{border.radius.md}",
        padding: "0.75rem",
        shadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)",
      },
      modal: {
        borderRadius: "{border.radius.xl}",
        padding: "1.25rem",
        shadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
      },
      navigation: {
        shadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)",
      },
    },
    colorScheme: {
      light: {
        surface: {
          0: "#ffffff",
          25: "#f5f5f5",
          50: "#eaeaea",
          100: "#d2d2d2",
          200: "#afafaf",
          300: "#8b8b8b",
          400: "#686868",
          500: "#444444",
          600: "#3a3a3a",
          700: "#303030",
          800: "#252525",
          900: "#1b1b1b",
          950: "#101012",
        },
        primary: {
          color: "{primary.500}",
          contrastColor: "#ffffff",
          hoverColor: "{primary.600}",
          activeColor: "{primary.700}",
        },
        highlight: {
          background: "{primary.50}",
          focusBackground: "{primary.100}",
          color: "{primary.700}",
          focusColor: "{primary.800}",
        },
        mask: {
          background: "rgba(0,0,0,0.6)",
          color: "{surface.200}",
        },
        formField: {
          background: "{surface.0}",
          disabledBackground: "{surface.200}",
          filledBackground: "{surface.50}",
          filledHoverBackground: "{surface.50}",
          filledFocusBackground: "{surface.50}",
          borderColor: "{surface.50}",
          hoverBorderColor: "{surface.200}",
          focusBorderColor: "{surface.950}",
          invalidBorderColor: "{red.400}",
          color: "{surface.700}",
          disabledColor: "{surface.300}",
          placeholderColor: "{surface.300}",
          invalidPlaceholderColor: "{red.600}",
          floatLabelColor: "{surface.500}",
          floatLabelFocusColor: "{primary.600}",
          floatLabelActiveColor: "{surface.500}",
          floatLabelInvalidColor: "{form.field.invalid.placeholder.color}",
          iconColor: "{surface.400}",
          shadow: "0 0 #0000, 0 0 #0000, 0 1px 2px 0 rgba(18, 18, 23, 0.05)",
        },
        text: {
          color: "{surface.950}",
          hoverColor: "{surface.800}",
          mutedColor: "{surface.500}",
          hoverMutedColor: "{surface.600}",
        },
        content: {
          background: "{surface.25}",
          hoverBackground: "{surface.100}",
          borderColor: "{surface.200}",
          color: "{text.color}",
          hoverColor: "{text.hover.color}",
        },
        overlay: {
          select: {
            background: "{surface.25}",
            borderColor: "{surface.200}",
            color: "{text.color}",
          },
          popover: {
            background: "{surface.25}",
            borderColor: "{surface.200}",
            color: "{text.color}",
          },
          modal: {
            background: "{surface.25}",
            borderColor: "{surface.200}",
            color: "{text.color}",
          },
        },
        list: {
          option: {
            focusBackground: "{surface.100}",
            selectedBackground: "{highlight.background}",
            selectedFocusBackground: "{highlight.focus.background}",
            color: "{text.color}",
            focusColor: "{text.hover.color}",
            selectedColor: "{highlight.color}",
            selectedFocusColor: "{highlight.focus.color}",
            icon: {
              color: "{surface.400}",
              focusColor: "{surface.500}",
            },
          },
          optionGroup: {
            background: "transparent",
            color: "{text.muted.color}",
          },
        },
        navigation: {
          item: {
            focusBackground: "{surface.100}",
            activeBackground: "{surface.100}",
            color: "{text.color}",
            focusColor: "{text.hover.color}",
            activeColor: "{text.hover.color}",
            icon: {
              color: "{surface.400}",
              focusColor: "{surface.500}",
              activeColor: "{surface.500}",
            },
          },
          submenuLabel: {
            background: "transparent",
            color: "{text.muted.color}",
          },
          submenuIcon: {
            color: "{surface.400}",
            focusColor: "{surface.500}",
            activeColor: "{surface.500}",
          },
        },
      },
      dark: {
        surface: {
          0: "#ffffff",
          25: "#1b223c",
          50: "#fafafa",
          100: "#f4f4f5",
          200: "#e4e4e7",
          300: "#d4d4d8",
          400: "#a1a1aa",
          500: "#71717a",
          600: "#52525b",
          700: "#3f3f46",
          800: "#27272a",
          900: "#18181b",
          950: "#101012",
        },
        primary: {
          color: "{primary.400}",
          contrastColor: "{surface.900}",
          hoverColor: "{primary.300}",
          activeColor: "{primary.200}",
        },
        highlight: {
          background: "color-mix(in srgb, {primary.400}, transparent 84%)",
          focusBackground: "color-mix(in srgb, {primary.400}, transparent 76%)",
          color: "rgba(255,255,255,.87)",
          focusColor: "rgba(255,255,255,.87)",
        },
        mask: {
          background: "rgba(11,14,25,0.7)",
          color: "{surface.200}",
        },
        formField: {
          background: "{slate.500}",
          disabledBackground: "{slate.700}",
          filledBackground: "{slate.800}",
          filledHoverBackground: "{slate.800}",
          filledFocusBackground: "{slate.800}",
          borderColor: "{slate.600}",
          hoverBorderColor: "{slate.400}",
          focusBorderColor: "{slate.100}",
          invalidBorderColor: "{red.300}",
          color: "{surface.0}",
          disabledColor: "{surface.400}",
          placeholderColor: "{surface.400}",
          invalidPlaceholderColor: "{red.400}",
          floatLabelColor: "{surface.400}",
          floatLabelFocusColor: "{primary.color}",
          floatLabelActiveColor: "{surface.400}",
          floatLabelInvalidColor: "{form.field.invalid.placeholder.color}",
          iconColor: "{surface.400}",
          shadow: "0 0 #0000, 0 0 #0000, 0 1px 2px 0 rgba(18, 18, 23, 0.05)",
        },
        text: {
          color: "{surface.0}",
          hoverColor: "{surface.0}",
          mutedColor: "{surface.400}",
          hoverMutedColor: "{surface.300}",
        },
        content: {
          background: "#ffffff1A",
          hoverBackground: "#ffffff4D",
          borderColor: "{surface.700}",
          color: "{text.color}",
          hoverColor: "{text.hover.color}",
        },
        overlay: {
          select: {
            background: "{surface.25}",
            borderColor: "{surface.200}",
            color: "{text.color}",
          },
          popover: {
            background: "{surface.25}",
            borderColor: "{surface.200}",
            color: "{text.color}",
          },
          modal: {
            background: "{surface.25}",
            borderColor: "{surface.200}",
            color: "{text.color}",
          },
        },
        list: {
          option: {
            focusBackground: "{surface.800}",
            selectedBackground: "{highlight.background}",
            selectedFocusBackground: "{highlight.focus.background}",
            color: "{text.color}",
            focusColor: "{text.hover.color}",
            selectedColor: "{highlight.color}",
            selectedFocusColor: "{highlight.focus.color}",
            icon: {
              color: "{surface.500}",
              focusColor: "{surface.400}",
            },
          },
          optionGroup: {
            background: "transparent",
            color: "{text.muted.color}",
          },
        },
        navigation: {
          item: {
            focusBackground: "{surface.800}",
            activeBackground: "{surface.800}",
            color: "{text.color}",
            focusColor: "{text.hover.color}",
            activeColor: "{text.hover.color}",
            icon: {
              color: "{surface.500}",
              focusColor: "{surface.400}",
              activeColor: "{surface.400}",
            },
          },
          submenuLabel: {
            background: "transparent",
            color: "{text.muted.color}",
          },
          submenuIcon: {
            color: "{surface.500}",
            focusColor: "{surface.400}",
            activeColor: "{surface.400}",
          },
        },
      },
    },
  },
  components: {
    breadcrumb: {
      root: {
        padding: "0",
        gap: "4px",
        background: "none"
      },
    },
    skeleton: {
      colorScheme: {
        light: {
          root: {
            background: "{surface.100}",
          },
        },
        dark: {
          root: {},
        },
      },
    },
    message: {
      root: {
        borderRadius: "0px",
        borderWidth: '0px',
      },
      content: {
        padding: '1rem 1.5rem',
      },
      colorScheme: {
        light: {
          info: {
            background: "#333333",
            color: '#ffffff',
            closeButton: {
              hoverBackground: 'rgba(255, 255, 255, 0.15)',
              focusRing: {
                color: 'rgba(255, 255, 255, 0.05)',
              }
            }
          },
          success: {
            background: "#333333",
            color: '{green.500}',
            closeButton: {
              hoverBackground: 'rgba(255, 255, 255, 0.15)',
              focusRing: {
                color: 'rgba(255, 255, 255, 0.05)',
              }
            }
          },
          warn: {
            background: "#333333",
            color: '{yellow.500}',
            closeButton: {
              hoverBackground: 'rgba(255, 255, 255, 0.15)',
              focusRing: {
                color: 'rgba(255, 255, 255, 0.05)',
              }
            }
          },
          error: {
            background: "#333333",
            color: '#FD5757',
            closeButton: {
              hoverBackground: 'rgba(255, 255, 255, 0.15)',
              focusRing: {
                color: 'rgba(255, 255, 255, 0.05)',
              }
            }
          },
          secondary: {
            background: "#333333",
            color: '{link.100}',
            closeButton: {
              hoverBackground: 'rgba(255, 255, 255, 0.15)',
              focusRing: {
                color: 'rgba(255, 255, 255, 0.05)',
              }
            }
          },
          contrast: {
            background: "#333333",
            color: '{surface.0}',
            closeButton: {
              hoverBackground: 'rgba(255, 255, 255, 0.15)',
              focusRing: {
                color: 'rgba(255, 255, 255, 0.05)',
              }
            }
          },
        },
        dark: {
          info: {
            background: "#13182a",
            color: '#ffffff',
            closeButton: {
              hoverBackground: 'rgba(255, 255, 255, 0.15)',
              focusRing: {
                color: 'rgba(255, 255, 255, 0.05)',
              }
            }
          },
          success: {
            background: "#13182a",
            color: '{green.500}',
            closeButton: {
              hoverBackground: 'rgba(255, 255, 255, 0.15)',
              focusRing: {
                color: 'rgba(255, 255, 255, 0.05)',
              }
            }
          },
          warn: {
            background: "#13182a",
            color: '{yellow.500}',
            closeButton: {
              hoverBackground: 'rgba(255, 255, 255, 0.15)',
              focusRing: {
                color: 'rgba(255, 255, 255, 0.05)',
              }
            }
          },
          error: {
            background: "#13182a",
            color: '#FD5757',
            closeButton: {
              hoverBackground: 'rgba(255, 255, 255, 0.15)',
              focusRing: {
                color: 'rgba(255, 255, 255, 0.05)',
              }
            }
          },
          secondary: {
            background: "#13182a",
            color: '{link.100}',
            closeButton: {
              hoverBackground: 'rgba(255, 255, 255, 0.15)',
              focusRing: {
                color: 'rgba(255, 255, 255, 0.05)',
              }
            }
          },
          contrast: {
            background: "#13182a",
            color: '{surface.0}',
            closeButton: {
              hoverBackground: 'rgba(255, 255, 255, 0.15)',
              focusRing: {
                color: 'rgba(255, 255, 255, 0.05)',
              }
            }
          },
        },
      },
    },
    toast: {
      root: {
        borderRadius: "0px",
        borderWidth: "0px",
      },
      icon: {
        size: "1.15rem",
      },
      summary: {
        fontWeight: "500",
        fontSize: '1rem'
      },
      detail: {
        fontWeight: "400",
        fontSize: '0.875rem'
      },
      colorScheme: {
        light: {
          info: {
            background: "#333333",
            color: '#ffffff',
            closeButton: {
              hoverBackground: 'rgba(255, 255, 255, 0.15)',
              focusRing: {
                color: 'rgba(255, 255, 255, 0.05)',
              }
            }
          },
          success: {
            background: "#333333",
            color: '{green.500}',
            closeButton: {
              hoverBackground: 'rgba(255, 255, 255, 0.15)',
              focusRing: {
                color: 'rgba(255, 255, 255, 0.05)',
              }
            }
          },
          warn: {
            background: "#333333",
            color: '{yellow.500}',
            closeButton: {
              hoverBackground: 'rgba(255, 255, 255, 0.15)',
              focusRing: {
                color: 'rgba(255, 255, 255, 0.05)',
              }
            }
          },
          error: {
            background: "#333333",
            color: '#FD5757',
            closeButton: {
              hoverBackground: 'rgba(255, 255, 255, 0.15)',
              focusRing: {
                color: 'rgba(255, 255, 255, 0.05)',
              }
            }
          },
          secondary: {
            background: "#333333",
            color: '{link.100}',
            closeButton: {
              hoverBackground: 'rgba(255, 255, 255, 0.15)',
              focusRing: {
                color: 'rgba(255, 255, 255, 0.05)',
              }
            }
          },
          contrast: {
            background: "#333333",
            color: '{surface.0}',
            closeButton: {
              hoverBackground: 'rgba(255, 255, 255, 0.15)',
              focusRing: {
                color: 'rgba(255, 255, 255, 0.05)',
              }
            }
          },
        },
        dark: {
          info: {
            background: "#13182a",
            color: '#ffffff',
            closeButton: {
              hoverBackground: 'rgba(255, 255, 255, 0.15)',
              focusRing: {
                color: 'rgba(255, 255, 255, 0.05)',
              }
            }
          },
          success: {
            background: "#13182a",
            color: '{green.500}',
            closeButton: {
              hoverBackground: 'rgba(255, 255, 255, 0.15)',
              focusRing: {
                color: 'rgba(255, 255, 255, 0.05)',
              }
            }
          },
          warn: {
            background: "#13182a",
            color: '{yellow.500}',
            closeButton: {
              hoverBackground: 'rgba(255, 255, 255, 0.15)',
              focusRing: {
                color: 'rgba(255, 255, 255, 0.05)',
              }
            }
          },
          error: {
            background: "#13182a",
            color: '#FD5757',
            closeButton: {
              hoverBackground: 'rgba(255, 255, 255, 0.15)',
              focusRing: {
                color: 'rgba(255, 255, 255, 0.05)',
              }
            }
          },
          secondary: {
            background: "#13182a",
            color: '{link.100}',
            closeButton: {
              hoverBackground: 'rgba(255, 255, 255, 0.15)',
              focusRing: {
                color: 'rgba(255, 255, 255, 0.05)',
              }
            }
          },
          contrast: {
            background: "#13182a",
            color: '{surface.0}',
            closeButton: {
              hoverBackground: 'rgba(255, 255, 255, 0.15)',
              focusRing: {
                color: 'rgba(255, 255, 255, 0.05)',
              }
            }
          },
        },
      },
    },
    slider: {
      borderRadius: "6px",
      track: {
        size: "6px",
        borderRadius: "6px",
        background: "{neutral.500}",
      },
      range: {
        background: "{primary.color}",
      },
      handle: {
        focusRing: {
          color: "transparent",
        },
      },
      colorScheme: {
        light: {
          range: {
            background: "#000000",
          },
          handle: {
            background: "#000000",
            contentBackground: "{surface.0}",
            hoverBackground: "{surface.0}",
            content: {
              background: "{surface.0}",
              hoverBackground: "{surface.0}",
            },
          },
        },
        dark: {
          range: {
            background: "{surface.0}",
          },
          handle: {
            background: "transparent",
            hoverBackground: "{surface.0}",
            content: {
              background: "{surface.0}",
              hoverBackground: "{surface.0}",
            },
          },
        },
      },
    },
    tabs: {
      tablist: {
        background: "transparent",
        padding: "0rem 2rem",
        borderColor: "transparent",
      },
      tab: {
        padding: "0.5rem 0rem",
        activeColor: "{primary.500}",
        borderColor: "transparent",
        hoverBorderColor: "transparent",
        activeBorderColor: "transparent",
      },
      navButton: {
        background: "{darkblue-500}",
      },
      activeBar: {
        height: "2px",
        bottom: "-2px",
        background: "{primary.500}",
      },
      tabpanel: {
        padding: "1.25rem 0rem 1.125rem 0rem",
        background: "transparent",
      },
      colorScheme: {
        light: {
          navButton: {
            background: "{surface.0}",
            shadow: '0px 0px 10px 50px rgba(255, 255, 255, 0.6)'
          }
        },
        dark: {
          tab: {
            activeColor: "{text.color}",
          },
          navButton: {
            background: "{darkblue-500}",
            shadow: '0px 0px 10px 50px color-mix(in srgb, {darkblue-500}, transparent 50%)'
          },
          activeBar: {
            background: "{text.color}",
          },
        }
      },
    },
    toggleswitch: {
      root: {
        width: "3.5rem",
      },
      colorScheme: {
        light: {
          root: {
            background: "{surface.50}",
            disabledBackground: "{form.field.disabled.background}",
            hoverBackground: "{surface.100}",
          },
          handle: {
            background: "{surface.0}",
            disabledBackground: "{form.field.disabled.color}",
            hoverBackground: "{surface.0}",
            checkedBackground: "{surface.0}",
            checkedHoverBackground: "{surface.0}",
          },
        },
        dark: {
          root: {
            background: "{darkblue.500}",
            disabledBackground: "{form.field.disabled.background}",
            hoverBackground: "{darkblue.800}",
          },
          handle: {
            background: "{surface.100}",
            disabledBackground: "{form.field.disabled.color}",
            hoverBackground: "{surface.300}",
            checkedBackground: "{surface.0}",
            checkedHoverBackground: "{surface.0}",
          },
        },
      },
    },
    drawer: {
      borderColor: "transparent",
      colorScheme: {
        light: {
          root: {
            background: "{surface.50}",
          },
        },
        dark: {
          root: {
            background: "{surface.25}",
          },
        },
      },
    },
    button: {
      root: {
        borderRadius: "9999px",
        paddingY: "0.38rem",
        paddingX: "0.75rem",
        label: {
          fontWeight: "600",
        },
        gap: "0.5rem",
        iconOnlyWidth: "2.0625rem",
        sm: {
          iconOnlyWidth: "2.0625rem",
        },
      },
      colorScheme: {
        light: {
          root: {
            primary: {
              color: "{surface.0}",
              hoverColor: "{surface-0}",
              activeColor: "{surface-0}",
              background: "{primary.500}",
              hoverBackground: "{primary.600}",
              activeBackground: "{primary.700}",
              borderColor: "{primary.500}",
              hoverBorderColor: "{primary.600}",
              activeBorderColor: "{primary.700}",
              focusRing: {
                color: "{focusRing.color}",
                shadow: "none",
              },
            },
            secondary: {
              background: "{surface.0}",
              hoverBackground: "{surface.50}",
              activeBackground: "{surface.200}",
              borderColor: "{surface.50}",
              hoverBorderColor: "{surface.50}",
              activeBorderColor: "{surface.300}",
              color: "{surface-950}",
              hoverColor: "{surface-950}",
              activeColor: "{surface-950}",
              focusRing: {
                color: "{focusRing.color}",
                shadow: "none",
              },
            },
            contrast: {
              background: "#3F3F41",
              hoverBackground: "#282829",
              activeBackground: "{surface.200}",
              borderColor: "#3F3F41",
              hoverBorderColor: "#282829",
              activeBorderColor: "{surface.300}",
              color: "{surface-0}",
              hoverColor: "{surface-0}",
              activeColor: "{surface-0}",
              focusRing: {
                color: "{focusRing.color}",
                shadow: "none",
              },
            },
          },
          link: {
            color: '{text.color}',
            hoverColor: '{link.500}',
            activeColor: '{link.500}'
          },
          text: {
            secondary: {
              color: '{surface.950}'
            },
          },
        },
        dark: {
          root: {
            primary: {
              color: "{surface.0}",
              hoverColor: "{surface-0}",
              activeColor: "{surface-0}",
              background: "{primary.500}",
              hoverBackground: "{primary.600}",
              activeBackground: "{primary.700}",
              borderColor: "{primary.500}",
              hoverBorderColor: "{primary.600}",
              activeBorderColor: "{primary.700}",
              focusRing: {
                color: "{focusRing.color}",
                shadow: "none",
              },
            },
            secondary: {
              background: "{surface.0}",
              hoverBackground: "{surface.300}",
              activeBackground: "{surface.200}",
              borderColor: "{surface.50}",
              hoverBorderColor: "{surface.300}",
              activeBorderColor: "{surface.400}",
              color: "{surface-950}",
              hoverColor: "{surface-950}",
              activeColor: "{surface-950}",
              focusRing: {
                color: "{focusRing.color}",
                shadow: "none",
              },
            },
            contrast: {
              background: "#3F3F41",
              hoverBackground: "#282829",
              activeBackground: "{surface.200}",
              borderColor: "#3F3F41",
              hoverBorderColor: "#282829",
              activeBorderColor: "{surface.300}",
              color: "{surface-0}",
              hoverColor: "{surface-0}",
              activeColor: "{surface-0}",
              focusRing: {
                color: "{focusRing.color}",
                shadow: "none",
              },
            },
          },
          text: {
            secondary: {
              color: "{surface.0}",
            },
          },
          link: {
            color: '{text.color}',
            hoverColor: '{link.400}',
            activeColor: '{link.400}'
          },
        },
      },
    },
    megamenu: {
      root: {
        background: "transparent",
        borderColor: "transparent",
        horizontalOrientation: {
          padding: '0.5rem 0rem',
        },
      },
      item: {
        focusBackground: "transparent",
        activeBackground: "transparent",
      },
    },
    menu: {
      root: {
        borderColor: "transparent",
        padding: '1.5rem 1.5rem',
      },
      list: {
        padding: '0',
        borderRadius: '0',
      },
      item: {
        padding: '0',
        borderRadius: '0',
      },
      submenuLabel: {
        padding: '0',
      }
    },
    popover: {
      root: {
        borderColor: "{surface.100}",
        shadow: "0px 0px 4px rgba(0, 0, 0, 0.25)",
        borderRadius: "20px",
      },
      content: {
        padding: "1.25rem 1.75rem 1.25rem 1.25rem",
      },
    },
    divider: {
      content: {
        background: "transparent"
      },
      colorScheme: {
        light: {
          root: {
            borderColor: '{content.border.color}'
          },
        },
        dark: {
          root: {
            borderColor: "#ffffffE6"
          },
        },
      },
    },
    avatar: {
      root: {
        background: "transparent",
      },
    },
    stepper: {
      stepTitle: {
        color: '{neutral.500}',
        activeColor: '{text.color}',
        fontWeight: '500'
      },
      stepNumber: {
        color: '{neutral.500}',
        activeColor: '{text.color}',
        borderColor: '{sky.500}',
        activeBorderColor: '{neutral.200}',
        activeBackground: '{surface.25}',
      },
      separator: {
        background: '{sky.500}',
        activeBackground: '{sky.500}',
        margin: '0 0 0 0rem',
        size: '2px'
      },
      step: {
        gap: '0',
        padding: '0'
      },
      steppanels: {
        padding: '0'
      },
      steppanel: {
        background: '{sky.50}',
      },
      colorScheme: {
        light: {
          steppanel: {
            //background: '{sky.100}',
          }
        },
        dark: {
          stepTitle: {
            color: '{neutral.300}',
          },
          steppanel: {
            background: '{surface.25}',
          },
          stepNumber: {
            background: '{surface.25}',
          },
        },
      },
    },
  },
})

export default MyPreset
