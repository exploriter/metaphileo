import "./style.css";

const inquiries = Object.values(
   import.meta.glob<string>("../inquiries/*.md", { query: "?raw", import: "default", eager: true })
)
   .map((i) => i.trim())
   .filter(Boolean);

const app = document.querySelector<HTMLDivElement>("#app")!;

if (inquiries.length === 0) {
   app.innerHTML = `<main><p>No inquiries. Go outside.</p></main>`;
} else {
   app.innerHTML = `<main><p></p><button type="button">New Inquiry</button></main>`;

   const inquiry = app.querySelector("p")!;
   let last = -1;

   const show = () => {
      let i = Math.floor(Math.random() * inquiries.length);
      if (i === last && inquiries.length > 1) i = (i + 1) % inquiries.length;
      last = i;
      inquiry.textContent = inquiries[i]!;
   };

   app.querySelector("button")!.addEventListener("click", show);
   show();
}
