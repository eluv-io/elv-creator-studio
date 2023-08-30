import "@/assets/stylesheets/markdown.scss";

import MarkdownItImport from "markdown-it";
const MarkdownIt = MarkdownItImport();

const Markdown = ({content, className="", ...props}) => {
  return (
    <div
      {...props}
      className={`markdown-document ${className}`}
      dangerouslySetInnerHTML={{__html: MarkdownIt.render(content)}}
    />
  );
};

export default Markdown;
