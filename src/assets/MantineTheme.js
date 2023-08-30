export default {
  fontFamily: "Montserrat, Helvetica Neue, Helvetica, sans-serif",
  fontFamilyMonospace: "Monaco, Courier, monospace",
  headings: {
    fontFamily: "Greycliff CF, sans-serif"
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
        },
      })
    }
  }
};
