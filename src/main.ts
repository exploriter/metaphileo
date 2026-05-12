import "./style.css";
import DOMPurify from "dompurify";
import { marked } from "marked";

const inquiries = Object.values(
   import.meta.glob<string>("../inquiries/*.md", { query: "?raw", import: "default", eager: true })
)
   .map((i) => i.trim())
   .filter(Boolean);

const inquiry = document.querySelector<HTMLElement>("#inquiry")!;
const button = document.querySelector<HTMLButtonElement>("#new-inquiry")!;

let last = -1;

const show = () => {
   let i = Math.floor(Math.random() * inquiries.length);
   if (i === last && inquiries.length > 1) i = (i + 1) % inquiries.length;
   last = i;
   inquiry.innerHTML = DOMPurify.sanitize(marked.parse(inquiries[i]!, { async: false }));
};

if (inquiries.length === 0) {
   inquiry.innerHTML = `<p>No inquiries. Go outside.</p>`;
   button.hidden = true;
} else {
   button.addEventListener("click", show);
   show();
}
