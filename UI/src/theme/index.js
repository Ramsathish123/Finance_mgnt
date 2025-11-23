import { extendTheme } from "@chakra-ui/react"

const config = {
  initialColorMode: "system",
  useSystemColorMode: true,
}

const theme = extendTheme({
  config,
  colors: {
    brand: {
      50: "#f7fafc",
      100: "#f8faff",
      500: "#625df0",
      600: "#5854d4",
      700: "#4f4bc0",
      900: "#1a202c",
    },
  },
  fonts: {
    body: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
    heading: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
    mono: "Menlo, monospace",
  },
  semanticTokens: {
    colors: {
      "chakra-body-bg": {
        _light: "#ffffff",
        _dark: "#1a202c",
      },
      "chakra-body-text": {
        _light: "#2d3748",
        _dark: "#e2e8f0",
      },
      "chakra-border-color": {
        _light: "#e2e8f0",
        _dark: "#4a5568",
      },
    },
  },
  components: {
    Button: {
      variants: {
        primary: {
          bg: "brand.500",
          color: "white",
          _hover: {
            bg: "brand.600",
            transform: "translateY(-1px)",
          },
        },
      },
    },
    Input: {
      variants: {
        outline: {
          field: {
            bg: "var(--color-card-bg)",
            borderColor: "chakra-border-color",
            color: "chakra-body-text",
            _placeholder: {
              color: "#a0aec0",
            },
            _hover: {
              borderColor: "brand.500",
            },
            _focus: {
              borderColor: "brand.500",
              boxShadow: "0 0 0 1px var(--chakra-colors-brand-500)",
            },
            _dark: {
              bg: "var(--color-card-bg)",
              borderColor: "var(--color-border)",
              color: "var(--color-text)",
            },
          },
        },
      },
    },
    Card: {
      baseStyle: {
        container: {
          bg: "var(--color-card-bg)",
          borderColor: "var(--color-border)",
          boxShadow: "var(--shadow-md)",
        },
      },
    },
    Menu: {
      baseStyle: {
        list: {
          bg: "var(--color-card-bg)",
          borderColor: "var(--color-border)",
        },
        item: {
          color: "var(--color-text)",
          _hover: {
            bg: "rgba(98, 93, 240, 0.08)",
          },
        },
      },
    },
  },
})

export default theme
