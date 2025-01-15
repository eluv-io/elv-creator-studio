export default {
  fontFamily: "system-ui, \"Segoe UI\", Roboto, Helvetica, Arial, sans-serif, \"Apple Color Emoji\", \"Segoe UI Emoji\", \"Segoe UI Symbol\"",
  fontFamilyMonospace: "Monaco, Courier, monospace",
  colors: {
    "purple": ["#f2ecfa", "#EEE5F5", "#e9d9f6", "#DBC1EE", "#DBC1EE", "#CB9AEE", "#be6ef6", "#AC5DE3", "#9B52CF", "#8C49BA"]
  },
  primaryColor: "purple",
  components: {
    Input: {
      // eslint-disable-next-line no-unused-vars
      styles: theme => ({
        input: {
          "&:disabled" : {
            opacity: 1,
            pointerEvents: "unset"
          }
        }
      })
    }
  }
};
