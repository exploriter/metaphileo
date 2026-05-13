import "./style.css";
import DOMPurify from "dompurify";
import { marked } from "marked";

const files = import.meta.glob<string>("../inquiries/*.md", { query: "?raw", import: "default", eager: true });
const inquiries = new Map(
   Object.entries(files)
      .map(([path, markdown]) => [path.split("/").pop()!, markdown.trim()] as const)
      .filter(([, markdown]) => markdown)
);
const storageKey = "metaphileo.inquiryQueue";

type QueueState = {
   queue: string[];
   cycle: string[];
};

const currentIds = () => [...inquiries.keys()];

const savedState = () => {
   try {
      return JSON.parse(localStorage.getItem(storageKey) ?? "[]") as unknown;
   } catch {
      return {};
   }
};

const shuffle = <T>(items: T[]) => {
   const shuffled = [...items];

   for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j]!, shuffled[i]!];
   }

   return shuffled;
};

const validIds = (value: unknown) =>
   Array.isArray(value) ? [...new Set(value.filter((id): id is string => inquiries.has(id)))] : [];

const loadState = (): QueueState => {
   const ids = currentIds();
   const saved = savedState();
   const savedQueue = Array.isArray(saved) ? saved : (saved as Partial<QueueState>).queue;
   const savedCycle = Array.isArray(saved) ? saved : (saved as Partial<QueueState>).cycle;
   const queue = validIds(savedQueue);
   const cycle = validIds(savedCycle);
   const cycled = new Set(cycle);
   const added = shuffle(ids.filter((id) => !cycled.has(id)));

   return {
      queue: [...queue, ...added],
      cycle: [...cycle, ...added],
   };
};

let state = loadState();

const saveState = () => {
   try {
      localStorage.setItem(storageKey, JSON.stringify(state));
   } catch {
      // Keep the in-memory queue working if storage is unavailable.
   }
};

const nextInquiry = () => {
   if (state.queue.length === 0) {
      const cycle = shuffle(currentIds());
      state = {
         queue: cycle,
         cycle,
      };
   }

   const id = state.queue.shift()!;
   saveState();
   return inquiries.get(id)!;
};

const render = (markdown: string) =>
   DOMPurify.sanitize(marked.parse(markdown, { async: false }), {
      ALLOWED_TAGS: ["p", "strong", "em"],
      ALLOWED_ATTR: [],
   });

const inquiry = document.querySelector<HTMLElement>("#inquiry")!;
const button = document.querySelector<HTMLButtonElement>("#new-inquiry")!;

const show = () => {
   inquiry.innerHTML = render(nextInquiry());
};

if (inquiries.size === 0) {
   inquiry.innerHTML = `<p>No inquiries. Go outside.</p>`;
   button.hidden = true;
} else {
   button.addEventListener("click", show);
   show();
}
