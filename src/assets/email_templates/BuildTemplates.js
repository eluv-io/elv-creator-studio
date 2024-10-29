import fs from "fs";
import Path from "path";

const baseTemplate = fs.readFileSync(Path.join(import.meta.dirname, "/parts/BaseTemplate.html"), "utf8");
const css = fs.readFileSync(Path.join(import.meta.dirname, "/parts/template.css"), "utf8");

const codeTemplateContent = fs.readFileSync(Path.join(import.meta.dirname, "./parts/CodeTemplateContent.html"), "utf8");
const linkTemplateContent = fs.readFileSync(Path.join(import.meta.dirname, "./parts/LinkTemplateContent.html"), "utf8");
const receiptTemplateContent = fs.readFileSync(Path.join(import.meta.dirname, "./parts/PurchaseReceiptTemplateContent.html"), "utf8");

const BuildTemplates = () => {
  fs.writeFileSync(
    Path.join(import.meta.dirname, "./CodeTemplate.html"),
    baseTemplate
      .replace("{{css}}", css)
      .replace("{{content}}", codeTemplateContent)
  );

  fs.writeFileSync(
    Path.join(import.meta.dirname, "./LinkTemplate.html"),
    baseTemplate
      .replace("{{css}}", css)
      .replace("{{content}}", linkTemplateContent)
  );

  fs.writeFileSync(
    Path.join(import.meta.dirname, "./PurchaseReceiptTemplate.html"),
    baseTemplate
      .replace("{{css}}", css)
      .replace("{{content}}", receiptTemplateContent)
  );
};

BuildTemplates();
