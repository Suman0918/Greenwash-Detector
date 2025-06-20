document.addEventListener("DOMContentLoaded", function () {
  const tabs = document.querySelectorAll(".tab");
  const contents = document.querySelectorAll(".tab-content");

  tabs.forEach((tab, i) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.remove("active"));
      contents.forEach((c) => c.style.display = "none");

      tab.classList.add("active");
      contents[i].style.display = "block";
    });
  });

  tabs[0].click(); // default tab
});
