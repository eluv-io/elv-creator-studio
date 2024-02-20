export default {
  fontFamily: "Montserrat, Helvetica Neue, Helvetica, sans-serif",
  fontFamilyMonospace: "Monaco, Courier, monospace",
  headings: {
    fontFamily: "system-ui, \"Segoe UI\", Roboto, Helvetica, Arial, sans-serif, \"Apple Color Emoji\", \"Segoe UI Emoji\", \"Segoe UI Symbol\"",
  },
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
